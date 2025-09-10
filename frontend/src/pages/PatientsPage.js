import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Divider,
  Fade,
  Paper,
  Container,
  useTheme,
  alpha,
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
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Filter as FilterIcon,
  TableView as TableViewIcon,
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
// import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdvancedFilter from '../components/AdvancedFilter';

const PatientsPage = () => {
  // const navigate = useNavigate();
  const navigate = (path) => {
    window.location.href = path;
  };
  const theme = useTheme();
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
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchPatients();
  }, [filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatients({ 
        page: 1, 
        limit: 50,
        search: filters.search || searchTerm,
        ...filters
      });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Errore nel caricamento dei pazienti:', error);
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
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}/edit`);
    }
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getPatientAge = (birthDate) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const filteredPatients = patients.filter(patient =>
    searchTerm === '' || 
    patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.codice_fiscale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Caricamento pazienti...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>

        {/* Actions Bar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <TextField
              placeholder="Cerca per nome, cognome, codice fiscale o email..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: { xs: '100%', sm: 400 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                }
              }}
            />
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ 
                  borderColor: theme.palette.divider,
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                Filtri
              </Button>
              
              {hasPermission('patients.create') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/patients/new')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  Nuovo Paziente
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

      {/* Advanced Filters */}
      <AdvancedFilter
        onFilterChange={setFilters}
        filterConfig={[
          {
            field: 'sesso',
            label: 'Sesso',
            type: 'select',
            options: [
              { value: 'M', label: 'Maschio' },
              { value: 'F', label: 'Femmina' },
              { value: 'Altro', label: 'Altro' }
            ]
          },
          {
            field: 'stato_civile',
            label: 'Stato Civile',
            type: 'select',
            options: [
              { value: 'Single', label: 'Single' },
              { value: 'Fidanzato/a', label: 'Fidanzato/a' },
              { value: 'Sposato/a', label: 'Sposato/a' },
              { value: 'Separato/a', label: 'Separato/a' },
              { value: 'Divorziato/a', label: 'Divorziato/a' },
              { value: 'Vedovo/a', label: 'Vedovo/a' }
            ]
          },
          {
            field: 'ageRange',
            label: 'Età',
            type: 'ageRange'
          },
          {
            field: 'createdDate',
            label: 'Data Registrazione',
            type: 'dateRange'
          },
          {
            field: 'citta',
            label: 'Città',
            type: 'text',
            placeholder: 'Inserisci città...'
          },
          {
            field: 'consenso_trattamento_dati',
            label: 'Solo con consenso dati',
            type: 'checkbox'
          }
        ]}
        compact={false}
        sx={{ mb: 3 }}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredPatients.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pazienti Totali
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  width: 56, 
                  height: 56 
                }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredPatients.filter(p => p.sesso === 'M').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Maschi
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  width: 56, 
                  height: 56 
                }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
            color: 'white',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredPatients.filter(p => p.sesso === 'F').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Femmine
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  width: 56, 
                  height: 56 
                }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            color: 'white',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {searchTerm ? filteredPatients.length : patients.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {searchTerm ? 'Risultati' : 'Attivi'}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  width: 56, 
                  height: 56 
                }}>
                  <SearchIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patients Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                  Genere/Età
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Telefono
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Città
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Data Nascita
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Codice Fiscale
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
                  Azioni
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient, index) => (
                  <TableRow
                    key={patient.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      '& .MuiTableCell-root': {
                        borderColor: theme.palette.divider,
                      }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: theme.palette.primary.main,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(patient.nome, patient.cognome)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {patient.nome} {patient.cognome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {patient.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={patient.sesso === 'M' ? 'M' : 'F'}
                          size="small"
                          sx={{
                            backgroundColor: patient.sesso === 'M' 
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(theme.palette.secondary.main, 0.1),
                            color: patient.sesso === 'M' 
                              ? theme.palette.info.main
                              : theme.palette.secondary.main,
                            fontWeight: 500,
                            width: 'fit-content'
                          }}
                        />
                        {patient.data_nascita && (
                          <Typography variant="caption" color="text.secondary">
                            {getPatientAge(patient.data_nascita)} anni
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      {patient.telefono ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {patient.telefono}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {patient.email ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography 
                            variant="body2" 
                            sx={{
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={patient.email}
                          >
                            {patient.email}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {patient.citta ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {patient.citta}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {patient.data_nascita ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(patient.data_nascita)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {patient.codice_fiscale || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, patient)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredPatients.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Righe per pagina"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} di ${count !== -1 ? count : `più di ${to}`}`
          }
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          }}
        />
      </Card>

      {/* Empty State */}
      {filteredPatients.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ 
            p: 6, 
            textAlign: 'center',
          }}>
            <TableViewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              {searchTerm ? 'Nessun paziente trovato' : 'Nessun paziente presente'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Prova a modificare i criteri di ricerca'
                : 'Inizia aggiungendo il primo paziente al sistema'
              }
            </Typography>
            {!searchTerm && hasPermission('patients.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/patients/new')}
              >
                Aggiungi Primo Paziente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 160,
          }
        }}
      >
        {hasPermission('patients.read') && (
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Visualizza
          </MenuItem>
        )}
        {hasPermission('patients.update') && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Modifica
          </MenuItem>
        )}
        {hasPermission('patients.delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Elimina
          </MenuItem>
        )}
      </Menu>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare il paziente {selectedPatient?.nome} {selectedPatient?.cognome}?
            Questa azione non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
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
            color="error" 
            variant="contained"
            sx={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#b91c1c',
                color: '#ffffff',
              }
            }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientsPage;
