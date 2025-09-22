import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  useTheme,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Groups as GroupsIcon,
  Receipt as ReceiptIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as MedicalIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Psychology as PsychologyIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const sections = [
    {
      title: "👥 Gestione Pazienti",
      path: "/patients",
      permission: "patients.read",
      icon: <PeopleIcon color="primary" />,
      description: "Il cuore della piattaforma per la gestione dei pazienti in cura per dipendenze.",
      features: [
        "Registrazione completa dati anagrafici e sanitari",
        "Gestione sostanze di abuso primarie e secondarie",
        "Assegnazione clinico di riferimento",
        "Ricerca avanzata per nome, codice fiscale, email",
        "Visualizzazione dettagliata profilo paziente",
        "Note cliniche integrate per ogni paziente"
      ]
    },
    {
      title: "🧠 Note Cliniche", 
      path: "/patients",
      permission: "clinical_notes.read",
      icon: <MedicalIcon color="secondary" />,
      description: "Sistema di documentazione clinica per il monitoraggio dei progressi terapeutici.",
      features: [
        "Creazione note cliniche dettagliate",
        "Cronologia completa per ogni paziente",
        "Categorie di note personalizzabili",
        "Sistema di permessi per accesso controllato",
        "Integrazione con profilo paziente",
        "Ricerca e filtri nelle note"
      ]
    },
    {
      title: "👫 Gruppi di Supporto",
      path: "/groups", 
      permission: "groups.read",
      icon: <GroupsIcon color="success" />,
      description: "Organizzazione e gestione dei gruppi di supporto psicologico per il recupero.",
      features: [
        "Creazione gruppi tematici di supporto",
        "Assegnazione conduttori e membri",
        "Gestione calendario attività di gruppo",
        "Monitoraggio partecipazione pazienti",
        "Documentazione sessioni di gruppo",
        "Comunicazione interna al gruppo"
      ]
    },
    {
      title: "💰 Fatturazione",
      path: "/billing",
      permission: "billing.read", 
      icon: <ReceiptIcon color="warning" />,
      description: "Sistema completo per la gestione economica e fatturazione dei servizi.",
      features: [
        "Creazione fatture automatiche",
        "Gestione pagamenti e scadenze",
        "Storico finanziario per paziente",
        "Report economici e statistiche",
        "Integrazione con sistemi contabili",
        "Gestione metodi di pagamento"
      ]
    },
    {
      title: "👨‍💼 Gestione Utenti",
      path: "/users",
      permission: "users.read",
      icon: <AdminIcon color="info" />,
      description: "Amministrazione del personale e gestione accessi alla piattaforma.",
      features: [
        "Registrazione staff medico e amministrativo", 
        "Sistema ruoli e permessi granulari",
        "Profili personalizzabili per tipologia utente",
        "Gestione credenziali e sicurezza",
        "Permessi specifici per funzionalità",
        "Audit log delle attività utenti"
      ]
    },
    {
      title: "🔐 Amministrazione",
      path: "/admin",
      permission: "admin",
      icon: <SecurityIcon color="error" />,
      description: "Pannello di controllo avanzato per la configurazione del sistema.",
      features: [
        "Configurazione ruoli e permessi sistema",
        "Gestione template permessi predefiniti",
        "Impostazioni sicurezza e privacy",
        "Configurazione sistema notifiche", 
        "Backup e manutenzione dati",
        "Monitoraggio performance sistema"
      ]
    }
  ];

  const quickActions = [
    {
      title: "Nuovo Paziente",
      path: "/patients/new",
      permission: "patients.write", 
      icon: <PersonAddIcon />,
      color: "primary",
      description: "Registra un nuovo paziente nel sistema"
    },
    {
      title: "Nuovo Gruppo",
      path: "/groups/new",
      permission: "groups.create",
      icon: <GroupsIcon />, 
      color: "success",
      description: "Crea un nuovo gruppo di supporto"
    },
    {
      title: "Nuovo Utente",
      path: "/users/new",
      permission: "users.write",
      icon: <AdminIcon />,
      color: "info", 
      description: "Aggiungi un nuovo membro dello staff"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Benvenuto nella Piattaforma CRM
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Sistema di gestione per fondazioni di assistenza conduttorica e recupero dipendenze
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ciao <strong>{user?.first_name} {user?.last_name}</strong>, 
          sei connesso come <Chip label={user?.role_name || 'Utente'} size="small" color="primary" sx={{ ml: 1 }} />
        </Typography>
      </Box>

      {/* Quick Actions */}
      {quickActions.some(action => !action.permission || hasPermission(action.permission)) && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ArrowForwardIcon sx={{ mr: 1 }} />
              Azioni Rapide
            </Typography>
            <Grid container spacing={2}>
              {quickActions
                .filter(action => !action.permission || hasPermission(action.permission))
                .map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{ 
                      py: 2,
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: `${theme.palette[action.color].main}10`
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Sections */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📚 Guida alle Funzionalità
      </Typography>
      
      <Grid container spacing={3}>
        {sections
          .filter(section => !section.permission || hasPermission(section.permission))
          .map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ height: '100%', p: 3 }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {section.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {section.description}
                  </Typography>

                  <Divider />

                  {/* Features List */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Funzionalità principali:
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {section.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5, pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <AssignmentIcon fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="outlined"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(section.path)}
                    sx={{ mt: 'auto' }}
                  >
                    Accedi alla sezione
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer Info */}
      <Card sx={{ mt: 4, backgroundColor: theme.palette.grey[50] }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Informazioni sulla Piattaforma
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Questa piattaforma è stata progettata specificatamente per fondazioni e centri di assistenza 
            conduttorica che si occupano di recupero dalle dipendenze. Il sistema integra gestione pazienti, 
            documentazione clinica, supporto di gruppo e amministrazione in un'unica soluzione sicura e completa.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;