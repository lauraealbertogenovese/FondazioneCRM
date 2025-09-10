import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Container,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as EmergencyIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ClinicalDiary from '../components/ClinicalDiary';
import DocumentManager from '../components/DocumentManager';
import GDPRCompliance from '../components/GDPRCompliance';
import AuditLog from '../components/AuditLog';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatient(id);
      setPatient(response.patient);
    } catch (error) {
      console.error('Errore nel caricamento del paziente:', error);
      setError('Errore nel caricamento del paziente');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/patients/${id}/edit`);
    handleMenuClose();
  };

  const getSessoColor = (sesso) => {
    switch (sesso) {
      case 'M': return 'primary';
      case 'F': return 'secondary';
      default: return 'default';
    }
  };

  const getSessoLabel = (sesso) => {
    switch (sesso) {
      case 'M': return 'Maschio';
      case 'F': return 'Femmina';
      case 'Altro': return 'Altro';
      default: return sesso;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discharged': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'In Cura';
      case 'inactive': return 'Sospeso';
      case 'discharged': return 'Dimesso';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={200} />
      </Stack>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={400} height={20} />
      </Box>
      
      <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert 
          severity="warning"
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
          }}
        >
          Paziente non trovato
        </Alert>
      </Container>
    );
  }

  const tabSections = [
    { label: 'Informazioni', icon: <PersonIcon />, content: 'info' },
    { label: 'Contatti', icon: <PhoneIcon />, content: 'contacts' },
    { label: 'Clinico', icon: <MedicalIcon />, content: 'medical' },
    { label: 'Documenti', icon: <DocumentIcon />, content: 'documents' },
    { label: 'Note Cliniche', icon: <AssignmentIcon />, content: 'notes' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Informazioni
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Informazioni Personali
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Nome Completo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.nome} {patient.cognome}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(patient.status)}
                    color={getStatusColor(patient.status)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Età
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {calculateAge(patient.data_nascita)} anni
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Codice Fiscale
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.codice_fiscale || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Data di Nascita
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.data_nascita ? new Date(patient.data_nascita).toLocaleDateString('it-IT') : 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Sesso
                  </Typography>
                  <Chip
                    label={getSessoLabel(patient.sesso)}
                    color={getSessoColor(patient.sesso)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Telefono
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.telefono || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.email || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Clinico di Riferimento
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.medico_curante || 'Non assegnato'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Tessera Sanitaria
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.numero_tessera_sanitaria || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Luogo di Nascita
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.luogo_nascita || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Stato Civile
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.stato_civile || 'Non specificato'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1: // Contatti
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Informazioni di Contatto
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Telefono
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.telefono || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.email || 'Non disponibile'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Indirizzo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.indirizzo || 'Non disponibile'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Città
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.citta || 'Non disponibile'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2: // Clinico
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Informazioni Mediche
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Clinico di Riferimento
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.medico_curante || 'Non assegnato'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Diagnosi Principale
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.diagnosi_principale || 'Non specificata'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Sostanza di Abuso
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.sostanza_abuso || 'Non specificata'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Lavoro
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.lavoro || 'Non specificato'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3: // Documenti
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Gestione Documenti
            </Typography>
            <DocumentManager 
              patientId={patient.id}
              patientName={`${patient.nome} ${patient.cognome}`}
            />
          </Box>
        );
      
      case 4: // Note Cliniche
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Note Cliniche e Diario
            </Typography>
            <ClinicalDiary 
              patientId={patient.id}
              patientName={`${patient.nome} ${patient.cognome}`}
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Fade in timeout={500}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Minimal Header */}
        <Box sx={{ mb: 3 }}>
          {/* Navigation */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => navigate('/patients')}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Pazienti / {patient.nome} {patient.cognome}
            </Typography>
          </Stack>

          {/* Patient Header - Compact */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="text.primary"
                sx={{ mb: 0.5 }}
              >
                {patient.nome} {patient.cognome}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  ID: {patient.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • CF: {patient.codice_fiscale || 'Non disponibile'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Registrato il {new Date(patient.created_at).toLocaleDateString('it-IT')}
                </Typography>
              </Stack>
            </Box>
            
            {/* Action Buttons - Compact */}
            <Stack direction="row" spacing={1}>
              {hasPermission('patients.write') && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  size="small"
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    }
                  }}
                >
                  Modifica
                </Button>
              )}
              
              <IconButton 
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Main Content Area */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            overflow: 'hidden',
          }}
        >
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              {tabSections.map((section, index) => (
                <Tab
                  key={index}
                  label={section.label}
                  icon={section.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {renderTabContent()}
          </Box>
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          elevation={2}
          sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
        >
          {hasPermission('patients.write') && (
            <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
              <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Modifica Paziente
            </MenuItem>
          )}
        </Menu>
      </Container>
    </Fade>
  );
};

export default PatientDetailPage;