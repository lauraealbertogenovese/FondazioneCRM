import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  useTheme,
  alpha,
  Divider,
  Fade,
  Skeleton,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Filter as FilterIcon,
  Badge as IdIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { patientService } from '../services/api';

const PatientsPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatients({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });
      setPatients(response.patients || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Errore nel caricamento dei pazienti');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleView = () => {
    navigate(`/patients/${selectedPatient.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/patients/${selectedPatient.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await patientService.deletePatient(selectedPatient.id);
      await fetchPatients();
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getStatusSwitch = (patient) => {
    // Safe check for is_active field
    const isActive = Boolean(patient.is_active);
    
    const handleSwitchToggle = async (event) => {
      try {
        const newStatus = !isActive;
        
        // Update UI optimistically
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p.id === patient.id 
              ? { ...p, is_active: newStatus }
              : p
          )
        );
        
        // Send update to backend
        await patientService.updatePatient(patient.id, { is_active: newStatus });
        
        // Optional: refresh data from server to ensure consistency
        // await fetchPatients();
        
      } catch (error) {
        console.error('Errore nell\'aggiornamento dello status:', error);
        // Revert optimistic update on error
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p.id === patient.id 
              ? { ...p, is_active: isActive }
              : p
          )
        );
        setError('Errore nell\'aggiornamento dello stato del paziente');
      }
    };
    
    return (
      <Box 
        data-testid="switch-container"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Switch
          checked={isActive}
          onChange={handleSwitchToggle}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#2e7d32',
              '&:hover': {
                backgroundColor: alpha('#2e7d32', 0.08),
              },
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#2e7d32',
            },
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem', 
            fontWeight: 500,
            color: isActive ? '#2e7d32' : '#666666',
            cursor: 'default',
            userSelect: 'none'
          }}
        >
          {isActive ? 'In Cura' : 'Non in cura'}
        </Typography>
      </Box>
    );
  };

  const getConsentChip = (patient) => {
    const hasConsent = patient.consenso_trattamento_dati === true;
    
    return (
      <Chip
        label={hasConsent ? 'Accettato' : 'Non Accettato'}
        size="small"
        sx={{ 
          fontSize: '0.75rem', 
          height: 24,
          fontWeight: 500,
          borderRadius: 2,
          backgroundColor: hasConsent 
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.grey[500], 0.1),
          color: hasConsent 
            ? theme.palette.success.main
            : theme.palette.grey[600],
          border: `1px solid ${hasConsent 
            ? alpha(theme.palette.success.main, 0.2)
            : alpha(theme.palette.grey[500], 0.2)}`,
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
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

  const filteredPatients = patients.filter(patient =>
    searchTerm === '' || 
    patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.codice_fiscale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefono?.includes(searchTerm)
  );

  const getInitials = (nome, cognome) => {
    return `${nome?.charAt(0) || ''}${cognome?.charAt(0) || ''}`.toUpperCase();
  };

  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
          <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 2 }} />
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rectangular" width={400} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Box sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
          <Stack direction="row" spacing={2}>
            {['Paziente', 'Età', 'Contatti', 'Codice Fiscale', 'Stato', 'Consenso', 'Data Inizio'].map((header) => (
              <Skeleton key={header} variant="text" width={100} height={20} />
            ))}
          </Stack>
        </Box>
        
        {[1, 2, 3, 4, 5].map((row) => (
          <Box key={row} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="circular" width={24} height={24} />
            </Stack>
          </Box>
        ))}
      </Box>
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Fade in timeout={500}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Enhanced Header */}
        <Box sx={{ mb: 4 }}>
          {/* Enhanced Search & Filters */}
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <TextField
              placeholder="Cerca pazienti per nome, CF, email o telefono..."
              value={searchTerm}
              onChange={handleSearch}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 500,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.grey[50], 0.8),
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.grey[100], 0.8),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    border: `1px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }
              }}
            />
            
            
            {hasPermission('patients.write') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
                onClick={() => navigate('/patients/new')}
              >
                Nuovo Paziente
              </Button>
            )}
          </Stack>
        </Box>

        {/* Enhanced Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Enhanced Table */}
        <Box sx={{ 
          border: 1, 
          borderColor: alpha(theme.palette.grey[300], 0.6), 
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: theme.shadows[1],
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4],
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                  py: 2,
                }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Età
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Contatti
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Codice Fiscale
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Stato
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Consenso
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'text.primary',
                  letterSpacing: '0.5px',
                }}>
                  Data Inizio
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  width: 60,
                  color: 'text.primary',
                }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient, index) => (
                <TableRow
                  key={patient.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      '& .patient-avatar': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }
                    },
                    cursor: 'pointer',
                    borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={(e) => {
                    // Check if the click came from the switch area or more actions menu
                    const isFromSwitch = e.target.closest('[data-testid="switch-container"]');
                    const isFromMenu = e.target.closest('button[aria-label="more"], .MuiIconButton-root');
                    
                    if (isFromSwitch || isFromMenu) {
                      // Don't prevent default or stop propagation for switch clicks
                      // Just return without navigating
                      return; 
                    }
                    navigate(`/patients/${patient.id}`);
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2.5}>
                      <Box 
                        className="patient-avatar"
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        {getInitials(patient.nome, patient.cognome)}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          lineHeight: 1.2,
                          color: 'text.primary',
                          fontSize: '0.95rem',
                        }}>
                          {patient.nome} {patient.cognome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}>
                          ID: {patient.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {calculateAge(patient.data_nascita)} anni
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {formatDate(patient.data_nascita)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {patient.telefono || '-'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                          {patient.email || '-'}
                        </Typography>
                      </Stack>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {patient.codice_fiscale}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusSwitch(patient)}
                  </TableCell>
                  
                  <TableCell>
                    {getConsentChip(patient)}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {formatDate(patient.created_at)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, patient);
                      }}
                      sx={{ color: 'text.disabled' }}
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Minimal Pagination */}
        <Divider />
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Pazienti per pagina"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} di ${count !== -1 ? count : `più di ${to}`}`
          }
          sx={{
            backgroundColor: alpha(theme.palette.grey[50], 0.3),
            '& .MuiTablePagination-toolbar': {
              minHeight: 48,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            }
          }}
        />
      </Box>

      {/* Empty State */}
      {filteredPatients.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            {searchTerm ? 'Nessun paziente trovato' : 'Nessun paziente registrato'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            {searchTerm 
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia registrando il primo paziente nel sistema'
            }
          </Typography>
          {!searchTerm && hasPermission('patients.write') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/patients/new')}
            >
              Registra Primo Paziente
            </Button>
          )}
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        elevation={2}
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        {hasPermission('patients.read') && (
          <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
            <VisibilityIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Visualizza Profilo
          </MenuItem>
        )}
        {hasPermission('patients.update') && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Modifica Dati
          </MenuItem>
        )}
        {hasPermission('patients.delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Archivia Paziente
          </MenuItem>
        )}
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Archivia paziente</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler archiviare {selectedPatient?.nome} {selectedPatient?.cognome}?
            Il paziente verrà spostato nell'archivio ma i dati rimarranno disponibili.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            size="small"
            sx={{
              borderColor: '#6b7280',
              color: '#374151',
              fontWeight: 500,
              px: 2,
              py: 0.5,
              '&:hover': {
                borderColor: '#3b82f6',
                color: '#3b82f6',
                backgroundColor: '#f8fafc',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="warning" 
            variant="contained" 
            size="small"
            sx={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              fontWeight: 600,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#d97706',
                color: '#ffffff',
              }
            }}
          >
            Archivia
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Fade>
  );
};

export default PatientsPageNew;