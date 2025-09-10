import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  Avatar,
  Container,
  useTheme,
  alpha,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  TableView as TableViewIcon,
  Filter as FilterIcon,
  Schedule as ScheduledIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Update as RescheduledIcon,
  EventAvailable as UpcomingIcon,
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
import { clinicalService } from '../services/api';

const VisitsPage = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const [visits, setVisits] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchVisits();
    fetchUpcomingVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clinicalService.getVisits({
        limit: 100,
      });
      setVisits(response.visits || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      setError('Errore nel caricamento delle sessioni');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingVisits = async () => {
    try {
      const response = await clinicalService.getUpcomingVisits({
        limit: 20,
      });
      setUpcomingVisits(response.visits || []);
    } catch (error) {
      console.error('Error fetching upcoming visits:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, visit) => {
    setAnchorEl(event.currentTarget);
    setSelectedVisit(visit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVisit(null);
  };

  const handleView = () => {
    // Implementare navigazione dettaglio sessione
    handleMenuClose();
  };

  const handleEdit = () => {
    // Implementare navigazione modifica sessione
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await clinicalService.deleteVisit(selectedVisit.id);
      await fetchVisits();
      await fetchUpcomingVisits();
      setDeleteDialogOpen(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      scheduled: { 
        label: 'Programmata', 
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        icon: ScheduledIcon
      },
      completed: { 
        label: 'Completata', 
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: CompletedIcon
      },
      cancelled: { 
        label: 'Annullata', 
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        icon: CancelledIcon
      },
      rescheduled: { 
        label: 'Riprogrammata', 
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: RescheduledIcon
      },
    };
    return statusMap[status] || statusMap.scheduled;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('it-IT')} ${date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const currentData = tabValue === 0 ? visits : upcomingVisits;
  
  const filteredData = currentData.filter(visit =>
    searchTerm === '' || 
    visit.visit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Caricamento sessioni...</Typography>
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
              placeholder="Cerca per tipo sessione, paziente, dottore o stato..."
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
              
              {hasPermission('clinical.create') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  Nuova Sessione
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Card sx={{ 
          flex: 1,
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
                  {visits.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Sessioni Totali
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <MedicalIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: 1,
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
                  {upcomingVisits.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Prossime Sessioni
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <UpcomingIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: 1,
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
                  {visits.filter(v => v.status === 'completed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completate
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <CompletedIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': {
              fontWeight: 600,
            }
          }}
        >
          <Tab 
            label={`Tutte le Sessioni (${visits.length})`}
            icon={<MedicalIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Prossime Sessioni (${upcomingVisits.length})`}
            icon={<UpcomingIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Visits Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Tipo Sessione
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>
                  Data e Ora
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                  Durata
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Dottore
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Stato
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                  Note
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
                  Azioni
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((visit, index) => {
                  const statusInfo = getStatusInfo(visit.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow
                      key={visit.id}
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
                              width: 32,
                              height: 32,
                              backgroundColor: theme.palette.secondary.main,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(visit.first_name, visit.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {visit.first_name} {visit.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {visit.codice_fiscale}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={visit.visit_type || 'Generale'}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(visit.visit_date)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(visit.visit_date)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {visit.duration_minutes ? `${visit.duration_minutes} min` : '-'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {visit.doctor_name || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <StatusIcon 
                            fontSize="small" 
                            sx={{ color: statusInfo.color }}
                          />
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              backgroundColor: statusInfo.bgColor,
                              color: statusInfo.color,
                              fontWeight: 500,
                            }}
                          />
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={visit.visit_notes}
                        >
                          {visit.visit_notes || '-'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, visit)}
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
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredData.length}
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
      {filteredData.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ 
            p: 6, 
            textAlign: 'center',
          }}>
            <TableViewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              {searchTerm ? 'Nessuna sessione trovata' : 'Nessuna sessione presente'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Prova a modificare i criteri di ricerca'
                : 'Inizia programmando la prima sessione'
              }
            </Typography>
            {!searchTerm && hasPermission('clinical.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                Programma Prima Sessione
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
        {hasPermission('clinical.read') && (
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Visualizza
          </MenuItem>
        )}
        {hasPermission('clinical.update') && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Modifica
          </MenuItem>
        )}
        {hasPermission('clinical.delete') && (
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
            Sei sicuro di voler eliminare questa sessione?
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

export default VisitsPage;
