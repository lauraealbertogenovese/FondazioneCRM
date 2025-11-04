import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  IconButton,
  Container,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  MedicalServices as MedicalIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { getMaritalStatusLabel } from "../utils/maritalStatusUtils";
import ClinicalDiary from "../components/ClinicalDiary";
import DocumentManager from "../components/DocumentManager";

// Constants
const TAB_SECTIONS = [
  { label: "Informazioni", icon: <PersonIcon />, content: "info" },
  { label: "Contatti", icon: <PhoneIcon />, content: "contacts" },
  { label: "Clinico", icon: <MedicalIcon />, content: "medical" },
  { label: "Documenti", icon: <DocumentIcon />, content: "documents" },
  { label: "Note Cliniche", icon: <AssignmentIcon />, content: "notes" },
];

// Utility functions
const getSessoColor = (sesso) => {
  const colors = { M: "primary", F: "secondary" };
  return colors[sesso] || "default";
};

const getSessoLabel = (sesso) => {
  const labels = { M: "Maschio", F: "Femmina", Altro: "Altro" };
  return labels[sesso] || sesso;
};

const calculateAge = (birthDate) => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
};

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString("it-IT") : "Non disponibile";
};

const getClinicianName = (patient) => {
  if (!patient.medico_curante_first_name || !patient.medico_curante_last_name) {
    return "Non assegnato";
  }
  const role = patient.medico_curante_role
    ? ` (${patient.medico_curante_role})`
    : "";
  return `${patient.medico_curante_first_name} ${patient.medico_curante_last_name}${role}`;
};

// Components
const LoadingSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="text" width={200} />
    </Stack>
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={400} height={20} />
    </Box>
    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
  </Container>
);

const InfoField = ({ label, value, chip = false, chipProps = {} }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
    >
      {label}
    </Typography>
    {chip ? (
      <Chip
        label={value}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 400 }}
        {...chipProps}
      />
    ) : (
      <Typography variant="body1" sx={{ fontWeight: 400 }}>
        {value || "Non disponibile"}
      </Typography>
    )}
  </Box>
);

