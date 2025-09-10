import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Popper,
  ClickAwayListener,
  Menu,
  MenuList,
  Autocomplete,
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
  ViewAgenda as AgendaViewIcon,
  Timeline as TimelineIcon,
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
  Settings as SettingsIcon,
  Group as GroupIcon,
  ViewList as ListViewIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { clinicalService, userService, patientService } from '../services/api';

const ProfessionalScheduler = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline'); // day, week, month, agenda, timeline
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and grouping
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupByDoctor, setGroupByDoctor] = useState(true);
  
  // UI State
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState({ mouseX: null, mouseY: null, appointment: null });
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  
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
    { value: 'consultation', label: 'Consulenza', color: '#1976d2', icon: '🩺' },
    { value: 'therapy', label: 'Terapia', color: '#388e3c', icon: '🧠' },
    { value: 'group_session', label: 'Sessione di Gruppo', color: '#0288d1', icon: '👥' },
    { value: 'evaluation', label: 'Valutazione', color: '#f57c00', icon: '📋' },
    { value: 'follow_up', label: 'Follow-up', color: '#7b1fa2', icon: '🔄' },
    { value: 'emergency', label: 'Emergenza', color: '#d32f2f', icon: '🚨' },
  ];

  const appointmentStatuses = [
    { value: 'scheduled', label: 'Programmato', color: '#0288d1' },
    { value: 'confirmed', label: 'Confermato', color: '#388e3c' },
    { value: 'in_progress', label: 'In Corso', color: '#f57c00' },
    { value: 'completed', label: 'Completato', color: '#2e7d32' },
    { value: 'cancelled', label: 'Annullato', color: '#d32f2f' },
    { value: 'no_show', label: 'Non Presentato', color: '#757575' },
  ];

  // Refs
  const schedulerRef = useRef(null);
  const dragRef = useRef(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, doctorFilter, typeFilter, statusFilter, searchTerm, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading data...');
      
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Current user token:', token);
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        setError('Token di autenticazione non trovato');
        return;
      }
      
      console.log('📞 Calling userService.getUsers...');
      const doctorsRes = await userService.getUsers({ role: 'clinico' });
      console.log('✅ Doctors response:', doctorsRes);
      
      console.log('📞 Calling patientService.getPatients...');
      const patientsRes = await patientService.getPatients({ limit: 1000 });
      console.log('✅ Patients response:', patientsRes);
      
      const doctorsList = doctorsRes.users || [];
      const patientsList = patientsRes.patients || [];
      
      setDoctors(doctorsList);
      setPatients(patientsList);
      
        console.log('📊 Final doctors count:', doctorsList.length);
        console.log('📊 Final patients count:', patientsList.length);
        console.log('👨‍⚕️ Doctors data sample:', doctorsList.slice(0, 2));
        console.log('🧑‍🦲 Patients data sample:', patientsList.slice(0, 2));
        
        // Debug struttura pazienti
        if (patientsList.length > 0) {
          console.log('🔍 Patient structure (first patient):', Object.keys(patientsList[0]));
          console.log('🔍 Patient sample data:', patientsList[0]);
        }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError('Errore nel caricamento dei dati');
      setDoctors([]);
      setPatients([]);
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
      case 'timeline':
        d.setDate(d.getDate() - d.getDay());
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
      case 'timeline':
        d.setDate(d.getDate() - d.getDay() + 6);
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

  const getCurrentTimePosition = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    const minutesFromStart = (now - startOfDay) / (1000 * 60);
    return Math.max(0, minutesFromStart * 2); // 2px per minuto
  };

  // Event handlers
  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
      case 'timeline':
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
      case 'timeline':
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
    setTouchedFields(new Set()); // Reset touched fields
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleContextMenu = (event, appointment) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      appointment: appointment
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ mouseX: null, mouseY: null, appointment: null });
  };

  const handleDragStart = (event, appointment) => {
    setDraggedAppointment(appointment);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
  };

  const handleDragOver = (event, slot) => {
    event.preventDefault();
    setDragOverSlot(slot);
  };

  const handleDrop = async (event, slot) => {
    event.preventDefault();
    if (draggedAppointment && slot) {
      // Update appointment time
      const newStartTime = new Date(slot.date);
      newStartTime.setHours(slot.hour, slot.minute, 0, 0);
      const newEndTime = new Date(newStartTime.getTime() + 
        (new Date(draggedAppointment.end_time) - new Date(draggedAppointment.start_time)));

      try {
        await clinicalService.updateVisit(draggedAppointment.id, {
          ...draggedAppointment,
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString()
        });
        loadAppointments();
      } catch (error) {
        console.error('Error updating appointment:', error);
      }
    }
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleSaveAppointment = async () => {
    try {
      console.log('💾 Saving appointment...');
      console.log('📊 IsEdit:', !!selectedAppointment);
      console.log('📋 Data to send (JSON):', JSON.stringify(selectedAppointment || newAppointment, null, 2));
      
      if (selectedAppointment) {
        await clinicalService.updateVisit(selectedAppointment.id, selectedAppointment);
      } else {
        // Gestione semplice appuntamenti - senza obbligo di cartella clinica
        console.log('📅 Creating simple calendar appointment...');
        
        // Ottieni il nome del dottore se disponibile
        const selectedDoctor = doctors.find(doc => doc.id === newAppointment.doctor_id);
        const doctorName = selectedDoctor ? `${selectedDoctor.first_name || selectedDoctor.nome || ''} ${selectedDoctor.last_name || selectedDoctor.cognome || ''}`.trim() : '';
        
        // Mappa i campi del frontend ai campi richiesti dal backend per appuntamento semplice
        const visitData = {
          clinical_record_id: null,  // Appuntamento senza cartella clinica
          visit_type: newAppointment.type,  // "type" -> "visit_type"
          visit_date: newAppointment.start_time,  // "start_time" -> "visit_date"
          duration_minutes: newAppointment.end_time && newAppointment.start_time ? 
            Math.round((new Date(newAppointment.end_time) - new Date(newAppointment.start_time)) / (1000 * 60)) : 60,
          visit_notes: newAppointment.notes || '',  // "notes" -> "visit_notes"
          doctor_name: doctorName,
          status: 'scheduled',
          follow_up_date: null
        };
        
        console.log('🔄 Simple appointment data:', JSON.stringify(visitData, null, 2));
        await clinicalService.createVisit(visitData);
      }
      setAppointmentDialogOpen(false);
      loadAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      console.error('📋 Appointment data being sent (JSON):', JSON.stringify(selectedAppointment || newAppointment, null, 2));
      setError('Errore nel salvataggio dell\'appuntamento');
    }
  };

  // Render functions
  const renderHeader = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            Scheduler Professionale
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
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              Impostazioni
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
              {viewMode === 'timeline' && `Timeline - Settimana ${getWeekNumber(currentDate)}`}
              {viewMode === 'agenda' && 'Agenda Appuntamenti'}
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
            <Tooltip title="Vista Giorno">
              <IconButton
                color={viewMode === 'day' ? 'primary' : 'default'}
                onClick={() => setViewMode('day')}
              >
                <DayViewIcon />
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
            <Tooltip title="Vista Mese">
              <IconButton
                color={viewMode === 'month' ? 'primary' : 'default'}
                onClick={() => setViewMode('month')}
              >
                <MonthViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Timeline">
              <IconButton
                color={viewMode === 'timeline' ? 'primary' : 'default'}
                onClick={() => setViewMode('timeline')}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Agenda">
              <IconButton
                color={viewMode === 'agenda' ? 'primary' : 'default'}
                onClick={() => setViewMode('agenda')}
              >
                <AgendaViewIcon />
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
              <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant={groupByDoctor ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<GroupIcon />}
                    onClick={() => setGroupByDoctor(!groupByDoctor)}
                  >
                    Raggruppa per Medico
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Slide>
      </CardContent>
    </Card>
  );

  const renderTimelineView = () => {
    const startDate = getStartOfPeriod(currentDate, 'timeline');
    const days = [];
    const timeSlots = [];
    
    // Generate days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    // Generate time slots (8 AM to 8 PM)
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push({ hour, minute });
      }
    }

    const currentTimePosition = getCurrentTimePosition();

    return (
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', height: 600 }}>
            {/* Time column */}
            <Box sx={{ width: 80, borderRight: 1, borderColor: 'divider' }}>
              <Box sx={{ height: 40, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Orario
                </Typography>
              </Box>
              {timeSlots.map((slot, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 40,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  {slot.hour.toString().padStart(2, '0')}:{slot.minute.toString().padStart(2, '0')}
                </Box>
              ))}
            </Box>

            {/* Days columns */}
            <Box sx={{ flex: 1, display: 'flex' }}>
              {days.map((day, dayIndex) => {
                const dayAppointments = appointments.filter(apt => 
                  isSameDay(new Date(apt.start_time), day)
                );
                const isToday = isSameDay(day, new Date());

                return (
                  <Box key={dayIndex} sx={{ flex: 1, borderRight: 1, borderColor: 'divider' }}>
                    {/* Day header */}
                    <Box
                      sx={{
                        height: 40,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        fontWeight: isToday ? 700 : 500,
                      }}
                    >
                      <Typography variant="body2">
                        {day.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>

                    {/* Time slots */}
                    <Box sx={{ position: 'relative' }}>
                      {timeSlots.map((slot, slotIndex) => (
                        <Box
                          key={slotIndex}
                          sx={{
                            height: 40,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                          onDragOver={(e) => handleDragOver(e, { date: day, hour: slot.hour, minute: slot.minute })}
                          onDrop={(e) => handleDrop(e, { date: day, hour: slot.hour, minute: slot.minute })}
                        >
                          {/* Current time indicator */}
                          {isToday && slotIndex === 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: currentTimePosition,
                                left: 0,
                                right: 0,
                                height: 2,
                                backgroundColor: theme.palette.error.main,
                                zIndex: 10,
                              }}
                            />
                          )}

                          {/* Appointments */}
                          {dayAppointments.map((appointment, aptIndex) => {
                            const startTime = new Date(appointment.start_time);
                            const endTime = new Date(appointment.end_time);
                            const startHour = startTime.getHours();
                            const startMinute = startTime.getMinutes();
                            const endHour = endTime.getHours();
                            const endMinute = endTime.getMinutes();

                            const slotStart = slot.hour * 2 + (slot.minute / 30);
                            const appointmentStart = startHour * 2 + (startMinute / 30);
                            const appointmentEnd = endHour * 2 + (endMinute / 30);

                            if (slotStart >= appointmentStart && slotStart < appointmentEnd) {
                              const type = appointmentTypes.find(t => t.value === appointment.type);
                              const isFirstSlot = slotStart === appointmentStart;
                              const duration = appointmentEnd - appointmentStart;

                              return (
                                <Box
                                  key={aptIndex}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, appointment)}
                                  onContextMenu={(e) => handleContextMenu(e, appointment)}
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 4,
                                    right: 4,
                                    height: duration * 20,
                                    backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                                    borderLeft: `4px solid ${type?.color || theme.palette.primary.main}`,
                                    borderRadius: 1,
                                    p: 0.5,
                                    cursor: 'pointer',
                                    zIndex: 5,
                                    '&:hover': {
                                      backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.2),
                                    },
                                  }}
                                  onClick={() => handleAppointmentClick(appointment)}
                                >
                                  {isFirstSlot && (
                                    <>
                                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                        {formatTime(startTime)} - {appointment.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                                        {appointment.patient_name}
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                              );
                            }
                            return null;
                          })}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
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
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', height: 600 }}>
            {/* Time column */}
            <Box sx={{ width: 80, borderRight: 1, borderColor: 'divider' }}>
              <Box sx={{ height: 40, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Orario
                </Typography>
              </Box>
              {timeSlots.map((time, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 40,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  {formatTime(time)}
                </Box>
              ))}
            </Box>

            {/* Main day column */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              {/* Day header */}
              <Box
                sx={{
                  height: 40,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  fontWeight: 700,
                }}
              >
                <Typography variant="body1">
                  {formatDate(selectedDate)}
                </Typography>
              </Box>

              {/* Time slots */}
              <Box sx={{ position: 'relative' }}>
                {timeSlots.map((time, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 40,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    {/* Current time indicator */}
                    {isSameDay(time, new Date()) && index === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: getCurrentTimePosition(),
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: theme.palette.error.main,
                          zIndex: 10,
                        }}
                      />
                    )}

                    {/* Appointments */}
                    {dayAppointments.map((appointment, aptIndex) => {
                      const startTime = new Date(appointment.start_time);
                      const endTime = new Date(appointment.end_time);
                      const startHour = startTime.getHours();
                      const startMinute = startTime.getMinutes();
                      const endHour = endTime.getHours();
                      const endMinute = endTime.getMinutes();

                      const slotStart = time.getHours() * 2 + (time.getMinutes() / 30);
                      const appointmentStart = startHour * 2 + (startMinute / 30);
                      const appointmentEnd = endHour * 2 + (endMinute / 30);

                      if (slotStart >= appointmentStart && slotStart < appointmentEnd) {
                        const type = appointmentTypes.find(t => t.value === appointment.type);
                        const isFirstSlot = slotStart === appointmentStart;
                        const duration = appointmentEnd - appointmentStart;

                        return (
                          <Box
                            key={aptIndex}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appointment)}
                            onContextMenu={(e) => handleContextMenu(e, appointment)}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 8,
                              right: 8,
                              height: duration * 20,
                              backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                              borderLeft: `4px solid ${type?.color || theme.palette.primary.main}`,
                              borderRadius: 1,
                              p: 0.5,
                              cursor: 'pointer',
                              zIndex: 5,
                              '&:hover': {
                                backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.2),
                              },
                            }}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            {isFirstSlot && (
                              <>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                  {formatTime(startTime)} - {appointment.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                                  {appointment.patient_name}
                                </Typography>
                              </>
                            )}
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
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

  const renderAgendaView = () => {
    const sortedAppointments = appointments
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Agenda Appuntamenti
          </Typography>
          <List>
            {sortedAppointments.map((appointment, index) => {
              const type = appointmentTypes.find(t => t.value === appointment.type);
              const status = appointmentStatuses.find(s => s.value === appointment.status);
              const startTime = new Date(appointment.start_time);
              const endTime = new Date(appointment.end_time);

              return (
                <ListItem
                  key={index}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={() => handleAppointmentClick(appointment)}
                  onContextMenu={(e) => handleContextMenu(e, appointment)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: type?.color || theme.palette.primary.main }}>
                      {type?.icon || '📅'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {appointment.title}
                        </Typography>
                        <Chip
                          label={type?.label || 'Appuntamento'}
                          size="small"
                          sx={{
                            backgroundColor: alpha(type?.color || theme.palette.primary.main, 0.1),
                            color: type?.color || theme.palette.primary.main,
                          }}
                        />
                        <Chip
                          label={status?.label || 'Programmato'}
                          size="small"
                          sx={{
                            backgroundColor: alpha(status?.color || theme.palette.info.main, 0.1),
                            color: status?.color || theme.palette.info.main,
                          }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <TimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {appointment.patient_name}
                        </Typography>
                        {appointment.location && (
                          <Typography variant="body2" color="text.secondary">
                            <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            {appointment.location}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="more">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderContextMenu = () => (
    <Menu
      open={contextMenu.mouseY !== null}
      onClose={handleCloseContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu.mouseY !== null && contextMenu.mouseX !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuList>
        <MenuItem onClick={() => {
          handleAppointmentClick(contextMenu.appointment);
          handleCloseContextMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Modifica
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle delete
          handleCloseContextMenu();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Elimina
        </MenuItem>
      </MenuList>
    </Menu>
  );

  // Validation function - only show errors after user interaction
  const isFormValid = () => {
    const appointment = selectedAppointment || newAppointment;
    return (
      appointment.title?.trim() &&
      appointment.patient_id &&
      appointment.doctor_id &&
      appointment.start_time &&
      appointment.end_time &&
      new Date(appointment.start_time) < new Date(appointment.end_time)
    );
  };

  // Track which fields have been touched by the user
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Check if field has been touched (user has interacted with it)
  const isFieldTouched = (fieldName) => {
    return touchedFields.has(fieldName);
  };

  // Mark field as touched
  const markFieldAsTouched = (fieldName) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  // Check if field has error (only if touched)
  const hasFieldError = (fieldName) => {
    const appointment = selectedAppointment || newAppointment;
    if (!isFieldTouched(fieldName)) return false;
    
    switch (fieldName) {
      case 'title':
        return !appointment.title?.trim();
      case 'patient_id':
        return !appointment.patient_id;
      case 'doctor_id':
        return !appointment.doctor_id;
      case 'start_time':
        return !appointment.start_time || (appointment.end_time && new Date(appointment.start_time) >= new Date(appointment.end_time));
      case 'end_time':
        return !appointment.end_time || (appointment.start_time && new Date(appointment.start_time) >= new Date(appointment.end_time));
      default:
        return false;
    }
  };

  // Auto-update end time when start time changes
  const handleStartTimeChange = (value) => {
    const startTime = new Date(value);
    const endTime = new Date(startTime.getTime() + 3600000); // +1 hour
    
    if (selectedAppointment) {
      setSelectedAppointment(prev => ({ 
        ...prev, 
        start_time: startTime,
        end_time: endTime
      }));
    } else {
      setNewAppointment(prev => ({ 
        ...prev, 
        start_time: startTime,
        end_time: endTime
      }));
    }
  };

  const renderAppointmentDialog = () => {
    const appointment = selectedAppointment || newAppointment;
    const isEdit = !!selectedAppointment;

    return (
      <Dialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
              <DialogTitle sx={{
                pb: 2,
                pt: 3,
                px: 3,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
                '& .MuiDialogTitle-root': {
                  margin: 0,
                  padding: 0,
                }
              }}>
                <EventIcon color="primary" />
                <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                  {isEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
                </Box>
              </DialogTitle>
        
        <DialogContent sx={{ 
          pt: 8, 
          pb: 2,
          px: 3,
          flex: 1, 
          overflow: 'auto',
          minHeight: '500px',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          },
        }}>
          <Grid container spacing={3}>
            {/* Titolo */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Titolo Appuntamento"
                placeholder="Es. Consulenza psicologica, Terapia di gruppo..."
                value={appointment.title || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  markFieldAsTouched('title');
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, title: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, title: value }));
                  }
                }}
                onBlur={() => markFieldAsTouched('title')}
                error={hasFieldError('title')}
                helperText={hasFieldError('title') ? 'Il titolo è obbligatorio' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Paziente e Medico */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => {
                  // Prova diversi possibili nomi di campo
                  const firstName = option.first_name || option.nome || '';
                  const lastName = option.last_name || option.cognome || '';
                  return `${firstName} ${lastName}`.trim() || `Paziente ${option.id}`;
                }}
                noOptionsText="Nessun paziente trovato"
                loadingText="Caricamento pazienti..."
                clearText="Cancella"
                openText="Apri"
                closeText="Chiudi"
                value={patients.find(p => p.id === appointment.patient_id) || null}
                onChange={(event, newValue) => {
                  const value = newValue?.id || '';
                  markFieldAsTouched('patient_id');
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, patient_id: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, patient_id: value }));
                  }
                }}
                onBlur={() => markFieldAsTouched('patient_id')}
                filterOptions={(options, { inputValue }) => {
                  if (!inputValue) return options;
                  
                  const searchText = inputValue.toLowerCase().trim();
                  
                  return options.filter(option => {
                    // Prova diversi possibili nomi di campo
                    const firstName = (option.first_name || option.nome || '').toLowerCase();
                    const lastName = (option.last_name || option.cognome || '').toLowerCase();
                    const fullName = `${firstName} ${lastName}`.trim();
                    const email = (option.email || '').toLowerCase();
                    const codice_fiscale = (option.codice_fiscale || '').toLowerCase();
                    const id = (option.id || '').toString().toLowerCase();
                    
                    return firstName.includes(searchText) || 
                           lastName.includes(searchText) ||
                           fullName.includes(searchText) ||
                           email.includes(searchText) || 
                           codice_fiscale.includes(searchText) ||
                           id.includes(searchText);
                  });
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                freeSolo={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paziente *"
                    error={hasFieldError('patient_id')}
                    helperText={hasFieldError('patient_id') ? 'Seleziona un paziente' : ''}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  // Prova diversi possibili nomi di campo
                  const firstName = option.first_name || option.nome || '';
                  const lastName = option.last_name || option.cognome || '';
                  const fullName = `${firstName} ${lastName}`.trim() || `Paziente ${option.id}`;
                  const initials = `${firstName[0] || 'P'}${lastName[0] || option.id?.toString()[0] || '?'}`;
                  
                  // Assicuriamoci che l'id sia una stringa valida
                  const uniqueKey = `patient-${option.id}`;
                  
                  return (
                    <li {...props} key={uniqueKey}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {initials}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fullName}
                          </Typography>
                          {option.email && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </li>
                  );
                }}
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '14px !important',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={doctors}
                getOptionLabel={(option) => `Dr. ${option.first_name} ${option.last_name}`}
                value={doctors.find(d => d.id === appointment.doctor_id) || null}
                onChange={(event, newValue) => {
                  const value = newValue?.id || '';
                  markFieldAsTouched('doctor_id');
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, doctor_id: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, doctor_id: value }));
                  }
                }}
                onBlur={() => markFieldAsTouched('doctor_id')}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(option =>
                    `Dr. ${option.first_name} ${option.last_name}`.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Medico *"
                    error={hasFieldError('doctor_id')}
                    helperText={hasFieldError('doctor_id') ? 'Seleziona un medico' : ''}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box key={key} component="li" {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
                          {option.first_name?.[0]}{option.last_name?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Dr. {option.first_name} {option.last_name}
                          </Typography>
                          {option.email && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                          {option.specialization && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                              {option.specialization}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="Nessun medico trovato"
                loadingText="Caricamento medici..."
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '14px !important',
                  },
                }}
              />
            </Grid>

            {/* Tipo e Stato */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={appointmentTypes}
                getOptionLabel={(option) => option.label}
                value={appointmentTypes.find(t => t.value === appointment.type) || appointmentTypes[0]}
                onChange={(event, newValue) => {
                  const value = newValue?.value || 'consultation';
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, type: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, type: value }));
                  }
                }}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(option =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo Appuntamento"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScheduleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box key={key} component="li" {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography sx={{ fontSize: '1.2rem', minWidth: 24 }}>
                          {option.icon}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="Nessun tipo trovato"
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '14px !important',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={appointmentStatuses}
                getOptionLabel={(option) => option.label}
                value={appointmentStatuses.find(s => s.value === appointment.status) || appointmentStatuses[0]}
                onChange={(event, newValue) => {
                  const value = newValue?.value || 'scheduled';
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, status: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, status: value }));
                  }
                }}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(option =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Stato Appuntamento"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box key={key} component="li" {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: option.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                noOptionsText="Nessuno stato trovato"
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '14px !important',
                  },
                }}
              />
            </Grid>

            {/* Date e Ora */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data e Ora Inizio"
                type="datetime-local"
                value={appointment.start_time ?
                  new Date(appointment.start_time).toISOString().slice(0, 16) :
                  ''
                }
                onChange={(e) => {
                  markFieldAsTouched('start_time');
                  handleStartTimeChange(e.target.value);
                }}
                onBlur={() => markFieldAsTouched('start_time')}
                InputLabelProps={{ shrink: true }}
                error={hasFieldError('start_time')}
                helperText={
                  hasFieldError('start_time') ? 
                    (!appointment.start_time ? 'Seleziona data e ora di inizio' :
                     appointment.end_time && new Date(appointment.start_time) >= new Date(appointment.end_time) ?
                     'La data di inizio deve essere precedente alla data di fine' : '') : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data e Ora Fine"
                type="datetime-local"
                value={appointment.end_time ?
                  new Date(appointment.end_time).toISOString().slice(0, 16) :
                  ''
                }
                onChange={(e) => {
                  const value = new Date(e.target.value);
                  markFieldAsTouched('end_time');
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, end_time: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, end_time: value }));
                  }
                }}
                onBlur={() => markFieldAsTouched('end_time')}
                InputLabelProps={{ shrink: true }}
                error={hasFieldError('end_time')}
                helperText={
                  hasFieldError('end_time') ? 
                    (!appointment.end_time ? 'Seleziona data e ora di fine' :
                     appointment.start_time && new Date(appointment.start_time) >= new Date(appointment.end_time) ?
                     'La data di fine deve essere successiva alla data di inizio' : '') : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Luogo (opzionale)"
                placeholder="Es. Studio 1, Sala riunioni, Online..."
                value={appointment.location || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, location: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, location: value }));
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Note */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note (opzionale)"
                placeholder="Aggiungi note o dettagli aggiuntivi..."
                multiline
                rows={3}
                value={appointment.notes || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedAppointment) {
                    setSelectedAppointment(prev => ({ ...prev, notes: value }));
                  } else {
                    setNewAppointment(prev => ({ ...prev, notes: value }));
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <EditIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          gap: 1,
          flexShrink: 0,
          backgroundColor: 'background.paper',
        }}>
          <Button 
            onClick={() => setAppointmentDialogOpen(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSaveAppointment} 
            variant="contained"
            disabled={!isFormValid()}
            startIcon={isEdit ? <EditIcon /> : <AddIcon />}
            sx={{
              minWidth: 120,
              background: isFormValid() ? 
                'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' : 
                undefined,
            }}
          >
            {isEdit ? 'Aggiorna' : 'Crea Appuntamento'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
        <Typography>Caricamento scheduler...</Typography>
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
      <Box ref={schedulerRef}>
        {renderHeader()}
        
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'agenda' && renderAgendaView()}

        {renderAppointmentDialog()}
        {renderContextMenu()}
      </Box>
    </Fade>
  );
};

export default ProfessionalScheduler;
