const express = require('express');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { 
  validateGroup, 
  validateGroupCreate,
  validateGroupUpdate, 
  validateGroupFilters, 
  validateId 
} = require('../middleware/validation');

const router = express.Router();

// GET /groups - Lista tutti i gruppi con filtri
router.get('/', validateGroupFilters, async (req, res) => {
  try {
    const { status, group_type, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (group_type) filters.group_type = group_type;
    if (search) filters.search = search;

    const groups = await Group.findAll(filters);
    
    res.json({
      success: true,
      data: groups,
      total: groups.length
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /groups/statistics - Statistiche gruppi
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Group.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching group statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /groups/:id - Dettaglio gruppo specifico
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Ottieni anche i membri del gruppo
    const members = await GroupMember.findActiveMembers(id);
    const memberStats = await GroupMember.getMemberStatistics(id);

    res.json({
      success: true,
      data: {
        ...group,
        members,
        member_statistics: memberStats
      }
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /groups - Crea nuovo gruppo
router.post('/', validateGroupCreate, async (req, res) => {
  try {
    const {
      name,
      description,
      meeting_frequency,
      conductors = [],
      members = []
    } = req.body;

    console.log(`[POST /groups] Creating group with:`, { name, description, meeting_frequency, conductors, members });

    // TODO: Ottieni created_by dal token JWT
    const created_by = 1; // Placeholder - da implementare con autenticazione

    const groupData = {
      name,
      description,
      group_type: 'support', // Default type
      max_members: 50, // Default max members
      meeting_frequency,
      status: 'active',
      created_by
    };

    const newGroup = await Group.create(groupData);
    console.log(`[POST /groups] Group created with ID:`, newGroup.id);

    // Add conductors if provided
    if (conductors.length > 0) {
      for (const conductorId of conductors) {
        const conductorData = {
          group_id: newGroup.id,
          user_id: parseInt(conductorId, 10),
          patient_id: null,
          member_type: 'psychologist',
          created_by
        };
        await GroupMember.addMember(conductorData);
        console.log(`[POST /groups] Added conductor:`, conductorId);
      }
    }

    // Add members if provided
    if (members.length > 0) {
      for (const memberId of members) {
        const memberData = {
          group_id: newGroup.id,
          patient_id: parseInt(memberId, 10),
          user_id: null,
          member_type: 'patient',
          created_by
        };
        await GroupMember.addMember(memberData);
        console.log(`[POST /groups] Added member:`, memberId);
      }
    }
    
    res.status(201).json({
      success: true,
      data: newGroup,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /groups/:id - Aggiorna gruppo
router.put('/:id', validateId, validateGroupUpdate, async (req, res) => {
  try {
    console.log(`[PUT /groups/${req.params.id}] Request received:`, req.body);
    const { id } = req.params;

    const updateData = req.body;
    console.log(`[PUT /groups/${id}] About to update with data:`, updateData);

    const updatedGroup = await Group.update(id, updateData);
    console.log(`[PUT /groups/${id}] Update completed:`, updatedGroup);
    
    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /groups/:id - Elimina gruppo
router.delete('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGroup = await Group.delete(id);
    
    if (!deletedGroup) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: deletedGroup,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /groups/:id/members - Add member to group
router.post('/:id/members', validateId, async (req, res) => {
  try {
    console.log(`[POST /groups/${req.params.id}/members] Request received:`, req.body);
    const { id } = req.params;
    const { patient_id, user_id, member_type, notes } = req.body;

    // Validate required fields
    if (!member_type) {
      return res.status(400).json({
        success: false,
        error: 'member_type is required'
      });
    }

    if (member_type === 'patient' && !patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required for patient members'
      });
    }

    if (member_type === 'psychologist' && !user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required for psychologist members'
      });
    }

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Add member to group using GroupMember model
    const memberData = {
      group_id: parseInt(id, 10),
      patient_id: patient_id ? parseInt(patient_id, 10) : null,
      user_id: user_id ? parseInt(user_id, 10) : null,
      member_type,
      notes,
      created_by: 1 // TODO: Get from JWT token
    };

    console.log(`[POST /groups/${id}/members] Adding member:`, memberData);
    
    let newMember;
    
    if (member_type === 'patient') {
      newMember = await GroupMember.addMember(memberData);
    } else if (member_type === 'psychologist') {
      // For psychologists/conductors, we need to modify the data structure
      const psychologistData = {
        ...memberData,
        patient_id: null // Psychologists don't have patient_id
      };
      newMember = await GroupMember.addMember(psychologistData);
    }
    
    console.log(`[POST /groups/${id}/members] Member added successfully:`, newMember);
    
    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: newMember
    });
    
  } catch (error) {
    console.error(`[POST /groups/${req.params.id}/members] Error:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /groups/:id/members/:memberId - Remove member from group
router.delete('/:id/members/:memberId', validateId, async (req, res) => {
  try {
    console.log(`[DELETE /groups/${req.params.id}/members/${req.params.memberId}] Request received`);
    const { id, memberId } = req.params;

    // Validate memberId is a number
    const memberIdNum = parseInt(memberId, 10);
    if (isNaN(memberIdNum) || memberIdNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member ID'
      });
    }

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if member exists in this group
    const members = await GroupMember.findActiveMembers(id);
    const memberToRemove = members.find(m => m.id === memberIdNum);
    
    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in this group'
      });
    }

    // Remove member by setting is_active to false
    await GroupMember.removeMember(memberIdNum);

    console.log(`[DELETE /groups/${id}/members/${memberId}] Member removed successfully`);
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
    
  } catch (error) {
    console.error(`[DELETE /groups/${req.params.id}/members/${req.params.memberId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /groups/:id - Delete group permanently
router.delete('/:id', validateId, async (req, res) => {
  try {
    console.log(`[DELETE /groups/${req.params.id}] Request received`);
    const { id } = req.params;

    // Check if group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Delete the group (CASCADE will handle related records)
    const deletedGroup = await Group.delete(id);

    console.log(`[DELETE /groups/${id}] Group deleted successfully:`, deletedGroup.name);
    
    res.json({
      success: true,
      message: 'Group deleted successfully',
      data: deletedGroup
    });
    
  } catch (error) {
    console.error(`[DELETE /groups/${req.params.id}] Error:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
