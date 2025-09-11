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
  Divider,
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
  Person as PersonIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as DoctorIcon,
  Psychology as PsychologyIcon,
  Work as OperatorIcon,
  TableView as TableViewIcon,
  Filter as FilterIcon,
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

const UsersPage = () => {
  const theme = useTheme();
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
      setError('Errore nel caricamento degli utenti');
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
    // Implementare navigazione dettaglio utente
    handleMenuClose();
  };

  const handleEdit = () => {
    // Implementare navigazione modifica utente
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
      admin: { 
        label: 'Amministratore', 
        color: 'error',
        icon: AdminIcon,
        bgColor: alpha(theme.palette.error.main, 0.1),
        textColor: theme.palette.error.main
      },
      doctor: { 
        label: 'Dottore', 
        color: 'primary',
        icon: DoctorIcon,
        bgColor: alpha(theme.palette.primary.main, 0.1),
        textColor: theme.palette.primary.main
      },
      psychologist: { 
        label: 'Psicologo', 
        color: 'secondary',
        icon: PsychologyIcon,
        bgColor: alpha(theme.palette.secondary.main, 0.1),
        textColor: theme.palette.secondary.main
      },
      operator: { 
        label: 'Operatore', 
        color: 'success',
        icon: OperatorIcon,
        bgColor: alpha(theme.palette.success.main, 0.1),
        textColor: theme.palette.success.main
      },
    };
    return roleMap[role] || { 
      label: role || 'Sconosciuto', 
      color: 'default',
      icon: PersonIcon,
      bgColor: alpha(theme.palette.grey[500], 0.1),
      textColor: theme.palette.grey[600]
    };
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
        label={isActive ? 'Attivo' : 'Inattivo'}
        size="small"
        sx={{
          backgroundColor: isActive 
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.error.main, 0.1),
          color: isActive 
            ? theme.palette.success.main
            : theme.palette.error.main,
          fontWeight: 500,
        }}
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Caricamento utenti...</Typography>
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
              placeholder="Cerca per username, email, nome o ruolo..."
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
              
              {hasPermission('users.create') && (
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
                  Nuovo Utente
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
                  {filteredUsers.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Utenti Totali
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
                  {filteredUsers.filter(u => u.is_active !== false).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Utenti Attivi
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <AdminIcon fontSize="large" />
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
                  {filteredUsers.filter(u => u.role_name === 'admin').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Amministratori
                </Typography>
              </Box>
              <Avatar sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                width: 56, 
                height: 56 
              }}>
                <AdminIcon fontSize="large" />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Users Table */}
      <Card sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                  Utente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                  Ruolo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                  Stato
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Data Creazione
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Ultimo Accesso
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>
                  Azioni
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((userItem, index) => {
                  const roleInfo = getRoleInfo(userItem.role_name);
                  const RoleIcon = roleInfo.icon;
                  
                  return (
                    <TableRow
                      key={userItem.id}
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
                              backgroundColor: roleInfo.textColor,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(userItem.first_name, userItem.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {userItem.first_name} {userItem.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{userItem.username}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        {userItem.email ? (
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
                              title={userItem.email}
                            >
                              {userItem.email}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <RoleIcon 
                            fontSize="small" 
                            sx={{ color: roleInfo.textColor }}
                          />
                          <Chip
                            label={roleInfo.label}
                            size="small"
                            sx={{
                              backgroundColor: roleInfo.bgColor,
                              color: roleInfo.textColor,
                              fontWeight: 500,
                            }}
                          />
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusChip(userItem.is_active !== false)}
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(userItem.created_at)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {userItem.last_login ? formatDate(userItem.last_login) : 'Mai'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, userItem)}
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
          count={filteredUsers.length}
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
      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ 
            p: 6, 
            textAlign: 'center',
          }}>
            <TableViewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              {searchTerm ? 'Nessun utente trovato' : 'Nessun utente presente'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Prova a modificare i criteri di ricerca'
                : 'Inizia aggiungendo il primo utente al sistema'
              }
            </Typography>
            {!searchTerm && hasPermission('users.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                Aggiungi Primo Utente
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
        {hasPermission('users.read') && (
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Visualizza
          </MenuItem>
        )}
        {hasPermission('users.update') && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Modifica
          </MenuItem>
        )}
        {hasPermission('users.delete') && selectedUser?.id !== user?.id && (
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
            Sei sicuro di voler eliminare l'utente {selectedUser?.username}?
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

export default UsersPage;
