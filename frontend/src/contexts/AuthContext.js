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
};

// Reducer per gestire lo stato
const authReducer = (state, action) => {
  console.log('🔍 DEBUG authReducer:', { action, currentState: state });
  
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      console.log('🔍 DEBUG authReducer LOGIN_SUCCESS:', { user: action.payload.user });
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
      console.log('🔍 DEBUG checkAuthStatus: Starting auth check');
      const token = localStorage.getItem('accessToken');
      console.log('🔍 DEBUG checkAuthStatus: Token exists:', !!token);
      
      if (token) {
        try {
          console.log('🔍 DEBUG checkAuthStatus: Calling getProfile');
          const response = await authService.getProfile();
          console.log('🔍 DEBUG checkAuthStatus: Profile response:', response);
          console.log('🔍 DEBUG checkAuthStatus: User data:', response.user);
          console.log('🔍 DEBUG checkAuthStatus: User role:', response.user?.role);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: response.user },
          });
        } catch (error) {
          console.error('🔍 DEBUG checkAuthStatus: Error getting profile:', error);
          // Token non valido, rimuovi dal localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        console.log('🔍 DEBUG checkAuthStatus: No token, setting loading to false');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Funzione di login
  const login = async (credentials) => {
    console.log('🔍 DEBUG login: Starting login process', { username: credentials.username });
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      console.log('🔍 DEBUG login: Calling authService.login');
      const response = await authService.login(credentials);
      console.log('🔍 DEBUG login: Login response received', { 
        hasTokens: !!response.tokens,
        hasUser: !!response.user,
        user: response.user
      });
      
      // Salva i token nel localStorage
      console.log('🔍 DEBUG login: Saving tokens to localStorage');
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      console.log('🔍 DEBUG login: Tokens saved, dispatching LOGIN_SUCCESS');
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });
      
      console.log('🔍 DEBUG login: Redirecting to /patients');
      // Redirect to patients page after successful login
      window.location.href = '/patients';
      
      return response;
    } catch (error) {
      console.error('🔍 DEBUG login: Login error', error);
      const errorMessage = error.response?.data?.error || 'Errore durante il login';
      console.log('🔍 DEBUG login: Error message', errorMessage);
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
      // Debug: Log dei dati utente
      console.log('🔍 DEBUG hasPermission:', {
        permission,
        user: state.user,
        userRole: state.user?.role,
        userPermissions: state.user?.role?.permissions,
        userRoleName: state.user?.role_name,
        userRoleId: state.user?.role_id
      });
      
      if (!state.user || !permission) {
        console.log('❌ No user or permission provided');
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
        'roles.delete': 'administration.roles.delete'
      };
      
      // Converti permesso legacy a granulare
      const granularPermission = permissionMap[permission] || permission;
      console.log('🔄 Permission mapping:', { legacy: permission, granular: granularPermission });
      
      // Usa i permessi del ruolo (non user.permissions)
      const permissions = state.user.role?.permissions;
      
      if (!permissions) {
        console.log('❌ No role permissions found');
        return false;
      }
      
      console.log('📋 Role permissions:', permissions);
      
      // Controlla se admin ha tutti i permessi
      if (typeof permissions === 'object' && permissions.all === true) {
        console.log('✅ Admin has all permissions');
        return true;
      }
      
      // Controlla permesso wildcard
      if (Array.isArray(permissions) && permissions.includes('*')) {
        console.log('✅ Wildcard permission found');
        return true;
      }
      
      // Controlla permesso specifico (formato: "area.action")
      if (Array.isArray(permissions) && permissions.includes(permission)) {
        console.log('✅ Legacy permission found in array');
        return true;
      }
      
      // Controlla permesso nell'oggetto permissions (formato granulare)
      if (typeof permissions === 'object' && !Array.isArray(permissions)) {
        const [section, area, action] = granularPermission.split('.');
        console.log('🔍 Checking granular permission:', { section, area, action });
        
        if (!section || !area || !action) {
          console.log('❌ Invalid granular permission format');
          return false;
        }
        
        // Controlla permesso granulare: permissions[section][area][action]
        const hasAccess = permissions[section] && 
                         permissions[section][area] && 
                         permissions[section][area][action] === true;
        
        console.log('🔍 Granular permission check:', {
          section: permissions[section],
          area: permissions[section]?.[area],
          action: permissions[section]?.[area]?.[action],
          result: hasAccess
        });
        
        return hasAccess;
      }
      
      console.log('❌ No matching permission found');
      return false;
    } catch (error) {
      console.error('💥 Error in hasPermission:', error, { permission, user: state.user });
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
