import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingService, patientService } from '../services/api';

const InvoiceEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    description: '',
    amount: '',
    payment_method: 'contanti',
    issue_date: ''
  });
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Check permissions
  useEffect(() => {
    if (!hasPermission('billing.update')) {
      navigate('/billing');
    }
  }, [hasPermission, navigate]);

  // Load invoice data and patients
  useEffect(() => {
    loadInvoiceData();
    loadPatients();
  }, [id]);

  const loadInvoiceData = async () => {
    try {
      setPageLoading(true);
      const response = await billingService.getInvoice(id);
      const invoice = response.data;
          
      setFormData({
        patient_id: invoice.patient_id,
        description: invoice.description,
        amount: invoice.amount.toString(),
        payment_method: invoice.payment_method,
        issue_date: invoice.issue_date ? invoice.issue_date.split('T')[0] : ''
      });
      
      // We'll set the selected patient after patients are loaded
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Errore nel caricamento della fattura: ' + (error.response?.data?.error || error.message));
    } finally {
      setPageLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 1000 });
      const patients = response.patients || [];
      setPatients(patients);
      
      // Set selected patient after patients are loaded
      if (formData.patient_id) {
        const patient = patients.find(p => p.id === formData.patient_id);
        setSelectedPatient(patient || null);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Errore nel caricamento dei pazienti: ' + (error.response?.data?.error || error.message));
    }
  };

  // Update selected patient when formData.patient_id changes
  useEffect(() => {
    if (formData.patient_id && patients.length > 0) {
      const patient = patients.find(p => p.id === formData.patient_id);
      setSelectedPatient(patient || null);
    }
  }, [formData.patient_id, patients]);

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

    try {
      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount),
        issue_date: formData.issue_date ? new Date(formData.issue_date).toISOString() : undefined
      };

      await billingService.updateInvoice(id, invoiceData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/billing/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setError(error.response?.data?.error || 'Errore nella modifica della fattura');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/billing/${id}`);
  };

  if (pageLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6">Fattura modificata con successo!</Typography>
            <Typography>Verrai reindirizzato ai dettagli della fattura...</Typography>
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
          >
            Indietro
          </Button>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            Modifica Fattura
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
                    <MenuItem value="tracciabile">Modalità Tracciabile</MenuItem>
                  </TextField>
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
                    >
                      Annulla
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salva Modifiche'}
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

export default InvoiceEditPage;