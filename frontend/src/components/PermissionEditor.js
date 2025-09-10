import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Stack,
  Chip,
  Divider,
  Alert,
  Switch,
  Box
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Groups as GroupsIcon,
  SupervisedUserCircle as UsersIcon,
  AttachMoney as BillingIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const PermissionEditor = ({ permissions, onChange }) => {
  const [localPermissions, setLocalPermissions] = useState({});
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Permission modules definition
  const permissionModules = [
    {
      key: 'patients',
      label: 'Gestione Pazienti',
      icon: <PeopleIcon />,
      description: 'Visualizzazione e gestione dei dati dei pazienti',
      actions: [
        { key: 'read', label: 'Visualizza', description: 'Visualizzare i pazienti esistenti' },
        { key: 'write', label: 'Modifica', description: 'Creare e modificare pazienti' },
        { key: 'delete', label: 'Elimina', description: 'Eliminare pazienti dal sistema' }
      ]
    },
    {
      key: 'clinical',
      label: 'Cartelle Cliniche',
      icon: <AssignmentIcon />,
      description: 'Gestione delle cartelle cliniche e documentazione medica',
      actions: [
        { key: 'read', label: 'Visualizza', description: 'Visualizzare cartelle cliniche' },
        { key: 'write', label: 'Modifica', description: 'Creare e modificare cartelle cliniche' },
        { key: 'delete', label: 'Elimina', description: 'Eliminare cartelle cliniche' }
      ]
    },
    {
      key: 'groups',
      label: 'Gruppi di Supporto',
      icon: <GroupsIcon />,
      description: 'Gestione dei gruppi di supporto e terapia di gruppo',
      actions: [
        { key: 'read', label: 'Visualizza', description: 'Visualizzare gruppi esistenti' },
        { key: 'write', label: 'Modifica', description: 'Creare e gestire gruppi' },
        { key: 'delete', label: 'Elimina', description: 'Eliminare gruppi' }
      ]
    },
    {
      key: 'users',
      label: 'Gestione Utenti',
      icon: <UsersIcon />,
      description: 'Amministrazione degli utenti del sistema',
      actions: [
        { key: 'read', label: 'Visualizza', description: 'Visualizzare utenti del sistema' },
        { key: 'write', label: 'Modifica', description: 'Creare e modificare utenti' },
        { key: 'delete', label: 'Elimina', description: 'Eliminare utenti dal sistema' }
      ]
    },
    {
      key: 'billing',
      label: 'Sistema Fatturazione',
      icon: <BillingIcon />,
      description: 'Gestione fatturazione e pagamenti',
      actions: [
        { key: 'read', label: 'Visualizza', description: 'Visualizzare informazioni di fatturazione' },
        { key: 'write', label: 'Modifica', description: 'Gestire fatture e pagamenti' },
        { key: 'delete', label: 'Elimina', description: 'Eliminare record di fatturazione' }
      ]
    }
  ];

  useEffect(() => {
    setLocalPermissions(permissions || {});
    setIsAdminMode(permissions?.all === true);
  }, [permissions]);

  const handleAdminToggle = (checked) => {
    setIsAdminMode(checked);
    const newPermissions = checked ? { all: true } : {};
    setLocalPermissions(newPermissions);
    onChange(newPermissions);
  };

  const handleModulePermissionChange = (moduleKey, actionKey, checked) => {
    if (isAdminMode) return; // Don't allow changes in admin mode

    const newPermissions = { ...localPermissions };
    
    // Initialize module if it doesn't exist
    if (!newPermissions[moduleKey]) {
      newPermissions[moduleKey] = {};
    }
    
    // Set the specific permission
    newPermissions[moduleKey][actionKey] = checked;
    
    // Clean up empty modules
    if (Object.values(newPermissions[moduleKey]).every(v => !v)) {
      delete newPermissions[moduleKey];
    }

    setLocalPermissions(newPermissions);
    onChange(newPermissions);
  };

  const handleModuleToggle = (moduleKey, checked) => {
    if (isAdminMode) return; // Don't allow changes in admin mode

    const newPermissions = { ...localPermissions };
    const module = permissionModules.find(m => m.key === moduleKey);
    
    if (checked) {
      // Grant all permissions for this module
      newPermissions[moduleKey] = {};
      module.actions.forEach(action => {
        newPermissions[moduleKey][action.key] = true;
      });
    } else {
      // Remove all permissions for this module
      delete newPermissions[moduleKey];
    }

    setLocalPermissions(newPermissions);
    onChange(newPermissions);
  };

  const getModulePermissionCount = (moduleKey) => {
    const modulePerms = localPermissions[moduleKey] || {};
    return Object.values(modulePerms).filter(Boolean).length;
  };

  const getTotalPermissionsCount = () => {
    if (isAdminMode) return 'Tutti';
    return permissionModules.reduce((total, module) => 
      total + getModulePermissionCount(module.key), 0
    );
  };

  return (
    <Stack spacing={3}>
      {/* Admin Mode Toggle */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          border: '2px solid',
          borderColor: isAdminMode ? 'error.main' : 'divider',
          bgcolor: isAdminMode ? 'error.50' : 'background.paper'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <AdminIcon color={isAdminMode ? 'error' : 'disabled'} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Modalità Amministratore
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Concede accesso completo a tutte le funzionalità del sistema
            </Typography>
          </Box>
          <Switch
            checked={isAdminMode}
            onChange={(e) => handleAdminToggle(e.target.checked)}
            color="error"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                },
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#ef4444',
              },
            }}
          />
        </Stack>
        
        {isAdminMode && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Attenzione:</strong> Questo ruolo avrà accesso completo a tutte le funzionalità del sistema, 
            incluse quelle critiche di amministrazione.
          </Alert>
        )}
      </Paper>

      {/* Permissions Summary */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Permessi attivi:
          </Typography>
          <Chip 
            label={`${getTotalPermissionsCount()} permessi`}
            size="small"
            color={isAdminMode ? 'error' : getTotalPermissionsCount() > 0 ? 'primary' : 'default'}
          />
        </Stack>
      </Paper>

      {/* Permission Modules */}
      <Stack spacing={3}>
        {permissionModules.map((module) => {
          const modulePermCount = getModulePermissionCount(module.key);
          const hasAnyPermission = modulePermCount > 0;
          
          return (
            <Paper 
              key={module.key} 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: '1px solid', 
                borderColor: hasAnyPermission && !isAdminMode ? 'primary.main' : 'divider',
                opacity: isAdminMode ? 0.6 : 1
              }}
            >
              <Stack spacing={2}>
                {/* Module Header */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  {module.icon}
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="h6" fontWeight={600}>
                        {module.label}
                      </Typography>
                      {!isAdminMode && (
                        <Chip
                          label={`${modulePermCount}/${module.actions.length}`}
                          size="small"
                          color={hasAnyPermission ? 'primary' : 'default'}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  </Box>
                  {!isAdminMode && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={modulePermCount === module.actions.length}
                          indeterminate={modulePermCount > 0 && modulePermCount < module.actions.length}
                          onChange={(e) => handleModuleToggle(module.key, e.target.checked)}
                        />
                      }
                      label="Tutti"
                    />
                  )}
                </Stack>

                {/* Individual Actions */}
                {!isAdminMode && (
                  <>
                    <Divider />
                    <Grid container spacing={2}>
                      {module.actions.map((action) => (
                        <Grid item xs={12} sm={4} key={action.key}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={localPermissions[module.key]?.[action.key] || false}
                                onChange={(e) => handleModulePermissionChange(
                                  module.key, 
                                  action.key, 
                                  e.target.checked
                                )}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {action.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {action.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {isAdminMode && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Tutti i permessi di questo modulo sono automaticamente concessi in modalità amministratore.
                  </Alert>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Summary */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Riepilogo:</strong> {isAdminMode 
            ? 'Questo ruolo ha accesso amministrativo completo al sistema.' 
            : `Questo ruolo ha ${getTotalPermissionsCount()} permessi specifici configurati.`
          }
        </Typography>
      </Paper>
    </Stack>
  );
};

export default PermissionEditor;