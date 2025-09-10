import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as MonthViewIcon,
  ViewWeek as WeekViewIcon,
  ViewDay as DayViewIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { clinicalService, userService, patientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ModernCalendar = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    patient_id: '',
    doctor_id: '',
    start_time: new Date(),
    end_time: new Date(Date.now() + 3600000),
    type: 'consultation',
    status: 'scheduled',
    location: '',
    notes: '',
  });

  // Appointment types and statuses
  const appointmentTypes = [
    { value: 'consultation', label: 'Consulenza', color: theme.palette.primary.main, icon: '🩺' },
    { value: 'therapy', label: 'Terapia', color: theme.palette.success.main, icon: '🧠' },
    { value: 'group_session', label: 'Sessione di Gruppo', color: theme.palette.info.main, icon: '👥' },
    { value: 'evaluation', label: 'Valutazione', color: theme.palette.warning.main, icon: '📋' },
    { value: 'follow_up', label: 'Follow-up', color: theme.palette.secondary.main, icon: '🔄' },
    { value: 'emergency', label: 'Emergenza', color: theme.palette.error.main, icon: '🚨' },
  ];

  const appointmentStatuses = [
    { value: 'scheduled', label: 'Programmato', color: theme.palette.info.main },
    { value: 'confirmed', label: 'Confermato', color: theme.palette.success.main },
    { value: 'in_progress', label: 'In Corso', color: theme.palette.warning.main },
    { value: 'completed', label: 'Completato', color: theme.palette.success.dark },
    { value: 'cancelled', label: 'Annullato', color: theme.palette.error.main },
    { value: 'no_show', label: 'Non Presentato', color: theme.palette.grey[500] },
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, doctorFilter, typeFilter, statusFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, patientsRes] = await Promise.all([
        userService.getUsers({ role: 'clinico' }),
        patientService.getPatients({ limit: 1000 })
      ]);
      
      setDoctors(doctorsRes.users || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const startDate = getStartOfPeriod(currentDate, viewMode);
      const endDate = getEndOfPeriod(currentDate, viewMode);
      
      const params = {
        date_from: startDate.toISOString(),
        date_to: endDate.toISOString(),
        ...(doctorFilter !== 'all' && { doctor_id: doctorFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await clinicalService.getVisits(params);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Errore nel caricamento degli appuntamenti');
    }
  };

  // Helper functions
  const getStartOfPeriod = (date, mode) => {
    const d = new Date(date);
    switch (mode) {
      case 'week':
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
      case 'day':
        d.setHours(0, 0, 0, 0);
        return d;
      default: // month
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }
  };

  const getEndOfPeriod = (date, mode) => {
    const d = new Date(date);
    switch (mode) {
      case 'week':
        d.setDate(d.getDate() - d.getDay() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
      case 'day':
        d.setHours(23, 59, 59, 999);
        return d;
      default: // month
        d.setMonth(d.getMonth() + 1, 0);
        d.setHours(23, 59, 59, 999);
        return d;
    }
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Event handlers
  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      default: // month
        newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      default: // month
        newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setNewAppointment({
      title: '',
      patient_id: '',
      doctor_id: '',
      start_time: selectedDate,
      end_time: new Date(selectedDate.getTime() + 3600000),
      type: 'consultation',
      status: 'scheduled',
      location: '',
      notes: '',
    });
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleSaveAppointment = async () => {
    try {
      if (selectedAppointment) {
        // Update existing appointment
        await clinicalService.updateVisit(selectedAppointment.id, selectedAppointment);
      } else {
        // Create new appointment
        await clinicalService.createVisit(newAppointment);
      }
      setAppointmentDialogOpen(false);
      loadAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Errore nel salvataggio dell\'appuntamento');
    }
  };

  // Render functions
  const renderHeader = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Calendario Appuntamenti
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddAppointment}
              disabled={!hasPermission('appointments.create')}
            >
              Nuovo Appuntamento
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtri
            </Button>
          </Stack>
        </Stack>

        {/* Navigation */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={handlePreviousPeriod}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {viewMode === 'month' && currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `Settimana ${getWeekNumber(currentDate)} - ${currentDate.getFullYear()}`}
              {viewMode === 'day' && formatDate(currentDate)}
            </Typography>
            <IconButton onClick={handleNextPeriod}>
              <ChevronRightIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TodayIcon />}
              onClick={handleToday}
            >
              Oggi
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Vista Mese">
              <IconButton
                color={viewMode === 'month' ? 'primary' : 'default'}
                onClick={() => setViewMode('month')}
              >
                <MonthViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista Settimana">
              <IconButton
                color={viewMode === 'week' ? 'primary' : 'default'}
                onClick={() => setViewMode('week')}
              >
                <WeekViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista Giorno">
              <IconButton
                color={viewMode === 'day' ? 'primary' : 'default'}
                onClick={() => setViewMode('day')}
              >
                <DayViewIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Filters */}
        <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cerca appuntamenti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medico</InputLabel>
                  <Select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    label="Medico"
                  >
                    <MenuItem value="all">Tutti i Medici</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.first_name} {doctor.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Tipo"
                  >
                    <MenuItem value="all">Tutti i Tipi</MenuItem>
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Stato"
                  >
                    <MenuItem value="all">Tutti gli Stati</MenuItem>
                    {appointmentStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Slide>
      </CardContent>
    </Card>
  );

  const renderMonthView = () => {
    const startDate = getStartOfPeriod(currentDate, 'month');
    const endDate = getEndOfPeriod(currentDate, 'month');
    const days = [];
    const startDay = startDate.getDay();
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i - startDay);
      days.push(date);
    }

    return (
      <Card>
        <CardContent sx={{ p: 1 }}>
          {/* Week header */}
          <Grid container sx={{ mb: 1 }}>
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
              <Grid item xs key={day}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'block',
                    color: 'text.secondary',
                    py: 1,
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar grid */}
          <Grid container sx={{ minHeight: 500 }}>
            {days.map((date, index) => {
              const dayAppointments = appointments.filter(apt => 
                isSameDay(new Date(apt.start_time), date)
              );
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);

              return (
                <Grid item xs key={index}>
                  <Paper
                    elevation={isSelected ? 2 : 0}
                    sx={{
                      minHeight: 80,
                      p: 1,
                      cursor: 'pointer',
                      border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                    onClick={() => setSelectedDate(date)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'primary.main' : 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    
                    <Stack spacing={0.5}>
                      {dayAppointments.slice(0, 3).map((appointment, idx) => {
                        const type = appointmentTypes.find(t => t.value === appointment.type);
                        return (
                          <Chip
                            key={idx}
                            label={`${formatTime(new Date(appointment.start_time))} ${appointment.title}`}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                              color: type?.color || theme.palette.primary.main,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                          />
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayAppointments.length - 3} altri
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const startDate = getStartOfPeriod(currentDate, 'week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <Card>
        <CardContent>
          <Grid container spacing={1}>
            {days.map((date, index) => {
              const dayAppointments = appointments.filter(apt => 
                isSameDay(new Date(apt.start_time), date)
              );
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);

              return (
                <Grid item xs key={index}>
                  <Paper
                    elevation={isSelected ? 2 : 0}
                    sx={{
                      p: 2,
                      minHeight: 400,
                      border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedDate(date)}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'primary.main' : 'text.primary',
                        mb: 2,
                      }}
                    >
                      {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric' })}
                    </Typography>
                    
                    <Stack spacing={1}>
                      {dayAppointments.map((appointment, idx) => {
                        const type = appointmentTypes.find(t => t.value === appointment.type);
                        return (
                          <Paper
                            key={idx}
                            elevation={1}
                            sx={{
                              p: 1.5,
                              backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                              borderLeft: `4px solid ${type?.color || theme.palette.primary.main}`,
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatTime(new Date(appointment.start_time))} - {appointment.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.patient_name}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderDayView = () => {
    const dayAppointments = appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), selectedDate)
    );
    
    // Generate time slots
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date(selectedDate);
        time.setHours(hour, minute, 0, 0);
        timeSlots.push(time);
      }
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {formatDate(selectedDate)}
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Stack spacing={1}>
                {timeSlots.map((time, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    sx={{
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    {formatTime(time)}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={10}>
              <Box sx={{ position: 'relative', height: 480 }}>
                {timeSlots.map((time, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 40,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                    }}
                  />
                ))}
                
                {dayAppointments.map((appointment, index) => {
                  const startTime = new Date(appointment.start_time);
                  const endTime = new Date(appointment.end_time);
                  const startHour = startTime.getHours();
                  const startMinute = startTime.getMinutes();
                  const duration = (endTime - startTime) / (1000 * 60 * 30); // in 30-min slots
                  
                  const top = ((startHour - 8) * 2 + startMinute / 30) * 40;
                  const height = duration * 40;
                  
                  const type = appointmentTypes.find(t => t.value === appointment.type);
                  
                  return (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        position: 'absolute',
                        top: top,
                        left: 8,
                        right: 8,
                        height: height,
                        backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                        borderLeft: `4px solid ${type?.color || theme.palette.primary.main}`,
                        p: 1,
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {formatTime(startTime)} - {appointment.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {appointment.patient_name}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSidebar = () => {
    const todayAppointments = appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), new Date())
    );
    
    const upcomingAppointments = appointments
      .filter(apt => new Date(apt.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 5);

    return (
      <Stack spacing={3}>
        {/* Today's appointments */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Oggi ({todayAppointments.length})
            </Typography>
            <Stack spacing={1}>
              {todayAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nessun appuntamento oggi
                </Typography>
              ) : (
                todayAppointments.map((appointment, index) => {
                  const type = appointmentTypes.find(t => t.value === appointment.type);
                  return (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.05),
                        borderLeft: `3px solid ${type?.color || theme.palette.primary.main}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(new Date(appointment.start_time))} - {appointment.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patient_name}
                      </Typography>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Prossimi Appuntamenti
            </Typography>
            <Stack spacing={1}>
              {upcomingAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nessun appuntamento in programma
                </Typography>
              ) : (
                upcomingAppointments.map((appointment, index) => {
                  const type = appointmentTypes.find(t => t.value === appointment.type);
                  return (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.05),
                        borderLeft: `3px solid ${type?.color || theme.palette.primary.main}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(new Date(appointment.start_time))} - {appointment.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patient_name}
                      </Typography>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Statistiche
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Appuntamenti Oggi
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {todayAppointments.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Appuntamenti Settimana
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {appointments.length}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  };

  const renderAppointmentDialog = () => (
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
            <FormControl fullWidth>
              <InputLabel>Paziente</InputLabel>
              <Select
                value={selectedAppointment ? selectedAppointment.patient_id : newAppointment.patient_id}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, patient_id: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, patient_id: value }));
                  }
                }}
                label="Paziente"
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Medico</InputLabel>
              <Select
                value={selectedAppointment ? selectedAppointment.doctor_id : newAppointment.doctor_id}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, doctor_id: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, doctor_id: value }));
                  }
                }}
                label="Medico"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.first_name} {doctor.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={selectedAppointment ? selectedAppointment.type : newAppointment.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, type: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, type: value }));
                  }
                }}
                label="Tipo"
              >
                {appointmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data e Ora Inizio"
              type="datetime-local"
              value={selectedAppointment ? 
                new Date(selectedAppointment.start_time).toISOString().slice(0, 16) : 
                newAppointment.start_time.toISOString().slice(0, 16)
              }
              onChange={(e) => {
                const value = new Date(e.target.value);
                if (selectedAppointment) {
                  setSelectedAppointment(prev => ({ ...prev, start_time: value }));
                } else {
                  setNewAppointment(prev => ({ ...prev, start_time: value }));
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data e Ora Fine"
              type="datetime-local"
              value={selectedAppointment ? 
                new Date(selectedAppointment.end_time).toISOString().slice(0, 16) : 
                newAppointment.end_time.toISOString().slice(0, 16)
              }
              onChange={(e) => {
                const value = new Date(e.target.value);
                if (selectedAppointment) {
                  setSelectedAppointment(prev => ({ ...prev, end_time: value }));
                } else {
                  setNewAppointment(prev => ({ ...prev, end_time: value }));
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Note"
              multiline
              rows={3}
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
        <Button onClick={handleSaveAppointment} variant="contained">
          {selectedAppointment ? 'Aggiorna' : 'Crea'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Helper function for week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Caricamento calendario...</Typography>
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
          <Button onClick={loadData} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
            Riprova
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in timeout={800}>
      <Box>
        {renderHeader()}
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </Grid>
          
          <Grid item xs={12} lg={4}>
            {renderSidebar()}
          </Grid>
        </Grid>

        {renderAppointmentDialog()}
      </Box>
    </Fade>
  );
};

export default ModernCalendar;
