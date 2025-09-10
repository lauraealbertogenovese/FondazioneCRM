import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  History as HistoryIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { auditService } from '../services/api';

const AuditLog = ({ 
  entityType = 'all', 
  entityId = null,
  showHeader = true,
  maxHeight = 600,
  showPagination = true 
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: ''
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const actionTypes = {
    CREATE: { label: 'Creazione', color: 'success', icon: AddIcon },
    UPDATE: { label: 'Modifica', color: 'warning', icon: EditIcon },
    DELETE: { label: 'Eliminazione', color: 'error', icon: DeleteIcon },
    VIEW: { label: 'Visualizzazione', color: 'info', icon: ViewIcon },
    LOGIN: { label: 'Accesso', color: 'primary', icon: PersonIcon },
    LOGOUT: { label: 'Logout', color: 'default', icon: PersonIcon },
  };

  const entityTypes = {
    patient: { label: 'Paziente', color: 'primary' },
    clinical_record: { label: 'Cartella Clinica', color: 'secondary' },
    document: { label: 'Documento', color: 'info' },
    group: { label: 'Gruppo', color: 'success' },
    user: { label: 'Utente', color: 'warning' },
    system: { label: 'Sistema', color: 'error' },
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, entityType, entityId, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        entity_type: entityType !== 'all' ? entityType : undefined,
        entity_id: entityId,
        limit: 100,
        offset: (currentPage - 1) * 10
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const response = await auditService.getAuditLogs(filters);
      setLogs(response.data || []);
      setTotalPages(Math.ceil((response.data || []).length / 10));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError('Errore nel caricamento dei log di audit');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogDetail = (log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
    setAnchorEl(null);
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log('Exporting audit logs...');
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, log) => {
    setAnchorEl(event.currentTarget);
    setSelectedLog(log);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLog(null);
  };

  const parseChanges = (changesString) => {
    try {
      return changesString ? JSON.parse(changesString) : {};
    } catch {
      return {};
    }
  };

  const parseMetadata = (metadataString) => {
    try {
      return metadataString ? JSON.parse(metadataString) : {};
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento log di audit...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      {showHeader && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Log di Audit
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cronologia delle attività del sistema
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <FilterIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleExport}
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                }
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Logs List */}
      <Box sx={{ maxHeight, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <Card 
            elevation={0}
            sx={{ 
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Avatar sx={{ 
                width: 64, 
                height: 64, 
                margin: '0 auto 16px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}>
                <HistoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Nessun log di audit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Non ci sono attività registrate per i criteri selezionati
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1}>
            {logs.map((log, index) => {
              const actionConfig = actionTypes[log.action] || actionTypes.VIEW;
              const entityConfig = entityTypes[log.entity_type] || entityTypes.system;
              const ActionIcon = actionConfig.icon;
              const changes = parseChanges(log.changes);
              const metadata = parseMetadata(log.metadata);
              
              return (
                <Card 
                  key={log.id}
                  elevation={0}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2}>
                      {/* Timeline indicator */}
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 32,
                      }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32,
                          backgroundColor: alpha(theme.palette[actionConfig.color].main, 0.1),
                          color: theme.palette[actionConfig.color].main,
                        }}>
                          <ActionIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        {index < logs.length - 1 && (
                          <Box sx={{ 
                            width: 2,
                            height: 20,
                            backgroundColor: theme.palette.divider,
                            mt: 1,
                          }} />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                              <Chip 
                                label={actionConfig.label}
                                size="small"
                                color={actionConfig.color}
                                variant="outlined"
                              />
                              <Chip 
                                label={entityConfig.label}
                                size="small"
                                color={entityConfig.color}
                                variant="filled"
                                sx={{ opacity: 0.8 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(log.created_at)}
                              </Typography>
                            </Stack>
                            
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                              {log.description}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary">
                              <strong>{log.user_name}</strong> • IP: {log.ip_address} • {metadata.browser || 'Browser sconosciuto'}
                            </Typography>
                          </Box>
                          
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuOpen(e, log)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        {Object.keys(changes).length > 0 && (
                          <>
                            <Divider sx={{ my: 1 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                MODIFICHE:
                              </Typography>
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                {Object.entries(changes).slice(0, 3).map(([field, change]) => (
                                  <Typography key={field} variant="caption" sx={{ display: 'block' }}>
                                    <strong>{field}:</strong> {change.old || 'vuoto'} → {change.new || 'vuoto'}
                                  </Typography>
                                ))}
                                {Object.keys(changes).length > 3 && (
                                  <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>
                                    +{Object.keys(changes).length - 3} altre modifiche...
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon color="primary" />
            <Box>
              <Typography variant="h6">Dettagli Log di Audit</Typography>
              {selectedLog && (
                <Typography variant="caption" color="text.secondary">
                  ID: {selectedLog.id} • {formatDateTime(selectedLog.created_at)}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {selectedLog && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      AZIONE
                    </Typography>
                    <Typography variant="body2">
                      {actionTypes[selectedLog.action]?.label || selectedLog.action}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ENTITÀ
                    </Typography>
                    <Typography variant="body2">
                      {selectedLog.entity_name} ({entityTypes[selectedLog.entity_type]?.label || selectedLog.entity_type})
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      UTENTE
                    </Typography>
                    <Typography variant="body2">
                      {selectedLog.user_name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      IP ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedLog.ip_address}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      USER AGENT
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                      {selectedLog.user_agent}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      METADATA
                    </Typography>
                    <Box component="pre" sx={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: alpha(theme.palette.grey[100], 0.5),
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 150
                    }}>
                      {JSON.stringify(parseMetadata(selectedLog.metadata), null, 2)}
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              
              {selectedLog.changes && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      MODIFICHE
                    </Typography>
                    <Box component="pre" sx={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: alpha(theme.palette.grey[100], 0.5),
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200,
                      mt: 1
                    }}>
                      {JSON.stringify(parseChanges(selectedLog.changes), null, 2)}
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleLogDetail(selectedLog)}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          Visualizza Dettagli
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Esporta Log
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuditLog;