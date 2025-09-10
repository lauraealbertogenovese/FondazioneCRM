import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  Avatar,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import it from 'date-fns/locale/it';
// import { format, addDays, isSameDay, setHours, setMinutes } from 'date-fns';

const OnlineBooking = ({ 
  embedded = false, 
  doctorId = null, 
  onBookingComplete = null 
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    // Step 1: Service Selection
    service_type: '',
    doctor_id: doctorId || '',
    
    // Step 2: Date & Time Selection
    selected_date: null,
    selected_time: null,
    
    // Step 3: Patient Information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: null,
    gender: '',
    notes: '',
    privacy_consent: false,
    marketing_consent: false,
  });

  const steps = ['Seleziona Servizio', 'Scegli Data e Ora', 'Informazioni Personali', 'Conferma'];

  const serviceTypes = [
    {
      value: 'consultation',
      label: 'Consulenza Iniziale',
      description: 'Prima valutazione e orientamento terapeutico',
      duration: 60,
      price: '€80',
      color: 'primary'
    },
    {
      value: 'therapy',
      label: 'Sessione Terapeutica',
      description: 'Sessione individuale di psicoterapia',
      duration: 50,
      price: '€70',
      color: 'success'
    },
    {
      value: 'couple_therapy',
      label: 'Terapia di Coppia',
      description: 'Sessione terapeutica per coppie',
      duration: 75,
      price: '€100',
      color: 'info'
    },
    {
      value: 'family_therapy',
      label: 'Terapia Familiare',
      description: 'Sessione terapeutica per famiglie',
      duration: 90,
      price: '€120',
      color: 'warning'
    },
    {
      value: 'group_therapy',
      label: 'Terapia di Gruppo',
      description: 'Partecipazione a gruppo terapeutico',
      duration: 120,
      price: '€40',
      color: 'secondary'
    },
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (bookingData.doctor_id && bookingData.selected_date) {
      fetchAvailableSlots();
    }
  }, [bookingData.doctor_id, bookingData.selected_date]);

  const fetchDoctors = async () => {
    try {
      // Mock data - replace with actual API call
      const mockDoctors = [
        {
          id: 1,
          name: 'Dr.ssa Anna Bianchi',
          specialization: 'Psicologo Clinico',
          bio: 'Specializzata in terapia cognitivo-comportamentale e dipendenze',
          avatar: null,
          rating: 4.9,
          experience_years: 12,
          services: ['consultation', 'therapy', 'couple_therapy'],
          available_days: [1, 2, 3, 4, 5], // Monday to Friday
          available_hours: { start: '09:00', end: '18:00' },
        },
        {
          id: 2,
          name: 'Dr. Marco Verdi',
          specialization: 'Medico Psichiatra',
          bio: 'Esperto in valutazione psichiatrica e terapia farmacologica',
          avatar: null,
          rating: 4.8,
          experience_years: 15,
          services: ['consultation', 'therapy'],
          available_days: [1, 2, 3, 4], // Monday to Thursday
          available_hours: { start: '10:00', end: '16:00' },
        },
        {
          id: 3,
          name: 'Dr.ssa Laura Ferrari',
          specialization: 'Specialista Dipendenze',
          bio: 'Psicologa specializzata nel trattamento delle dipendenze',
          avatar: null,
          rating: 4.7,
          experience_years: 8,
          services: ['consultation', 'therapy', 'group_therapy'],
          available_days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
          available_hours: { start: '08:00', end: '17:00' },
        },
      ];

      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Errore nel caricamento dei medici disponibili');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      // Mock available slots - replace with actual API call
      const doctor = doctors.find(d => d.id === parseInt(bookingData.doctor_id));
      if (!doctor) return;

      const selectedDateObj = new Date(bookingData.selected_date);
      const dayOfWeek = selectedDateObj.getDay();
      
      // Check if doctor is available on this day
      if (!doctor.available_days.includes(dayOfWeek)) {
        setAvailableSlots([]);
        return;
      }

      // Generate time slots based on doctor's availability
      const startHour = parseInt(doctor.available_hours.start.split(':')[0]);
      const endHour = parseInt(doctor.available_hours.end.split(':')[0]);
      
      const slots = [];
      const serviceType = serviceTypes.find(s => s.value === bookingData.service_type);
      const sessionDuration = serviceType ? serviceType.duration : 60;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour * 60 + minute + sessionDuration <= endHour * 60) {
            const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isAvailable = Math.random() > 0.3; // Mock availability
            
            if (isAvailable) {
              slots.push({
                time: slotTime,
                available: true,
                label: slotTime,
              });
            }
          }
        }
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Errore nel caricamento degli orari disponibili');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleBookingSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock booking submission - replace with actual API call
      const bookingPayload = {
        ...bookingData,
        booking_id: `BK-${Date.now()}`,
        status: 'pending_confirmation',
        created_at: new Date().toISOString(),
      };

      console.log('Submitting booking:', bookingPayload);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(true);
      
      if (onBookingComplete) {
        onBookingComplete(bookingPayload);
      }

    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Errore nella prenotazione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return bookingData.service_type && bookingData.doctor_id;
      case 1:
        return bookingData.selected_date && bookingData.selected_time;
      case 2:
        return bookingData.first_name && 
               bookingData.last_name && 
               bookingData.email && 
               bookingData.phone && 
               bookingData.privacy_consent;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderServiceSelection();
      case 1:
        return renderDateTimeSelection();
      case 2:
        return renderPatientInformation();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderServiceSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Seleziona il tipo di servizio
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {serviceTypes.map(service => (
          <Grid item xs={12} md={6} key={service.value}>
            <Card
              elevation={bookingData.service_type === service.value ? 4 : 1}
              sx={{
                cursor: 'pointer',
                border: `2px solid ${bookingData.service_type === service.value ? theme.palette[service.color].main : 'transparent'}`,
                backgroundColor: bookingData.service_type === service.value ? alpha(theme.palette[service.color].main, 0.05) : 'transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette[service.color].main, 0.1),
                }
              }}
              onClick={() => handleInputChange('service_type', service.value)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {service.label}
                  </Typography>
                  <Chip 
                    label={service.price} 
                    color={service.color} 
                    size="small" 
                    variant="outlined" 
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {service.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {service.duration} minuti
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {bookingData.service_type && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Seleziona il medico specialista
          </Typography>
          
          <Grid container spacing={2}>
            {doctors
              .filter(doctor => 
                !bookingData.service_type || 
                doctor.services.includes(bookingData.service_type)
              )
              .map(doctor => (
                <Grid item xs={12} md={6} key={doctor.id}>
                  <Card
                    elevation={bookingData.doctor_id === doctor.id ? 4 : 1}
                    sx={{
                      cursor: 'pointer',
                      border: `2px solid ${bookingData.doctor_id === doctor.id ? theme.palette.primary.main : 'transparent'}`,
                      backgroundColor: bookingData.doctor_id === doctor.id ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                    onClick={() => handleInputChange('doctor_id', doctor.id)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56, backgroundColor: theme.palette.primary.main }}>
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {doctor.specialization}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {doctor.bio}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip 
                              label={`${doctor.experience_years} anni esperienza`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`⭐ ${doctor.rating}`} 
                              size="small" 
                              color="warning" 
                              variant="outlined" 
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderDateTimeSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Seleziona data e orario
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Data dell'appuntamento"
            type="date"
            value={bookingData.selected_date}
            onChange={(e) => handleInputChange('selected_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          {bookingData.selected_date && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Orari disponibili
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : availableSlots.length === 0 ? (
                <Alert severity="info">
                  Nessun orario disponibile per la data selezionata
                </Alert>
              ) : (
                <Grid container spacing={1}>
                  {availableSlots.map((slot, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Button
                        variant={bookingData.selected_time === slot.time ? 'contained' : 'outlined'}
                        fullWidth
                        size="small"
                        onClick={() => handleInputChange('selected_time', slot.time)}
                        disabled={!slot.available}
                      >
                        {slot.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const renderPatientInformation = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Informazioni personali
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Nome"
            value={bookingData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Cognome"
            value={bookingData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            value={bookingData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Telefono"
            value={bookingData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Data di nascita"
            type="date"
            value={bookingData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Sesso</InputLabel>
            <Select
              value={bookingData.gender}
              label="Sesso"
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <MenuItem value="M">Maschio</MenuItem>
              <MenuItem value="F">Femmina</MenuItem>
              <MenuItem value="Altro">Altro</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Note aggiuntive (opzionale)"
            placeholder="Descrivi brevemente il motivo della prenotazione o eventuali esigenze particolari..."
            value={bookingData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Stack spacing={2}>
            <FormControl component="fieldset">
              <label>
                <input
                  type="checkbox"
                  checked={bookingData.privacy_consent}
                  onChange={(e) => handleInputChange('privacy_consent', e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="body2" component="span">
                  Accetto il trattamento dei dati personali secondo la <strong>Privacy Policy</strong> (obbligatorio)
                </Typography>
              </label>
            </FormControl>
            
            <FormControl component="fieldset">
              <label>
                <input
                  type="checkbox"
                  checked={bookingData.marketing_consent}
                  onChange={(e) => handleInputChange('marketing_consent', e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="body2" component="span">
                  Accetto di ricevere comunicazioni promozionali (opzionale)
                </Typography>
              </label>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderConfirmation = () => {
    const selectedDoctor = doctors.find(d => d.id === parseInt(bookingData.doctor_id));
    const selectedService = serviceTypes.find(s => s.value === bookingData.service_type);
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Conferma prenotazione
        </Typography>
        
        <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    SERVIZIO
                  </Typography>
                  <Typography variant="body1">
                    {selectedService?.label}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    MEDICO
                  </Typography>
                  <Typography variant="body1">
                    {selectedDoctor?.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    DATA E ORARIO
                  </Typography>
                  <Typography variant="body1">
                    {bookingData.selected_date && bookingData.selected_date}
                    {bookingData.selected_time && ` alle ${bookingData.selected_time}`}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    PAZIENTE
                  </Typography>
                  <Typography variant="body1">
                    {bookingData.first_name} {bookingData.last_name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    CONTATTI
                  </Typography>
                  <Typography variant="body2">
                    {bookingData.email}
                  </Typography>
                  <Typography variant="body2">
                    {bookingData.phone}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    COSTO
                  </Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                    {selectedService?.price}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          La prenotazione sarà confermata entro 24 ore via email o telefono. 
          Il pagamento verrà richiesto al momento dell'appuntamento.
        </Alert>
      </Box>
    );
  };

  if (success) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'success.main' }}>
            Prenotazione Inviata!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            La tua richiesta di prenotazione è stata inviata con successo.
            Riceverai una conferma entro 24 ore.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID Prenotazione: <strong>BK-{Date.now()}</strong>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        {!embedded && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <HospitalIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
              Prenota un Appuntamento
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema di prenotazione online - Fondazione per la Cura delle Dipendenze
            </Typography>
          </Box>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Stack direction="row" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Indietro
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid(activeStep) || loading}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Conferma Prenotazione'
            ) : (
              'Continua'
            )}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OnlineBooking;