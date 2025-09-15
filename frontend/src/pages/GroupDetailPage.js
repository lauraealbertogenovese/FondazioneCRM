import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Container
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  RemoveCircle as RemoveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/api';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGroupDetail();
    }
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroup(id);
      if (response.success) {
        setGroup(response.data);
        setMembers(response.data.members || []);
      } else {
        setError('Gruppo non trovato');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Errore nel caricamento del gruppo');
    } finally {
      setLoading(false);
    }
  };


  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo membro dal gruppo?')) {
      try {
        await groupService.removeGroupMember(id, memberId);
        fetchGroupDetail();
      } catch (error) {
        console.error('Error removing member:', error);
        setError('Errore nella rimozione del membro');
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

  const getMemberTypeLabel = (type) => {
    switch (type) {
      case 'patient': return 'Paziente';
      case 'conductor': return 'Conduttore';
      default: return type;
    }
  };

  const getMemberTypeColor = (type) => {
    switch (type) {
      case 'patient': return 'primary';
      case 'conductor': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !group) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/groups')} 
          variant="outlined"
          color="inherit"
          sx={{ 
            mt: 2,
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
            }
          }}
        >
          Torna ai Gruppi
        </Button>
      </Box>
    );
  }

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate('/groups')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {group?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gruppo di supporto • {group?.group_type}
              </Typography>
            </Box>
          </Stack>
          {hasPermission('groups.write') && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/groups/${id}/edit`)}
              size="small"
            >
              Modifica
            </Button>
          )}
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Informazioni Principali */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <GroupIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Informazioni Gruppo
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Tipo Gruppo
              </Typography>
              <Chip
                label={group?.group_type}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Stato
              </Typography>
              <Chip
                label={getStatusLabel(group?.status)}
                color={getStatusColor(group?.status)}
                size="small"
              />
            </Box>

            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Descrizione
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {group?.description || 'Nessuna descrizione disponibile'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Data Inizio
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(group?.start_date)}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Frequenza Incontri
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {group?.meeting_frequency || 'Non specificata'}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Luogo Incontri
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {group?.meeting_location || 'Non specificato'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Membri del Gruppo */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PeopleIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Membri del Gruppo ({members.filter(m => m.is_active).length}{group?.max_members ? `/${group.max_members}` : ''})
            </Typography>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Ruolo</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Iscrizione</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Contatti</TableCell>
                  {hasPermission('groups.write') && (
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Azioni</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.filter(member => member.is_active).map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.nome} {member.cognome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMemberTypeLabel(member.member_type)}
                        size="small"
                        color={getMemberTypeColor(member.member_type)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.role || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(member.joined_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {member.email && (
                          <Tooltip title={member.email}>
                            <IconButton size="small">
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {member.telefono && (
                          <Tooltip title={member.telefono}>
                            <IconButton size="small">
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    {hasPermission('groups.write') && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, member)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {members.filter(m => m.is_active).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Nessun membro attivo nel gruppo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Usa la tab "Modifica" per gestire i membri
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Paper>

      </Stack>
    </Container>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemComponent 
            onClick={() => handleRemoveMember(selectedMember?.id)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <RemoveIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Rimuovi dal Gruppo</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>
    </>
  );
};

export default GroupDetailPage;
