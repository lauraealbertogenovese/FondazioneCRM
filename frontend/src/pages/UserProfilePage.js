import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (error) setError(null);
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
    if (error) setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
    // Reset form data
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name) {
      setError('Nome e cognome sono obbligatori');
      return false;
    }
    if (!formData.username) {
      setError('Username è obbligatorio');
      return false;
    }
    if (!formData.email) {
      setError('Email è obbligatoria');
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email non valida');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (passwordData.newPassword || passwordData.confirmPassword || passwordData.currentPassword) {
      if (!passwordData.currentPassword) {
        setError('Password corrente è obbligatoria per modificare la password');
        return false;
      }
      if (!passwordData.newPassword) {
        setError('Nuova password è obbligatoria');
        return false;
      }
      if (passwordData.newPassword.length < 8) {
        setError('La nuova password deve essere di almeno 8 caratteri');
        return false;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Le password non corrispondono');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !validatePassword()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement API call to update user profile
      console.log('Updating profile:', formData);
      if (passwordData.newPassword) {
        console.log('Updating password');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate updating user data in context (questo sarà sostituito con la vera API)
      if (updateUser) {
        updateUser({
          ...user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        });
      }
      
      setSuccess(true);
      setIsEditing(false);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Errore nell\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Errore nel caricamento del profilo utente
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Il mio Profilo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualizza e modifica le tue informazioni personali
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profilo aggiornato con successo!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* User Info Header */}
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <AccountIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formData.first_name} {formData.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                @{formData.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ alignSelf: 'flex-start' }}
              >
                Modifica
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Informazioni Personali</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cognome"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={!isEditing}
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 2 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6">Informazioni di Contatto</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefono"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
              />
            </Grid>

            {/* Password Section - Only visible when editing */}
            {isEditing && (
              <>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 2 }}>
                    <KeyIcon color="primary" />
                    <Typography variant="h6">Modifica Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                      (opzionale)
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Password Corrente"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange('currentPassword')}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Nuova Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange('newPassword')}
                    helperText="Minimo 8 caratteri"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Conferma Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange('confirmPassword')}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Action Buttons */}
          {isEditing && (
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                startIcon={<CancelIcon />}
              >
                Annulla
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  }
                }}
              >
                {loading ? 'Salvando...' : 'Salva Modifiche'}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserProfilePage;