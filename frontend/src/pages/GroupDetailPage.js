import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  Autocomplete,
  ListItemText,
  Tooltip,
  CircularProgress,
  Container,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  RemoveCircle as RemoveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService, patientService, userService } from '../services/api';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [memberNotes, setMemberNotes] = useState('');
  
  // Data states
  const [operators, setOperators] = useState([]);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Filtered patients state - rimosso, ora usa filterOptions direttamente

  useEffect(() => {
    if (id) {
      fetchGroupDetail();
      fetchAvailablePatients();
      fetchAvailableOperators();
    }
  }, [id]);

  // Calculate available patients (patients not already in the group)
  const availablePatients = useMemo(() => {
    return patients.filter(patient => 
      !members.some(member => member.patient_id === patient.id && member.is_active)
    );
  }, [patients, members]);

  // Filtro dei pazienti ora gestito direttamente da filterOptions in Autocomplete

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroup(id);
      if (response.success) {
        setGroup(response.data);
        setMembers(response.data.members || []);
      } else {
        setError('Gruppo non trovato');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Errore nel caricamento del gruppo');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePatients = async () => {
    try {
      const response = await patientService.getPatients();
      console.log('Patients response:', response); // Debug
      setPatients(response.patients || response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAvailableOperators = async () => {
    try {
      const response = await userService.getUsers();
      console.log('Conductors response:', response); // Debug
      setOperators(response.users || response.data || []);
    } catch (error) {
      console.error('Error fetching conductors:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      // Aggiungi tutti i pazienti selezionati
      for (const patientId of selectedPatients) {
        const memberData = {
          patient_id: parseInt(patientId, 10),
          member_type: 'patient',
          notes: memberNotes
        };
        await groupService.addGroupMember(parseInt(id, 10), memberData);
      }
      
      // Se è stato selezionato un conduttore, aggiungilo separatamente
      if (selectedOperator) {
        const conductorData = {
          user_id: parseInt(selectedOperator, 10),
          member_type: 'conductor',
          notes: memberNotes
        };
        await groupService.addGroupMember(parseInt(id, 10), conductorData);
      }
      
      // Refresh data
      fetchGroupDetail();
      
      // Reset form
      setAddMemberDialog(false);
      setSelectedPatients([]);
      setSelectedOperator('');
      setMemberNotes('');
      
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error.response?.data?.message || 'Errore nell\'aggiunta dei membri');
    }
  };

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo membro dal gruppo?')) {
      try {
        await groupService.removeGroupMember(id, memberId);
        fetchGroupDetail();
      } catch (error) {
        console.error('Error removing member:', error);
        setError('Errore nella rimozione del membro');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  const getMemberTypeLabel = (type) => {
    switch (type) {
      case 'patient': return 'Paziente';
      case 'conductor': return 'Conduttore';
      default: return type;
    }
  };

  const getMemberTypeColor = (type) => {
    switch (type) {
      case 'patient': return 'primary';
      case 'conductor': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !group) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/groups')} 
          variant="outlined"
          color="inherit"
          sx={{ 
            mt: 2,
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
            }
          }}
        >
          Torna ai Gruppi
        </Button>
      </Box>
    );
  }

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate('/groups')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {group?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gruppo di supporto • {group?.group_type}
              </Typography>
            </Box>
          </Stack>
          {hasPermission('groups.write') && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setAddMemberDialog(true)}
                size="small"
              >
                Aggiungi
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/groups/${id}/edit`)}
                size="small"
              >
                Modifica
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Informazioni Principali */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <GroupIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Informazioni Gruppo
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Tipo Gruppo
              </Typography>
              <Chip
                label={group?.group_type}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Stato
              </Typography>
              <Chip
                label={getStatusLabel(group?.status)}
                color={getStatusColor(group?.status)}
                size="small"
              />
            </Box>

            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Descrizione
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {group?.description || 'Nessuna descrizione disponibile'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Data Inizio
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(group?.start_date)}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Frequenza Incontri
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {group?.meeting_frequency || 'Non specificata'}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Luogo Incontri
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {group?.meeting_location || 'Non specificato'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Membri del Gruppo */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PeopleIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Membri del Gruppo ({members.filter(m => m.is_active).length}{group?.max_members ? `/${group.max_members}` : ''})
            </Typography>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Ruolo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Iscrizione</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Contatti</TableCell>
                  {hasPermission('groups.write') && (
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Azioni</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.filter(member => member.is_active).map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.nome} {member.cognome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMemberTypeLabel(member.member_type)}
                        size="small"
                        color={getMemberTypeColor(member.member_type)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.role || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(member.joined_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {member.email && (
                          <Tooltip title={member.email}>
                            <IconButton size="small">
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {member.telefono && (
                          <Tooltip title={member.telefono}>
                            <IconButton size="small">
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    {hasPermission('groups.write') && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, member)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {members.filter(m => m.is_active).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Nessun membro attivo nel gruppo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Usa il pulsante "Aggiungi" per iniziare
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Paper>

      </Stack>
    </Container>

    {/* Add Member Dialog */}
    <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAddIcon color="primary" />
            <Box>
              <Typography variant="h6" component="div">
                Gestisci Membri del Gruppo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualizza i membri attuali e aggiungi nuovi membri al gruppo "{group?.name}"
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {/* Sezione Membri Attuali */}
          {members.filter(member => member.is_active).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                Membri Attuali ({members.filter(member => member.is_active).length})
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {members.filter(member => member.is_active).map((member) => (
                  <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, px: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: member.member_type === 'patient' ? 'primary.main' : 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {member.nome?.charAt(0)}{member.cognome?.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {member.nome} {member.cognome}
                      </Typography>
                    </Box>
                    <Chip
                      label={getMemberTypeLabel(member.member_type)}
                      size="small"
                      color={getMemberTypeColor(member.member_type)}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Sezione Aggiungi Nuovi Membri */}
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Aggiungi Nuovi Membri
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                multiple
                options={availablePatients}
                getOptionLabel={(option) => 
                  option ? `${option.nome} ${option.cognome}` : ''
                }
                value={availablePatients.filter(p => selectedPatients.includes(p.id))}
                onChange={(event, newValue) => {
                  setSelectedPatients(newValue.map(patient => patient.id));
                }}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(patient => {
                    return (
                      patient.nome?.toLowerCase().includes(searchTerm) ||
                      patient.cognome?.toLowerCase().includes(searchTerm) ||
                      patient.codice_fiscale?.toLowerCase().includes(searchTerm) ||
                      `${patient.nome} ${patient.cognome}`.toLowerCase().includes(searchTerm)
                    );
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleziona Pazienti *"
                    placeholder="Cerca e seleziona uno o più pazienti..."
                    helperText="Scegli i pazienti da aggiungere al gruppo di supporto"
                    required
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps} sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {option.nome?.charAt(0)}{option.cognome?.charAt(0)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {option.nome} {option.cognome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            CF: {option.codice_fiscale}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="Nessun paziente disponibile per questo gruppo"
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={operators}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  const firstName = option.firstname || option.first_name || option.nome || '';
                  const lastName = option.lastname || option.last_name || option.cognome || '';
                  const role = option.role || option.ruolo || option.job_title || 'Conduttore';
                  return `${firstName} ${lastName} - ${role}`.trim();
                }}
                value={operators.find(op => op.id === selectedOperator) || null}
                onChange={(event, newValue) => {
                  setSelectedOperator(newValue ? newValue.id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Aggiungi Conduttore (opzionale)"
                    placeholder="Cerca conduttore da assegnare al gruppo..."
                    helperText="Opzionalmente puoi aggiungere un conduttore che guiderà questo gruppo"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps} sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'secondary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {(option.firstname || option.first_name || option.nome || '')?.charAt(0)}{(option.lastname || option.last_name || option.cognome || '')?.charAt(0)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {option.firstname || option.first_name || option.nome || ''} {option.lastname || option.last_name || option.cognome || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.role || option.ruolo || option.job_title || 'Conduttore'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="Nessun conduttore disponibile"
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note aggiuntive (opzionale)"
                placeholder="Informazioni aggiuntive sui membri o sul loro coinvolgimento nel gruppo..."
                multiline
                rows={3}
                value={memberNotes}
                onChange={(e) => setMemberNotes(e.target.value)}
                helperText="Eventuali informazioni utili per la gestione dei membri nel gruppo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button 
            onClick={() => setAddMemberDialog(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained"
            color="primary"
            disabled={selectedPatients.length === 0}
            startIcon={<PersonAddIcon />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              '&:disabled': {
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
              }
            }}
          >
            {selectedPatients.length > 0 
              ? `Aggiungi ${selectedPatients.length} ${selectedPatients.length === 1 ? 'Paziente' : 'Pazienti'} al Gruppo`
              : 'Seleziona almeno un Paziente'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemComponent 
            onClick={() => handleRemoveMember(selectedMember?.id)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <RemoveIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Rimuovi dal Gruppo</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>
    </>
  );
};

export default GroupDetailPage;
