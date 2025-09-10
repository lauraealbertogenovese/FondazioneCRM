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
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { visitService, clinicalService } from '../services/api';

const VisitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visit, setVisit] = useState(null);
  const [clinicalRecord, setClinicalRecord] = useState(null);

  const visitTypeLabels = {
    individual: 'Terapia Individuale',
    group: 'Terapia di Gruppo',
    family: 'Terapia Familiare',
    medical: 'Visita Clinica',
    intake: 'Colloquio di Intake',
    emergency: 'Intervento di Emergenza',
    consultation: 'Consulenza',
  };

  const statusLabels = {
    scheduled: 'Programmata',
    completed: 'Completata',
    cancelled: 'Cancellata',
    rescheduled: 'Riprogrammata',
  };

  const statusColors = {
    scheduled: 'info',
    completed: 'success',
    cancelled: 'error',
    rescheduled: 'warning',
  };

  useEffect(() => {
    loadVisit();
  }, [id]);

  const loadVisit = async () => {
    setLoading(true);
    try {
      const response = await visitService.getById(id);
      setVisit(response.visit);
      
      // Load associated clinical record
      if (response.visit.clinical_record_id) {
        const clinicalResponse = await clinicalService.getRecord(response.visit.clinical_record_id);
        setClinicalRecord(clinicalResponse.record);
      }
    } catch (error) {
      console.error('Errore nel caricamento della visita:', error);
      setError('Errore nel caricamento della visita');
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
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non specificata';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (error || !visit) {
    return (
      <Container maxWidth="md">
        <Box py={3}>
          <Alert severity="error">
            {error || 'Visita non trovata'}
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
            <IconButton onClick={() => navigate('/visits')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Dettaglio Visita
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {visitTypeLabels[visit.visit_type] || visit.visit_type}
              </Typography>
            </Box>
          </Stack>

          {hasPermission('visits.update') && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/visits/${id}/edit`)}
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Informazioni Visita
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Tipo Visita
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {visitTypeLabels[visit.visit_type] || visit.visit_type}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Stato
              </Typography>
              <Chip
                label={statusLabels[visit.status] || visit.status}
                color={statusColors[visit.status] || 'default'}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Data e Ora
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDateTime(visit.visit_date)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Clinico/Operatore
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {visit.doctor_name || 'Non specificato'}
              </Typography>
            </Box>

            {visit.follow_up_date && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Data Follow-up
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(visit.follow_up_date)}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Paziente e Cartella Clinica */}
        {clinicalRecord && (
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PersonIcon color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Informazioni Paziente
              </Typography>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Paziente
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {clinicalRecord.first_name} {clinicalRecord.last_name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Numero Cartella
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {clinicalRecord.record_number}
                </Typography>
              </Box>

              {clinicalRecord.diagnosis && (
                <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                    Diagnosi
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {clinicalRecord.diagnosis}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Note della Visita */}
        {visit.visit_notes && (
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <NotesIcon color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Note della Visita
              </Typography>
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                minHeight: 100,
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2">
                {visit.visit_notes}
              </Typography>
            </Paper>
          </Paper>
        )}

        {/* Metadati */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Informazioni Sistema
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {visit.created_at && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Creata il
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(visit.created_at)}
                </Typography>
              </Box>
            )}

            {visit.updated_at && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Ultima modifica
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(visit.updated_at)}
                </Typography>
              </Box>
            )}

            {visit.created_by_username && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Creata da
                </Typography>
                <Typography variant="body2">
                  {visit.created_by_username}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
};

export default VisitDetailPage;