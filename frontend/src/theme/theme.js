import { createTheme } from '@mui/material/styles';

// 🎨 Enhanced Color Palette per Healthcare CRM
const colors = {
  // Primary - Professional Medical Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main
    600: '#2563eb',  // Dark
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    main: '#3b82f6',    // Required by Material-UI
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  
  // Secondary - Healthcare Green
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0', 
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main
    600: '#16a34a',  // Dark
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    main: '#22c55e',    // Required by Material-UI
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#ffffff',
  },

  // Medical Semantic Colors
  medical: {
    success: '#10b981',    // Verde salute/successo
    warning: '#f59e0b',    // Ambra attenzione/cautela  
    critical: '#ef4444',   // Rosso urgenza/critico
    info: '#06b6d4',       // Cyan informazione
    neutral: '#6b7280',    // Grigio neutro
  },

  // Enhanced Gray Scale
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9', 
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Background & Surface
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    elevated: '#fefefe',
    subtle: '#f1f5f9',
  },

  // Text colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b', 
    disabled: '#94a3b8',
    hint: '#cbd5e1',
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    
    primary: colors.primary,
    secondary: colors.secondary,
    
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    
    background: colors.background,
    text: colors.text,
    divider: '#e2e8f0',
    grey: colors.gray,

    // Custom medical colors
    medical: colors.medical,
  },

  // 🎭 Enhanced Typography System
  typography: {
    fontFamily: '"Roboto", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    
    // Display Typography
    h1: {
      fontSize: '3rem',        // 48px
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#1e293b',
    },
    h2: {
      fontSize: '2.25rem',     // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: '#1e293b',
    },
    h3: {
      fontSize: '1.875rem',    // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      color: '#1e293b',
    },
    h4: {
      fontSize: '1.5rem',      // 24px
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
      color: '#1e293b',
    },
    h5: {
      fontSize: '1.25rem',     // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1e293b',
    },
    h6: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 600,
      lineHeight: 1.45,
      color: '#1e293b',
    },

    // Body Typography
    body1: {
      fontSize: '1rem',        // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#334155',
    },
    body2: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 400,
      lineHeight: 1.55,
      color: '#64748b',
    },
    
    // Utility Typography
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#475569',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.45,
      color: '#64748b',
    },
    caption: {
      fontSize: '0.75rem',     // 12px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.025em',
      color: '#94a3b8',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#64748b',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },

    // Custom variants
    displayLarge: {
      fontSize: '4rem',
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
    },
    mono: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },

  // 🎨 Enhanced Border Radius
  shape: {
    borderRadius: 12,
  },

  // ✨ Advanced Shadow System
  shadows: [
    'none',
    // Level 1 - Subtle
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    // Level 2 - Small
    '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    // Level 3 - Medium  
    '0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Level 4 - Large
    '0 8px 16px 0 rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
    // Level 5 - X-Large
    '0 16px 32px 0 rgba(0, 0, 0, 0.12), 0 8px 16px 0 rgba(0, 0, 0, 0.1)',
    // Level 6 - XX-Large
    '0 24px 48px 0 rgba(0, 0, 0, 0.15), 0 12px 24px 0 rgba(0, 0, 0, 0.12)',
    // Custom elevations
    '0 32px 64px 0 rgba(0, 0, 0, 0.18), 0 16px 32px 0 rgba(0, 0, 0, 0.15)',
    ...Array(17).fill('none'),
  ],

  // 🎨 Enhanced Component Overrides
  components: {
    // 🔘 Buttons - Modern & Interactive
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          letterSpacing: '0.01em',
          padding: '12px 24px',
          minHeight: 44,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, var(--mui-palette-primary-dark) 0%, var(--mui-palette-primary-800) 100%)',
            boxShadow: '0 6px 16px 0 rgba(59, 130, 246, 0.4)',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#475569',
          borderWidth: '1.5px',
          '&:hover': {
            borderColor: '#cbd5e1',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            borderWidth: '1.5px',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.8125rem',
          minHeight: 36,
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '0.9375rem',
          minHeight: 52,
        },
      },
    },

    // 🎴 Cards - Glassmorphism & Elevation
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.08), 0 4px 8px 0 rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },

    // 📝 Forms - Enhanced Input Experience
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontSize: '0.875rem',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.01)',
              '& fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#64748b',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
        },
      },
    },

    // 🗂️ Tables - Professional Data Display
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          fontSize: '0.875rem',
          color: '#334155',
          padding: '16px',
        },
        head: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          color: '#1e293b',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
      },
    },

    // 🏗️ Layout Components
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.04)',
        },
      },
    },

    // 🎯 Interactive Elements
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: 8,
          height: 28,
          letterSpacing: '0.025em',
        },
        filled: {
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          color: '#475569',
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#64748b',
          borderWidth: '1.5px',
        },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderRadius: 12,
          margin: '2px 12px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
            borderLeft: '3px solid #3b82f6',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.16)',
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: '#64748b',
          '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
          },
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1e293b',
        },
      },
    },

    // 🎨 Utility Components
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
        },
        elevation1: {
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#64748b',
          borderRadius: 10,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            color: '#3b82f6',
            transform: 'scale(1.05)',
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
        },
      },
    },

    // 📊 Data Components
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: '#f1f5f9',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
        },
      },
    },

    // 🎭 Typography Enhanced
    MuiTypography: {
      styleOverrides: {
        h1: { fontWeight: 800, color: '#1e293b' },
        h2: { fontWeight: 700, color: '#1e293b' },
        h3: { fontWeight: 600, color: '#1e293b' },
        h4: { fontWeight: 600, color: '#1e293b' },
        h5: { fontWeight: 600, color: '#1e293b' },
        h6: { fontWeight: 600, color: '#1e293b' },
      },
    },
  },
});

export default theme;