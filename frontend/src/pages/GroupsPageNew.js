import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Filter as FilterIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Psychology as PsychologyIcon,
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
import { groupService } from '../services/api';

const GroupsPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Errore nel caricamento dei gruppi di supporto');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleView = () => {
    navigate(`/groups/${selectedGroup.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/groups/${selectedGroup.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      if (!selectedGroup || !selectedGroup.id) {
        console.error('No group selected for deletion');
        return;
      }
      
      await groupService.deleteGroup(selectedGroup.id);
      await fetchGroups();
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };



  const filteredGroups = groups.filter(group =>
    searchTerm === '' || 
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.group_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Typography color="text.secondary">Caricamento gruppi...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        {/* Enhanced Search & Filters */}
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="Cerca gruppi per nome, tipo o facilitatore..."
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
          
          {hasPermission('groups.write') && (
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
              onClick={() => navigate('/groups/new')}
            >
              Nuovo Gruppo
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
                  Nome Gruppo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Conduttori
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Numero di Partecipanti
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Frequenza
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', width: 60 }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((group) => (
                  <TableRow
                    key={group.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PsychologyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                          {group.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {group.created_by_username || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {group.member_count || 0}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {group.meeting_frequency || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, group);
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
          count={filteredGroups.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Gruppi per pagina"
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
      {filteredGroups.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <GroupIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 400 }}>
            {searchTerm ? 'Nessun gruppo trovato' : 'Nessun gruppo di supporto'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            {searchTerm 
              ? 'Prova a modificare i criteri di ricerca'
              : 'Inizia creando il primo gruppo di supporto per i pazienti'
            }
          </Typography>
          {!searchTerm && hasPermission('groups.write') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/groups/new')}
            >
              Crea Primo Gruppo
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
        {hasPermission('groups.read') && (
          <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
            <VisibilityIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Visualizza Gruppo
          </MenuItem>
        )}
        {hasPermission('groups.write') && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Modifica Gruppo
          </MenuItem>
        )}
        {hasPermission('groups.delete') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
            Elimina Gruppo
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
        <DialogTitle sx={{ pb: 1 }}>Elimina gruppo</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sei sicuro di voler eliminare definitivamente il gruppo "{selectedGroup?.name}"?
            Questa azione non può essere annullata e tutti i dati del gruppo verranno rimossi.
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
  );
};

export default GroupsPageNew;