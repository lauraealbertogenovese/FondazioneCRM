import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Visibility as PreviewIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { documentService, patientService, clinicalService } from '../services/api';

// Componente separato per il preview di file di testo
const TextPreview = ({ previewUrl, setError }) => {
  const [textContent, setTextContent] = useState('');
  
  useEffect(() => {
    if (previewUrl) {
      fetch(previewUrl)
        .then(response => response.text())
        .then(setTextContent)
        .catch(err => setError('Errore nel caricamento del testo'));
    }
  }, [previewUrl, setError]);

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {textContent}
      </Typography>
    </Box>
  );
};

// Componente per il preview del contenuto
const PreviewContent = ({ document }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Per ora usiamo il download endpoint e creiamo un blob URL
        // In futuro si potrebbe creare un endpoint dedicato per il preview
        let blob;
        if (document.clinical_record_id) {
          blob = await clinicalService.downloadClinicalDocument(document.id);
        } else {
          blob = await documentService.downloadDocument(document.id);
        }
        
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Errore nel caricamento dell\'anteprima');
      } finally {
        setLoading(false);
      }
    };

    if (document) {
      loadPreview();
    }

    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography>Caricamento anteprima...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!previewUrl) return null;

  const mimeType = document.mime_type;

  // Preview per immagini
  if (mimeType.startsWith('image/')) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        p: 2,
        overflow: 'auto'
      }}>
        <img 
          src={previewUrl} 
          alt={document.original_filename}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
    );
  }

  // Preview per PDF
  if (mimeType === 'application/pdf') {
    return (
      <Box sx={{ height: '100%' }}>
        <iframe
          src={previewUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={document.original_filename}
        />
      </Box>
    );
  }

  // Preview per documenti Office via Office Online
  if (mimeType.includes('officedocument') || mimeType.includes('openxmlformats')) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
    return (
      <Box sx={{ height: '100%' }}>
        <iframe
          src={officeUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={document.original_filename}
        />
      </Box>
    );
  }

  // Preview per testo
  if (mimeType === 'text/plain') {
    return <TextPreview previewUrl={previewUrl} setError={setError} />;
  }

  // Fallback per tipi non supportati
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      gap: 2,
      p: 3
    }}>
      <DocumentIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        Anteprima non disponibile
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        Questo tipo di file non può essere visualizzato in anteprima. <br/>
        Usa il pulsante "Scarica" per aprire il file.
      </Typography>
    </Box>
  );
};

