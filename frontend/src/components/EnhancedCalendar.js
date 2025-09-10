import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Autocomplete,
  Badge,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Today as TodayIcon,
  ViewWeek as WeekViewIcon,
  ViewDay as DayViewIcon,
  CalendarMonth as MonthViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { clinicalService, userService } from '../services/api';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import it from 'date-fns/locale/it';
import { useAuth } from '../contexts/AuthContext';

const EnhancedCalendar = ({ 
  doctorId = null, 
  viewMode = 'month', 
  showAddButton = true,
  compactView = false,
  doctorFilter = null,
  onAppointmentChange = null
}) => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [calendarView, setCalendarView] = useState(viewMode);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMultiDoctorView, setShowMultiDoctorView] = useState(false);

  const appointmentTypes = [
    { value: 'consultation', label: 'Consulenza', color: 'primary' },
    { value: 'therapy', label: 'Terapia', color: 'success' },
    { value: 'group_session', label: 'Sessione di Gruppo', color: 'info' },
    { value: 'evaluation', label: 'Valutazione', color: 'warning' },
    { value: 'follow_up', label: 'Follow-up', color: 'secondary' },
    { value: 'emergency', label: 'Emergenza', color: 'error' },
  ];

  const appointmentStatuses = [
    { value: 'scheduled', label: 'Programmato', color: 'info' },
    { value: 'confirmed', label: 'Confermato', color: 'success' },
    { value: 'in_progress', label: 'In Corso', color: 'warning' },
    { value: 'completed', label: 'Completato', color: 'success' },
    { value: 'cancelled', label: 'Annullato', color: 'error' },
    { value: 'no_show', label: 'Non Presentato', color: 'default' },
  ];

  const [newAppointment, setNewAppointment] = useState({
    title: '',
    patient_id: '',
    patient_name: '',
    doctor_id: doctorId || '',
    doctor_name: '',
    start_time: new Date(),
    end_time: new Date(Date.now() + 3600000), // 1 hour later
    type: 'consultation',
    status: 'scheduled',
    location: '',
    notes: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, doctorId, doctorFilter]);

  // Separate effect for fetching doctors only once
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Initialize selectedDoctors when doctors are loaded
  useEffect(() => {
    if (doctors.length > 0 && selectedDoctors.length === 0) {
      if (doctorId) {
        setSelectedDoctors([parseInt(doctorId)]);
      } else {
        setSelectedDoctors(doctors.map(d => d.id));
      }
    }
  }, [doctors, doctorId]);

  const fetchDoctors = async () => {
    try {
      const doctorsResponse = await userService.getUsers({ role: 'doctor' });
      const doctorsData = (doctorsResponse.data || []).map((user, index) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        specialization: user.role || 'Medico',
        color: [
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ][index % 5],
        avatar: null,
        available_hours: { start: '09:00', end: '18:00' },
        working_days: [1, 2, 3, 4, 5], // Default Monday to Friday
      }));
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockAppointments = [
        {
          id: 1,
          title: 'Consulenza Iniziale - Mario Rossi',
          patient_id: 1,
          patient_name: 'Mario Rossi',
          doctor_id: 1,
          doctor_name: 'Dr. Anna Bianchi',
          start_time: new Date(Date.now() + 86400000), // Tomorrow 10:00
          end_time: new Date(Date.now() + 86400000 + 3600000),
          type: 'consultation',
          status: 'confirmed',
          location: 'Studio 1',
          notes: 'Prima visita, valutazione iniziale',
          phone: '+39 123 456 7890',
          email: 'mario.rossi@email.com',
          color: theme.palette.primary.main,
        },
        {
          id: 2,
          title: 'Sessione Terapeutica - Laura Bianchi',
          patient_id: 2,
          patient_name: 'Laura Bianchi',
          doctor_id: 1,
          doctor_name: 'Dr. Anna Bianchi',
          start_time: new Date(Date.now() + 172800000), // Day after tomorrow 14:00
          end_time: new Date(Date.now() + 172800000 + 5400000), // 1.5 hours
          type: 'therapy',
          status: 'scheduled',
          location: 'Studio 1',
          notes: 'Terapia cognitivo-comportamentale, 5° sessione',
          phone: '+39 123 456 7891',
          email: 'laura.bianchi@email.com',
          color: theme.palette.success.main,
        },
        {
          id: 3,
          title: 'Visita Medica - Giuseppe Verdi',
          patient_id: 3,
          patient_name: 'Giuseppe Verdi',
          doctor_id: 2,
          doctor_name: 'Dr. Marco Verdi',
          start_time: new Date(Date.now() + 259200000), // 3 days from now 11:00
          end_time: new Date(Date.now() + 259200000 + 1800000), // 30 minutes
          type: 'evaluation',
          status: 'confirmed',
          location: 'Studio Medico',
          notes: 'Controllo generale, monitoraggio farmacologico',
          phone: '+39 123 456 7892',
          email: 'giuseppe.verdi@email.com',
          color: theme.palette.info.main,
        },
        {
          id: 4,
          title: 'Sessione di Gruppo - Gruppo Alpha',
          patient_id: null,
          patient_name: 'Gruppo Alpha (8 partecipanti)',
          doctor_id: 3,
          doctor_name: 'Dr. Laura Ferrari',
          start_time: new Date(Date.now() + 345600000), // 4 days from now 16:00
          end_time: new Date(Date.now() + 345600000 + 7200000), // 2 hours
          type: 'group_session',
          status: 'scheduled',
          location: 'Sala Gruppi A',
          notes: 'Sessione di gruppo per dipendenze, tema: gestione delle ricadute',
          phone: null,
          email: null,
          color: theme.palette.warning.main,
        },
        {
          id: 5,
          title: 'Follow-up - Alessandro Conti',
          patient_id: 4,
          patient_name: 'Alessandro Conti',
          doctor_id: 1,
          doctor_name: 'Dr. Anna Bianchi',
          start_time: new Date(Date.now() + 432000000), // 5 days from now 15:30
          end_time: new Date(Date.now() + 432000000 + 3600000),
          type: 'follow_up',
          status: 'scheduled',
          location: 'Studio 1',
          notes: 'Controllo mensile, valutazione progressi',
          phone: '+39 123 456 7893',
          email: 'alessandro.conti@email.com',
          color: theme.palette.secondary.main,
        },
      ];

      // Fetch real clinical visits data
      const visitsResponse = await clinicalService.getCalendarEvents({
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
        doctor_id: doctorFilter || undefined
      });
      
      // The backend returns { events: [...] } format
      const appointments = (visitsResponse.events || []).map((event) => ({
        id: event.id,
        title: event.title,
        patient_id: event.extendedProps?.patient_id,
        patient_name: event.extendedProps?.patient_name || event.title,
        doctor_id: event.extendedProps?.doctor_id || 1,
        doctor_name: event.extendedProps?.doctor_name || 'Medico',
        start_time: new Date(event.start),
        end_time: new Date(event.end || event.start),
        type: event.extendedProps?.visit_type || 'consultation',
        status: event.extendedProps?.status || 'scheduled',
        location: 'Studio 1',
        notes: event.extendedProps?.notes || '',
        phone: '',
        email: '',
        color: event.backgroundColor || theme.palette.primary.main,
      }));

      setFilteredDoctors(doctors);
      setAppointments(appointments);

    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Errore nel caricamento del calendario');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setNewAppointment({
      title: '',
      patient_id: '',
      patient_name: '',
      doctor_id: doctorId || (selectedDoctors.length === 1 ? selectedDoctors[0] : ''),
      doctor_name: '',
      start_time: selectedDate || new Date(),
      end_time: selectedDate ? new Date(selectedDate.getTime() + 3600000) : new Date(Date.now() + 3600000),
      type: 'consultation',
      status: 'scheduled',
      location: '',
      notes: '',
      phone: '',
      email: '',
    });
    setAppointmentDialogOpen(true);
  };

  const handleSaveAppointment = async () => {
    try {
      const appointmentToSave = selectedAppointment || newAppointment;
      const doctor = doctors.find(d => d.id === parseInt(appointmentToSave.doctor_id));
      
      // Prepare visit data for API
      const visitData = {
        patient_id: appointmentToSave.patient_id,
        visit_type: appointmentToSave.type,
        scheduled_date: appointmentToSave.start_time,
        duration: Math.round((new Date(appointmentToSave.end_time) - new Date(appointmentToSave.start_time)) / 60000),
        assigned_doctor_id: appointmentToSave.doctor_id,
        location: appointmentToSave.location,
        notes: appointmentToSave.notes,
        status: appointmentToSave.status || 'scheduled'
      };
      
      if (selectedAppointment) {
        // Update existing appointment
        await clinicalService.updateVisit(selectedAppointment.id, visitData);
      } else {
        // Create new appointment
        await clinicalService.createVisit(visitData);
      }
      
      // Refresh calendar data
      await fetchCalendarData();
      
      // Notify parent component of appointment change
      if (onAppointmentChange) {
        onAppointmentChange();
      }

      setAppointmentDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (selectedAppointment) {
      try {
        // Delete via API
        await clinicalService.deleteVisit(selectedAppointment.id);
        
        // Refresh calendar data
        await fetchCalendarData();
        
        // Notify parent component of appointment change
        if (onAppointmentChange) {
          onAppointmentChange();
        }
        
        setAppointmentDialogOpen(false);
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleDoctorToggle = (doctorId) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => 
      selectedDoctors.includes(apt.doctor_id) &&
      isSameMonth(new Date(apt.start_time), currentDate)
    );
  };

  const isSameMonth = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getAppointmentTypeConfig = (type) => {
    return appointmentTypes.find(t => t.value === type) || appointmentTypes[0];
  };

  const getAppointmentStatusConfig = (status) => {
    return appointmentStatuses.find(s => s.value === status) || appointmentStatuses[0];
  };

  const renderCalendarGrid = () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const totalDays = 42; // 6 weeks × 7 days

    for (let i = 0; i < totalDays; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayAppointments = getFilteredAppointments().filter(apt => 
        isSameDay(new Date(apt.start_time), day)
      );

      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      days.push(
        <Grid item xs key={day.toISOString()}>
          <Paper
            elevation={0}
            sx={{
              minHeight: 100,
              p: 1,
              cursor: 'pointer',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 
                             isToday ? alpha(theme.palette.info.main, 0.05) : 
                             !isCurrentMonth ? alpha(theme.palette.grey[100], 0.5) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
            onClick={() => setSelectedDate(day)}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isToday ? 700 : isCurrentMonth ? 500 : 400,
                color: isToday ? theme.palette.info.main : 
                       !isCurrentMonth ? theme.palette.text.secondary : 
                       theme.palette.text.primary,
                mb: 0.5
              }}
            >
              {day.getDate()}
            </Typography>
            
            <Box sx={{ maxHeight: 80, overflowY: 'auto' }}>
              {dayAppointments.slice(0, 3).map(appointment => (
                <Chip
                  key={appointment.id}
                  label={appointment.title.substring(0, 20) + (appointment.title.length > 20 ? '...' : '')}
                  size="small"
                  sx={{
                    mb: 0.25,
                    height: 18,
                    fontSize: '0.7rem',
                    backgroundColor: alpha(appointment.color, 0.1),
                    color: appointment.color,
                    display: 'block',
                    textAlign: 'left',
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAppointmentClick(appointment);
                  }}
                />
              ))}
              {dayAppointments.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{dayAppointments.length - 3} altri
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      );
    }

    return days;
  };

  const renderDoctorList = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Medici e Specialisti
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showMultiDoctorView}
                onChange={(e) => setShowMultiDoctorView(e.target.checked)}
                size="small"
              />
            }
            label="Vista Multi-Medico"
          />
        </Stack>
        
        <Grid container spacing={1}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Paper
                elevation={selectedDoctors.includes(doctor.id) ? 2 : 0}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  border: `2px solid ${selectedDoctors.includes(doctor.id) ? doctor.color : 'transparent'}`,
                  backgroundColor: selectedDoctors.includes(doctor.id) ? alpha(doctor.color, 0.05) : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(doctor.color, 0.1),
                  }
                }}
                onClick={() => handleDoctorToggle(doctor.id)}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: doctor.color,
                      fontSize: '0.875rem'
                    }}
                  >
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {doctor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doctor.specialization}
                    </Typography>
                  </Box>
                  <Badge
                    badgeContent={appointments.filter(apt => apt.doctor_id === doctor.id && isSameMonth(new Date(apt.start_time), currentDate)).length}
                    color="primary"
                    max={99}
                  />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1">Caricamento calendario...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" variant="body1">
            {error}
          </Typography>
          <Button onClick={fetchCalendarData} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
            Riprova
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box>
        {/* Doctor Selection */}
        {!doctorId && renderDoctorList()}

        {/* Calendar Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Stack direction="row" alignItems="center">
                  <IconButton onClick={handlePreviousMonth}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center', fontWeight: 700 }}>
                    {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                  </Typography>
                  <IconButton onClick={handleNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={handleTodayClick}
                >
                  Oggi
                </Button>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Vista Mese">
                  <IconButton
                    color={calendarView === 'month' ? 'primary' : 'default'}
                    onClick={() => setCalendarView('month')}
                  >
                    <MonthViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista Settimana">
                  <IconButton
                    color={calendarView === 'week' ? 'primary' : 'default'}
                    onClick={() => setCalendarView('week')}
                  >
                    <WeekViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista Giorno">
                  <IconButton
                    color={calendarView === 'day' ? 'primary' : 'default'}
                    onClick={() => setCalendarView('day')}
                  >
                    <DayViewIcon />
                  </IconButton>
                </Tooltip>

                {showAddButton && hasPermission('appointments.create') && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddAppointment}
                    sx={{
                      ml: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    Nuovo Appuntamento
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            {/* Week Header */}
            <Grid container sx={{ mb: 1 }}>
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                <Grid item xs key={day}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'block',
                      color: 'text.secondary',
                      py: 1
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Days Grid */}
            <Grid container sx={{ minHeight: 600 }}>
              {renderCalendarGrid()}
            </Grid>
          </CardContent>
        </Card>

        {/* Appointment Dialog */}
        <Dialog 
          open={appointmentDialogOpen} 
          onClose={() => setAppointmentDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Titolo Appuntamento"
                  value={selectedAppointment ? selectedAppointment.title : newAppointment.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, title: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, title: value }));
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Paziente"
                  value={selectedAppointment ? selectedAppointment.patient_name : newAppointment.patient_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, patient_name: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, patient_name: value }));
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  options={filteredDoctors}
                  getOptionLabel={(option) => 
                    option ? `${option.name} - ${option.specialization}` : ''
                  }
                  value={doctors.find(d => d.id === (selectedAppointment ? selectedAppointment.doctor_id : newAppointment.doctor_id)) || null}
                  onChange={(event, newValue) => {
                    const value = newValue ? newValue.id : '';
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, doctor_id: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, doctor_id: value }));
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    // Filtra i dottori in base al testo di ricerca
                    const filtered = doctors.filter(doctor => {
                      const searchTerm = newInputValue.toLowerCase();
                      return (
                        doctor.name?.toLowerCase().includes(searchTerm) ||
                        doctor.specialization?.toLowerCase().includes(searchTerm) ||
                        doctor.email?.toLowerCase().includes(searchTerm)
                      );
                    });
                    setFilteredDoctors(filtered);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medico"
                      placeholder="Cerca dottore per nome o specializzazione..."
                      size="small"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization} • {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="Nessun dottore trovato"
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  filterOptions={(options) => options} // Disabilita il filtro interno di MUI
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo Appuntamento</InputLabel>
                  <Select
                    value={selectedAppointment ? selectedAppointment.type : newAppointment.type}
                    label="Tipo Appuntamento"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedAppointment) {
                        setSelectedAppointment(prev => ({ ...prev, type: value }));
                      } else {
                        setNewAppointment(prev => ({ ...prev, type: value }));
                      }
                    }}
                  >
                    {appointmentTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Inizio (gg/mm/aaaa)"
                  value={selectedAppointment ? new Date(selectedAppointment.start_time).toLocaleDateString('it-IT') : new Date(newAppointment.start_time).toLocaleDateString('it-IT')}
                  onChange={(e) => {
                    // Simple text input, validation can be added later
                  }}
                  placeholder="es. 15/09/2025"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ora Inizio (hh:mm)"
                  value={selectedAppointment ? new Date(selectedAppointment.start_time).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'}) : new Date(newAppointment.start_time).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                  onChange={(e) => {
                    // Simple text input, validation can be added later
                  }}
                  placeholder="es. 14:30"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Durata (minuti)"
                  type="number"
                  defaultValue="60"
                  onChange={(e) => {
                    // Simple duration input
                  }}
                  placeholder="es. 60"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Luogo"
                  value={selectedAppointment ? selectedAppointment.location : newAppointment.location}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, location: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, location: value }));
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={selectedAppointment ? selectedAppointment.status : newAppointment.status}
                    label="Stato"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (selectedAppointment) {
                        setSelectedAppointment(prev => ({ ...prev, status: value }));
                      } else {
                        setNewAppointment(prev => ({ ...prev, status: value }));
                      }
                    }}
                  >
                    {appointmentStatuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefono"
                  value={selectedAppointment ? selectedAppointment.phone : newAppointment.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, phone: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, phone: value }));
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedAppointment ? selectedAppointment.email : newAppointment.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, email: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, email: value }));
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Note"
                  value={selectedAppointment ? selectedAppointment.notes : newAppointment.notes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedAppointment) {
                      setSelectedAppointment(prev => ({ ...prev, notes: value }));
                    } else {
                      setNewAppointment(prev => ({ ...prev, notes: value }));
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAppointmentDialogOpen(false)}>
              Annulla
            </Button>
            
            {selectedAppointment && hasPermission('appointments.delete') && (
              <Button 
                color="error" 
                onClick={handleDeleteAppointment}
              >
                Elimina
              </Button>
            )}
            
            <Button 
              variant="contained" 
              onClick={handleSaveAppointment}
              disabled={!hasPermission('appointments.create')}
            >
              {selectedAppointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default EnhancedCalendar;