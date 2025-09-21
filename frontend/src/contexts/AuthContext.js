import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { authService } from "../services/api";

// Stato iniziale
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipi di azioni
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
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
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const response = await authService.getProfile();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: response.user },
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          // Token non valido, rimuovi dal localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Funzione di login
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.login(credentials);

      // Salva i token nel localStorage
      localStorage.setItem("accessToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user },
      });

      // Redirect to dashboard after successful login
      window.location.href = "/dashboard";

      return response;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "Errore durante il login";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      // Throw a new error with the formatted message for the UI
      const uiError = new Error(errorMessage);
      uiError.originalError = error;
      throw uiError;
    }
  }, []);

  // Funzione di logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      // Rimuovi i token dal localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      // Redirect to login page after logout
      window.location.href = "/login";
    }
  }, []);

  // Funzione per aggiornare i dati utente
  const updateUser = useCallback(
    (userData) => {
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData,
      });
    },
    [dispatch]
  );

  // Funzione per registrare un nuovo utente
  const register = useCallback(
    async (userData) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      try {
        const response = await authService.register(userData);

        // Salva i token nel localStorage
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.user },
        });

        return response;
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || "Errore durante la registrazione";
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMessage },
        });
        throw error;
      }
    },
    [dispatch]
  );

  // Funzione per pulire gli errori
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  // Funzione per verificare se l'utente ha un determinato ruolo
  const hasRole = useCallback(
    (role) => {
      return state.user?.role_name === role;
    },
    [state.user]
  );

  // Funzione per verificare se l'utente ha un determinato permesso
  const hasPermission = useCallback(
    (permission) => {
      try {
        if (!state.user || !permission) {
          return false;
        }

        // Legacy to granular permission map
        const permissionMap = {
          // Pazienti
          "patients.read": "pages.patients.access",
          "patients.create": "pages.patients.create",
          "patients.write": "pages.patients.create",
          "patients.update": "pages.patients.edit_all",
          "patients.update_own": "pages.patients.edit_own",
          "patients.delete": "pages.patients.delete",

          // Note cliniche
          "clinical_notes.read": "pages.clinical_notes.access",
          "clinical_notes.create": "pages.clinical_notes.create",
          "clinical_notes.update": "pages.clinical_notes.edit_own",
          "clinical_notes.delete": "pages.clinical_notes.delete",
          "clinical.read": "pages.clinical_notes.access",
          "clinical.write": "pages.clinical_notes.create",
          "clinical.update": "pages.clinical_notes.edit_own",
          "clinical.delete": "pages.clinical_notes.delete",

          // Gruppi
          "groups.read": "pages.groups.access",
          "groups.create": "pages.groups.create",
          "groups.write": "pages.groups.create",
          "groups.update": "pages.groups.edit_own",
          "groups.delete": "pages.groups.delete",
          "groups.assign": "pages.groups.manage_members",

          // Fatturazione
          "billing.read": "pages.billing.access",
          "billing.create": "pages.billing.create_invoices",
          "billing.write": "pages.billing.create_invoices",
          "billing.update": "pages.billing.edit_invoices",
          "billing.delete": "pages.billing.delete_invoices",

          // Utenti
          "users.read": "administration.users.access",
          "users.create": "administration.users.create",
          "users.write": "administration.users.create",
          "users.update": "administration.users.edit",
          "users.delete": "administration.users.delete",
          "users.view_permissions": "administration.users.view_permissions",
          "users.edit_permissions": "administration.users.edit_permissions",

          // Ruoli
          "roles.read": "administration.roles.access",
          "roles.create": "administration.roles.create",
          "roles.write": "administration.roles.create",
          "roles.update": "administration.roles.edit",
          "roles.delete": "administration.roles.delete",
          "roles.assign": "administration.roles.assign",
          "roles.manage_permissions": "administration.roles.manage_permissions",

          // Documenti
          "documents.create": "features.documents.upload",
          "documents.read": "features.documents.download",
          "documents.download": "features.documents.download",
          "documents.delete": "features.documents.delete",
          "documents.manage_versions": "features.documents.manage_versions",

          // Amministrazione
          admin: "administration.system.access",
          "administration.system.access": "administration.system.access",
        };

        // Accept string or array
        const perms = Array.isArray(permission) ? permission : [permission];

        // Use role permissions (not user.permissions)
        const permissions = state.user.role?.permissions;

        if (!permissions) {
          return false;
        }

        // Admin: all permissions
        if (typeof permissions === "object" && permissions.all === true) {
          return true;
        }

        // Wildcard
        if (Array.isArray(permissions) && permissions.includes("*")) {
          return true;
        }

        // Check each permission in the array
        for (let perm of perms) {
          // Map legacy to granular
          const granularPermission = permissionMap[perm] || perm;

          // Array permissions (legacy)
          if (Array.isArray(permissions) && permissions.includes(perm)) {
            return true;
          }

          // Object permissions (granular)
          if (typeof permissions === "object" && !Array.isArray(permissions)) {
            const keys = granularPermission.split(".");
            let current = permissions;
            let found = true;
            for (const key of keys) {
              if (current[key] === undefined) {
                found = false;
                break;
              }
              current = current[key];
            }
            if (found && current === true) {
              return true;
            }
          }
        }

        return false;
      } catch (error) {
        console.error("Error in hasPermission:", error);
        return false;
      }
    },
    [state.user]
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      register,
      clearError,
      updateUser,
      hasRole,
      hasPermission,
    }),
    [
      state,
      login,
      logout,
      register,
      clearError,
      updateUser,
      hasRole,
      hasPermission,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook per utilizzare il context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth deve essere utilizzato all'interno di un AuthProvider"
    );
  }
  return context;
};

export default AuthContext;
