import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Divider,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Euro as EuroIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingService, patientService } from '../services/api';
import { generateInvoicePDF } from '../services/pdfServiceSimple';

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    description: '',
    amount: '',
    payment_method: 'contanti',
    due_days: 30,
    issue_date: new Date().toISOString().split('T')[0] // Today's date
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Check permissions
  useEffect(() => {
    if (!hasPermission('billing.create')) {
      navigate('/billing');
    }
  }, [hasPermission, navigate]);

  // Load patients for dropdown
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      console.log('Loading patients...');
      const response = await patientService.getPatients({ limit: 1000 });
      console.log('Full response:', response);
      
      // Correct structure: response.patients
      const patients = response.patients || [];
      setPatients(patients);
      console.log('Patients loaded:', patients.length);
      console.log('First patient:', patients[0]);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Errore nel caricamento dei pazienti: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handlePatientChange = (event, newValue) => {
    setSelectedPatient(newValue);
    setFormData({
      ...formData,
      patient_id: newValue ? newValue.id : ''
    });
    // Clear errors when user selects
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.patient_id) {
      setError('Selezionare un paziente');
      return false;
    }
    if (!formData.description || formData.description.length < 5) {
      setError('La descrizione deve essere di almeno 5 caratteri');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Inserire un importo valido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    const invoiceData = {
      ...formData,
      amount: parseFloat(formData.amount),
      due_days: parseInt(formData.due_days),
      issue_date: formData.issue_date ? new Date(formData.issue_date) : undefined
    };

    try {
      const response = await billingService.createInvoice(invoiceData);
      
      // Genera PDF della fattura
      try {
        const pdfResult = generateInvoicePDF(invoiceData, selectedPatient);
        console.log('PDF generato:', pdfResult.fileName);
      } catch (pdfError) {
        console.error('Errore nella generazione PDF:', pdfError);
        // Non bloccare il flusso se il PDF fallisce
      }
      
      setSuccess(true);
      
      // Redirect after 3 seconds (più tempo per vedere il messaggio)
      setTimeout(() => {
        navigate('/billing');
      }, 3000);
    } catch (error) {
      console.error('Error creating invoice:', error);
      console.error('Error response:', error.response?.data);
      console.error('Request data:', invoiceData);
      
      // Mostra dettagli dell'errore di validazione
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        setError(`Errore di validazione: ${errorMessages}`);
      } else {
        setError(error.response?.data?.error || 'Errore nella creazione della fattura');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/billing');
  };

  const handlePreviewPDF = () => {
    if (!validateForm()) {
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount),
        due_days: parseInt(formData.due_days),
        issue_date: formData.issue_date ? new Date(formData.issue_date) : undefined
      };

      generateInvoicePDF(invoiceData, selectedPatient);
    } catch (error) {
      console.error('Errore nella generazione anteprima PDF:', error);
      setError('Errore nella generazione dell\'anteprima PDF');
    }
  };

  if (success) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <PdfIcon />
              <Typography variant="h6">Fattura creata con successo!</Typography>
            </Box>
            <Typography>Il PDF della fattura è stato generato e scaricato automaticamente.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Verrai reindirizzato alla lista fatture...
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
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
            Indietro
          </Button>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            Nuova Fattura
          </Typography>
        </Box>

        <Paper elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Error Alert */}
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}

                {/* Patient Selection */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) => `${option.nome} ${option.cognome} - ${option.codice_fiscale}`}
                    value={selectedPatient}
                    onChange={handlePatientChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Paziente *"
                        required
                        placeholder="Cerca un paziente..."
                        helperText={`${patients.length} pazienti disponibili`}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterOptions={(options, { inputValue }) => {
                      return options.filter((option) =>
                        `${option.nome} ${option.cognome} ${option.codice_fiscale}`.toLowerCase().includes(inputValue.toLowerCase())
                      );
                    }}
                    noOptionsText="Nessun paziente trovato"
                  />
                </Grid>

                {/* Issue Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data Emissione"
                    type="date"
                    value={formData.issue_date}
                    onChange={handleInputChange('issue_date')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrizione Servizio/Trattamento *"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    placeholder="Descrivi il servizio o trattamento fornito..."
                    required
                    helperText="Minimo 5 caratteri"
                  />
                </Grid>

                {/* Amount */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Importo *"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange('amount')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EuroIcon /></InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    required
                  />
                </Grid>

                {/* Payment Method */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Modalità di Pagamento"
                    value={formData.payment_method}
                    onChange={handleInputChange('payment_method')}
                  >
                    <MenuItem value="contanti">Contanti</MenuItem>
                    <MenuItem value="bonifico">Bonifico</MenuItem>
                    <MenuItem value="pos">POS</MenuItem>
                  </TextField>
                </Grid>

                {/* Due Days */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giorni Scadenza"
                    type="number"
                    value={formData.due_days}
                    onChange={handleInputChange('due_days')}
                    inputProps={{ min: 1, max: 365 }}
                    helperText="Numero di giorni dalla data emissione"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
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
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={handlePreviewPDF}
                      disabled={loading || !selectedPatient}
                      color="primary"
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        }
                      }}
                    >
                      Anteprima PDF
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                      color="primary"
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
                      {loading ? 'Creazione...' : 'Crea Fattura'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateInvoicePage;