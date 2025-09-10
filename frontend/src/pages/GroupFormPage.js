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
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/api';

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
    group_type: 'support',
    max_members: 10,
    status: 'active',
    start_date: '',
    end_date: '',
    meeting_frequency: '',
    meeting_location: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      fetchGroup();
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (!hasPermission('groups.write')) {
      navigate('/groups');
    }
  }, [hasPermission, navigate]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroup(id);
      if (response.success) {
        const group = response.data;
        setFormData({
          name: group.name || '',
          description: group.description || '',
          group_type: group.group_type || 'support',
          max_members: group.max_members || 10,
          status: group.status || 'active',
          start_date: group.start_date ? group.start_date.split('T')[0] : '',
          end_date: group.end_date ? group.end_date.split('T')[0] : '',
          meeting_frequency: group.meeting_frequency || '',
          meeting_location: group.meeting_location || ''
        });
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
    
    if (!formData.group_type) {
      errors.group_type = 'Il tipo di gruppo è obbligatorio';
    }
    
    if (!formData.max_members || formData.max_members < 1) {
      errors.max_members = 'Il numero massimo di membri deve essere almeno 1';
    }
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        errors.end_date = 'La data di fine deve essere successiva alla data di inizio';
      }
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
        max_members: parseInt(formData.max_members),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };
      
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
              Informazioni di Base
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 2 }}>
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
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Tipo Gruppo *
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.group_type}
                  onChange={(e) => handleInputChange('group_type', e.target.value)}
                  error={Boolean(formErrors.group_type)}
                  helperText={formErrors.group_type}
                  size="small"
                >
                  <MenuItem value="support">Supporto</MenuItem>
                  <MenuItem value="therapy">Terapia</MenuItem>
                  <MenuItem value="activity">Attività</MenuItem>
                  <MenuItem value="education">Educativo</MenuItem>
                  <MenuItem value="rehabilitation">Riabilitazione</MenuItem>
                </TextField>
              </Box>
            </Stack>
              
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
          </Box>

          <Divider />
              
          {/* Settings */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Impostazioni
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Max Membri *
                </Typography>
                <TextField
                  type="number"
                  value={formData.max_members}
                  onChange={(e) => handleInputChange('max_members', e.target.value)}
                  error={Boolean(formErrors.max_members)}
                  helperText={formErrors.max_members}
                  inputProps={{ min: 1, max: 50 }}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Status
                </Typography>
                <TextField
                  select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  size="small"
                  sx={{ width: 140 }}
                >
                  <MenuItem value="active">Attivo</MenuItem>
                  <MenuItem value="inactive">Inattivo</MenuItem>
                  <MenuItem value="archived">Archiviato</MenuItem>
                </TextField>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Frequenza Incontri
                </Typography>
                <TextField
                  fullWidth
                  value={formData.meeting_frequency}
                  onChange={(e) => handleInputChange('meeting_frequency', e.target.value)}
                  placeholder="es. Settimanale, Bisettimanale"
                  size="small"
                />
              </Box>
            </Stack>
          </Box>
              
          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Data Inizio
                </Typography>
                <TextField
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ width: 160 }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Data Fine
                </Typography>
                <TextField
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  error={Boolean(formErrors.end_date)}
                  helperText={formErrors.end_date}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ width: 160 }}
                />
              </Box>
            </Stack>
            
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Luogo Incontri
              </Typography>
              <TextField
                fullWidth
                value={formData.meeting_location}
                onChange={(e) => handleInputChange('meeting_location', e.target.value)}
                placeholder="es. Sala A - Piano 1, Studio 205"
                size="small"
              />
            </Box>
          </Box>
              
          <Divider />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
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
