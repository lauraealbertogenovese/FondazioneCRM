import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

export default LoadingSpinner;