import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  AdminPanelSettings as AdminIcon,
  Monitor as MonitorIcon,
  Assessment as AnalyticsIcon,
  Storage as DatabaseIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Backup as BackupIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import RoleManagementPage from "./RoleManagementPage";
import systemService from "../services/systemService";

// System Configuration Component
const SystemConfigurationSection = () => {
  const [systemSettings, setSystemSettings] = useState({
    applicationName: "FondazioneCRM",
    organizationName: "Fondazione per il Recupero",
    systemEmail: "admin@fondazione.org",
    timezone: "Europe/Rome",
    language: "it",
  });

  const handleSettingChange = (setting, value) => {
    setSystemSettings((prev) => ({ ...prev, [setting]: value }));
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Configurazione Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestisci le impostazioni generali del sistema e dell'organizzazione
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Impostazioni Applicazione
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configurazione generale dell'applicazione
                </Typography>
              </Box>

              <TextField
                label="Nome Applicazione"
                value={systemSettings.applicationName}
                onChange={(e) =>
                  handleSettingChange("applicationName", e.target.value)
                }
                fullWidth
              />

              <TextField
                label="Nome Organizzazione"
                value={systemSettings.organizationName}
                onChange={(e) =>
                  handleSettingChange("organizationName", e.target.value)
                }
                fullWidth
              />

              <TextField
                label="Email Sistema"
                value={systemSettings.systemEmail}
                onChange={(e) =>
                  handleSettingChange("systemEmail", e.target.value)
                }
                type="email"
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Fuso Orario</InputLabel>
                <Select
                  value={systemSettings.timezone}
                  onChange={(e) =>
                    handleSettingChange("timezone", e.target.value)
                  }
                >
                  <MenuItem value="Europe/Rome">Europe/Rome (GMT+1)</MenuItem>
                  <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
                  <MenuItem value="America/New_York">
                    America/New_York (GMT-5)
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Lingua</InputLabel>
                <Select
                  value={systemSettings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                >
                  <MenuItem value="it">Italiano</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Security & Access Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Sicurezza e Accesso
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Impostazioni di sicurezza e controllo accessi
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Nota:</strong> Le funzionalità di configurazione
                  avanzata sono in fase di sviluppo. Attualmente sono
                  disponibili solo le impostazioni di base dell'applicazione.
                </Typography>
              </Alert>
            </Stack>
          </Paper>
        </Grid>

        {/* Save Settings */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => {
                console.log("Saving system settings:", systemSettings);
                // TODO: Implement actual save functionality
              }}
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": { backgroundColor: "#2563eb" },
              }}
            >
              Salva Configurazione
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

// System Monitoring Component
const SystemMonitoringSection = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [serviceStatus, setServiceStatus] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load real system data
  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [health, services, stats, dbStatus] = await Promise.all([
        systemService.getSystemHealth(),
        systemService.getServiceStatus(),
        systemService.getSystemStatistics(),
        systemService.getDatabaseStatus(),
      ]);

      setSystemHealth(health);
      setServiceStatus(services);
      setSystemStats(stats);
      setDatabaseStatus(dbStatus);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading system data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (uptimeStr) => {
    if (!uptimeStr || uptimeStr === "Unknown") return "Sconosciuto";
    return uptimeStr;
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case "online":
        return "success.main";
      case "offline":
        return "error.main";
      case "error":
        return "warning.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Monitoraggio Sistema
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1" color="text.secondary">
            Stato in tempo reale dei servizi e delle performance del sistema
          </Typography>
          {lastUpdated && (
            <Chip
              label={`Ultimo aggiornamento: ${lastUpdated.toLocaleTimeString()}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Caricamento dati sistema...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* System Health Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Uptime Sistema
                </Typography>
                <Typography variant="h5" fontWeight={600} color="success.main">
                  {formatUptime(systemHealth?.uptime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pazienti Totali
                </Typography>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {systemStats?.totalPatients || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Cartelle Cliniche
                </Typography>
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {systemStats?.totalRecords || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Gruppi Attivi
                </Typography>
                <Typography variant="h5" fontWeight={600} color="success.main">
                  {systemStats?.totalGroups || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Database Status */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider", mb: 2 }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Stato Database
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor:
                      databaseStatus?.status === "connected"
                        ? "success.main"
                        : "error.main",
                  }}
                />
                <Typography variant="body1">PostgreSQL Database</Typography>
                <Chip
                  label={
                    databaseStatus?.status === "connected"
                      ? "Connesso"
                      : "Errore"
                  }
                  size="small"
                  color={
                    databaseStatus?.status === "connected" ? "success" : "error"
                  }
                />
                {databaseStatus?.responseTime && (
                  <Typography variant="body2" color="text.secondary">
                    Tempo risposta: {databaseStatus.responseTime}ms
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Service Status */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Stato Microservizi
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadSystemData}
                  disabled={loading}
                >
                  Aggiorna
                </Button>
              </Stack>

              <Stack spacing={2}>
                {serviceStatus.length > 0 ? (
                  serviceStatus.map((service) => (
                    <Stack
                      key={service.name}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: getServiceStatusColor(
                              service.status
                            ),
                          }}
                        />
                        <Typography variant="body1">{service.name}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={
                            service.status === "online"
                              ? "Online"
                              : service.status === "offline"
                              ? "Offline"
                              : "Errore"
                          }
                          size="small"
                          color={
                            service.status === "online"
                              ? "success"
                              : service.status === "offline"
                              ? "error"
                              : "warning"
                          }
                        />
                        <Typography variant="body2" color="text.secondary">
                          :{service.port}
                        </Typography>
                        {service.responseTime && (
                          <Typography variant="body2" color="text.secondary">
                            {service.responseTime}ms
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nessun servizio rilevato o errore nel caricamento
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
};

const AdminSettingsPage = () => {
  const { hasPermission } = useAuth();
  const [selectedSection, setSelectedSection] = useState("roles");

  const adminSections = [
    {
      key: "roles",
      label: "Gestione Ruoli",
      icon: <SecurityIcon />,
      description: "Amministrazione ruoli utenti e permessi",
      permission: "admin",
      component: <RoleManagementPage embedded={true} />,
      category: "Sicurezza",
    },
    {
      key: "system",
      label: "Configurazione Sistema",
      icon: <SettingsIcon />,
      description: "Impostazioni generali del sistema",
      permission: "admin",
      component: <SystemConfigurationSection />,
      category: "Sistema",
    },
    {
      key: "monitoring",
      label: "Monitoraggio Sistema",
      icon: <MonitorIcon />,
      description: "Stato e performance del sistema",
      permission: "admin",
      component: <SystemMonitoringSection />,
      category: "Sistema",
    },
  ];

  // Filter sections based on permissions
  const availableSections = adminSections.filter(
    (section) => !section.permission || hasPermission(section.permission)
  );

  if (!hasPermission("admin")) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <AdminIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Accesso Negato
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Non hai i permessi necessari per accedere al pannello di
            amministrazione.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const selectedSectionData = availableSections.find(
    (section) => section.key === selectedSection
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Amministrazione
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Pannello di controllo per la configurazione del sistema
          </Typography>
        </Box>
        <Chip
          icon={<AdminIcon />}
          label="Amministratore"
          color="error"
          variant="outlined"
        />
      </Stack>

      {/* Horizontal Navigation Tabs */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Pannello Amministrazione
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configurazione e gestione sistema
          </Typography>
        </Box>

        <Box sx={{ px: 2, py: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: "auto",
              py:0.25,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-track": { bgcolor: "grey.100" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "grey.400",
                borderRadius: 2,
              },
            }}
          >
            {availableSections.map((section) => (
              <Button
                key={section.key}
                variant={
                  selectedSection === section.key ? "contained" : "outlined"
                }
                onClick={() => setSelectedSection(section.key)}
                disabled={section.disabled}
                startIcon={section.icon}
                sx={{
                  minWidth: "auto",
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: selectedSection === section.key ? 600 : 500,
                  whiteSpace: "nowrap",
                  "&.Mui-disabled": {
                    opacity: 0.6,
                  },
                   "&:hover": {
                      boxShadow: (t) => t.shadows?.[0],
                    },
                  ...(selectedSection === section.key && {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                      boxShadow: (t) => t.shadows?.[0],
                    },
                  }),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "inherit" }}>
                    {section.label}
                  </Typography>
                  {section.disabled && (
                    <Chip
                      label="Presto"
                      size="small"
                      color="default"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        ml: 1,
                      }}
                    />
                  )}
                </Box>
              </Button>
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box>{selectedSectionData && selectedSectionData.component}</Box>
    </Container>
  );
};

export default AdminSettingsPage;
