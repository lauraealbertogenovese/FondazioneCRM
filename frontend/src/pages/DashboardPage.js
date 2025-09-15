import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Chip,
  Avatar,
  Stack,
  Button,
  LinearProgress,
  Container,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Badge,
  Skeleton,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  Groups as GroupsIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  EventAvailable as EventIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { patientService, clinicalService, userService, groupService } from '../services/api';

const DashboardPage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalUsers: 0,
    totalGroups: 0,
    activePatients: 0,
    recentPatients: [],
    upcomingAppointments: [],
    recentActivity: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);
      
      const requests = [];
      
      // Richieste base sempre disponibili
      if (hasPermission('patients.read')) {
        requests.push(patientService.getPatients({ limit: 5 }));
      } else {
        requests.push(Promise.resolve({ patients: [], pagination: { total: 0 } }));
      }

      if (hasPermission('clinical.read')) {
        requests.push(
          clinicalService.getRecords({ limit: 10 })
        );
      } else {
        requests.push(
          Promise.resolve({ records: [] })
        );
      }

      if (hasPermission('users.read')) {
        requests.push(userService.getUsers({ limit: 1 }));
      } else {
        requests.push(Promise.resolve({ users: [] }));
      }

      if (hasPermission('groups.read')) {
        requests.push(groupService.getGroups({ limit: 5 }));
      } else {
        requests.push(Promise.resolve({ groups: [] }));
      }

      const [
        patientsResponse,
        clinicalResponse,
        usersResponse,
        groupsResponse
      ] = await Promise.all(requests);

      setStats({
        totalPatients: patientsResponse.pagination?.total || patientsResponse.patients?.length || 0,
        totalUsers: usersResponse.pagination?.total || usersResponse.users?.length || 0,
        totalGroups: groupsResponse.pagination?.total || groupsResponse.groups?.length || 0,
        activePatients: patientsResponse.patients?.filter(p => p.is_active).length || 0,
        recentPatients: patientsResponse.patients || [],
        upcomingAppointments: [],
        recentActivity: [
          ...((patientsResponse.patients || []).slice(0, 3).map(p => ({
            type: 'patient',
            title: `Nuovo paziente: ${p.nome} ${p.cognome}`,
            time: p.created_at,
            icon: PersonIcon,
            color: 'primary'
          }))),
          ...((upcomingResponse.visits || []).slice(0, 3).map(v => ({
            type: 'visit',
            title: `Visita programmata: ${v.visit_type}`,
            time: v.visit_date,
            icon: CalendarIcon,
            color: 'info'
          })))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)
      });
    } catch (error) {
      console.error('Errore nel caricamento dei dati della dashboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('it-IT')} ${date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Ora';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ore fa`;
    if (diffInHours < 48) return 'Ieri';
    return formatDate(dateString);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick, action }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={`${color}.main`}>
              {isLoading ? <Skeleton width={60} /> : value}
            </Typography>
            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  {trend}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
              color: 'white',
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Stack>
        {action && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{ 
              mt: 2,
              borderColor: alpha(theme.palette[color].main, 0.3),
              color: `${color}.main`,
              '&:hover': {
                borderColor: `${color}.main`,
                background: alpha(theme.palette[color].main, 0.1),
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
          >
            {action.label || 'Aggiungi'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
                {getGreeting()}, {(user?.first_name || 'Utente').replace(/[^\w\s]/g, '').replace(/\s*!.*$/, '')}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Benvenuto nel sistema di gestione della Fondazione per il Recovery
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  background: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshIcon sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </IconButton>
              <IconButton
                sx={{
                  background: alpha(theme.palette.info.main, 0.1),
                  '&:hover': { background: alpha(theme.palette.info.main, 0.2) }
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pazienti Totali"
                value={stats.totalPatients}
                icon={PeopleIcon}
                color="primary"
                onClick={() => navigate('/patients')}
                action={hasPermission('patients.write') ? () => navigate('/patients/new') : null}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Gruppi di Supporto"
                value={stats.totalGroups}
                icon={GroupsIcon}
                color="success"
                onClick={() => navigate('/groups')}
                action={hasPermission('groups.write') ? () => navigate('/groups/new') : null}
              />
            </Grid>
          </Grid>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Recent Patients */}
            {hasPermission('patients.read') && (
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" p={3} pb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PeopleIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Pazienti Recenti
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/patients')}
                      >
                        Vedi tutti
                      </Button>
                    </Stack>
                    <Divider />
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {stats.recentPatients.map((patient, index) => (
                        <ListItem
                          key={patient.id}
                          button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          sx={{
                            '&:hover': { background: alpha(theme.palette.primary.main, 0.05) }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                color: 'white'
                              }}
                            >
                              {getInitials(patient.nome, patient.cognome)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontWeight={600}>
                                {patient.nome} {patient.cognome}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(patient.created_at)}
                              </Typography>
                            }
                          />
                          <Chip
                            label={patient.is_active ? 'Attivo' : 'Inattivo'}
                            size="small"
                            color={patient.is_active ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </ListItem>
                      ))}
                      {stats.recentPatients.length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="Nessun paziente recente"
                            secondary="I nuovi pazienti appariranno qui"
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Upcoming Appointments */}
            {hasPermission('clinical.read') && (
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" p={3} pb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarIcon color="info" />
                        <Typography variant="h6" fontWeight="bold">
                          Appuntamenti Prossimi
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/calendar')}
                      >
                        Calendario
                      </Button>
                    </Stack>
                    <Divider />
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {stats.upcomingAppointments.map((visit, index) => (
                        <ListItem
                          key={visit.id}
                          sx={{
                            '&:hover': { background: alpha(theme.palette.info.main, 0.05) }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                                color: 'white'
                              }}
                            >
                              <EventIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontWeight={600}>
                                {visit.visit_type || 'Visita'}
                              </Typography>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(visit.visit_date)}
                                </Typography>
                                <Typography variant="caption" color="info.main">
                                  {visit.doctor_name || 'Clinico non specificato'}
                                </Typography>
                              </Stack>
                            }
                          />
                          <Chip
                            label={visit.status}
                            size="small"
                            color={visit.status === 'scheduled' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </ListItem>
                      ))}
                      {stats.upcomingAppointments.length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="Nessun appuntamento programmato"
                            secondary="Gli appuntamenti futuri appariranno qui"
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" p={3} pb={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="h6" fontWeight="bold">
                        Attività Recente
                      </Typography>
                    </Stack>
                  </Stack>
                  <Divider />
                  <List>
                    {stats.recentActivity.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette[activity.color].main} 0%, ${theme.palette[activity.color].dark} 100%)`,
                              color: 'white',
                              width: 36,
                              height: 36
                            }}
                          >
                            <activity.icon sx={{ fontSize: 20 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={formatRelativeTime(activity.time)}
                        />
                      </ListItem>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary="Nessuna attività recente"
                          secondary="Le attività recenti appariranno qui"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default DashboardPage;