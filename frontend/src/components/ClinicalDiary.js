import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  Avatar,
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
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import {
  Add as AddIcon,
  Notes as NotesIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { clinicalService } from "../services/api";
import {
  DateTimePicker,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { useSnackbar } from "notistack";
import { isValid } from "date-fns";
const entryTypes = {
  consultation: {
    label: "Consultazione",
    color: "primary",
    icon: PersonIcon,
  },
  treatment: { label: "Trattamento", color: "success", icon: NotesIcon },
  observation: { label: "Osservazione", color: "info", icon: CalendarIcon },
  assessment: { label: "Valutazione", color: "warning", icon: NotesIcon },
  session: { label: "Sessione", color: "secondary", icon: PersonIcon },
};
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("it-IT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const ClinicalDiary = ({
  patientId,
  clinicalRecordId,
  showAddButton = true,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let recordsResponse;

      if (patientId) {
        recordsResponse = await clinicalService.getPatientRecords(patientId);
      } else if (clinicalRecordId) {
        const recordResponse = await clinicalService.getRecord(
          clinicalRecordId
        );
        recordsResponse = { data: [recordResponse.data] };
      } else {
        recordsResponse = await clinicalService.getRecords();
      }

      const entries = (recordsResponse.data || []).map((record) => ({
        id: record.id,
        type: record.record_type || "consultation",
        content: record.notes || record.description || "Record clinico",
        created_at: record.created_at,
        author: record.created_by_username || user?.username || "Utente",
        author_id: record.created_by,
        session_date: record.session_date,
      }));

      setEntries(entries);
    } catch (error) {
      setError("Errore nel caricamento del diario clinico");
    } finally {
      setLoading(false);
    }
  }, [patientId, clinicalRecordId, user?.username]);
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  const { enqueueSnackbar } = useSnackbar();
  const handleAddEntry = useCallback(
    async (payload, callback) => {
      try {
        const { type, content, session_date } = payload ?? {};

        const recordData = {
          patient_id: patientId,
          record_type: type,
          title: `Nota ${entryTypes[type].label}`,
          description: content,
          notes: content,
          session_date,
        };

        await clinicalService.createRecord(recordData);

        await fetchEntries();
        callback?.();
        enqueueSnackbar("Nota aggiunta con successo!", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("Errore nell'aggiunta della nota", {
          variant: "error",
        });
      }
    },
    [enqueueSnackbar, fetchEntries, patientId]
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Caricamento diario clinico...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Diario Clinico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cronologia delle interazioni e note cliniche
          </Typography>
        </Box>

        {showAddButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              },
            }}
          >
            Nuova Nota
          </Button>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Timeline Entries */}
      {Array.isArray(entries) && entries.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: "0 auto 16px",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <NotesIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Nessuna nota clinica
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aggiungi la prima nota clinica per questo paziente
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {entries.map((entry, index) => {
            const showDivider = index !== entries.length - 1;
            return (
              <ClinicalRecordCard
                entry={entry}
                key={entry.id}
                showDivider={showDivider}
                fetchEntries={fetchEntries}
              />
            );
          })}
        </Stack>
      )}

      {/* Add Entry Dialog */}
      <ClinicalDiaryForm
        title="Nuova Nota Clinica"
        buttonLabel="Salva Nota"
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddEntry}
      />
    </Box>
  );
};

