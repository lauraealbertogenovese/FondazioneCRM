import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Notes as NotesIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { clinicalService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PatientClinicalRecords = ({ patientId, patientName }) => {
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const { hasPermission } = useAuth();

  // Form state for new record
  const [newRecord, setNewRecord] = useState({
    title: '',
    record_type: 'consultation',
    status: 'active',
    diagnosis: '',
    treatment_plan: '',
    description: '',
    notes: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchClinicalRecords();
    }
  }, [patientId]);

  const fetchClinicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clinicalService.getPatientRecords(patientId);
      setClinicalRecords(response.data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei record clinici:', error);
      setError('Errore nel caricamento dei record clinici');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Data non disponibile';
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecordTypeLabel = (type) => {
    const types = {
      'consultation': 'Consultazione',
      'assessment': 'Valutazione',
      'therapy': 'Terapia',
      'follow_up': 'Follow-up',
      'emergency': 'Emergenza'
    };
    return types[type] || 'Consultazione';
  };


  const handleEditRecord = async (recordId) => {
    try {
      const response = await clinicalService.getRecord(recordId);
      setEditingRecord(response.data);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento del record:', error);
      setError('Errore nel caricamento del record per la modifica');
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleEditInputChange = (field, value) => {
    setEditingRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateRecord = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await clinicalService.updateRecord(editingRecord.id, editingRecord);
      await fetchClinicalRecords(); // Refresh the list
      handleCloseEditModal();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del record:', error);
      setError('Errore nell\'aggiornamento del record clinico');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRecord = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setNewRecord({
      title: '',
      record_type: 'consultation',
      status: 'active',
      diagnosis: '',
      treatment_plan: '',
      description: '',
      notes: ''
    });
  };

  const handleInputChange = (field, value) => {
    setNewRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRecord = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const recordData = {
        patient_id: patientId,
        title: newRecord.title,
        record_type: newRecord.record_type,
        description: newRecord.description,
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment_plan, // Fix: mappatura corretta
        notes: newRecord.notes
      };

      await clinicalService.createRecord(recordData);
      await fetchClinicalRecords(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Errore nella creazione del record:', error);
      setError('Errore nella creazione del record clinico');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    try {
      setError(null);
      await clinicalService.deleteRecord(recordToDelete.id);
      await fetchClinicalRecords(); // Refresh the list
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Errore nell\'eliminazione del record:', error);
      setError('Errore nell\'eliminazione del record clinico');
      handleCloseDeleteDialog();
    }
  };

  if (loading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={150} height={36} />
        </Stack>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={120} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Cartella clinica di {patientName}
        </Typography>
        {hasPermission('clinical.write') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRecord}
            sx={{ 
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Nuovo Record
          </Button>
        )}
      </Stack>

      {/* Records List */}
      {clinicalRecords.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 2 
          }}
        >
          <HospitalIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Nessun record clinico
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Non ci sono ancora record clinici per questo paziente
          </Typography>
          {hasPermission('clinical.write') && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateRecord}
            >
              Crea il primo record
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {clinicalRecords.map((record, index) => (
            <Paper 
              key={record.id} 
              elevation={0}
              sx={{ 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.50',
                borderBottom: '1px solid',
                borderBottomColor: 'divider'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {record.title || `Record Clinico #${record.id}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.record_number} • Creato il {formatDate(record.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={getRecordTypeLabel(record.record_type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={record.status === 'active' ? 'Attivo' : record.status}
                      size="small"
                      color={record.status === 'active' ? 'success' : 'default'}
                      variant="filled"
                    />
                    {hasPermission('clinical.update') && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditRecord(record.id)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission('clinical.delete') && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteRecord(record)}
                        sx={{ ml: 1, color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Diagnosi */}
                  {record.diagnosis && (
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                          <NotesIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Diagnosi
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {record.diagnosis}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Piano di Trattamento */}
                  {record.treatment && (
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'secondary.main' }}>
                          <HospitalIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Piano di Trattamento
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {record.treatment}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Descrizione */}
                  {record.description && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Descrizione
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {record.description}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Note */}
                  {record.notes && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Note Cliniche
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.6,
                            p: 2,
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            fontStyle: 'italic'
                          }}
                        >
                          {record.notes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Footer info */}
                <Divider sx={{ mt: 3, mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Ultimo aggiornamento: {formatDateTime(record.updated_at)}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Record Modal */}
      <Dialog 
        open={isCreateModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          pb: 3,
          pt: 3,
          px: 3,
          borderBottom: '1px solid',
          borderBottomColor: 'divider'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                Nuovo Record Clinico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paziente: {patientName}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ 
          pt: 2,         // Riduci padding top
          px: 3,         // Padding orizzontale
          pb: 3,         // Padding bottom
          minHeight: '60vh',  // Altezza minima
          overflow: 'visible' // Assicura che il contenuto sia visibile
        }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Titolo e Tipo */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Titolo del Record"
                value={newRecord.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Es. Prima visita, Controllo periodico..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo Record"
                value={newRecord.record_type}
                onChange={(e) => handleInputChange('record_type', e.target.value)}
              >
                <MenuItem value="consultation">Consultazione</MenuItem>
                <MenuItem value="assessment">Valutazione</MenuItem>
                <MenuItem value="therapy">Terapia</MenuItem>
                <MenuItem value="follow_up">Follow-up</MenuItem>
                <MenuItem value="emergency">Emergenza</MenuItem>
              </TextField>
            </Grid>

            {/* Diagnosi */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Diagnosi"
                value={newRecord.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Inserisci la diagnosi clinica..."
              />
            </Grid>

            {/* Piano di Trattamento */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Piano di Trattamento"
                value={newRecord.treatment_plan}
                onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                placeholder="Descrivi il piano di trattamento proposto..."
              />
            </Grid>

            {/* Descrizione */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrizione"
                value={newRecord.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Breve descrizione dell'incontro o del record..."
              />
            </Grid>

            {/* Note Cliniche */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Note Cliniche"
                value={newRecord.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Note aggiuntive, osservazioni, commenti..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid', 
          borderTopColor: 'divider',
          gap: 2,
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={handleCloseModal}
            variant="outlined"
            disabled={saving}
            sx={{ minWidth: 100 }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSaveRecord}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving || !newRecord.title}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
              minWidth: 140
            }}
          >
            {saving ? 'Salvando...' : 'Crea Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          pb: 3,
          pt: 3,
          px: 3,
          borderBottom: '1px solid',
          borderBottomColor: 'divider'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                Modifica Record Clinico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paziente: {patientName} • Record #{editingRecord?.id}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ 
          pt: 2,         // Riduci padding top
          px: 3,         // Padding orizzontale
          pb: 3,         // Padding bottom
          minHeight: '60vh',  // Altezza minima
          overflow: 'visible' // Assicura che il contenuto sia visibile
        }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {editingRecord && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Titolo e Tipo */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Titolo del Record"
                  value={editingRecord.title || ''}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  placeholder="Es. Prima visita, Controllo periodico..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo Record"
                  value={editingRecord.record_type || 'consultation'}
                  onChange={(e) => handleEditInputChange('record_type', e.target.value)}
                >
                  <MenuItem value="consultation">Consultazione</MenuItem>
                  <MenuItem value="assessment">Valutazione</MenuItem>
                  <MenuItem value="therapy">Terapia</MenuItem>
                  <MenuItem value="follow_up">Follow-up</MenuItem>
                  <MenuItem value="emergency">Emergenza</MenuItem>
                </TextField>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={editingRecord.status || 'active'}
                  onChange={(e) => handleEditInputChange('status', e.target.value)}
                >
                  <MenuItem value="active">Attivo</MenuItem>
                  <MenuItem value="archived">Archiviato</MenuItem>
                  <MenuItem value="closed">Chiuso</MenuItem>
                </TextField>
              </Grid>

              {/* Diagnosi */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Diagnosi"
                  value={editingRecord.diagnosis || ''}
                  onChange={(e) => handleEditInputChange('diagnosis', e.target.value)}
                  placeholder="Inserisci la diagnosi clinica..."
                />
              </Grid>

              {/* Piano di Trattamento */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Piano di Trattamento"
                  value={editingRecord.treatment || ''}
                  onChange={(e) => handleEditInputChange('treatment', e.target.value)}
                  placeholder="Descrivi il piano di trattamento proposto..."
                />
              </Grid>

              {/* Descrizione */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descrizione"
                  value={editingRecord.description || ''}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  placeholder="Breve descrizione dell'incontro o del record..."
                />
              </Grid>

              {/* Note Cliniche */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Note Cliniche"
                  value={editingRecord.notes || ''}
                  onChange={(e) => handleEditInputChange('notes', e.target.value)}
                  placeholder="Note aggiuntive, osservazioni, commenti..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid', 
          borderTopColor: 'divider',
          gap: 3,
          justifyContent: 'flex-end',
          flexWrap: 'nowrap'
        }}>
          <Button 
            onClick={handleCloseEditModal}
            variant="outlined"
            disabled={saving}
            sx={{ minWidth: 120, flexShrink: 0 }}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleUpdateRecord}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving || !editingRecord?.title}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
              minWidth: 180,
              flexShrink: 0
            }}
          >
            {saving ? 'Salvando...' : 'Aggiorna Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Conferma Eliminazione
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sei sicuro di voler eliminare questo record clinico?
          </Typography>
          {recordToDelete && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {recordToDelete.title || `Record Clinico #${recordToDelete.id}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recordToDelete.record_number} • Creato il {formatDate(recordToDelete.created_at)}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 500 }}>
            ⚠️ Questa azione non può essere annullata. Tutti i dati associati a questo record clinico verranno eliminati definitivamente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderTopColor: 'divider' }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
          >
            Annulla
          </Button>
          <Button 
            onClick={confirmDeleteRecord}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Elimina Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientClinicalRecords;