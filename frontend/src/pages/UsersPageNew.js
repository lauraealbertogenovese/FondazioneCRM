import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  SwapHoriz as TransferIcon,
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
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PermissionEditor from '../components/PermissionEditor';

const UsersPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  // Debug log per verificare l'utente corrente
  console.log('🔍 DEBUG UsersPageNew - Current user:', user);
  console.log('🔍 DEBUG UsersPageNew - User permissions:', user?.role?.permissions);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transferOwnershipDialogOpen, setTransferOwnershipDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');
  const [ownershipSummary, setOwnershipSummary] = useState(null);
  const [loadingOwnership, setLoadingOwnership] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
      setError('Errore nel caricamento degli operatori');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };


  const handleView = (userItem) => {
    navigate(`/users/${userItem.id}`);
  };

  const handleEdit = (userItem) => {
    navigate(`/users/${userItem.id}/edit`);
  };

  const handleDelete = (userItem) => {
    setSelectedUser(userItem);
    setDeleteDialogOpen(true);
  };

  const handlePermissions = (userItem) => {
    setSelectedUser(userItem);
    setUserPermissions(userItem.permissions || {});
    setPermissionDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) {
      console.error('Nessun utente selezionato per la cancellazione');
      return;
    }

    console.log('Tentativo di cancellare utente:', selectedUser.id, selectedUser.username);

    try {
      const result = await userService.deleteUser(selectedUser.id);
      console.log('Risultato cancellazione:', result);
      await fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      console.log('Utente cancellato con successo');
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
      
      // Check if error indicates ownership transfer is required
      if (error.response?.data?.action === 'transfer_ownership_required') {
        setDeleteDialogOpen(false);
        // Load ownership summary and available users
        loadOwnershipDetails();
      } else {
        setError('Errore nella cancellazione dell\'utente: ' + (error.response?.data?.error || error.message));
        setDeleteDialogOpen(false);
      }
    }
  };

  const loadOwnershipDetails = async () => {
    if (!selectedUser) return;
    
    setLoadingOwnership(true);
    try {
      // Load ownership summary
      const summary = await userService.getUserOwnershipSummary(selectedUser.id);
      setOwnershipSummary(summary);
      
      // Load available users for ownership transfer
      const allUsers = users.filter(u => u.id !== selectedUser.id && u.is_active !== false);
      setAvailableUsers(allUsers);
      
      // Show transfer dialog
      setTransferOwnershipDialogOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dettagli proprietà:', error);
      setError('Errore nel caricamento dei dettagli: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingOwnership(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedUser || !selectedNewOwnerId) {
      return;
    }

    try {
      // Transfer ownership (this will also delete the user)
      await userService.transferUserOwnership(selectedUser.id, selectedNewOwnerId);
      
      await fetchUsers();
      setTransferOwnershipDialogOpen(false);
      setSelectedUser(null);
      setSelectedNewOwnerId('');
      setOwnershipSummary(null);
      console.log('Utente cancellato con successo dopo trasferimento proprietà');
    } catch (error) {
      console.error('Errore nel trasferimento proprietà:', error);
      setError('Errore nel trasferimento proprietà: ' + (error.response?.data?.error || error.message));
    }
  };

  const handlePermissionSave = async (permissions) => {
    try {
      await userService.updateUserPermissions(selectedUser.id, permissions);
      setPermissionDialogOpen(false);
      await fetchUsers(); // Ricarica la lista utenti
    } catch (error) {
      console.error('Errore nel salvataggio permessi:', error);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getStatusChip = (isActive) => {
    return (
      <Chip
        label={isActive ? 'Attivo' : 'Sospeso'}
        color={isActive ? 'success' : 'warning'}
        size="small"
        variant="outlined"
        sx={{ fontSize: '0.75rem', height: 20 }}
      />
    );
  };

  const filteredUsers = users.filter(userItem =>
    searchTerm === '' || 
    userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={280} height={20} />
          </Box>
          <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 2 }} />
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
            {['Utente', 'Contatti', 'Ruolo', 'Stato', 'Ultimo Accesso'].map((header) => (
              <Skeleton key={header} variant="text" width={100} height={20} />
            ))}
          </Stack>
        </Box>
        
        {[1, 2, 3, 4, 5].map((row) => (
          <Box key={row} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
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
              placeholder="Cerca operatori per nome, username, email o ruolo..."
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
            
            
            {hasPermission('users.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  }
                }}
                onClick={() => navigate('/users/new')}
              >
                Nuovo Utente
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
                  Utente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Contatti
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Ruolo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Stato
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Ultimo Accesso
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', width: 200 }}>
                  Azioni
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((userItem) => {
                  return (
                    <TableRow
                      key={userItem.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        },
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/users/${userItem.id}`)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                            {userItem.first_name} {userItem.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            @{userItem.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {userItem.email || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={userItem.role_name || 'Nessun ruolo'}
                          color="default"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 20 }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        {getStatusChip(userItem.is_active !== false)}
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {userItem.last_login ? formatDate(userItem.last_login) : 'Mai'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {hasPermission('users.read') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(userItem);
                              }}
                              sx={{ color: 'primary.main' }}
                              title="Visualizza Profilo"
                            >
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                          {hasPermission('users.update') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(userItem);
                              }}
                              sx={{ color: 'warning.main' }}
                              title="Modifica Dati"
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                          {user?.role === 'admin' && userItem?.role !== 'admin' && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermissions(userItem);
                              }}
                              sx={{ color: 'info.main' }}
                              title="Modifica Permessi"
                            >
                              <SecurityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}
                          {(() => {
                            const canDelete = hasPermission('users.delete') && 
                                            userItem?.id !== user?.id && 
                                            (user?.username === 'SuperAdmin' || userItem?.role_name !== 'admin');
                            
                            console.log('🔍 DEBUG Delete button visibility:', {
                              userItem: userItem?.username,
                              currentUser: user?.username,
                              targetRole: userItem?.role_name,
                              hasPermission: hasPermission('users.delete'),
                              notSelf: userItem?.id !== user?.id,
                              isSuperAdmin: user?.username === 'SuperAdmin',
                              notAdmin: userItem?.role_name !== 'admin',
                              canDelete: canDelete
                            });
                            
                            return canDelete && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🔍 DEBUG Delete button clicked:', {
                                    currentUser: user?.username,
                                    targetUser: userItem?.username,
                                    targetRole: userItem?.role_name,
                                    canDelete: user?.username === 'SuperAdmin' || userItem?.role_name !== 'admin'
                                  });
                                  handleDelete(userItem);
                                }}
                                sx={{ color: 'error.main' }}
                                title="Cancella Utente"
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            );
                          })()}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Minimal Pagination */}
        <Divider />
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Operatori per pagina"
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
      {filteredUsers.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            {searchTerm ? 'Nessun operatore trovato' : 'Nessun operatore registrato'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            {searchTerm 
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia registrando il primo operatore nel sistema'
            }
          </Typography>
          {!searchTerm && hasPermission('users.create') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/users/new')}
            >
              Registra Primo Utente
            </Button>
          )}
        </Box>
      )}


      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen && selectedUser !== null}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="xs"
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Cancella operatore</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler cancellare l'operatore {selectedUser?.first_name} {selectedUser?.last_name}?
            Questa azione è irreversibile e cancellerà definitivamente l'utente dal sistema.
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
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#dc2626',
                color: '#ffffff',
              }
            }}
          >
            Cancella
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog
        open={transferOwnershipDialogOpen}
        onClose={() => {
          setTransferOwnershipDialogOpen(false);
          setSelectedUser(null);
          setSelectedNewOwnerId('');
          setOwnershipSummary(null);
        }}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TransferIcon sx={{ color: 'warning.main' }} />
          Trasferimento Proprietà Richiesto
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            L'utente <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> ha i seguenti dati associati 
            che devono essere trasferiti ad un altro utente prima della cancellazione.
          </Typography>
          
          {loadingOwnership && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Typography>Caricamento dettagli in corso...</Typography>
            </Box>
          )}
          
          {ownershipSummary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Dati da Trasferire:
              </Typography>
              
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📋 <strong>{ownershipSummary.summary.patients_created}</strong> Pazienti creati
                  </Typography>
                  <Typography variant="body2">
                    👨‍⚕️ <strong>{ownershipSummary.summary.patients_as_doctor}</strong> Pazienti come medico curante
                  </Typography>
                  <Typography variant="body2">
                    🏥 <strong>{ownershipSummary.summary.clinical_records}</strong> Cartelle cliniche
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    📊 <strong>{ownershipSummary.summary.total_records}</strong> Record totali da trasferire
                  </Typography>
                </Stack>
              </Box>
              
              {ownershipSummary.details.patients.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Pazienti Creati:
                  </Typography>
                  {ownershipSummary.details.patients.map(patient => (
                    <Typography key={patient.id} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                      • {patient.name} (creato il {new Date(patient.created_at).toLocaleDateString('it-IT')})
                    </Typography>
                  ))}
                </Box>
              )}
              
              {ownershipSummary.details.patients_as_doctor.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Pazienti come Medico Curante:
                  </Typography>
                  {ownershipSummary.details.patients_as_doctor.map(patient => (
                    <Typography key={patient.id} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                      • {patient.name} (assegnato il {new Date(patient.assigned_at).toLocaleDateString('it-IT')})
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
          
          <FormControl fullWidth>
            <InputLabel>Seleziona nuovo proprietario</InputLabel>
            <Select
              value={selectedNewOwnerId}
              onChange={(e) => setSelectedNewOwnerId(e.target.value)}
              label="Seleziona nuovo proprietario"
            >
              {availableUsers.map((userItem) => (
                <MenuItem key={userItem.id} value={userItem.id}>
                  {userItem.first_name} {userItem.last_name} ({userItem.username}) - {userItem.role_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Tutti i dati creati dall'utente verranno trasferiti al nuovo proprietario selezionato.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setTransferOwnershipDialogOpen(false);
              setSelectedUser(null);
              setSelectedNewOwnerId('');
              setOwnershipSummary(null);
            }} 
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
            onClick={handleTransferOwnership}
            disabled={!selectedNewOwnerId}
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
              },
              '&:disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
              }
            }}
          >
            Trasferisci e Cancella
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Editor Dialog */}
      <Dialog 
        open={permissionDialogOpen} 
        onClose={() => setPermissionDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          fontWeight: 600 
        }}>
          Modifica Permessi - {selectedUser?.first_name} {selectedUser?.last_name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <PermissionEditor
            permissions={userPermissions}
            onChange={setUserPermissions}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setPermissionDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={() => handlePermissionSave(userPermissions)}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Salva Permessi
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Fade>
  );
};

export default UsersPageNew;