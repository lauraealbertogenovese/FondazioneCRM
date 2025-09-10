import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Layout from '../../components/Layout';
import { AuthProvider } from '../../contexts/AuthContext';
import theme from '../../theme/theme';

// Mock the AuthContext
const mockAuthContext = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin'
  },
  isAuthenticated: true,
  isLoading: false,
  hasPermission: jest.fn(() => true),
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockAuthContext
}));

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/dashboard' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

const renderLayout = (children = <div>Test Content</div>) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders layout with sidebar and main content', () => {
    renderLayout();
    
    expect(screen.getByText('Fondazione CRM')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('displays user information in header', () => {
    renderLayout();
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('renders navigation menu items', () => {
    renderLayout();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pazienti')).toBeInTheDocument();
    expect(screen.getByText('Profili Clinici')).toBeInTheDocument();
    expect(screen.getByText('Gruppi di Supporto')).toBeInTheDocument();
  });

  test('handles menu item click navigation', () => {
    renderLayout();
    
    const patientsMenuItem = screen.getByText('Pazienti');
    fireEvent.click(patientsMenuItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/patients');
  });

  test('handles logout functionality', () => {
    renderLayout();
    
    // Find and click the user menu button
    const userMenuButton = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(userMenuButton);
    
    // Find and click logout option
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('applies active styling to current page', () => {
    // Mock location to dashboard
    mockLocation.pathname = '/dashboard';
    
    renderLayout();
    
    const dashboardItem = screen.getByText('Dashboard').closest('div');
    expect(dashboardItem).toHaveClass('Mui-selected');
  });

  test('shows only menu items user has permission for', () => {
    // Mock limited permissions
    mockAuthContext.hasPermission.mockImplementation((permission) => {
      return permission === 'patients.read';
    });
    
    renderLayout();
    
    expect(screen.getByText('Pazienti')).toBeInTheDocument();
    expect(screen.queryByText('Utenti')).not.toBeInTheDocument();
  });

  test('renders responsive drawer for mobile', () => {
    // Mock mobile breakpoint
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });
    
    renderLayout();
    
    // Should still render the layout
    expect(screen.getByText('Fondazione CRM')).toBeInTheDocument();
  });

  test('handles page title updates', () => {
    renderLayout();
    
    // Click on a menu item to update title
    const clinicalMenuItem = screen.getByText('Profili Clinici');
    fireEvent.click(clinicalMenuItem);
    
    expect(screen.getByText('Profili Clinici')).toBeInTheDocument();
  });
});
