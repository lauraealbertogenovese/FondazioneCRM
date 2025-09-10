import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Collapse,
  IconButton,
  Slider,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const AdvancedFilter = ({ 
  onFilterChange, 
  filterConfig = [], 
  initialFilters = {}, 
  showSearch = true,
  searchPlaceholder = "Cerca...",
  compact = false 
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState(initialFilters);
  const [expanded, setExpanded] = useState(!compact);
  const [searchTerm, setSearchTerm] = useState('');

  // Age range specific state
  const [ageRange, setAgeRange] = useState([18, 65]);

  useEffect(() => {
    // Notify parent of filter changes
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          acc[key] = value;
        } else if (!Array.isArray(value)) {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    if (searchTerm) {
      activeFilters.search = searchTerm;
    }

    if (filters.ageRange && (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 65)) {
      activeFilters.ageRange = ageRange;
    }

    onFilterChange(activeFilters);
  }, [filters, searchTerm, ageRange, onFilterChange]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setAgeRange([18, 65]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });
    if (searchTerm) count++;
    if (ageRange[0] !== 18 || ageRange[1] !== 65) count++;
    return count;
  };

  const renderFilterField = (config) => {
    const { field, label, type, options, placeholder, multiple = false } = config;
    const value = filters[field] || (multiple ? [] : '');

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth key={field}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFilterChange(field, e.target.value)}
              label={label}
              multiple={multiple}
              renderValue={multiple ? (selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={options.find(o => o.value === value)?.label || value} size="small" />
                  ))}
                </Box>
              ) : undefined}
            >
              <MenuItem value="">
                <em>{multiple ? 'Nessuna selezione' : 'Tutti'}</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {multiple && (
                    <Checkbox checked={value.includes(option.value)} />
                  )}
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            key={field}
            multiple={multiple}
            options={options}
            getOptionLabel={(option) => option.label}
            value={multiple ? 
              options.filter(o => value.includes(o.value)) : 
              options.find(o => o.value === value) || null
            }
            onChange={(event, newValue) => {
              if (multiple) {
                handleFilterChange(field, newValue.map(v => v.value));
              } else {
                handleFilterChange(field, newValue?.value || '');
              }
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option.label} {...getTagProps({ index })} key={option.value} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label={label} placeholder={placeholder} />
            )}
          />
        );

      case 'text':
        return (
          <TextField
            key={field}
            label={label}
            value={value}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            placeholder={placeholder}
            fullWidth
          />
        );

      case 'date':
        return (
          <TextField
            key={field}
            label={label}
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        );

      case 'dateRange':
        return (
          <Grid container spacing={1} key={field}>
            <Grid item xs={6}>
              <TextField
                label={`${label} - Da`}
                type="date"
                value={value?.from || ''}
                onChange={(e) => handleFilterChange(field, { ...value, from: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${label} - A`}
                type="date"
                value={value?.to || ''}
                onChange={(e) => handleFilterChange(field, { ...value, to: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case 'ageRange':
        return (
          <Box key={field}>
            <Typography gutterBottom>{label}</Typography>
            <Slider
              value={ageRange}
              onChange={(event, newValue) => {
                setAgeRange(newValue);
                handleFilterChange(field, newValue);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              marks={[
                { value: 0, label: '0' },
                { value: 18, label: '18' },
                { value: 35, label: '35' },
                { value: 50, label: '50' },
                { value: 65, label: '65' },
                { value: 100, label: '100+' }
              ]}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  backgroundColor: theme.palette.primary.main,
                },
                '& .MuiSlider-track': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Età: {ageRange[0]} - {ageRange[1]} anni
            </Typography>
          </Box>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field}
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleFilterChange(field, e.target.checked)}
                color="primary"
              />
            }
            label={label}
          />
        );

      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card 
      elevation={0}
      sx={{ 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)} 0%, ${alpha(theme.palette.grey[100], 0.3)} 100%)`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtri Avanzati
            </Typography>
            {activeFilterCount > 0 && (
              <Chip 
                label={`${activeFilterCount} attivi`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            {activeFilterCount > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                color="secondary"
              >
                Pulisci
              </Button>
            )}
            {compact && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Search Field */}
        {showSearch && (
          <TextField
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        )}

        {/* Filter Fields */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {filterConfig.map((config) => (
              <Grid item xs={12} sm={config.width || 6} md={config.width || 4} key={config.field}>
                {renderFilterField(config)}
              </Grid>
            ))}
          </Grid>
        </Collapse>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Filtri Attivi:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {searchTerm && (
                <Chip
                  label={`Ricerca: "${searchTerm}"`}
                  size="small"
                  onDelete={() => setSearchTerm('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {Object.entries(filters).map(([key, value]) => {
                if (value === '' || value === null || value === undefined) return null;
                if (Array.isArray(value) && value.length === 0) return null;
                
                const config = filterConfig.find(c => c.field === key);
                if (!config) return null;

                let displayValue = value;
                if (config.type === 'select' && config.options) {
                  if (Array.isArray(value)) {
                    displayValue = value.map(v => config.options.find(o => o.value === v)?.label || v).join(', ');
                  } else {
                    displayValue = config.options.find(o => o.value === value)?.label || value;
                  }
                } else if (config.type === 'dateRange' && typeof value === 'object') {
                  displayValue = `${value.from || ''} - ${value.to || ''}`;
                } else if (config.type === 'ageRange' && Array.isArray(value)) {
                  displayValue = `${value[0]}-${value[1]} anni`;
                }

                return (
                  <Chip
                    key={key}
                    label={`${config.label}: ${displayValue}`}
                    size="small"
                    onDelete={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilter;