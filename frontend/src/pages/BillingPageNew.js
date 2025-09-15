import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  useTheme,
  Chip,
  Divider,
  Paper,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Filter as FilterIcon,
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Cancel as OverdueIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/api';


const BillingPageNew = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check permissions
  useEffect(() => {
    if (!hasPermission('billing.read')) {
      navigate('/dashboard');
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await billingService.getInvoices({
        limit: 100,
        patient: searchTerm
      });
      setBillings(response.data || []);
    } catch (error) {
      console.error('Error fetching billings:', error);
      setError('Errore nel caricamento delle fatture');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, billing) => {
    setAnchorEl(event.currentTarget);
    setSelectedBilling(billing);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBilling(null);
  };


  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Pagato',
      pending: 'In attesa',
      overdue: 'Scaduto'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning', 
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      paid: <PaidIcon />,
      pending: <PendingIcon />,
      overdue: <OverdueIcon />
    };
    return icons[status] || <PendingIcon />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredBillings = billings.filter(billing => {
    const matchesSearch = !searchTerm || 
      billing.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedBillings = filteredBillings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        {/* Enhanced Search & Filters */}
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="Cerca per paziente o numero fattura..."
            value={searchTerm}
            onChange={handleSearch}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.grey[50], 0.8),
                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[100], 0.8),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  border: `1px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
              }
            }}
          />
          
          {hasPermission('billing.create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="medium"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                backgroundColor: theme.palette.primary.main,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => navigate('/billing/new')}
            >
              Nuova Fattura
            </Button>
          )}
        </Stack>
      </Box>


      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numero Fattura</TableCell>
                <TableCell>Paziente</TableCell>
                <TableCell>Descrizione</TableCell>
                <TableCell align="right">Importo</TableCell>
                <TableCell>Data Emissione</TableCell>
                <TableCell>Data Pagamento</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ height: 20, backgroundColor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedBillings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'Nessuna fattura trovata' : 'Nessuna fattura presente'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBillings.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ReceiptIcon color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {billing.invoice_number}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {billing.patient_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {billing.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatAmount(billing.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(billing.issue_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(billing.payment_date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={(e) => handleMenuOpen(e, billing)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredBillings.length > 0 && (
          <TablePagination
            component="div"
            count={filteredBillings.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Righe per pagina:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}–${to} di ${count}`
            }
          />
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate(`/billing/${selectedBilling?.id}`)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Visualizza Dettagli
        </MenuItem>
        {hasPermission('billing.update') && (
          <MenuItem onClick={() => navigate(`/billing/${selectedBilling?.id}/edit`)}>
            <EditIcon sx={{ mr: 1 }} />
            Modifica
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default BillingPageNew;