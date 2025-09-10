const express = require('express');
const GroupMember = require('../models/GroupMember');
const { 
  validateMember, 
  validateMemberUpdate, 
  validateId, 
  validateMemberId, 
  validatePatientId 
} = require('../middleware/validation');

const router = express.Router();

// GET /groups/:groupId/members - Lista membri di un gruppo
router.get('/:groupId/members', validateId, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { active_only } = req.query;

    let members;
    if (active_only === 'true') {
      members = await GroupMember.findActiveMembers(groupId);
    } else {
      members = await GroupMember.findByGroupId(groupId);
    }

    const statistics = await GroupMember.getMemberStatistics(groupId);
    
    res.json({
      success: true,
      data: {
        members,
        statistics
      },
      total: members.length
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /groups/:groupId/members - Aggiungi membro al gruppo
router.post('/:groupId/members', validateId, validateMember, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { patient_id, member_type, role, notes } = req.body;

    // TODO: Ottieni created_by dal token JWT
    const created_by = 1; // Placeholder

    const memberData = {
      group_id: groupId,
      patient_id,
      member_type,
      role,
      notes,
      created_by
    };

    const newMember = await GroupMember.addMember(memberData);
    
    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Member added to group successfully'
    });
  } catch (error) {
    console.error('Error adding group member:', error);
    
    if (error.message.includes('already an active member')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message
      });
    }
    
    if (error.message.includes('maximum member limit')) {
      return res.status(400).json({
        success: false,
        error: 'Group full',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /groups/:groupId/members/:memberId - Aggiorna membro
router.put('/:groupId/members/:memberId', validateId, validateMemberId, validateMemberUpdate, async (req, res) => {
  try {
    const { memberId } = req.params;
    const updateData = req.body;

    const updatedMember = await GroupMember.updateMember(memberId, updateData);
    
    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: updatedMember,
      message: 'Member updated successfully'
    });
  } catch (error) {
    console.error('Error updating group member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /groups/:groupId/members/:memberId - Rimuovi membro (soft delete)
router.delete('/:groupId/members/:memberId', validateId, validateMemberId, async (req, res) => {
  try {
    const { memberId } = req.params;

    const removedMember = await GroupMember.removeMember(memberId);
    
    if (!removedMember) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: removedMember,
      message: 'Member removed from group successfully'
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /patients/:patientId/groups - Gruppi di un paziente
router.get('/patients/:patientId/groups', validatePatientId, async (req, res) => {
  try {
    const { patientId } = req.params;

    const groups = await GroupMember.findByPatientId(patientId);
    
    res.json({
      success: true,
      data: groups,
      total: groups.length
    });
  } catch (error) {
    console.error('Error fetching patient groups:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
