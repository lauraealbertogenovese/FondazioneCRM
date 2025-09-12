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
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Groups as GroupsIcon,
  SupervisedUserCircle as UsersIcon,
  AttachMoney as BillingIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon,
  Calendar as CalendarIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { GRANULAR_PERMISSION_TEMPLATE, ROLE_PRESETS } from '../utils/permissionTemplates';

// Funzione per tradurre le chiavi dei permessi in italiano
const translatePermissionKey = (key) => {
  const translations = {
    // Permessi generali
    'access': 'Accesso',
    'create': 'Crea',
    'edit': 'Modifica',
    'delete': 'Elimina',
    'view': 'Visualizza',
    'upload': 'Carica',
    'download': 'Scarica',
    'export': 'Esporta',
    
    // Permessi specifici pazienti
    'edit_own': 'Modifica Propri',
    'edit_all': 'Modifica Tutti',
    'view_sensitive': 'Visualizza Dati Sensibili',
    
    // Permessi specifici cartelle cliniche
    'create_records': 'Crea Cartelle',
    'edit_own_records': 'Modifica Proprie Cartelle',
    'edit_all_records': 'Modifica Tutte le Cartelle',
    'create_notes': 'Crea Note',
    'edit_own_notes': 'Modifica Proprie Note',
    'edit_all_notes': 'Modifica Tutte le Note',
    'delete_notes': 'Elimina Note',
    'view_all_records': 'Visualizza Tutte le Cartelle',
    
    // Permessi specifici gruppi
    'manage_members': 'Gestisci Membri',
    
    // Permessi specifici fatturazione
    'create_invoices': 'Crea Fatture',
    'edit_invoices': 'Modifica Fatture',
    'view_financial_data': 'Visualizza Dati Finanziari',
    'export_data': 'Esporta Dati',
    
    // Permessi funzionalità
    
    // Permessi amministrazione
    'view_permissions': 'Visualizza Permessi',
    'edit_permissions': 'Modifica Permessi',
    'email_config': 'Configurazione Email',
    'audit_logs': 'Log Accessi e Azioni'
  };
  
  return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const PermissionEditor = ({ permissions, onChange }) => {
  const [localPermissions, setLocalPermissions] = useState({});
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Initialize permissions from template
  useEffect(() => {
    if (permissions) {
      setLocalPermissions(permissions);
    } else {
      // Initialize with empty permissions structure
      const emptyPermissions = JSON.parse(JSON.stringify(GRANULAR_PERMISSION_TEMPLATE));
      setLocalPermissions(emptyPermissions);
    }
  }, [permissions]);

  // Handle permission change
  const handlePermissionChange = (section, category, permission, value) => {
    const newPermissions = { ...localPermissions };
    
    if (!newPermissions[section]) newPermissions[section] = {};
    if (!newPermissions[section][category]) newPermissions[section][category] = {};
    
    newPermissions[section][category][permission] = value;
    
    setLocalPermissions(newPermissions);
    onChange(newPermissions);
  };

  // Apply preset permissions
  const applyPreset = (presetKey) => {
    const preset = ROLE_PRESETS[presetKey];
    if (preset) {
      setLocalPermissions(preset.permissions);
      onChange(preset.permissions);
      setSelectedPreset(presetKey);
    }
  };

  // Clear all permissions
  const clearAllPermissions = () => {
    const emptyPermissions = JSON.parse(JSON.stringify(GRANULAR_PERMISSION_TEMPLATE));
    setLocalPermissions(emptyPermissions);
    onChange(emptyPermissions);
    setSelectedPreset(null);
  };

  // Section icons mapping
  const sectionIcons = {
    pages: PeopleIcon,  // Changed from DashboardIcon to PeopleIcon since first page is patients
    features: DocumentIcon,
    administration: AdminIcon
  };


  return (
    <Stack spacing={3}>
      {/* Quick Presets */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Template Predefiniti
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
            <Chip
              key={key}
              label={preset.name}
              onClick={() => applyPreset(key)}
              color={selectedPreset === key ? 'primary' : 'default'}
              variant={selectedPreset === key ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
          <Chip
            label="Pulisci Tutto"
            onClick={clearAllPermissions}
            color="error"
            variant="outlined"
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Usa i template per impostare rapidamente permessi comuni, poi personalizza secondo necessità.
        </Typography>
      </Paper>

      {/* Permission Sections */}
      <Stack spacing={2}>
        {Object.entries(GRANULAR_PERMISSION_TEMPLATE).map(([sectionKey, sectionData]) => {
          if (sectionKey === 'label' || sectionKey === 'description') return null;
          
          const SectionIcon = sectionIcons[sectionKey] || PeopleIcon;
          
          return (
            <Accordion key={sectionKey} defaultExpanded={sectionKey === 'pages'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <SectionIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    {sectionKey === 'pages' ? 'Accesso Pagine' :
                     sectionKey === 'features' ? 'Funzionalità' :
                     sectionKey === 'administration' ? 'Amministrazione' : sectionKey}
                  </Typography>
                </Stack>
              </AccordionSummary>
              
              <AccordionDetails>
                <Stack spacing={3}>
                  {Object.entries(sectionData).map(([categoryKey, categoryData]) => {
                    if (!categoryData || typeof categoryData !== 'object') return null;
                    
                    return (
                      <Paper 
                        key={categoryKey}
                        elevation={0}
                        sx={{ p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                          {categoryData.label || categoryKey}
                        </Typography>
                        {categoryData.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {categoryData.description}
                          </Typography>
                        )}
                        
                        <Grid container spacing={2}>
                          {Object.entries(categoryData).map(([permKey, permValue]) => {
                            if (permKey === 'label' || permKey === 'description') return null;
                            
                            const isChecked = localPermissions[sectionKey]?.[categoryKey]?.[permKey] || false;
                            
                            return (
                              <Grid item xs={12} sm={6} md={4} key={permKey}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={isChecked}
                                      onChange={(e) => handlePermissionChange(
                                        sectionKey, 
                                        categoryKey, 
                                        permKey, 
                                        e.target.checked
                                      )}
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      {translatePermissionKey(permKey)}
                                    </Typography>
                                  }
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

    </Stack>
  );
};

export default PermissionEditor;