import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";

import theme from "./theme/theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Componenti
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPageNew from "./pages/PatientsPageNew";
import PatientDetailPage from "./pages/PatientDetailPage";
import PatientFormPage from "./pages/PatientFormPage";
import UsersPageNew from "./pages/UsersPageNew";
import GroupsPageNew from "./pages/GroupsPageNew";
import GroupDetailPage from "./pages/GroupDetailPage";
import GroupFormPage from "./pages/GroupFormPage";
import UserFormPage from "./pages/UserFormPage";
import UserDetailPage from "./pages/UserDetailPage";
import BillingPageNew from "./pages/BillingPageNew";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceEditPage from "./pages/InvoiceEditPage";
import UserProfilePage from "./pages/UserProfilePage";
import RoleManagementPage from "./pages/RoleManagementPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

// Loading Spinner
import LoadingSpinner from "./components/LoadingSpinner";

// Componente per le rotte protette
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// App con React Router
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute requiredPermission="patients.read">
            <PatientsPageNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <ProtectedRoute requiredPermission="patients.write">
            <PatientFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute requiredPermission="patients.read">
            <PatientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id/edit"
        element={
          <ProtectedRoute requiredPermission={["patients.update", "patients.update_own"]}>
            <PatientFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="users.read">
            <UsersPageNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute requiredPermission="users.read">
            <UserDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute requiredPermission="users.write">
            <UserFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute requiredPermission="users.update">
            <UserFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute requiredPermission="groups.read">
            <GroupsPageNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/new"
        element={
          <ProtectedRoute requiredPermission="groups.write">
            <GroupFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <ProtectedRoute requiredPermission="groups.read">
            <GroupDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id/edit"
        element={
          <ProtectedRoute requiredPermission="groups.write">
            <GroupFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/new"
        element={
          <ProtectedRoute requiredPermission="billing.write">
            <CreateInvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/:id"
        element={
          <ProtectedRoute requiredPermission="billing.read">
            <InvoiceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/:id/edit"
        element={
          <ProtectedRoute requiredPermission="billing.update">
            <InvoiceEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute requiredPermission="billing.read">
            <BillingPageNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermission="administration.system.access">
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requiredPermission="administration.system.access">
            <RoleManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/patients" replace />} />
    </Routes>
  );
};

// App principale
const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </CssVarsProvider>
    </LocalizationProvider>
  );
};

export default App;
