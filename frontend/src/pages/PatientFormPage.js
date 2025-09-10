import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Container,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { patientService } from '../services/api';

const PatientFormPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState(null);

  const [formData, setFormData] = useState({
    codice_fiscale: '',
    numero_tessera_sanitaria: '',
    nome: '',
    cognome: '',
    data_nascita: '',
    sesso: '',
    telefono: '',
    email: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    consenso_trattamento_dati: false,
    note: '',
    // New fields as per TODO requirements
    sostanza_abuso: '', // Substance of abuse
    abusi_secondari: [], // Secondary substance abuse (multi-select)
    diagnosi_primaria: '', // Primary diagnosis
    stato_civile: '', // Civil status
    lavoro: '', // Work information
  });

  const [errors, setErrors] = useState({});
  
  // Opzioni per i selettori
  const sostanzaAbusoOptions = [
    { value: '', label: 'Nessuna' },
    { value: 'alcol', label: 'Alcol' },
    { value: 'cannabis', label: 'Cannabis' },
    { value: 'cocaina', label: 'Cocaina' },
    { value: 'eroina', label: 'Eroina' },
    { value: 'anfetamine', label: 'Anfetamine' },
    { value: 'ecstasy', label: 'Ecstasy/MDMA' },
    { value: 'benzodiazepine', label: 'Benzodiazepine' },
    { value: 'oppiacei', label: 'Oppiacei' },
    { value: 'altro', label: 'Altro' },
    { value: 'policonsumo', label: 'Policonsumo' },
  ];
  

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [id, isEdit]);


  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatient(id);
      const patientData = response.patient;
      
      setPatient(patientData);
      // Destructure to exclude come_vi_raggiunge field
      const { come_vi_raggiunge, ...cleanPatientData } = patientData;
      
      setFormData({
        ...cleanPatientData,
        // Convert null values to empty strings for text fields
        nome: patientData.nome || '',
        cognome: patientData.cognome || '',
        codice_fiscale: patientData.codice_fiscale || '',
        numero_tessera_sanitaria: patientData.numero_tessera_sanitaria || '',
        telefono: patientData.telefono || '',
        email: patientData.email || '',
        indirizzo: patientData.indirizzo || '',
        citta: patientData.citta || '',
        provincia: patientData.provincia || '',
        cap: patientData.cap || '',
        professione: patientData.professione || '',
        stato_civile: patientData.stato_civile || '',
        note: patientData.note || '',
        data_nascita: patientData.data_nascita ? patientData.data_nascita.split('T')[0] : '',
        abusi_secondari: patientData.abusi_secondari || [],
      });
    } catch (error) {
      console.error('Errore nel caricamento del paziente:', error);
      setError('Errore nel caricamento del paziente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome?.trim()) newErrors.nome = 'Nome è obbligatorio';
    if (!formData.cognome?.trim()) newErrors.cognome = 'Cognome è obbligatorio';
    if (!formData.codice_fiscale?.trim()) newErrors.codice_fiscale = 'Codice Fiscale è obbligatorio';
    if (!formData.data_nascita) newErrors.data_nascita = 'Data di nascita è obbligatoria';
    if (!formData.sesso) newErrors.sesso = 'Sesso è obbligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await patientService.updatePatient(id, formData);
      } else {
        await patientService.createPatient(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/patients');
      }, 1500);
    } catch (error) {
      console.error('Errore nel salvataggio del paziente:', error);
      setError(error.response?.data?.error || 'Errore nel salvataggio del paziente');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <Avatar sx={{ 
            bgcolor: 'success.main', 
            width: 80, 
            height: 80, 
            mb: 2 
          }}>
            <CheckIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {isEdit ? 'Paziente aggiornato con successo!' : 'Paziente creato con successo!'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Reindirizzamento in corso...
          </Typography>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate('/patients')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
          {isEdit ? <EditIcon /> : <PersonIcon />}
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEdit ? 'Aggiorna le informazioni del paziente' : 'Inserisci i dati del nuovo paziente'}
          </Typography>
        </Box>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Dati Anagrafici */}
            <Typography variant="h6" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 3
            }}>
              Dati Anagrafici
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="nome"
                  label="Nome"
                  fullWidth
                  value={formData.nome}
                  onChange={handleChange}
                  error={!!errors.nome}
                  helperText={errors.nome}
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="cognome"
                  label="Cognome"
                  fullWidth
                  value={formData.cognome}
                  onChange={handleChange}
                  error={!!errors.cognome}
                  helperText={errors.cognome}
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="codice_fiscale"
                  label="Codice Fiscale"
                  fullWidth
                  value={formData.codice_fiscale}
                  onChange={handleChange}
                  error={!!errors.codice_fiscale}
                  helperText={errors.codice_fiscale}
                  variant="outlined"
                  required
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="numero_tessera_sanitaria"
                  label="Numero Tessera Sanitaria"
                  fullWidth
                  value={formData.numero_tessera_sanitaria}
                  onChange={handleChange}
                  error={!!errors.numero_tessera_sanitaria}
                  helperText={errors.numero_tessera_sanitaria}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="data_nascita"
                  label="Data di Nascita"
                  type="date"
                  fullWidth
                  value={formData.data_nascita}
                  onChange={handleChange}
                  error={!!errors.data_nascita}
                  helperText={errors.data_nascita}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl error={!!errors.sesso} required>
                  <FormLabel component="legend">Sesso</FormLabel>
                  <RadioGroup
                    name="sesso"
                    value={formData.sesso}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel 
                      value="M" 
                      control={<Radio />} 
                      label="Maschio" 
                    />
                    <FormControlLabel 
                      value="F" 
                      control={<Radio />} 
                      label="Femmina" 
                    />
                    <FormControlLabel 
                      value="A" 
                      control={<Radio />} 
                      label="Altro" 
                    />
                  </RadioGroup>
                  {errors.sesso && (
                    <FormHelperText>{errors.sesso}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Informazioni di Contatto */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3
                }}>
                  Informazioni di Contatto
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="telefono"
                  label="Telefono"
                  fullWidth
                  value={formData.telefono}
                  onChange={handleChange}
                  type="tel"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="indirizzo"
                  label="Indirizzo"
                  fullWidth
                  value={formData.indirizzo}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="citta"
                  label="Città"
                  fullWidth
                  value={formData.citta}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="cap"
                  label="CAP"
                  fullWidth
                  value={formData.cap}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="provincia"
                  label="Provincia"
                  fullWidth
                  value={formData.provincia}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Consensi */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3
                }}>
                  Consensi e Privacy
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="consenso_trattamento_dati"
                      checked={formData.consenso_trattamento_dati}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Consenso al trattamento dei dati personali
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Il paziente ha autorizzato al trattamento dei rispettivi dati personali
                      </Typography>
                    </Box>
                  }
                />
                {errors.consenso_trattamento_dati && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {errors.consenso_trattamento_dati}
                  </FormHelperText>
                )}
              </Grid>

              {/* New clinical information fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  Informazioni Cliniche
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={sostanzaAbusoOptions}
                  getOptionLabel={(option) => option.label}
                  value={sostanzaAbusoOptions.find(option => option.value === formData.sostanza_abuso) || null}
                  onChange={(event, newValue) => {
                    handleChange({
                      target: {
                        name: 'sostanza_abuso',
                        value: newValue ? newValue.value : ''
                      }
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sostanza di Abuso"
                      placeholder="Seleziona o cerca sostanza..."
                      size="small"
                      error={!!errors.sostanza_abuso}
                      helperText={errors.sostanza_abuso}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Typography variant="body2">
                        {option.label}
                      </Typography>
                    </Box>
                  )}
                  noOptionsText="Nessuna sostanza trovata"
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  fullWidth
                  options={sostanzaAbusoOptions.filter(option => option.value !== '')}
                  getOptionLabel={(option) => option.label}
                  value={formData.abusi_secondari.map(value => 
                    sostanzaAbusoOptions.find(option => option.value === value)
                  ).filter(Boolean)}
                  onChange={(event, newValue) => {
                    const selectedValues = newValue.map(option => option.value);
                    setFormData(prev => ({
                      ...prev,
                      abusi_secondari: selectedValues
                    }));
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        {...getTagProps({ index })}
                        size="small"
                        sx={{
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #0ea5e9',
                          color: '#0369a1',
                          '& .MuiChip-deleteIcon': {
                            color: '#0369a1',
                            '&:hover': {
                              color: '#dc2626'
                            }
                          }
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Abusi Secondari"
                      placeholder="Seleziona sostanze secondarie..."
                      size="small"
                      error={!!errors.abusi_secondari}
                      helperText={errors.abusi_secondari || "Seleziona le sostanze di abuso secondarie (opzionale)"}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Typography variant="body2">
                        {option.label}
                      </Typography>
                    </Box>
                  )}
                  noOptionsText="Nessuna sostanza trovata"
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="diagnosi_primaria"
                  label="Diagnosi Primaria"
                  fullWidth
                  value={formData.diagnosi_primaria}
                  onChange={handleChange}
                  placeholder="Es. Disturbo da uso di sostanze, Depressione..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Stato Civile</InputLabel>
                  <Select
                    name="stato_civile"
                    value={formData.stato_civile}
                    onChange={handleChange}
                    label="Stato Civile"
                  >
                    <MenuItem value="">Seleziona...</MenuItem>
                    <MenuItem value="single">Celibe/Nubile</MenuItem>
                    <MenuItem value="married">Coniugato/a</MenuItem>
                    <MenuItem value="divorced">Divorziato/a</MenuItem>
                    <MenuItem value="widowed">Vedovo/a</MenuItem>
                    <MenuItem value="separated">Separato/a</MenuItem>
                    <MenuItem value="cohabiting">Convivente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="lavoro"
                  label="Occupazione"
                  fullWidth
                  value={formData.lavoro}
                  onChange={handleChange}
                  placeholder="Professione, status lavorativo..."
                />
              </Grid>

              
              <Grid item xs={12}>
                <TextField
                  name="note"
                  label="Note aggiuntive"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.note}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="Eventuali note o informazioni aggiuntive..."
                />
              </Grid>
            </Grid>
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${theme.palette.divider}`
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/patients')}
                startIcon={<CancelIcon />}
              >
                Annulla
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }
                }}
              >
                {loading ? 'Salvataggio...' : (isEdit ? 'Aggiorna Paziente' : 'Crea Paziente')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PatientFormPage;
