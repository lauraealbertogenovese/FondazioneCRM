import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
  Divider,
  Container,
  Stack,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { visitService, clinicalService } from '../services/api';

const VisitFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  
  const [formData, setFormData] = useState({
    clinical_record_id: '',
    visit_type: '',
    visit_date: '',
    doctor_name: '',
    visit_notes: '',
    follow_up_date: '',
    status: 'scheduled'
  });

  const visitTypes = [
    { value: 'individual', label: 'Terapia Individuale' },
    { value: 'group', label: 'Terapia di Gruppo' },
    { value: 'family', label: 'Terapia Familiare' },
    { value: 'medical', label: 'Visita Clinica' },
    { value: 'intake', label: 'Colloquio di Intake' },
    { value: 'emergency', label: 'Intervento di Emergenza' },
    { value: 'consultation', label: 'Consulenza' },
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Programmata' },
    { value: 'completed', label: 'Completata' },
    { value: 'cancelled', label: 'Cancellata' },
    { value: 'rescheduled', label: 'Riprogrammata' },
  ];

  useEffect(() => {
    loadClinicalRecords();
    if (isEdit) {
      loadVisit();
    }
  }, [id, isEdit]);

  const loadClinicalRecords = async () => {
    try {
      const response = await clinicalService.getAll();
      setClinicalRecords(response.records || []);
      setFilteredRecords(response.records || []);
    } catch (error) {
      console.error('Errore nel caricamento delle cartelle cliniche:', error);
    }
  };

  const loadVisit = async () => {
    setLoading(true);
    try {
      const response = await visitService.getById(id);
      setFormData({
        clinical_record_id: response.visit.clinical_record_id || '',
        visit_type: response.visit.visit_type || '',
        visit_date: response.visit.visit_date ? 
          new Date(response.visit.visit_date).toISOString().slice(0, 16) : '',
        doctor_name: response.visit.doctor_name || '',
        visit_notes: response.visit.visit_notes || '',
        follow_up_date: response.visit.follow_up_date ? 
          response.visit.follow_up_date.split('T')[0] : '',
        status: response.visit.status || 'scheduled'
      });
    } catch (error) {
      console.error('Errore nel caricamento della visita:', error);
      setError('Errore nel caricamento della visita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value?.id || ''
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.clinical_record_id) {
      setError('Seleziona una cartella clinica');
      return false;
    }
    if (!formData.visit_type) {
      setError('Seleziona il tipo di visita');
      return false;
    }
    if (!formData.visit_date) {
      setError('Inserisci la data e ora della visita');
      return false;
    }
    if (!formData.doctor_name) {
      setError('Inserisci il nome del clinico/operatore');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        visit_date: new Date(formData.visit_date).toISOString(),
        follow_up_date: formData.follow_up_date || null
      };

      if (isEdit) {
        await visitService.update(id, submitData);
        setSuccess('Visita aggiornata con successo');
      } else {
        await visitService.create(submitData);
        setSuccess('Visita creata con successo');
      }

      setTimeout(() => {
        navigate('/visits');
      }, 1500);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      setError(error.response?.data?.message || 'Errore nel salvataggio della visita');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getClinicalRecordLabel = (record) => {
    return `${record.record_number} - ${record.first_name} ${record.last_name}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <IconButton onClick={() => navigate('/visits')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Modifica Visita' : 'Nuova Visita'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Aggiorna i dettagli della visita' : 'Crea una nuova visita per il paziente'}
            </Typography>
          </Box>
        </Stack>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Cartella Clinica */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Cartella Clinica
                </Typography>
                <Autocomplete
                  options={filteredRecords}
                  value={clinicalRecords.find(r => r.id === formData.clinical_record_id) || null}
                  onChange={(event, newValue) => handleAutocompleteChange('clinical_record_id', newValue)}
                  onInputChange={(event, newInputValue) => {
                    // Filtra le cartelle cliniche in base al testo di ricerca
                    const filtered = clinicalRecords.filter(record => {
                      const searchTerm = newInputValue.toLowerCase();
                      return (
                        record.record_number?.toLowerCase().includes(searchTerm) ||
                        record.first_name?.toLowerCase().includes(searchTerm) ||
                        record.last_name?.toLowerCase().includes(searchTerm) ||
                        record.diagnosis?.toLowerCase().includes(searchTerm) ||
                        `${record.first_name} ${record.last_name}`.toLowerCase().includes(searchTerm)
                      );
                    });
                    setFilteredRecords(filtered);
                  }}
                  getOptionLabel={getClinicalRecordLabel}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Cerca cartella clinica per numero, paziente o diagnosi..."
                      fullWidth
                      size="small"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.record_number} - {option.first_name} {option.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Diagnosi: {option.diagnosis || 'Non specificata'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  disabled={isEdit}
                  size="small"
                  noOptionsText="Nessuna cartella clinica trovata"
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  filterOptions={(options) => options} // Disabilita il filtro interno di MUI
                />
              </Box>

              <Divider />

              {/* Visit Details */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Dettagli Visita
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Tipo Visita *
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      name="visit_type"
                      value={formData.visit_type}
                      onChange={handleChange}
                      size="small"
                    >
                      {visitTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Stato
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      size="small"
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Data e Ora Visita *
                    </Typography>
                    <TextField
                      name="visit_date"
                      type="datetime-local"
                      value={formData.visit_date}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Clinico/Operatore *
                    </Typography>
                    <TextField
                      name="doctor_name"
                      value={formData.doctor_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      placeholder="Nome del clinico o operatore"
                    />
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Note della Visita
                </Typography>
                <TextField
                  name="visit_notes"
                  value={formData.visit_notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  placeholder="Inserisci le note della visita, osservazioni, trattamenti..."
                />
              </Box>

              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Data Follow-up
                </Typography>
                <TextField
                  name="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>


            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/visits')}
                disabled={submitLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitLoading}
              >
                {submitLoading ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Crea'}
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Help Text */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Suggerimento:</strong> Assicurati di specificare il tipo di visita corretto e di inserire note dettagliate per un migliore follow-up del paziente.
          </Typography>
        </Box>
    </Container>
  );
};

export default VisitFormPage;