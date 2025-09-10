import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { gdprService } from '../services/api';

// Helper function to get consent purpose
const getConsentPurpose = (consentType) => {
  const purposes = {
    data_processing: 'Trattamento dati personali per finalità di cura',
    marketing: 'Invio di comunicazioni commerciali e promozionali',
    research: 'Utilizzo dei dati per scopi di ricerca scientifica',
    data_sharing: 'Condivisione dei dati con terze parti autorizzate',
    cookies: 'Utilizzo di cookie e tecnologie di tracciamento'
  };
  return purposes[consentType] || 'Finalità non specificata';
};

const GDPRCompliance = ({ 
  patientId,
  showHeader = true,
  compact = false 
}) => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const [consents, setConsents] = useState({});
  const [consentHistory, setConsentHistory] = useState([]);
  const [dataProcessingLog, setDataProcessingLog] = useState([]);
  const [retentionStatus, setRetentionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [dataExportDialogOpen, setDataExportDialogOpen] = useState(false);
  const [dataDeletionDialogOpen, setDataDeletionDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [deletionReason, setDeletionReason] = useState('');

  const consentTypes = {
    data_processing: {
      label: 'Trattamento Dati',
      description: 'Consenso per il trattamento dei dati personali per finalità mediche',
      required: true,
      icon: SecurityIcon
    },
    marketing: {
      label: 'Marketing',
      description: 'Consenso per l\'invio di comunicazioni promozionali',
      required: false,
      icon: PersonIcon
    },
    research: {
      label: 'Ricerca Scientifica',
      description: 'Consenso per l\'utilizzo dei dati in ambito di ricerca scientifica',
      required: false,
      icon: DocumentIcon
    },
    data_sharing: {
      label: 'Condivisione Dati',
      description: 'Consenso per la condivisione dei dati con terze parti autorizzate',
      required: false,
      icon: ShieldIcon
    }
  };

  useEffect(() => {
    fetchGDPRData();
  }, [patientId]);

  const fetchGDPRData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      // Fetch real data from API
      const [consentsResponse, historyResponse, retentionResponse] = await Promise.all([
        gdprService.getPatientConsents(patientId),
        gdprService.getConsentHistory(patientId),
        gdprService.getRetentionStatus(patientId)
      ]);

      setConsents(consentsResponse.data || {});
      
      // Transform history data to match expected format
      const transformedHistory = (historyResponse.data || []).map(item => ({
        id: item.id,
        type: item.consent_type,
        action: item.action,
        date: item.created_at,
        user: item.user_name,
        version: item.version,
        notes: item.notes
      }));
      setConsentHistory(transformedHistory);
      
      setRetentionStatus(retentionResponse.data || {});
      
      // For now, set empty processing log - this would need to be implemented
      // based on audit logs filtered for this patient
      setDataProcessingLog([]);
      
    } catch (error) {
      console.error('Error fetching GDPR data:', error);
      setError('Errore nel caricamento dei dati GDPR');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentToggle = async (consentType, granted) => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      // Update consent via API
      const consentData = {
        granted,
        version: '1.2',
        legal_basis: 'Consenso dell\'interessato',
        purpose: getConsentPurpose(consentType),
        notes: `Consenso ${granted ? 'concesso' : 'revocato'} dall'utente`
      };

      await gdprService.updateConsent(patientId, consentType, consentData);
      
      // Refresh data
      await fetchGDPRData();
    } catch (error) {
      console.error('Error updating consent:', error);
      setError('Errore nell\'aggiornamento del consenso');
    }
  };

  const handleDataExport = async () => {
    try {
      setExportProgress(0);
      setDataExportDialogOpen(true);

      // Simulate export process
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Simulate file download
            setTimeout(() => {
              setDataExportDialogOpen(false);
              setExportProgress(0);
            }, 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Errore nell\'esportazione dei dati');
    }
  };

  const handleDataDeletion = async () => {
    if (!deletionReason.trim()) {
      setError('Inserire una motivazione per l\'eliminazione dei dati');
      return;
    }

    try {
      // Mock implementation - replace with actual API call
      console.log('Deleting patient data with reason:', deletionReason);
      
      setDataDeletionDialogOpen(false);
      setDeletionReason('');
      
      // Show success message
      alert('Richiesta di eliminazione dati inviata. Verrà processata secondo le procedure GDPR.');
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      setError('Errore nella richiesta di eliminazione dati');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Mai';
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsentStatus = (consent) => {
    if (!consent.granted) {
      return { color: 'error', label: 'Non Concesso', icon: ErrorIcon };
    }
    return { color: 'success', label: 'Concesso', icon: CheckIcon };
  };

  const getRetentionStatusColor = () => {
    const now = new Date();
    const scheduledDeletion = new Date(retentionStatus.scheduled_deletion);
    const yearsLeft = (scheduledDeletion - now) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsLeft < 1) return 'error';
    if (yearsLeft < 2) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento dati GDPR...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      {showHeader && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Conformità GDPR
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestione consensi e diritti sulla privacy
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Consent Management */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Gestione Consensi
                </Typography>
              </Stack>

              <Stack spacing={3}>
                {Object.entries(consentTypes).map(([key, type]) => {
                  const consent = consents[key] || {};
                  const status = getConsentStatus(consent);
                  const StatusIcon = status.icon;

                  return (
                    <Paper
                      key={key}
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        background: alpha(theme.palette[status.color].main, 0.02),
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <type.icon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="subtitle2" fontWeight="600">
                              {type.label}
                            </Typography>
                            {type.required && (
                              <Chip 
                                label="Obbligatorio" 
                                size="small" 
                                color="warning" 
                                variant="outlined" 
                              />
                            )}
                          </Stack>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {type.description}
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <StatusIcon 
                                sx={{ 
                                  fontSize: 16, 
                                  color: theme.palette[status.color].main 
                                }} 
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: theme.palette[status.color].main,
                                  fontWeight: 600 
                                }}
                              >
                                {status.label}
                              </Typography>
                            </Stack>
                            
                            {consent.date && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(consent.date)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={consent.granted || false}
                              onChange={(e) => handleConsentToggle(key, e.target.checked)}
                              color="primary"
                              disabled={!hasPermission('gdpr.manage')}
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Rights & Retention */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Data Rights */}
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.01)} 100%)`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                      color: 'white',
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600">
                    Diritti sui Dati
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDataExport}
                    disabled={!hasPermission('gdpr.export')}
                    fullWidth
                  >
                    Esporta Dati
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => setConsentDialogOpen(true)}
                    fullWidth
                  >
                    Cronologia Consensi
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDataDeletionDialogOpen(true)}
                    disabled={!hasPermission('gdpr.delete')}
                    fullWidth
                  >
                    Richiedi Cancellazione
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.01)} 100%)`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                      color: 'white',
                    }}
                  >
                    <LockIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600">
                    Conservazione Dati
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      CREAZIONE RECORD
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(retentionStatus.creation_date)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      ULTIMA ATTIVITÀ
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(retentionStatus.last_activity)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      CANCELLAZIONE PROGRAMMATA
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">
                        {formatDate(retentionStatus.scheduled_deletion)}
                      </Typography>
                      <Chip
                        size="small"
                        label={retentionStatus.status}
                        color={getRetentionStatusColor()}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Consent History Dialog */}
      <Dialog 
        open={consentDialogOpen} 
        onClose={() => setConsentDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Cronologia Consensi</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={2}>
            {consentHistory.map((entry) => (
              <Paper
                key={entry.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {consentTypes[entry.type]?.label}
                      </Typography>
                      <Chip
                        label={entry.action === 'granted' ? 'Concesso' : 'Revocato'}
                        size="small"
                        color={entry.action === 'granted' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {entry.notes}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {entry.user} • {formatDate(entry.date)} • v{entry.version}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConsentDialogOpen(false)}>
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog open={dataExportDialogOpen} onClose={() => setDataExportDialogOpen(false)}>
        <DialogTitle>Esportazione Dati</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Preparazione dell'archivio dei dati personali...
          </Typography>
          <LinearProgress variant="determinate" value={exportProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {exportProgress}% completato
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Data Deletion Dialog */}
      <Dialog 
        open={dataDeletionDialogOpen} 
        onClose={() => setDataDeletionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Richiesta Cancellazione Dati</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              La cancellazione dei dati è irreversibile. Una volta confermata, tutti i dati del paziente verranno rimossi dal sistema secondo le procedure GDPR.
            </Typography>
          </Alert>
          
          <TextField
            label="Motivazione della cancellazione"
            multiline
            rows={4}
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            placeholder="Inserire la motivazione per la richiesta di cancellazione dei dati..."
            required
            fullWidth
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDataDeletionDialogOpen(false)}>
            Annulla
          </Button>
          <Button 
            onClick={handleDataDeletion}
            color="error"
            variant="contained"
            disabled={!deletionReason.trim()}
          >
            Conferma Cancellazione
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GDPRCompliance;