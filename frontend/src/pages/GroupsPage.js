import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  EventAvailable as EventIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/api';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const theme = useTheme();
  
  const [groups, setGroups] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtri
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    group_type: ''
  });
  
  // Menu azioni
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchStatistics();
  }, [filters]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroups(filters);
      setGroups(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Errore nel caricamento dei gruppi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await groupService.getGroupStatistics();
      setStatistics(response.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMenuOpen = (event, group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
    handleMenuClose();
  };

  const handleEditGroup = (groupId) => {
    navigate(`/groups/${groupId}/edit`);
    handleMenuClose();
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo gruppo?')) {
      try {
        await groupService.deleteGroup(groupId);
        fetchGroups();
        fetchStatistics();
      } catch (error) {
        console.error('Error deleting group:', error);
        setError('Errore nell\'eliminazione del gruppo');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading && groups.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2 }} />
          </Box>

          {/* Statistics Skeleton */}
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box>
                        <Skeleton variant="text" width={80} height={32} />
                        <Skeleton variant="text" width={100} height={20} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filters Skeleton */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Gruppi di Supporto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Gestisci e organizza i gruppi di supporto per i tuoi pazienti
            </Typography>
          </Box>
          {hasPermission('groups.write') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/groups/new')}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              Nuovo Gruppo
            </Button>
          )}
        </Box>

        {/* Statistiche */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      mr: 2,
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {statistics.total_groups || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Gruppi Totali
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.success.main, 0.01)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(theme.palette.success.main, 0.2),
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      mr: 2,
                    }}
                  >
                    <EventIcon sx={{ fontSize: 32, color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {statistics.active_groups || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Gruppi Attivi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.01)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      mr: 2,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 32, color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                      {Math.round(statistics.avg_members_per_active_group || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Media Membri
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.01)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(theme.palette.warning.main, 0.2),
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      mr: 2,
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      {statistics.inactive_groups || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Gruppi Inattivi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
      </Grid>

        {/* Filtri */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)} 0%, ${alpha(theme.palette.grey[100], 0.3)} 100%)`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
              Filtri di Ricerca
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Cerca gruppi..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2,
                        }
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: 2,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    <MenuItem value="active">Attivo</MenuItem>
                    <MenuItem value="inactive">Inattivo</MenuItem>
                    <MenuItem value="archived">Archiviato</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo Gruppo</InputLabel>
                  <Select
                    value={filters.group_type}
                    onChange={(e) => handleFilterChange('group_type', e.target.value)}
                    label="Tipo Gruppo"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: 2,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    <MenuItem value="support">Supporto</MenuItem>
                    <MenuItem value="therapy">Terapia</MenuItem>
                    <MenuItem value="activity">Attività</MenuItem>
                    <MenuItem value="education">Educativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Errori */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Tabella Gruppi */}
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Nome Gruppo</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Conduttori</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Membri</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Data Inizio</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Frequenza</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Creato da</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow 
                    key={group.id} 
                    hover
                    sx={{
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        transform: 'scale(1.005)',
                      }
                    }}
                  >
                    <TableCell>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {group.name}
                      </Typography>
                      {group.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {group.description.substring(0, 50)}...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                    <TableCell>
                      <Chip
                        label={group.group_type}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(group.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          ...(getStatusColor(group.status) === 'success' && {
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          }),
                          ...(getStatusColor(group.status) === 'warning' && {
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          }),
                          ...(getStatusColor(group.status) === 'default' && {
                            backgroundColor: alpha(theme.palette.grey[500], 0.1),
                            color: theme.palette.grey[700],
                            border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                          }),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {group.conductors && group.conductors.length > 0 ? (
                          group.conductors.map((conductor, index) => (
                            <Chip
                              key={index}
                              label={conductor}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                fontWeight: 500,
                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nessun conduttore
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {group.member_count || 0} membri
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(group.start_date)}</TableCell>
                  <TableCell>{group.meeting_frequency || '-'}</TableCell>
                  <TableCell>{group.created_by_username || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, group)}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
            {groups.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <GroupIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Nessun gruppo trovato
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  {filters.search || filters.status || filters.group_type
                    ? 'Prova a modificare i filtri di ricerca per vedere altri risultati'
                    : 'Inizia creando il tuo primo gruppo di supporto per organizzare le attività terapeutiche'
                  }
                </Typography>
              </Box>
            )}
        </TableContainer>
      </Card>

      {/* Menu Azioni */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemComponent onClick={() => handleViewGroup(selectedGroup?.id)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Visualizza</ListItemText>
          </MenuItemComponent>
          {hasPermission('groups.write') && (
            <MenuItemComponent onClick={() => handleEditGroup(selectedGroup?.id)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Modifica</ListItemText>
            </MenuItemComponent>
          )}
          {hasPermission('groups.delete') && (
            <MenuItemComponent 
              onClick={() => handleDeleteGroup(selectedGroup?.id)}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Elimina</ListItemText>
            </MenuItemComponent>
          )}
        </MenuList>
      </Menu>
      </Container>
    </Fade>
  );
};

export default GroupsPage;
