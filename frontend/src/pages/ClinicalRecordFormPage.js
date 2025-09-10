import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Stack,
  Alert,
  IconButton,
  MenuItem,
  Divider,
  Paper,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { clinicalService, patientService } from '../services/api';

const ClinicalRecordFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    record_number: '',
    status: 'active',
    diagnosis: '',
    treatment_plan: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      fetchRecord();
    } else {
      generateRecordNumber();
    }
    fetchPatients();
  }, [isEdit, id]);

  useEffect(() => {
    if (!hasPermission('clinical.write')) {
      navigate('/clinical-records');
    }
  }, [hasPermission, navigate]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await clinicalService.getRecord(id);
      if (response.success) {
        setFormData(response.data);
      } else {
        setError('Cartella clinica non trovata');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Errore nel caricamento della cartella clinica');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 100 });
      setPatients(response.patients || []);
      setFilteredPatients(response.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const generateRecordNumber = () => {
    const timestamp = Date.now();
    const recordNumber = `CR-${timestamp.toString().slice(-8)}`;
    setFormData(prev => ({ ...prev, record_number: recordNumber }));
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
    
    if (!formData.patient_id) {
      errors.patient_id = 'Seleziona un paziente';
    }
    
    if (!formData.diagnosis.trim()) {
      errors.diagnosis = 'La diagnosi è obbligatoria';
    }
    
    if (!formData.treatment_plan.trim()) {
      errors.treatment_plan = 'Il piano di cura è obbligatorio';
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
        patient_id: parseInt(formData.patient_id),
      };
      
      let response;
      if (isEdit) {
        response = await clinicalService.updateRecord(id, submitData);
      } else {
        response = await clinicalService.createRecord(submitData);
      }
      
      if (response.success) {
        navigate('/clinical-records');
      } else {
        setError(response.message || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.response?.data?.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinical-records');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography>Caricamento...</Typography>
      </Container>
    );
  }

  const selectedPatient = patients.find(p => p.id === parseInt(formData.patient_id));

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
              {isEdit ? 'Modifica Cartella Clinica' : 'Nuova Cartella Clinica'}
            </Typography>
            {formData.record_number && (
              <Typography variant="body2" color="text.secondary">
                {formData.record_number}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            
            {/* Patient Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Paziente
              </Typography>
              <Autocomplete
                fullWidth
                options={filteredPatients}
                getOptionLabel={(option) => 
                  option ? `${option.nome} ${option.cognome} - ${option.codice_fiscale}` : ''
                }
                value={selectedPatient || null}
                onChange={(event, newValue) => {
                  handleInputChange('patient_id', newValue ? newValue.id : '');
                }}
                onInputChange={(event, newInputValue) => {
                  // Filtra i pazienti in base al testo di ricerca
                  const filtered = patients.filter(patient => {
                    const searchTerm = newInputValue.toLowerCase();
                    return (
                      patient.nome?.toLowerCase().includes(searchTerm) ||
                      patient.cognome?.toLowerCase().includes(searchTerm) ||
                      patient.codice_fiscale?.toLowerCase().includes(searchTerm) ||
                      `${patient.nome} ${patient.cognome}`.toLowerCase().includes(searchTerm)
                    );
                  });
                  setFilteredPatients(filtered);
                }}
                disabled={isEdit}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Cerca paziente per nome, cognome o codice fiscale..."
                    error={Boolean(formErrors.patient_id)}
                    helperText={formErrors.patient_id}
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {option.nome} {option.cognome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CF: {option.codice_fiscale} • ID: {option.id}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText="Nessun paziente trovato"
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                filterOptions={(options) => options} // Disabilita il filtro interno di MUI
              />
              {selectedPatient && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {selectedPatient.email} • {selectedPatient.telefono}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Clinical Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Informazioni Cliniche
              </Typography>
              
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Diagnosi *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    error={Boolean(formErrors.diagnosis)}
                    helperText={formErrors.diagnosis}
                    placeholder="es. Disturbo d'Ansia Generalizzata (F41.1)"
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Piano di Cura *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.treatment_plan}
                    onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                    error={Boolean(formErrors.treatment_plan)}
                    helperText={formErrors.treatment_plan}
                    placeholder="Descrivi il piano di trattamento dettagliato..."
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Note Aggiuntive
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Note, osservazioni, farmaci prescritti..."
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Stato
                  </Typography>
                  <TextField
                    select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="active">Attivo</MenuItem>
                    <MenuItem value="archived">Archiviato</MenuItem>
                    <MenuItem value="closed">Chiuso</MenuItem>
                  </TextField>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  borderColor: '#6b7280',
                  color: '#374151',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    backgroundColor: '#f8fafc',
                  },
                  '&:disabled': {
                    borderColor: '#d1d5db',
                    color: '#9ca3af',
                  }
                }}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? null : <SaveIcon />}
                disabled={saving}
                sx={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                  },
                  '&:disabled': {
                    backgroundColor: '#9ca3af',
                    color: '#ffffff',
                  }
                }}
              >
                {saving ? 'Salvataggio...' : (isEdit ? 'Aggiorna' : 'Crea Cartella')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* Help Text */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Suggerimento:</strong> Assicurati che la diagnosi sia precisa e il piano di cura sia dettagliato. 
          Queste informazioni saranno utilizzate per il monitoraggio del paziente.
        </Typography>
      </Box>
    </Container>
  );
};

export default ClinicalRecordFormPage;