export default ClinicalDiary;
function ClinicalRecordCard({ entry, showDivider = true, fetchEntries }) {
  const theme = useTheme();
  const { type, content, session_date, author, id } = entry ?? {};
  const entryType = entryTypes[type ?? ""] ?? entryTypes.consultation;
  const IconComponent = entryType.icon;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const open = Boolean(anchorEl);

  const [dialogOpen, setEditDialogOpen] = useState(false);
  const onClose = useCallback(() => {
    setEditDialogOpen(false);
  }, []);
  const handleDialogOpen = useCallback(() => {
    setEditDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const { enqueueSnackbar } = useSnackbar();
  const onSubmit = useCallback(
    async (payload, callback) => {
      try {
        const { type, content, session_date } = payload;

        const recordId = id;
        if (!recordId) {
          enqueueSnackbar("Errore: ID della nota non trovato.", {
            variant: "error",
          });
          return;
        }

        const recordData = {
          title: `Nota ${entryTypes[type].label}`,
          description: content,
          notes: content,
          record_type: type,
          session_date: session_date || null,
        };

        await clinicalService.updateRecord(recordId, recordData);

        await fetchEntries();
        enqueueSnackbar("Nota modificata con successo!", {
          variant: "success",
        });
        onClose();
        callback?.();
      } catch (error) {
        enqueueSnackbar("Errore nella modifica della nota.", {
          variant: "error",
        });
      }
    },
    [enqueueSnackbar, fetchEntries, id, onClose]
  );

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2}>
            {/* Timeline indicator */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 40,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: alpha(
                    theme.palette[entryType.color].main,
                    0.1
                  ),
                  color: theme.palette[entryType.color].main,
                }}
              >
                <IconComponent sx={{ fontSize: 20 }} />
              </Avatar>
              {showDivider && (
                <Box
                  sx={{
                    width: 2,
                    height: 40,
                    backgroundColor: theme.palette.divider,
                    mt: 1,
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 0.5 }}
                  >
                    <Chip
                      label={entryType.label}
                      size="small"
                      color={entryType.color}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(session_date)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {author}
                  </Typography>
                </Box>

                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                {content}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            boxShadow: 2,
          },
        }}
      >
        <MenuItem onClick={handleDialogOpen}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Modifica
        </MenuItem>
        <ConfirmationDialog
          id={id}
          fetchEntries={fetchEntries}
          handleMenuClose={handleMenuClose}
        />
      </Menu>
      <ClinicalDiaryForm
        values={entry}
        title={"Modifica Nota Clinica"}
        buttonLabel={"Salva Modifiche"}
        onClose={onClose}
        onSubmit={onSubmit}
        open={dialogOpen}
      />
    </Box>
  );
}
function ConfirmationDialog({ id, fetchEntries, handleMenuClose }) {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeleteEntry = useCallback(
    async (entryId) => {
      try {
        await clinicalService.deleteRecord(entryId);

        await fetchEntries();
        handleClose();
        enqueueSnackbar("Nota eliminata con successo!", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("Errore nell'eliminazione della nota.", {
          variant: "error",
        });
      }
    },
    [enqueueSnackbar, fetchEntries, handleClose]
  );

  const handleConfirm = useCallback(() => {
    handleDeleteEntry(id);
  }, [handleDeleteEntry, id]);
  return (
    <>
      <MenuItem onClick={handleOpen} sx={{ color: "error.main" }}>
        <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
        Elimina
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="elimina-note-dialog-title"
        aria-describedby="elimina-note-dialog-description"
      >
        <DialogTitle id="elimina-note-dialog-title">
          {"Elimina Nota Clinica "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="elimina-note-dialog-description">
            {"Sei sicuro di voler eliminare questa nota?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
function ClinicalDiaryForm({
  values,
  onSubmit,
  open,
  onClose,
  title = "Nuova Nota Clinica",
  buttonLabel = "Salva Nota",
}) {
  const [state, setState] = useState(
    values || {
      type: "consultation",
      content: "",
      session_date: null,
    }
  );
  const [formErrors, setFormErrors] = useState({});
  const theme = useTheme();
  const { type, content, session_date } = state ?? {};
  const handleInputChange = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [formErrors]);
  const validateForm = useCallback(() => {
    const errors = {};

    if (!content || !content.trim()) {
      errors.content = "Il contenuto è obbligatorio";
    }

    if (!session_date) {
      errors.session_date = "La data della sessione è obbligatoria";
    } else if (isNaN(Date.parse(session_date))) {
      errors.session_date = "La data della sessione non è valida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [content, session_date]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: (e) => {
          e.preventDefault();
          if (validateForm()) {
            onSubmit(state, onClose);
          }
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo di Nota</InputLabel>
            <Select
              value={type}
              onChange={(e) => setState({ ...state, type: e.target.value })}
              label="Tipo di Nota"
            >
              {Object.entries(entryTypes).map(([key, type]) => (
                <MenuItem key={key} value={key}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Data Sessione *
            </Typography>
            <DateTimePicker
              value={session_date ? new Date(session_date) : null}
              onChange={(date) => {
                if (isValid(date)) {
                  handleInputChange(
                    "session_date",
                    date ? date.toISOString() : null
                  );
                } else {
                  handleInputChange("session_date", null);
                }
              }}
              format="Pp"
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: null,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(formErrors.session_date),
                  helperText: formErrors.session_date,
                  InputProps: {
                    sx: {
                      pr: 1,
                    },
                  },
                },
                openPickerButton: {
                  size: "small",
                  edge: "end",
                },
              }}
            />
          </Box>
          <TextField
            label="Contenuto"
            multiline
            rows={4}
            value={content || ""}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Descrivi l'intervento, osservazione o trattamento..."
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          type="submit"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            "&:disabled": {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }}
        >
          {buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