const DocumentManager = ({ patientId, clinicalRecordId, groupId, showUploadButton = true }) => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newDocument, setNewDocument] = useState({
    file: null,
    category: 'medical_report',
    description: ''
  });

  const documentCategories = {
    medical_report: { label: 'Referto Medico', color: 'primary', icon: DocumentIcon },
    consent_form: { label: 'Modulo Consenso', color: 'success', icon: DocumentIcon },
    external_referral: { label: 'Invio Esterno', color: 'info', icon: DocumentIcon },
    group_document: { label: 'Documento Gruppo', color: 'warning', icon: DocumentIcon },
    prescription: { label: 'Prescrizione', color: 'secondary', icon: DocumentIcon },
    lab_result: { label: 'Esito Laboratorio', color: 'error', icon: DocumentIcon },
    image: { label: 'Immagine', color: 'default', icon: ImageIcon },
    other: { label: 'Altro', color: 'default', icon: DocumentIcon },
  };

  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    fetchDocuments();
  }, [patientId, clinicalRecordId, groupId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug log
      console.log('📋 DocumentManager fetchDocuments:', { patientId, clinicalRecordId, groupId });
      
      // Fetch real documents data
      let documentsResponse;
      
      if (clinicalRecordId) {
        // Get clinical record documents
        console.log('📋 Fetching clinical record documents for recordId:', clinicalRecordId);
        const clinicalResponse = await clinicalService.getClinicalRecordDocuments(clinicalRecordId);
        documentsResponse = clinicalResponse;
        console.log('📋 Clinical documents response:', clinicalResponse);
      } else if (patientId) {
        // Get patient documents
        console.log('📋 Fetching patient documents for patientId:', patientId);
        const patientResponse = await patientService.getPatientDocuments(patientId);
        documentsResponse = patientResponse;
        console.log('📋 Patient documents response:', patientResponse);
      } else if (selectedCategory && selectedCategory !== 'all') {
        // Get documents by type
        console.log('📋 Fetching documents by type:', selectedCategory);
        documentsResponse = await documentService.getDocumentsByType(selectedCategory);
        console.log('📋 Type documents response:', documentsResponse);
      } else {
        // Get all documents (you might need a different endpoint for this)
        console.log('📋 Fetching all documents');
        documentsResponse = await documentService.getDocumentsByType('all');
        console.log('📋 All documents response:', documentsResponse);
      }
      
      const documents = documentsResponse.documents || documentsResponse.data || [];
      console.log('📋 Setting documents:', documents);
      setDocuments(documents);
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError('Errore nel caricamento dei documenti');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newDocument.file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file
      if (!allowedFileTypes.includes(newDocument.file.type)) {
        throw new Error('Tipo di file non supportato');
      }

      if (newDocument.file.size > maxFileSize) {
        throw new Error('File troppo grande (max 10MB)');
      }

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('document_type', newDocument.category);
      formData.append('description', newDocument.description);

      // Debug log
      console.log('🔄 DocumentManager handleFileUpload:', { 
        patientId, 
        clinicalRecordId, 
        groupId,
        fileName: newDocument.file.name,
        fileSize: newDocument.file.size,
        fileType: newDocument.file.type,
        category: newDocument.category
      });
      
      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log('📎 FormData:', pair[0], pair[1]);
      }
      
      // Real API upload
      let response;
      if (clinicalRecordId) {
        console.log('⬆️ Uploading to clinical record:', clinicalRecordId);
        response = await clinicalService.uploadClinicalDocument(clinicalRecordId, formData);
      } else if (patientId) {
        console.log('⬆️ Uploading to patient:', patientId);
        response = await documentService.uploadDocument(patientId, formData);
      } else {
        console.log('⬆️ Uploading general document');
        // For non-patient specific documents, you might need a different endpoint
        response = await documentService.uploadDocument(null, formData);
      }

      console.log('✅ Upload response:', response);
      setUploadProgress(100);

      // Refresh documents list
      await fetchDocuments();
      setNewDocument({ file: null, category: 'medical_report', description: '' });
      setUploadDialogOpen(false);
      setUploadProgress(0);

    } catch (error) {
      console.error('❌ Error uploading document:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Errore durante il caricamento del documento');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewDocument({ ...newDocument, file });
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      // Delete via API
      if (clinicalRecordId) {
        await clinicalService.deleteClinicalDocument(documentId);
      } else {
        await documentService.deleteDocument(documentId);
      }
      
      // Refresh documents list
      await fetchDocuments();
      
      setAnchorEl(null);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Errore nell\'eliminazione del documento');
    }
  };

  const handleDownloadDocument = async (documentToDownload) => {
    try {
      // Download via API
      let blob;
      if (clinicalRecordId) {
        blob = await clinicalService.downloadClinicalDocument(documentToDownload.id);
      } else {
        blob = await documentService.downloadDocument(documentToDownload.id);
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentToDownload.original_filename || documentToDownload.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Errore nel download del documento');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPreviewable = (document) => {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    return previewableTypes.includes(document.mime_type);
  };

  const handlePreviewDocument = async (document) => {
    try {
      setPreviewLoading(true);
      setPreviewDocument(document);
      setPreviewOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error opening preview:', error);
      setError('Errore nell\'apertura del preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewDocument(null);
  };

  const getFileIcon = (mimeType, category) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType === 'application/pdf') return PdfIcon;
    return documentCategories[category]?.icon || DocumentIcon;
  };

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };
const isAllowed = showUploadButton && hasPermission('documents.create')

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAllowed) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      setNewDocument({ ...newDocument, file: files[0] });
      setUploadDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento documenti...
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Gestione Documenti
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carica e gestisci i documenti del paziente
          </Typography>
        </Box>

        {isAllowed && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }
            }}
          >
            Carica Documento
          </Button>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card 
          elevation={0}
          sx={{ 
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.5),
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            }
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <UploadIcon sx={{ 
              fontSize: 64, 
              color: theme.palette.primary.main,
              opacity: 0.5,
              mb: 2 
            }} />
            <Typography variant="h6" gutterBottom>
              Nessun documento caricato
            </Typography>
            {isAllowed && <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Trascina i file qui o utilizza il pulsante per caricare i documenti
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Carica Primo Documento
            </Button>
            </>}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {documents.map((document) => {
            const category = documentCategories[document.document_type || document.category] || documentCategories.other;
            const FileIcon = getFileIcon(document.mime_type, document.document_type || document.category);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileIcon 
                          sx={{ 
                            fontSize: 32, 
                            color: category?.color ? theme.palette[category.color]?.main : theme.palette.primary.main
                          }} 
                        />
                        <Box>
                          <Chip 
                            label={category?.label || 'Documento'}
                            size="small"
                            color={category?.color || 'default'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuOpen(e, document)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {document.name}
                    </Typography>

                    {document.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {document.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(document.file_size || document.size)} • {new Date(document.created_at || document.uploaded_at).toLocaleDateString('it-IT')}
                    </Typography>
                    
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Carica Nuovo Documento</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* File Selection */}
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={allowedFileTypes.join(',')}
                style={{ display: 'none' }}
              />
              
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                sx={{ mb: 1 }}
                disabled={uploading}
              >
                {newDocument.file ? newDocument.file.name : 'Seleziona File'}
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Formati supportati: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max 10MB)
              </Typography>
            </Box>

            {/* Category Selection */}
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={newDocument.category}
                onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                label="Categoria"
                disabled={uploading}
              >
                {Object.entries(documentCategories).map(([key, category]) => (
                  <MenuItem key={key} value={key}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              label="Descrizione"
              multiline
              rows={2}
              value={newDocument.description}
              onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
              placeholder="Breve descrizione del documento..."
              disabled={uploading}
            />


            {/* Upload Progress */}
            {uploading && (
              <Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" align="center">
                  Caricamento in corso... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={uploading}
            sx={{
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Annulla
          </Button>
          <Button 
            variant="contained" 
            onClick={handleFileUpload}
            disabled={!newDocument.file || uploading}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              }
            }}
          >
            {uploading ? 'Caricamento...' : 'Carica'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedDocument && isPreviewable(selectedDocument) && (
          <MenuItem onClick={() => handlePreviewDocument(selectedDocument)}>
            <PreviewIcon sx={{ mr: 1 }} fontSize="small" />
            Anteprima
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleDownloadDocument(selectedDocument);
          handleMenuClose();
        }}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Scarica
        </MenuItem>
        {hasPermission('documents.delete') && (
          <MenuItem 
            onClick={() => {
              if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
                handleDeleteDocument(selectedDocument.id);
              }
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Elimina
          </MenuItem>
        )}
      </Menu>

      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: '90vh',
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {previewDocument && (
              <>
                {React.createElement(getFileIcon(previewDocument.mime_type), { 
                  sx: { fontSize: 24, color: 'primary.main' } 
                })}
                <Box>
                  <Typography variant="h6" component="div">
                    {previewDocument.original_filename || previewDocument.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(previewDocument.file_size)} • {previewDocument.mime_type}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => handleDownloadDocument(previewDocument)}
              size="small"
              title="Scarica"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {previewDocument && (
            <PreviewContent document={previewDocument} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;