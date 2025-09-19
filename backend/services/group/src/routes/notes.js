const express = require('express');
const GroupNote = require('../models/GroupNote');
const { authenticateToken } = require('../middleware/auth');
const { validateNoteCreate,validateNoteUpdate } = require('../middleware/validation'); // Import validation

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /group/statistics - Group notes statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await GroupNote.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching group statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch group statistics' 
    });
  }
});

// GET /group/notes - List notes
router.get('/notes', async (req, res) => {
  try {
    const { 
      group_id, 
      note_type, 
      created_by, 
      date_from, 
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const filters = {};
    if (group_id) filters.group_id = group_id;
    if (note_type) filters.note_type = note_type;
    if (created_by) filters.created_by = created_by;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const notes = await GroupNote.findAll(filters, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: notes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: notes.length
      }
    });
  } catch (error) {
    console.error('Error fetching group notes:', error);
    res.status(500).json({ error: 'Failed to fetch group notes' });
  }
});

// GET /group/notes/:id - Note details
router.get('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await GroupNote.findById(id);

    if (!note) {
      return res.status(404).json({ error: 'Group note not found' });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching group note:', error);
    res.status(500).json({ error: 'Failed to fetch group note' });
  }
});

// GET /group/notes/group/:groupId - Notes for a group
router.get('/notes/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const notes = await GroupNote.findByGroupId(
      groupId, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      success: true,
      data: notes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: notes.length
      }
    });
  } catch (error) {
    console.error('Error fetching group group notes:', error);
    res.status(500).json({ error: 'Failed to fetch group group notes' });
  }
});

// POST /group/notes - Create new note
router.post('/notes', validateNoteCreate, async (req, res) => {
  try {
    const {
      group_id,
      note_type,
      content,
      is_private
    } = req.body;

    const noteData = {
      group_id,
      note_type,
      content,
      is_private,
      created_by: req.user.id
    };

    const newNote = await GroupNote.create(noteData);

    res.status(201).json({
      success: true,
      data: newNote,
      message: 'Group note created successfully'
    });
  } catch (error) {
    console.error('Error creating group note:', error);
    res.status(500).json({ error: 'Failed to create group note' });
  }
});

// PUT /group/notes/:id - Update note
router.put('/notes/:id', validateNoteUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, content, is_private } = req.body;

    // Check if note exists
    const existingNote = await GroupNote.findById(id);
    if (!existingNote) {
      return res.status(404).json({ error: 'Group note not found' });
    }

    const updatedNote = await GroupNote.update(id, { note_type, content, is_private });

    res.json({
      success: true,
      data: updatedNote,
      message: 'Group note updated successfully'
    });
  } catch (error) {
    console.error('Error updating group note:', error);
    res.status(500).json({ error: 'Failed to update group note' });
  }
});

// DELETE /group/notes/:id - Delete note
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const existingNote = await GroupNote.findById(id);
    if (!existingNote) {
      return res.status(404).json({ error: 'Group note not found' });
    }

    await GroupNote.delete(id);

    res.json({
      success: true,
      message: 'Group note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group note:', error);
    res.status(500).json({ error: 'Failed to delete group note' });
  }
});

// GET /group/notes/group/:groupId/count - Count notes for a group
router.get('/notes/group/:groupId/count', async (req, res) => {
  try {
    const { groupId } = req.params;
    const count = await GroupNote.countByGroupId(groupId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error counting group notes:', error);
    res.status(500).json({ error: 'Failed to count group notes' });
  }
});

module.exports = router;
