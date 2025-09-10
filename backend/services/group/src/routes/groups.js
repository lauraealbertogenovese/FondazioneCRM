const express = require('express');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { 
  validateGroup, 
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
router.post('/', validateGroup, async (req, res) => {
  try {
    const {
      name,
      description,
      group_type,
      max_members,
      start_date,
      end_date,
      meeting_frequency,
      meeting_location
    } = req.body;

    // TODO: Ottieni created_by dal token JWT
    const created_by = 1; // Placeholder - da implementare con autenticazione

    const groupData = {
      name,
      description,
      group_type,
      max_members,
      start_date,
      end_date,
      meeting_frequency,
      meeting_location,
      created_by
    };

    const newGroup = await Group.create(groupData);
    
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
    const { id } = req.params;

    const updateData = req.body;

    const updatedGroup = await Group.update(id, updateData);
    
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

module.exports = router;
