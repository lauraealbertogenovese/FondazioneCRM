import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import roleService from '../services/roleService';
import PermissionEditor from '../components/PermissionEditor';
import { GRANULAR_PERMISSION_TEMPLATE } from '../utils/permissionTemplates';

const RoleManagementPage = ({ embedded = false }) => {
  const { user, hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleUsers, setRoleUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {}
  });

  // Permission structure template - using complete granular template
  const permissionTemplate = JSON.parse(JSON.stringify(GRANULAR_PERMISSION_TEMPLATE));

  useEffect(() => {
    if (hasPermission('admin')) {
      loadRoles();
    }
  }, [hasPermission]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      showSnackbar('Errore nel caricamento dei ruoli', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClick = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleCreateRole = () => {
    setRoleForm({ name: '', description: '', permissions: JSON.parse(JSON.stringify(permissionTemplate)) });
    setSelectedRole(null);
    setRoleDialogOpen(true);
  };

  const handleEditRole = () => {
    if (selectedRole) {
      setRoleForm({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions || JSON.parse(JSON.stringify(permissionTemplate))
      });
      setRoleDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleEditPermissions = () => {
    if (selectedRole) {
      setPermissionDialogOpen(true);
      setAnchorEl(null); // Chiudi solo il menu, mantieni selectedRole
    }
  };

  const handleViewUsers = async () => {
    if (selectedRole) {
      try {
        const users = await roleService.getRoleUsers(selectedRole.id);
        setRoleUsers(users);
        setUsersDialogOpen(true);
      } catch (error) {
        showSnackbar('Errore nel caricamento degli utenti', 'error');
      }
    }
    handleMenuClose();
  };

  const handleDeleteRole = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Chiudi solo il menu, mantieni selectedRole
  };

  const handleSaveRole = async () => {
    try {
      if (selectedRole) {
        await roleService.updateRole(selectedRole.id, roleForm);
        showSnackbar('Ruolo aggiornato con successo');
      } else {
        await roleService.createRole(roleForm);
        showSnackbar('Ruolo creato con successo');
      }
      setRoleDialogOpen(false);
      loadRoles();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Errore nel salvataggio del ruolo', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Eliminando ruolo:', selectedRole);
      await roleService.deleteRole(selectedRole.id);
      showSnackbar('Ruolo eliminato con successo');
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      console.error('Errore eliminazione ruolo:', error);
      showSnackbar(error.response?.data?.error || 'Errore nell\'eliminazione del ruolo', 'error');
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    }
  };

  const getPermissionSummary = (permissions) => {
    if (!permissions) return [];
    
    const summary = [];
    
    // Handle legacy admin format
    if (Array.isArray(permissions)) {
      if (permissions.includes('*')) {
        return ['Amministratore'];
      }
      
      // Parse legacy format ["patients.read", "patients.write", etc.]
      const uniqueModules = new Set();
      permissions.forEach(perm => {
        const [module] = perm.split('.');
        uniqueModules.add(module);
      });
      
      const moduleLabels = {
        patients: 'Pazienti',
        clinical: 'Cartelle',
        groups: 'Gruppi',
        billing: 'Fatturazione',
        visits: 'Visite',
        users: 'Utenti',
        roles: 'Ruoli'
      };
      
      uniqueModules.forEach(module => {
        if (moduleLabels[module]) {
          summary.push(moduleLabels[module]);
        }
      });
      
      if (summary.length > 4) {
        return [...summary.slice(0, 3), `+${summary.length - 3}`];
      }
      return summary;
    }

    // Handle new granular format
    if (typeof permissions === 'object') {
      // Check if it's the all permissions format
      if (permissions.all) {
        return ['Amministratore'];
      }
      
      // Check pages permissions
      if (permissions.pages) {
        Object.keys(permissions.pages).forEach(page => {
          if (permissions.pages[page]?.access) {
            const pageLabels = {
              patients: 'Pazienti',
              clinical: 'Cartelle',
              groups: 'Gruppi',
              billing: 'Fatturazione'
            };
            summary.push(pageLabels[page] || page);
          }
        });
      }

      // Check features permissions
      if (permissions.features?.documents?.upload || permissions.features?.documents?.download) {
        summary.push('Documenti');
      }

      // Check admin permissions  
      if (permissions.administration?.users?.access) {
        summary.push('Utenti');
      }
      if (permissions.administration?.roles?.access) {
        summary.push('Ruoli');
      }
      if (permissions.administration?.system?.access) {
        summary.push('Sistema');
      }

      // Limit to 4 items to avoid overflow
      if (summary.length > 4) {
        return [...summary.slice(0, 3), `+${summary.length - 3}`];
      }
    }
    
    return summary;
  };

  const handlePermissionChange = (permissions) => {
    setSelectedRole({ ...selectedRole, permissions });
  };

  const handleSavePermissions = async () => {
    try {
      await roleService.updateRole(selectedRole.id, { permissions: selectedRole.permissions });
      showSnackbar('Permessi aggiornati con successo');
      setPermissionDialogOpen(false);
      loadRoles();
    } catch (error) {
      showSnackbar('Errore nell\'aggiornamento dei permessi', 'error');
    }
  };

  if (!hasPermission('admin')) {
    return (
      <Alert severity="error">
        Non hai i permessi necessari per accedere a questa pagina.
      </Alert>
    );
  }

  const content = (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestione Ruoli
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
          color="primary"
          sx={{
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px 0 rgba(59, 130, 246, 0.4)',
            }
          }}
        >
          Nuovo Ruolo
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrizione</TableCell>
                <TableCell>Utenti</TableCell>
                <TableCell>Permessi</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {role.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${role.user_count || 0} utenti`}
                      size="small"
                      color={role.user_count > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {role.permissions?.all ? (
                      <Chip 
                        label="Amministratore"
                        size="small"
                        color="error"
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getPermissionSummary(role.permissions).map((perm, index) => (
                          <Chip
                            key={index}
                            label={perm}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: '20px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        ))}
                        {getPermissionSummary(role.permissions).length === 0 && (
                          <Chip 
                            label="Nessun permesso"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, role)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEditRole}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Modifica</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditPermissions}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Permessi</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewUsers}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Utenti</ListItemText>
        </MenuItem>
        {selectedRole?.name !== 'admin' && (
          <MenuItem onClick={handleDeleteRole}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Elimina</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Modifica Ruolo' : 'Nuovo Ruolo'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descrizione"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <PermissionEditor
              permissions={roleForm.permissions}
              onChange={(permissions) => setRoleForm({ ...roleForm, permissions })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRoleDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSaveRole} 
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Editor Dialog */}
      <Dialog open={permissionDialogOpen} onClose={() => {
        setPermissionDialogOpen(false);
        setSelectedRole(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          Modifica Permessi - {selectedRole?.name}
        </DialogTitle>
        <DialogContent>
          {selectedRole ? (
            <PermissionEditor
              permissions={selectedRole.permissions || {}}
              onChange={handlePermissionChange}
            />
          ) : (
            <div>Nessun ruolo selezionato</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPermissionDialogOpen(false);
              setSelectedRole(null);
            }}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            variant="contained"
            color="primary"
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

      {/* Users Dialog */}
      <Dialog open={usersDialogOpen} onClose={() => setUsersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Utenti con ruolo: {selectedRole?.name}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {roleUsers.filter(u => u.is_active).length} attivi di {roleUsers.length} totali
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {roleUsers.length > 0 ? (
              roleUsers.map((user) => (
                <Paper 
                  key={user.id} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    opacity: user.is_active ? 1 : 0.6,
                    backgroundColor: user.is_active ? 'background.paper' : 'grey.50'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.username} - {user.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.is_active ? 'Attivo' : 'Inattivo'}
                      size="small"
                      color={user.is_active ? 'success' : 'default'}
                      variant={user.is_active ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nessun utente con questo ruolo
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUsersDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
              }
            }}
          >
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => {
        setDeleteDialogOpen(false);
        setSelectedRole(null);
      }}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare il ruolo "{selectedRole?.name}"?
            {selectedRole?.user_count > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Questo ruolo è assegnato a {selectedRole.user_count} utenti.
              </Alert>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedRole(null);
            }}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={selectedRole?.user_count > 0}
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626',
              },
              '&:disabled': {
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
              }
            }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  return embedded ? content : (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {content}
    </Container>
  );
};

export default RoleManagementPage;