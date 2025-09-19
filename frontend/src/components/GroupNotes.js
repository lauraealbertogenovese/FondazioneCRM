import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Notes as NotesIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/api';

const GroupNotes = ({ groupId, groupNoteId, showAddButton = true }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newEntry, setNewEntry] = useState({
    type: 'consultation',
    content: ''
  });

  const [editEntry, setEditEntry] = useState({
    id: null,
    type: 'consultation',
    content: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  const entryTypes = {
    consultation: { label: 'Consultazione', color: 'primary', icon: PersonIcon },
    treatment: { label: 'Trattamento', color: 'success', icon: NotesIcon },
    observation: { label: 'Osservazione', color: 'info', icon: CalendarIcon },
    assessment: { label: 'Valutazione', color: 'warning', icon: NotesIcon },
    session: { label: 'Sessione', color: 'secondary', icon: PersonIcon },
  };

  useEffect(() => {
    fetchEntries();
  }, [groupId, groupNoteId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real group notes data
      let notesResponse;
      
      if (groupId) {
        // Get group-specific group notes
        notesResponse = await groupService.getGroupNotes(groupId);
      } else if (groupNoteId) {
        // Get specific group note
        const noteResponse = await groupService.getNote(groupNoteId);
        notesResponse = { data: [noteResponse.data] };
      } else {
        // Get all group notes
        notesResponse = await groupService.getNotes();
      }
      
      // Transform notes to diary entries format
      const entries = (notesResponse.data || []).map(note => ({
        id: note.id,
        type: note.note_type || 'consultation',
        content: note.content ||  'Record gruppo',
        created_at: note.created_at,
        author: note.created_by_username || user?.username || 'Utente',
        author_id: note.created_by
      }));
      
      setEntries(entries);
    } catch (error) {
      console.error('Error fetching group diary entries:', error);
      setError('Errore nel caricamento del diario gruppo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    try {
      // Create new group note via API
      const noteData = {
        group_id: groupId,
        note_type: newEntry.type,
        // title: `Nota ${entryTypes[newEntry.type].label}`,
        content: newEntry.content,
        is_private: false
      };
      
      await groupService.createNote(noteData);
      
      // Refresh entries
      await fetchEntries();
      
      setNewEntry({ type: 'consultation', content: '' });
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding diary entry:', error);
      setError('Errore nell\'aggiunta della nota');
    }
  };

  const handleEditEntry = async () => {
    try {
      console.log('handleEditEntry called with editEntry:', editEntry);
      console.log('editEntry.id:', editEntry.id);
      console.log('editingId:', editingId);
      
      const noteId = editEntry.id || editingId;
      if (!noteId) {
        console.error('No valid ID found for editing!');
        setError('Errore: ID della nota non trovato');
        return;
      }
      
      const noteData = {
        // title: `Nota ${entryTypes[editEntry.type].label}`,
        content: editEntry.content,
        note_type: editEntry.type,
        is_private: false
      };
      
      console.log('Updating note with data:', noteData);
      await groupService.updateNote(noteId, noteData);
      
      // Refresh entries
      await fetchEntries();
      
      setEditEntry({ id: null, type: 'consultation', content: '' });
      setEditingId(null);
      setEditDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error updating diary entry:', error);
      setError('Errore nella modifica della nota');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      // Delete via API
      await groupService.deleteNote(entryId);
      
      // Refresh entries
      await fetchEntries();
      
      setAnchorEl(null);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      setError('Errore nell\'eliminazione della nota');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuOpen = (event, entry) => {
    setAnchorEl(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEntry(null);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento diario gruppo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Diario Gruppo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cronologia delle interazioni e note di gruppo
          </Typography>
        </Box>
        
        {showAddButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }
            }}
          >
            Nuova Nota
          </Button>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Timeline Entries */}
      {entries.length === 0 ? (
        <Card 
          elevation={0}
          sx={{ 
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ 
              width: 64, 
              height: 64, 
              margin: '0 auto 16px',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}>
              <NotesIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Nessuna nota di gruppo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aggiungi la prima nota di gruppo per iniziare a tracciare le interazioni.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {entries.map((entry, index) => {
            const entryType = entryTypes[entry.type] || entryTypes.consultation;
            const IconComponent = entryType.icon;
            
            return (
              <Card 
                key={entry.id}
                elevation={0}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2}>
                    {/* Timeline indicator */}
                    <Box sx={{ 
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 40,
                    }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40,
                        backgroundColor: alpha(theme.palette[entryType.color].main, 0.1),
                        color: theme.palette[entryType.color].main,
                      }}>
                        <IconComponent sx={{ fontSize: 20 }} />
                      </Avatar>
                      {index < entries.length - 1 && (
                        <Box sx={{ 
                          width: 2,
                          height: 40,
                          backgroundColor: theme.palette.divider,
                          mt: 1,
                        }} />
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Chip 
                              label={entryType.label}
                              size="small"
                              color={entryType.color}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(entry.created_at)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {entry.author}
                          </Typography>
                        </Box>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuOpen(e, entry)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                        {entry.content}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nuova Nota di Gruppo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo di Nota</InputLabel>
              <Select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                label="Tipo di Nota"
              >
                {Object.entries(entryTypes).map(([key, type]) => (
                  <MenuItem key={key} value={key}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Contenuto"
              multiline
              rows={4}
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              placeholder="Descrivi l'intervento, osservazione o trattamento..."
              required
            />

          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddDialogOpen(false)}>
            Annulla
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddEntry}
            disabled={!newEntry.content.trim()}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              }
            }}
          >
            Salva Nota
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifica Nota di Gruppo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo di Nota</InputLabel>
              <Select
                value={editEntry.type}
                onChange={(e) => setEditEntry({ ...editEntry, type: e.target.value })}
                label="Tipo di Nota"
              >
                {Object.entries(entryTypes).map(([key, type]) => (
                  <MenuItem key={key} value={key}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Contenuto"
              multiline
              rows={4}
              value={editEntry.content || ''}
              onChange={(e) => setEditEntry({ ...editEntry, content: e.target.value })}
              placeholder="Descrivi l'intervento, osservazione o trattamento..."
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Annulla
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEditEntry}
            disabled={!editEntry.content.trim()}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              }
            }}
          >
            Salva Modifiche
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          console.log('Setting edit entry with selectedEntry:', selectedEntry);
          setEditingId(selectedEntry.id);
          setEditEntry({
            id: selectedEntry.id,
            type: selectedEntry.type,
            content: selectedEntry.content
          });
          console.log('Edit entry set to:', {
            id: selectedEntry.id,
            type: selectedEntry.type,
            content: selectedEntry.content
          });
          setEditDialogOpen(true);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Modifica
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (window.confirm('Sei sicuro di voler eliminare questa nota?')) {
              handleDeleteEntry(selectedEntry.id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Elimina
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GroupNotes;