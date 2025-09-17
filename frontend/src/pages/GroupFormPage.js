import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService, userService, patientService } from '../services/api';

const GroupFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meeting_frequency: '',
    max_members: 8,
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({});
  
  // Multi-select states
  const [selectedConductors, setSelectedConductors] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Options
  const [conductors, setConductors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Group data for syncing after options load
  const [groupData, setGroupData] = useState(null);

  useEffect(() => {
    fetchOptions();
    if (isEdit && id) {
      fetchGroup();
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (!hasPermission('groups.write')) {
      navigate('/groups');
    }
  }, [hasPermission, navigate]);

  // Sync existing group members with loaded options
  useEffect(() => {
    if (groupData && conductors.length > 0 && patients.length > 0) {
      if (groupData.members) {
        console.log('Syncing members with options...');
        console.log('Group members:', groupData.members);
        console.log('Available conductors:', conductors);
        console.log('Available patients:', patients);
        
        // Match existing conductors with loaded conductor options
        const existingConductorIds = groupData.members
          .filter(member => member.member_type === 'conductor')
          .map(member => member.user_id);

        console.log('Existing conductor IDs:', existingConductorIds);

        const matchedConductors = conductors.filter(conductor =>
          existingConductorIds.includes(conductor.id)
        );

        console.log('Matched conductors:', matchedConductors);

        // Match existing members with loaded patient options
        const existingMemberIds = groupData.members
          .filter(member => member.member_type === 'patient')
          .map(member => member.patient_id);

        const matchedMembers = patients.filter(patient =>
          existingMemberIds.includes(patient.id)
        );

        setSelectedConductors(matchedConductors);
        setSelectedMembers(matchedMembers);
      }
    }
  }, [groupData, conductors, patients]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      
      // Fetch conductors (users)
      const usersResponse = await userService.getUsers();
      setConductors(usersResponse.users || []);
      
      // Fetch patients
      const patientsResponse = await patientService.getPatients();
      setPatients(patientsResponse.patients || []);
      
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Errore nel caricamento delle opzioni');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroup(id);
      if (response.success) {
        const group = response.data;
        console.log('Group data from backend:', group);
        console.log('Group members:', group.members);
        
        setFormData({
          name: group.name || '',
          description: group.description || '',
          meeting_frequency: group.meeting_frequency || '',
          max_members: group.max_members || 8,
          status: group.status || 'active'
        });
        
        // Store group data for later processing when options are loaded
        setGroupData(group);

        // Load existing members and conductors
        if (group.members) {
          const existingConductors = group.members
            .filter(member => member.member_type === 'conductor')
            .map(member => ({
              id: member.user_id,
              first_name: member.nome,
              last_name: member.cognome,
              role: member.role || 'Staff'
            }));

          const existingMembers = group.members
            .filter(member => member.member_type === 'patient')
            .map(member => ({
              id: member.patient_id,
              nome: member.nome,
              cognome: member.cognome
            }));

          setSelectedConductors(existingConductors);
          setSelectedMembers(existingMembers);
        }
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Il nome del gruppo è obbligatorio';
    }
    
    if (!formData.meeting_frequency.trim()) {
      errors.meeting_frequency = 'La frequenza degli incontri è obbligatoria';
    }
    
    if (selectedConductors.length === 0) {
      errors.conductors = 'Almeno un conduttore è obbligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const submitData = {
        ...formData,
        conductors: selectedConductors.map(c => c.id),
        members: selectedMembers.map(m => m.id)
      };

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('selectedConductors:', selectedConductors);
      console.log('selectedConductors.length:', selectedConductors.length);
      console.log('selectedMembers:', selectedMembers);
      console.log('selectedMembers.length:', selectedMembers.length);
      console.log('submitData before API call:', submitData);
      console.log('conductors array:', submitData.conductors);
      console.log('conductors array length:', submitData.conductors.length);
      console.log('members array:', submitData.members);
      console.log('members array length:', submitData.members.length);
      console.log('Array.isArray(submitData.conductors):', Array.isArray(submitData.conductors));
      console.log('Array.isArray(submitData.members):', Array.isArray(submitData.members));

      // Test each conductor mapping
      selectedConductors.forEach((conductor, index) => {
        console.log(`conductor[${index}]:`, conductor);
        console.log(`conductor[${index}].id:`, conductor.id);
      });

      // Test each member mapping
      selectedMembers.forEach((member, index) => {
        console.log(`member[${index}]:`, member);
        console.log(`member[${index}].id:`, member.id);
      });

      console.log('==============================');

      let response;
      if (isEdit) {
        response = await groupService.updateGroup(id, submitData);
      } else {
        response = await groupService.createGroup(submitData);
      }
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          if (isEdit) {
            navigate(`/groups/${id}`);
          } else {
            navigate('/groups');
          }
        }, 1500);
      } else {
        setError(response.message || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Error saving group:', error);
      setError(error.response?.data?.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEdit) {
      navigate(`/groups/${id}`);
    } else {
      navigate('/groups');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <IconButton onClick={handleCancel} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Modifica Gruppo' : 'Nuovo Gruppo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Aggiorna le informazioni del gruppo' : 'Crea un nuovo gruppo di terapia'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Gruppo {isEdit ? 'aggiornato' : 'creato'} con successo!
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
          
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Informazioni del Gruppo
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Nome Gruppo *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                  placeholder="es. Gruppo Supporto Ansia"
                  size="small"
                />
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Descrizione
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrizione dettagliata del gruppo e dei suoi obiettivi..."
                  size="small"
                />
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Frequenza Incontri *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.meeting_frequency}
                  onChange={(e) => handleInputChange('meeting_frequency', e.target.value)}
                  error={Boolean(formErrors.meeting_frequency)}
                  helperText={formErrors.meeting_frequency}
                  placeholder="es. Settimanale, Bisettimanale, Mensile"
                  size="small"
                />
              </Box>
            </Stack>
          </Box>

          <Divider />
              
          {/* Conductors and Members */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Conduttori e Membri
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Conduttori *
                </Typography>
                <Autocomplete
                  multiple
                  options={conductors}
                  value={selectedConductors}
                  onChange={(event, newValue) => {
                    setSelectedConductors(newValue);
                    // Clear error when user selects conductors
                    if (formErrors.conductors && newValue.length > 0) {
                      setFormErrors(prev => ({ ...prev, conductors: null }));
                    }
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => `${option.first_name || option.nome || ''} ${option.last_name || option.cognome || ''} (${option.role || option.ruolo || option.job_title || 'Staff'})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Seleziona uno o più conduttori..."
                      size="small"
                      error={Boolean(formErrors.conductors)}
                      helperText={formErrors.conductors}
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...chipProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={option.id}
                          label={`${option.first_name || option.nome || ''} ${option.last_name || option.cognome || ''}`}
                          {...chipProps}
                          size="small"
                          color="primary"
                        />
                      );
                    })
                  }
                  loading={loadingOptions}
                  noOptionsText="Nessun conduttore trovato"
                />
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Membri (Pazienti)
                </Typography>
                <Autocomplete
                  multiple
                  options={patients}
                  value={selectedMembers}
                  onChange={(event, newValue) => {
                    setSelectedMembers(newValue);
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => `${option.nome || ''} ${option.cognome || ''}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Seleziona i pazienti da aggiungere al gruppo..."
                      size="small"
                      helperText="Opzionale - puoi aggiungere membri anche dopo la creazione del gruppo"
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                      const { key, ...chipProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={option.id}
                          label={`${option.nome || ''} ${option.cognome || ''}`}
                          {...chipProps}
                          size="small"
                          color="secondary"
                        />
                      );
                    })
                  }
                  loading={loadingOptions}
                  noOptionsText="Nessun paziente trovato"
                />
              </Box>
            </Stack>
          </Box>
              
          <Divider />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'primary.main',
                }
              }}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                }
              }}
            >
              {saving ? 'Salvataggio...' : (isEdit ? 'Aggiorna Gruppo' : 'Crea Gruppo')}
            </Button>
          </Stack>
          
          </Stack>
        </form>
      </Paper>
      
      {/* Help Text */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Suggerimento:</strong> Il nome del gruppo dovrebbe essere descrittivo e facilmente riconoscibile. 
          La descrizione aiuta i membri a comprendere gli obiettivi del gruppo.
        </Typography>
      </Box>
    </Container>
  );
};

export default GroupFormPage;