const ConsentChip = ({
  value,
  trueLabel = "Sì",
  falseLabel = "No",
  nullLabel = "Non specificato",
}) => {
  const getChipProps = () => {
    if (value === null) {
      return {
        label: nullLabel,
        sx: {
          color: "text.primary",
          borderColor: "text.primary",
        },
      };
    }
    return {
      label: value ? trueLabel : falseLabel,
      sx: {
        color: value ? "success.main" : "error.main",
        borderColor: value ? "success.main" : "error.main",
        bgcolor: (theme) =>
          value
            ? alpha(theme.palette?.success?.main ?? "green", 0.1)
            : alpha(theme.palette?.error?.main ?? "red", 0.1),
      },
    };
  };

  return (
    <Chip
      size="small"
      variant="outlined"
      sx={{ fontWeight: 400 }}
      {...getChipProps()}
    />
  );
};

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatient(id);
      setPatient(response.patient);
    } catch (error) {
      console.error("Errore nel caricamento del paziente:", error);
      setError("Errore nel caricamento del paziente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const renderInformationTab = useCallback(
    () => (
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Informazioni Personali
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoField
              label="Nome Completo"
              value={`${patient?.nome} ${patient?.cognome}`}
            />
            <InfoField
              label="Status"
              value={patient?.is_active ? "In Cura" : "Non in Cura"}
              chip
              chipProps={{
                color: patient?.is_active ? "success" : "warning",
                sx: {
                  borderColor: patient?.is_active
                    ? "success.main"
                    : "warning.main",
                  color: patient?.is_active ? "success.main" : "warning.main",
                  bgcolor: (theme) =>
                    patient?.is_active
                      ? alpha(theme.palette?.success?.main ?? "green", 0.1)
                      : alpha(theme.palette?.warning?.main ?? "orange", 0.1),
                },
              }}
            />
            <InfoField
              label="Età"
              value={`${calculateAge(patient?.data_nascita)} anni`}
            />
            <InfoField label="Codice Fiscale" value={patient?.codice_fiscale} />
            <InfoField
              label="Data di Nascita"
              value={formatDate(patient?.data_nascita)}
            />
            <InfoField
              label="Sesso"
              value={getSessoLabel(patient?.sesso)}
              chip
              chipProps={{ color: getSessoColor(patient?.sesso) }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoField label="Telefono" value={patient?.telefono} />
            <InfoField label="Email" value={patient?.email} />
            <InfoField
              label="Clinico di Riferimento"
              value={getClinicianName(patient)}
            />
            <InfoField
              label="Tessera Sanitaria"
              value={patient?.numero_tessera_sanitaria}
            />
            <InfoField
              label="Stato Civile"
              value={getMaritalStatusLabel(patient?.stato_civile)}
            />
            <InfoField
              label="Professione"
              value={patient?.professione || "Non specificata"}
            />
          </Grid>
        </Grid>
      </Box>
    ),
    [patient]
  );

  const renderContactsTab = useCallback(
    () => (
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Informazioni di Contatto
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoField label="Telefono" value={patient?.telefono} />
            <InfoField label="Email" value={patient?.email} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoField label="Indirizzo" value={patient?.indirizzo} />
            <InfoField label="Città" value={patient?.citta} />
          </Grid>
        </Grid>
      </Box>
    ),
    [patient]
  );

  const renderMedicalTab = useCallback(
    () => (
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Informazioni Mediche
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoField
              label="Clinico di Riferimento"
              value={getClinicianName(patient)}
            />
            <InfoField
              label="Professione"
              value={patient?.professione || "Non specificata"}
            />

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
              >
                Consenso Trattamento Dati
              </Typography>
              <ConsentChip value={patient?.consenso_trattamento_dati} />
            </Box>

            {patient?.note && (
              <InfoField label="Note aggiuntive" value={patient.note} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoField
              label="D.U.S"
              value={patient?.sostanza_abuso || "Non specificata"}
            />
            <InfoField
              label="Abusi Secondari"
              value={
                patient?.abusi_secondari && patient.abusi_secondari.length > 0
                  ? patient.abusi_secondari.join(", ")
                  : "Nessuno"
              }
            />

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
              >
                Consenso Invio STS
              </Typography>
              <ConsentChip
                value={patient?.consenso_invio_sts}
                trueLabel="Acconsento"
                falseLabel="Non acconsento"
              />
            </Box>

            {patient?.diagnosi_psichiatrica && (
              <InfoField
                label="Diagnosi Psichiatrica"
                value={patient.diagnosi_psichiatrica}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    ),
    [patient]
  );

  const renderDocumentsTab = useCallback(
    () => (
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Gestione Documenti
        </Typography>
        <DocumentManager
          patientId={patient.id}
          patientName={`${patient?.nome ?? ""} ${patient?.cognome ?? ""}`}
          showUploadButton={hasPermission("documents.create")}
        />
      </Box>
    ),
    [hasPermission, patient?.cognome, patient?.id, patient?.nome]
  );

  const renderNotesTab = useCallback(
    () => (
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
        >
          Note Cliniche e Diario
        </Typography>
        <ClinicalDiary
          showAddButton={hasPermission("clinical_notes.create")}
          patientId={patient?.id}
          patientName={`${patient?.nome ?? ""} ${patient?.cognome ?? ""}`}
        />
      </Box>
    ),
    [hasPermission, patient?.cognome, patient?.id, patient?.nome]
  );

  const renderTabContent = useCallback(() => {
    if (!patient) return null;

    const tabRenderers = [
      renderInformationTab,
      renderContactsTab,
      renderMedicalTab,
      renderDocumentsTab,
      renderNotesTab,
    ];

    return tabRenderers[activeTab]?.() || null;
  }, [
    patient,
    renderInformationTab,
    renderContactsTab,
    renderMedicalTab,
    renderDocumentsTab,
    renderNotesTab,
    activeTab,
  ]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert
          severity="warning"
          sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}
        >
          Paziente non trovato
        </Alert>
      </Container>
    );
  }

  return (
    <Fade in timeout={500}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate("/patients")}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Pazienti / {patient.nome} {patient.cognome}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="700"
                color="text.primary"
                sx={{ mb: 0.5 }}
              >
                {patient.nome} {patient.cognome}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  ID: {patient.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • CF: {patient.codice_fiscale || "Non disponibile"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Registrato il {formatDate(patient.created_at)}
                </Typography>
              </Stack>
            </Box>

            {hasPermission("patients.write") && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/patients/${id}/edit`)}
                size="small"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  "&:hover": { backgroundColor: "#2563eb" },
                }}
              >
                Modifica
              </Button>
            )}
          </Stack>
        </Box>

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  minHeight: 48,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                },
                "& .Mui-selected": { color: theme.palette.primary.main },
              }}
            >
              {TAB_SECTIONS.map((section, index) => (
                <Tab
                  key={index}
                  label={section.label}
                  icon={section.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>{renderTabContent()}</Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default PatientDetailPage;
