import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Alert,
  IconButton,
  Chip,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as MedicalIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { clinicalService } from '../services/api';
import ClinicalDiary from '../components/ClinicalDiary';
import DocumentManager from '../components/DocumentManager';

const ClinicalRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const theme = useTheme();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  useEffect(() => {
    if (!hasPermission('clinical.read')) {
      navigate('/clinical-records');
    }
  }, [hasPermission, navigate]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await clinicalService.getRecord(id);
      if (response.success) {
        setRecord(response.data);
      } else {
        setError('Cartella clinica non trovata');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Errore nel caricamento della cartella clinica');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/clinical-records/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/clinical-records');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { label: 'Attivo', color: 'success' },
      archived: { label: 'Archiviato', color: 'warning' },
      closed: { label: 'Chiuso', color: 'error' },
    };
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
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

  if (error || !record) {
    return (
      <Container maxWidth="md">
        <Box py={3}>
          <Alert severity="error">
            {error || 'Cartella clinica non trovata'}
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
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Cartella Clinica
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {record.record_number}
                </Typography>
                {getStatusChip(record.status)}
              </Stack>
            </Box>
          </Stack>

          {hasPermission('clinical.update') && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Modifica
            </Button>
          )}
        </Stack>
      </Box>

      <Stack spacing={3}>
        {/* Informazioni Paziente */}
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
                Nome Completo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {record.first_name} {record.last_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Codice Fiscale
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                {record.codice_fiscale}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Creato da
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {record.created_by_username}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                Data Creazione
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(record.created_at)}
              </Typography>
            </Box>

            {record.updated_at && record.updated_at !== record.created_at && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase' }}>
                  Ultima Modifica
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(record.updated_at)}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Diagnosi */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <MedicalIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Diagnosi
            </Typography>
          </Stack>
          
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'grey.50',
              minHeight: 60,
              whiteSpace: 'pre-wrap'
            }}
          >
            <Typography variant="body2">
              {record.diagnosis || 'Nessuna diagnosi specificata'}
            </Typography>
          </Paper>
        </Paper>

        {/* Piano di Cura */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AssignmentIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Piano di Cura
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
              {record.treatment_plan || 'Nessun piano di cura specificato'}
            </Typography>
          </Paper>
        </Paper>

        {/* Note */}
        {record.notes && (
          <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <NotesIcon color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Note Aggiuntive
              </Typography>
            </Stack>
            
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                minHeight: 80,
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2">
                {record.notes}
              </Typography>
            </Paper>
          </Paper>
        )}

        {/* Clinical Diary Section */}
        <ClinicalDiary 
          patientId={record.patient_id} 
          clinicalRecordId={record.id}
          showAddButton={hasPermission('clinical.update')}
        />

        {/* Document Management Section */}
        <DocumentManager 
          patientId={record.patient_id}
          clinicalRecordId={record.id}
          showUpload={hasPermission('documents.write')}
        />

        {/* Cronologia Attività */}
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CalendarIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Cronologia Attività
            </Typography>
          </Stack>
          
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              Cronologia Visite
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Le visite e gli appuntamenti collegati a questa cartella clinica appariranno qui
            </Typography>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ClinicalRecordDetailPage;