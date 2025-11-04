import { Box, Container, Stack, Skeleton, alpha, useTheme } from '@mui/material';

const LoadingSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" width={500} height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={160} height={56} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Box sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
          <Stack direction="row" spacing={2}>
            {['Paziente', 'Età', 'Contatti', 'Codice Fiscale', 'Stato', 'Consenso', 'Data Inizio', ''].map((header, index) => (
              <Skeleton key={index} variant="text" width={index === 0 ? 150 : index === 7 ? 60 : 100} height={24} />
            ))}
          </Stack>
        </Box>
        
        {Array.from({ length: 10 }).map((_, index) => (
          <Box key={index} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Pagination Skeleton */}
      <Box sx={{ 
        mt: 0,
        p: 2, 
        backgroundColor: alpha(theme.palette.grey[50], 0.3),
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width={150} height={20} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};

export default LoadingSkeleton;