import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  CircularProgress,
  Container,
  Stack,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await userService.getById(id);
      setUser(response.user);
    } catch (error) {
      console.error('Errore nel caricamento dell\'utente:', error);
      setError('Errore nel caricamento dell\'utente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non specificata';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'error',
      doctor: 'primary',
      psychologist: 'secondary',
      operator: 'success',
    };
    return colors[roleName] || 'default';
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'admin':
        return <AdminIcon />;
      case 'doctor':
      case 'psychologist':
        return <BadgeIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="md">
        <Box py={3}>
          <Alert severity="error">
            {error || 'Utente non trovato'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate('/users')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: user.is_active ? 'primary.main' : 'grey.400',
                fontSize: '1.2rem',
              }}
            >
              {getInitials(user.first_name, user.last_name)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Stack>

          {hasPermission('users.update') && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/users/${id}/edit`)}
              size="small"
            >
              Modifica
            </Button>
          )}
        </Stack>
      </Box>

      <Stack spacing={3}>
        {/* Informazioni Principali */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PersonIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Informazioni Utente
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Nome Completo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.first_name} {user.last_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Username
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                @{user.username}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Email
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.email}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Stato Account
              </Typography>
              <Chip
                label={user.is_active ? 'Attivo' : 'Inattivo'}
                color={user.is_active ? 'success' : 'error'}
              />
            </Box>
          </Box>
        </Paper>

        {/* Ruolo e Permessi */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <BadgeIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Ruolo e Permessi
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Ruolo
              </Typography>
              <Chip
                icon={getRoleIcon(user.role_name)}
                label={user.role_display_name || user.role_name}
                color={getRoleColor(user.role_name)}
                variant="outlined"
                size="small"
              />
            </Box>

            {user.role_description && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Descrizione Ruolo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.role_description}
                </Typography>
              </Box>
            )}
          </Box>

          {user.role_permissions && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1, textTransform: 'uppercase' }}>
                Permessi
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  maxHeight: 150,
                  overflow: 'auto'
                }}
              >
                {Array.isArray(user.role_permissions) ? (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {user.role_permissions.map((permission, index) => (
                      <Chip
                        key={index}
                        label={permission}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {JSON.stringify(user.role_permissions, null, 2)}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </Paper>

        {/* Metadati */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Informazioni Sistema
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {user.created_at && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Account creato il
                </Typography>
                <Typography variant="body2">
                  {formatDate(user.created_at)}
                </Typography>
              </Box>
            )}

            {user.updated_at && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Ultima modifica
                </Typography>
                <Typography variant="body2">
                  {formatDate(user.updated_at)}
                </Typography>
              </Box>
            )}

            {user.last_login && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Ultimo accesso
                </Typography>
                <Typography variant="body2">
                  {formatDate(user.last_login)}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                ID Utente
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {user.id}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Statistiche Utente (se disponibili) */}
        {(user.patients_created || user.records_created || user.visits_conducted) && (
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Statistiche Attività
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {user.patients_created && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                    Pazienti Creati
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                    {user.patients_created}
                  </Typography>
                </Box>
              )}

              {user.records_created && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                    Cartelle Create
                  </Typography>
                  <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 700 }}>
                    {user.records_created}
                  </Typography>
                </Box>
              )}

              {user.visits_conducted && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                    Visite Condotte
                  </Typography>
                  <Typography variant="h5" color="info.main" sx={{ fontWeight: 700 }}>
                    {user.visits_conducted}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default UserDetailPage;