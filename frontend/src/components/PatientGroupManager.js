import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  EventAvailable as EventIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/api';

const PatientGroupManager = ({ patientId, patientName, showAddButton = true }) => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  
  const [memberships, setMemberships] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membershipHistory, setMembershipHistory] = useState([]);

  const groupStatusColors = {
    active: 'success',
    inactive: 'warning',
    completed: 'primary',
    cancelled: 'error'
  };

  useEffect(() => {
    fetchMemberships();
  }, [patientId]);

  useEffect(() => {
    if (memberships.length >= 0) {
      fetchAvailableGroups();
    }
  }, [memberships]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await groupService.getPatientGroups(patientId);
      setMemberships(response.data || []);
    } catch (error) {
      console.error('Error fetching patient group memberships:', error);
      setError('Errore nel caricamento delle appartenenze ai gruppi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const response = await groupService.getGroups({ status: 'active' });
      // Filter out groups where patient is already a member
      const availableGroups = (response.data?.groups || []).filter(group => 
        !memberships.some(membership => 
          membership.group_id === group.id && 
          membership.is_active === true
        )
      );
      setAvailableGroups(availableGroups);
    } catch (error) {
      console.error('Error fetching available groups:', error);
    }
  };

  const fetchMembershipHistory = async (membershipId) => {
    try {
      // TODO: Implementare endpoint per membership history nel backend
      // Per ora mostriamo dati basic basati sulla membership
      const membership = memberships.find(m => m.id === membershipId);
      if (membership) {
        const basicHistory = [
          {
            id: 1,
            action: 'joined',
            date: membership.joined_date || new Date().toISOString(),
            note: `Paziente aggiunto al gruppo ${membership.group_name}`,
            created_by: membership.psychologist || 'Sistema'
          }
        ];
        
        if (membership.left_date) {
          basicHistory.push({
            id: 2,
            action: 'left',
            date: membership.left_date,
            note: `Paziente ha lasciato il gruppo`,
            created_by: 'Sistema'
          });
        }
        
        setMembershipHistory(basicHistory);
      }
    } catch (error) {
      console.error('Error fetching membership history:', error);
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      const memberData = {
        patient_id: parseInt(patientId),
        member_type: 'patient',
        role: 'member',
        notes: `Aggiunto tramite gestione paziente`
      };
      
      await groupService.addGroupMember(selectedGroup.id, memberData);
      
      // Refresh memberships after adding
      await fetchMemberships();
      
      setSelectedGroup(null);
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding patient to group:', error);
      setError('Errore nell\'aggiunta del paziente al gruppo');
    }
  };

  const handleRemoveFromGroup = async (membershipId) => {
    try {
      const membership = memberships.find(m => m.id === membershipId);
      if (membership) {
        await groupService.removeGroupMember(membership.group_id, membership.id);
        
        // Refresh memberships after removing
        await fetchMemberships();
      }
      
      setAnchorEl(null);
      setSelectedMembership(null);
    } catch (error) {
      console.error('Error removing patient from group:', error);
      setError('Errore nella rimozione del paziente dal gruppo');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'joined': return <AddIcon />;
      case 'left': return <RemoveIcon />;
      case 'session_attended': return <EventIcon />;
      case 'session_missed': return <TimeIcon />;
      default: return <HistoryIcon />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'joined': return 'Aggiunto al gruppo';
      case 'left': return 'Rimosso dal gruppo';
      case 'session_attended': return 'Sessione frequentata';
      case 'session_missed': return 'Sessione mancata';
      default: return action;
    }
  };

  const getMembershipStatus = (membership) => {
    if (membership.is_active) {
      return 'active';
    } else if (membership.left_date) {
      return 'completed';
    } else {
      return 'inactive';
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento appartenenze ai gruppi...
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
            Appartenenze ai Gruppi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestisci la partecipazione di {patientName} ai gruppi terapeutici
          </Typography>
        </Box>
        
        {showAddButton && hasPermission('groups.assign') && (
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
            Aggiungi a Gruppo
          </Button>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Group Memberships */}
      {memberships.length === 0 ? (
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
              <GroupIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Nessuna appartenenza ai gruppi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Il paziente non è attualmente assegnato a nessun gruppo
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {memberships.map((membership) => (
            <Grid item xs={12} md={6} key={membership.id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {membership.group_name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                          label={membership.group_type} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={getMembershipStatus(membership)} 
                          size="small" 
                          color={groupStatusColors[getMembershipStatus(membership)]}
                        />
                      </Stack>
                    </Box>
                    
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedMembership(membership);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        PSICOLOGO
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {membership.psychologist}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        SESSIONI
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {membership.session_count} completate
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        INIZIO
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(membership.joined_date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {membership.is_active ? 'ATTIVO' : 'CONCLUSO'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {membership.is_active ? 'In corso...' : formatDate(membership.left_date)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add to Group Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aggiungi a Gruppo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Seleziona un gruppo a cui aggiungere {patientName}
            </Typography>
            
            <Autocomplete
              options={availableGroups}
              getOptionLabel={(option) => `${option.name} (${option.current_members}/${option.max_members} membri)`}
              value={selectedGroup}
              onChange={(event, newValue) => setSelectedGroup(newValue)}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main 
                    }}>
                      <GroupIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.psychologist} • {option.current_members}/{option.max_members} membri
                      </Typography>
                    </Box>
                    <Chip label={option.type} size="small" variant="outlined" />
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Seleziona Gruppo" placeholder="Cerca gruppi disponibili..." />
              )}
            />
            
            {selectedGroup && (
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Dettagli Gruppo Selezionato
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">TIPO</Typography>
                      <Typography variant="body2">{selectedGroup.type}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">CONDUTTORE</Typography>
                      <Typography variant="body2">{selectedGroup.psychologist}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">MEMBRI</Typography>
                      <Typography variant="body2">{selectedGroup.current_members}/{selectedGroup.max_members}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">STATUS</Typography>
                      <Chip label={selectedGroup.group_status || 'active'} size="small" color="success" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddDialogOpen(false)}>
            Annulla
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddToGroup}
            disabled={!selectedGroup}
          >
            Aggiungi al Gruppo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Membership History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cronologia Appartenenza</DialogTitle>
        <DialogContent>
          <List>
            {membershipHistory.map((entry, index) => (
              <ListItem key={entry.id} divider={index < membershipHistory.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main 
                  }}>
                    {getActionIcon(entry.action)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getActionLabel(entry.action)}
                  secondary={
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        {entry.note}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(entry.date)} • {entry.created_by}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          fetchMembershipHistory(selectedMembership?.id);
          setHistoryDialogOpen(true);
          setAnchorEl(null);
        }}>
          <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
          Visualizza Cronologia
        </MenuItem>
        {selectedMembership?.is_active && hasPermission('groups.assign') && (
          <MenuItem 
            onClick={() => {
              if (window.confirm('Sei sicuro di voler rimuovere il paziente da questo gruppo?')) {
                handleRemoveFromGroup(selectedMembership.id);
              }
            }}
            sx={{ color: 'error.main' }}
          >
            <RemoveIcon sx={{ mr: 1 }} fontSize="small" />
            Rimuovi dal Gruppo
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PatientGroupManager;