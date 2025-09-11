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
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as DoctorIcon,
  Psychology as PsychologyIcon,
  Work as OperatorIcon,
  Email as EmailIcon,
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

const UsersPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const handleMenuOpen = (event, selectedUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(selectedUser);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleView = () => {
    navigate(`/users/${selectedUser.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/users/${selectedUser.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      await fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Errore nella cancellazione:', error);
    }
  };

  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { label: 'Amministratore', color: 'error' },
      doctor: { label: 'Clinico', color: 'primary' },
      psychologist: { label: 'Psicologo', color: 'secondary' },
      operator: { label: 'Operatore', color: 'success' },
    };
    return roleMap[role] || { label: role || 'Sconosciuto', color: 'default' };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', width: 60 }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((userItem) => {
                  const roleInfo = getRoleInfo(userItem.role_name);
                  
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
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            {getInitials(userItem.first_name, userItem.last_name)}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                              {userItem.first_name} {userItem.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              @{userItem.username}
                            </Typography>
                          </Box>
                        </Stack>
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
                          label={roleInfo.label}
                          color={roleInfo.color}
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
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, userItem);
                          }}
                          sx={{ color: 'text.disabled' }}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        elevation={2}
        sx={{ '& .MuiPaper-root': { borderRadius: 2 } }}
      >
        {hasPermission('users.read') && (
          <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
            <VisibilityIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Visualizza Profilo
          </MenuItem>
        )}
        {hasPermission('users.update') && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Modifica Dati
          </MenuItem>
        )}
        {hasPermission('users.delete') && selectedUser?.id !== user?.id && selectedUser?.role !== 'admin' && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Disattiva Utente
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
        <DialogTitle sx={{ pb: 1 }}>Disattiva operatore</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler disattivare l'operatore {selectedUser?.first_name} {selectedUser?.last_name}?
            L'operatore non potrà più accedere al sistema.
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
            Disattiva
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Fade>
  );
};

export default UsersPageNew;