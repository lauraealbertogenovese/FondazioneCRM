import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Stato iniziale
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipi di azioni
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer per gestire lo stato
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Creazione del context
const AuthContext = createContext();

// Provider del context
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verifica se l'utente è già autenticato al caricamento dell'app
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const response = await authService.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: response.user },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token non valido, rimuovi dal localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Funzione di login
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.login(credentials);
      
      // Salva i token nel localStorage
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });
      
      // Redirect to patients page after successful login
      window.location.href = '/patients';
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Errore durante il login';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      
      // Throw a new error with the formatted message for the UI
      const uiError = new Error(errorMessage);
      uiError.originalError = error;
      throw uiError;
    }
  };

  // Funzione di logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Rimuovi i token dal localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Redirect to login page after logout
      window.location.href = '/login';
    }
  };

  // Funzione per aggiornare i dati utente
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Funzione per registrare un nuovo utente
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.register(userData);
      
      // Salva i token nel localStorage
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Errore durante la registrazione';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      throw error;
    }
  };

  // Funzione per pulire gli errori
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Funzione per verificare se l'utente ha un determinato ruolo
  const hasRole = (role) => {
    return state.user?.role_name === role;
  };

  // Funzione per verificare se l'utente ha un determinato permesso
  const hasPermission = (permission) => {
    try {
      if (!state.user || !permission) {
        return false;
      }
      
      // Mappa permessi legacy a permessi granulari
      const permissionMap = {
        'patients.read': 'pages.patients.access',
        'patients.write': 'pages.patients.create',
        'patients.update': 'pages.patients.edit',
        'patients.delete': 'pages.patients.delete',
        'clinical.read': 'pages.clinical.access',
        'clinical.write': 'pages.clinical.create_records',
        'clinical.update': 'pages.clinical.edit_own_records',
        'groups.read': 'pages.groups.access',
        'groups.write': 'pages.groups.create',
        'groups.update': 'pages.groups.edit',
        'groups.delete': 'pages.groups.delete',
        'groups.assign': 'pages.groups.manage_members',
        'billing.read': 'pages.billing.access',
        'billing.write': 'pages.billing.create',
        'billing.update': 'pages.billing.edit',
        'billing.delete': 'pages.billing.delete',
        'users.read': 'administration.users.access',
        'users.write': 'administration.users.create',
        'users.update': 'administration.users.edit',
        'users.delete': 'administration.users.delete',
        'roles.read': 'administration.roles.access',
        'roles.write': 'administration.roles.create',
        'roles.update': 'administration.roles.edit',
        'roles.delete': 'administration.roles.delete',
        'documents.create': 'features.documents.upload',
        'documents.delete': 'features.documents.delete',
        'documents.download': 'features.documents.download',
        'documents.upload_sensitive': 'features.documents.upload_sensitive',
        'documents.manage_versions': 'features.documents.manage_versions',
        'administration.system.access': 'administration.system.access'
      };
      
      // Converti permesso legacy a granulare
      const granularPermission = permissionMap[permission] || permission;
      
      // Usa i permessi del ruolo (non user.permissions)
      const permissions = state.user.role?.permissions;
      
      if (!permissions) {
        return false;
      }
      
      // Controlla se admin ha tutti i permessi
      if (typeof permissions === 'object' && permissions.all === true) {
        return true;
      }
      
      // Controlla permesso wildcard
      if (Array.isArray(permissions) && permissions.includes('*')) {
        return true;
      }
      
      // Controlla permesso specifico (formato: "area.action")
      if (Array.isArray(permissions) && permissions.includes(permission)) {
        return true;
      }
      
      // Controlla permesso nell'oggetto permissions (formato granulare)
      if (typeof permissions === 'object' && !Array.isArray(permissions)) {
        const [section, area, action] = granularPermission.split('.');
        
        if (!section || !area || !action) {
          return false;
        }
        
        // Controlla permesso granulare: permissions[section][area][action]
        return permissions[section] && 
               permissions[section][area] && 
               permissions[section][area][action] === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    clearError,
    hasRole,
    hasPermission,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook per utilizzare il context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};

export default AuthContext;
