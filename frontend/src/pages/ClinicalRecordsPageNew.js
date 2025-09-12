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
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Filter as FilterIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
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
import { useNavigate } from 'react-router-dom';
import { clinicalService } from '../services/api';

const ClinicalRecordsPageNew = () => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clinicalService.getRecords({
        limit: 100,
      });
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching clinical records:', error);
      setError('Errore nel caricamento delle cartelle cliniche');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, record) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleView = () => {
    navigate(`/clinical-records/${selectedRecord.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/clinical-records/${selectedRecord.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('handleDelete: selectedRecord =', selectedRecord);
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedRecord
  };

  const confirmDelete = async () => {
    try {
      console.log('confirmDelete: selectedRecord =', selectedRecord);
      
      if (!selectedRecord || !selectedRecord.id) {
        console.error('No record selected for deletion');
        setDeleteDialogOpen(false);
        return;
      }
      
      await clinicalService.deleteRecord(selectedRecord.id);
      await fetchRecords();
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { label: 'Attivo', color: 'success' },
      archived: { label: 'Archiviato', color: 'warning' },
      closed: { label: 'Chiuso', color: 'error' },
    };
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ fontSize: '0.75rem', height: 20 }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const filteredRecords = records.filter(record =>
    searchTerm === '' || 
    record.record_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Skeleton variant="text" width={250} height={40} />
              <Skeleton variant="text" width={180} height={24} />
            </Box>
            <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2 }} />
          </Box>

          {/* Search and Filters Skeleton */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" height={56} sx={{ flexGrow: 1, borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={120} height={56} sx={{ borderRadius: 2 }} />
          </Stack>

          {/* Statistics Cards Skeleton */}
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={60} height={32} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Table Skeleton */}
          <Card>
            <Skeleton variant="rectangular" height={400} />
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Enhanced Header */}
        <Box sx={{ mb: 4 }}>
          {/* Enhanced Search & Filters */}
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <TextField
              placeholder="Cerca cartelle per paziente, diagnosi o numero cartella..."
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
            
            
            {hasPermission('clinical.create') && (
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
                onClick={() => navigate('/clinical-records/new')}
              >
                Nuova Cartella
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
                  Cartella
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Diagnosi
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Piano di Cura
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Stato
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Data
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', width: 60 }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow
                    key={record.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/clinical-records/${record.id}`)}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AssignmentIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {record.record_number}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                          {record.first_name} {record.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {record.codice_fiscale}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{ lineHeight: 1.2 }}
                        title={record.diagnosis}
                      >
                        {truncateText(record.diagnosis, 40)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.2 }}
                        title={record.treatment_plan}
                      >
                        {truncateText(record.treatment_plan, 50)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusChip(record.status)}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {formatDate(record.created_at)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, record);
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
          count={filteredRecords.length}
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
      {filteredRecords.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <AssignmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            {searchTerm ? 'Nessuna cartella trovata' : 'Nessuna cartella clinica'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            {searchTerm 
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia creando la prima cartella clinica'
            }
          </Typography>
          {!searchTerm && hasPermission('clinical.create') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/clinical-records/new')}
            >
              Crea Prima Cartella
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
            Visualizza
          </MenuItem>
        )}
        {hasPermission('clinical.update') && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Modifica
          </MenuItem>
        )}
        {hasPermission('clinical.delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Elimina
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
        <DialogTitle sx={{ pb: 1 }}>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler eliminare la cartella clinica {selectedRecord?.record_number}?
            Questa azione non può essere annullata.
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
            color="error" 
            variant="contained" 
            size="small"
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
    </Fade>
  );
};

export default ClinicalRecordsPageNew;