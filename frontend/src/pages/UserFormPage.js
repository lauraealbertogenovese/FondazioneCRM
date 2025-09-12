import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  Divider,
  Container,
  Stack,
  FormControlLabel,
  Switch,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService, authService } from '../services/api';
import roleService from '../services/roleService';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const theme = useTheme();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role_id: 1,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  
  // Funzione per mappare errori di validazione ai campi
  const parseValidationErrors = (validationErrors) => {
    const fieldErrors = {};
    
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach(error => {
        const errorLower = error.toLowerCase();
        if (errorLower.includes('password') || errorLower.includes('obbligatoria')) {
          fieldErrors.password = error;
        } else if (errorLower.includes('nome utente')) {
          fieldErrors.username = error;
        } else if (errorLower.includes('email')) {
          fieldErrors.email = error;
        } else if (errorLower.includes('il nome')) {
          fieldErrors.first_name = error;
        } else if (errorLower.includes('il cognome')) {
          fieldErrors.last_name = error;
        }
      });
    }
    
    return fieldErrors;
  };

  useEffect(() => {
    loadRoles();
    if (isEdit) {
      loadUser();
    }
  }, [id, isEdit]);

  // Carica tutti i ruoli disponibili dal database
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const roles = await roleService.getRoles();
      
      // Usa direttamente i ruoli dal database esattamente come sono stati creati dall'admin
      const rolesFormatted = roles.map(role => ({
        id: role.id,
        name: role.name,
        display_name: role.name  // Usa il nome esatto del ruolo dal database
      }));
      setAvailableRoles(rolesFormatted);
      
      // Set default role_id se non già impostato
      if (!isEdit && roles.length > 0) {
        setFormData(prev => ({ ...prev, role_id: roles[0].id }));
      }
    } catch (error) {
      console.error('Errore nel caricamento dei ruoli:', error);
      setError('Errore nel caricamento dei ruoli. Impossibile caricare la lista dei ruoli.');
      setAvailableRoles([]); // Non usare fallback hardcodati, usare solo ruoli dal database
    } finally {
      setRolesLoading(false);
    }
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await userService.getById(id);
      setFormData({
        username: response.user.username || '',
        email: response.user.email || '',
        password: '',
        confirmPassword: '',
        first_name: response.user.first_name || '',
        last_name: response.user.last_name || '',
        role_id: response.user.role_id || 1,
        is_active: response.user.is_active !== false
      });
    } catch (error) {
      console.error('Errore nel caricamento dell\'utente:', error);
      setError('Errore nel caricamento dell\'utente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username obbligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username deve essere almeno 3 caratteri';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    // Password validation (only for new users or when changing password)
    if (!isEdit || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password obbligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password deve essere almeno 6 caratteri';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Le password non corrispondono';
      }
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome obbligatorio';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Cognome obbligatorio';
    }

    // Role validation
    if (!formData.role_id || !Number.isInteger(Number(formData.role_id))) {
      newErrors.role_id = 'Ruolo obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role_id: Number(formData.role_id),
        is_active: formData.is_active
      };

      // Only include password if it's provided
      if (!isEdit || formData.password) {
        submitData.password = formData.password;
      }

      if (isEdit) {
        await userService.update(id, submitData);
        setSuccess('Utente aggiornato con successo');
      } else {
        await userService.create(submitData);
        setSuccess('Utente creato con successo');
      }

      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      
      // Gestisci errori di validazione con dettagli
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const fieldErrors = parseValidationErrors(error.response.data.details);
        setErrors(fieldErrors);
        
        const validationErrors = error.response.data.details.join(', ');
        setError(`Errori di validazione: ${validationErrors}`);
      } else {
        setErrors({});
        setError(error.response?.data?.error || error.response?.data?.message || 'Errore nel salvataggio dell\'utente');
      }
    } finally {
      setSubmitLoading(false);
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

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Minimal Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <IconButton onClick={() => navigate('/users')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Modifica Utente' : 'Nuovo Utente'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Aggiorna i dati dell\'utente' : 'Crea un nuovo account utente'}
            </Typography>
          </Box>
        </Stack>
      </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Account Information */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Informazioni Account
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Username *
                    </Typography>
                    <TextField
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={!!errors.username}
                      helperText={errors.username}
                      disabled={isEdit}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Email *
                    </Typography>
                    <TextField
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Password Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  {isEdit ? 'Cambia Password (opzionale)' : 'Password'}
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {isEdit ? 'Nuova Password' : 'Password *'}
                    </Typography>
                    <TextField
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isEdit && !formData.password ? '••••••••' : ''}
                      fullWidth
                      size="small"
                      error={!!errors.password}
                      helperText={errors.password || (isEdit ? 'Lascia vuoto per non cambiare' : '')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Conferma Password {!isEdit && '*'}
                    </Typography>
                    <TextField
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={isEdit && !formData.confirmPassword ? '••••••••' : ''}
                      fullWidth
                      size="small"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Personal Information */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Informazioni Personali
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Nome *
                    </Typography>
                    <TextField
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Cognome *
                    </Typography>
                    <TextField
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Role and Status */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Ruolo e Stato
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Ruolo *
                    </Typography>
                    {rolesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RadioGroup
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: 1,
                          mt: 1
                        }}
                      >
                        {availableRoles.map(role => (
                          <FormControlLabel
                            key={role.id}
                            value={role.id}
                            control={<Radio size="small" />}
                            label={role.name}
                            sx={{ 
                              mr: 0,
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                    )}
                    {errors.role_id && (
                      <Typography variant="caption" color="error" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
                        {errors.role_id}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: { xs: 0, md: 3 } }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={handleChange}
                          name="is_active"
                          size="small"
                        />
                      }
                      label="Utente Attivo"
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>


            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
                disabled={submitLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitLoading}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.400',
                    color: 'white',
                  }
                }}
              >
                {submitLoading ? 'Salvataggio...' : isEdit ? 'Aggiorna' : 'Crea'}
              </Button>
            </Stack>
          </form>
        </Paper>
        
        {/* Help Text */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Suggerimento:</strong> I ruoli e i relativi permessi sono configurabili dalla sezione "Gestione Ruoli" del sistema.
          </Typography>
        </Box>
    </Container>
  );
};

export default UserFormPage;