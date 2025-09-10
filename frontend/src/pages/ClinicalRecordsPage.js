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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  TableView as TableViewIcon,
  Filter as FilterIcon,
  CheckCircle as ActiveIcon,
  Archive as ArchivedIcon,
  Cancel as ClosedIcon,
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

const ClinicalRecordsPage = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
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
    // Implementare navigazione dettaglio cartella
    handleMenuClose();
  };

  const handleEdit = () => {
    // Implementare navigazione modifica cartella
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await clinicalService.deleteRecord(selectedRecord.id);
      await fetchRecords();
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: { 
        label: 'Attiva', 
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: ActiveIcon
      },
      archived: { 
        label: 'Archiviata', 
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: ArchivedIcon
      },
      closed: { 
        label: 'Chiusa', 
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        icon: ClosedIcon
      },
    };
    return statusMap[status] || statusMap.active;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const truncateText = (text, maxLength = 100) => {
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
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Caricamento profili clinici...</Typography>
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
              placeholder="Cerca per numero cartella, diagnosi, paziente o medico..."
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
              
              {/* Dev only - Mock data button */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    try {
                      await clinicalService.createMockData();
                      await fetchRecords();
                    } catch (error) {
                      console.error('Error creating mock data:', error);
                    }
                  }}
                >
                  Dati Mock
                </Button>
              )}
              
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
                  Nuovo Profilo
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
                  {filteredRecords.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Profili Totali
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
                  {filteredRecords.filter(r => r.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Profili Attivi
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <ActiveIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          flex: 1,
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
                  {filteredRecords.filter(r => r.status === 'archived').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Profili Archiviati
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <ArchivedIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Clinical Records Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Numero Cartella
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                  Paziente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                  Diagnosi
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>
                  Piano di Trattamento
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Stato
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Creato da
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Data Creazione
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
                  Azioni
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record, index) => {
                  const statusInfo = getStatusInfo(record.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow
                      key={record.id}
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AssignmentIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {record.record_number}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
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
                            {getInitials(record.first_name, record.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {record.first_name} {record.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.codice_fiscale}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={record.diagnosis}
                        >
                          {truncateText(record.diagnosis, 50)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={record.treatment_plan}
                        >
                          {truncateText(record.treatment_plan, 80)}
                        </Typography>
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {record.created_by_username || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(record.created_at)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, record)}
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
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          }}
        />
      </Card>

      {/* Empty State */}
      {filteredRecords.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ 
            p: 6, 
            textAlign: 'center',
          }}>
            <TableViewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              {searchTerm ? 'Nessun profilo clinico trovato' : 'Nessun profilo clinico presente'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Prova a modificare i criteri di ricerca'
                : 'Inizia aggiungendo il primo profilo clinico al sistema'
              }
            </Typography>
            {!searchTerm && hasPermission('clinical.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                Aggiungi Primo Profilo
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
            Sei sicuro di voler eliminare il profilo clinico {selectedRecord?.record_number}?
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

export default ClinicalRecordsPage;
