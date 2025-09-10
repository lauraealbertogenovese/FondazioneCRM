import React from 'react';
import {
  Container,
  Typography,
  useTheme,
  Fade,
  Box,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import ProfessionalScheduler from '../components/ProfessionalScheduler';


const CalendarPage = () => {
  const theme = useTheme();

  return (
    <Fade in timeout={800}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CalendarIcon sx={{ fontSize: 40 }} />
            Calendario Appuntamenti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestione completa degli appuntamenti con viste multiple e filtri avanzati
          </Typography>
        </Box>

        {/* Professional Scheduler Component */}
        <ProfessionalScheduler />
      </Container>
    </Fade>
  );
};

export default CalendarPage;