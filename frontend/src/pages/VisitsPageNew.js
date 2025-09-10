import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
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
  Chip,
  Divider,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Filter as FilterIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Psychology as PsychologyIcon,
  EventAvailable as ScheduledIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Update as RescheduledIcon,
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
import { useNavigate } from 'react-router-dom';

const VisitsPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchVisits();
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
      setError('Errore nel caricamento delle sessioni terapeutiche');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
    navigate(`/visits/${selectedVisit.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/visits/${selectedVisit.id}/edit`);
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
      setDeleteDialogOpen(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      scheduled: { label: 'Programmata', color: 'info' },
      completed: { label: 'Completata', color: 'success' },
      cancelled: { label: 'Annullata', color: 'error' },
      rescheduled: { label: 'Riprogrammata', color: 'warning' },
      no_show: { label: 'Assente', color: 'default' },
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{ 
          fontSize: '0.8rem', 
          height: 24,
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette[config.color].main, 0.1),
          color: theme.palette[config.color].main,
          border: `1px solid ${alpha(theme.palette[config.color].main, 0.2)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette[config.color].main, 0.2),
          }
        }}
      />
    );
  };

  const getTypeChip = (visitType) => {
    const typeConfig = {
      individual: { label: 'Individuale', color: 'primary' },
      group: { label: 'Gruppo', color: 'secondary' },
      family: { label: 'Familiare', color: 'info' },
      intake: { label: 'Valutazione', color: 'warning' },
      follow_up: { label: 'Follow-up', color: 'success' },
      emergency: { label: 'Urgenza', color: 'error' },
    };
    const config = typeConfig[visitType] || { label: visitType, color: 'default' };
    
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{ 
          fontSize: '0.8rem', 
          height: 24,
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette[config.color].main, 0.1),
          color: theme.palette[config.color].main,
          border: `1px solid ${alpha(theme.palette[config.color].main, 0.2)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette[config.color].main, 0.2),
          }
        }}
      />
    );
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

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const filteredVisits = visits.filter(visit =>
    searchTerm === '' || 
    visit.visit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={220} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={320} height={20} />
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
            {['Paziente', 'Tipo Sessione', 'Data e Ora', 'Durata', 'Terapeuta', 'Stato'].map((header) => (
              <Skeleton key={header} variant="text" width={100} height={20} />
            ))}
          </Stack>
        </Box>
        
        {[1, 2, 3, 4, 5].map((row) => (
          <Box key={row} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
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
              placeholder="Cerca sessioni per paziente, terapeuta o tipo..."
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
            
            <Button
              variant="outlined"
              size="medium"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: alpha(theme.palette.grey[300], 0.8),
                color: 'text.secondary',
                '&:hover': { 
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: 'primary.main',
                }
              }}
            >
              Filtri Avanzati
            </Button>
            
            {hasPermission('clinical.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                  }
                }}
                onClick={() => navigate('/visits/new')}
              >
                Nuova Sessione
              </Button>
            )}
          </Stack>
        </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Minimal Table */}
      <Box sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Tipo Sessione
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Data e Ora
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Durata
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Terapeuta
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Stato
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', width: 60 }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisits
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((visit) => (
                  <TableRow
                    key={visit.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/visits/${visit.id}`)}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                            {visit.first_name} {visit.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {visit.codice_fiscale}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      {getTypeChip(visit.visit_type)}
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {formatDate(visit.visit_date)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {formatTime(visit.visit_date)}
                          </Typography>
                        </Stack>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {visit.duration_minutes ? `${visit.duration_minutes} min` : '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PsychologyIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {visit.doctor_name || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusChip(visit.status)}
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, visit);
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
          count={filteredVisits.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sessioni per pagina"
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
      {filteredVisits.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <MedicalIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            {searchTerm ? 'Nessuna sessione trovata' : 'Nessuna sessione terapeutica'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            {searchTerm 
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia programmando la prima sessione terapeutica'
            }
          </Typography>
          {!searchTerm && hasPermission('clinical.create') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/visits/new')}
            >
              Programma Prima Sessione
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
        {hasPermission('clinical.read') && (
          <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
            <VisibilityIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Visualizza Sessione
          </MenuItem>
        )}
        {hasPermission('clinical.update') && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Modifica Sessione
          </MenuItem>
        )}
        {hasPermission('clinical.delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Annulla Sessione
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
        <DialogTitle sx={{ pb: 1 }}>Annulla sessione</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler annullare la sessione del {formatDate(selectedVisit?.visit_date)} 
            con {selectedVisit?.first_name} {selectedVisit?.last_name}?
            Il paziente verrà notificato della cancellazione.
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
            Mantieni
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
            Annulla Sessione
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Fade>
  );
};

export default VisitsPageNew;