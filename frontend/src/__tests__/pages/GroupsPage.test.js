import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import GroupsPage from '../../pages/GroupsPage';
import { AuthProvider } from '../../contexts/AuthContext';
import theme from '../../theme/theme';
import * as api from '../../services/api';

// Mock the AuthContext
const mockAuthContext = {
  user: {
    id: 1,
    username: 'testuser',
    role: 'admin'
  },
  isAuthenticated: true,
  isLoading: false,
  hasPermission: jest.fn(() => true)
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockAuthContext
}));

// Mock the API services
jest.mock('../../services/api', () => ({
  groupService: {
    getGroups: jest.fn(),
    getGroupStatistics: jest.fn(),
    deleteGroup: jest.fn()
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderGroupsPage = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <GroupsPage />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('GroupsPage Component', () => {
  const mockGroups = [
    {
      id: 1,
      name: 'Test Group 1',
      description: 'Test description 1',
      group_type: 'support',
      status: 'active',
      member_count: 5,
      max_members: 10,
      start_date: '2025-01-01',
      meeting_frequency: 'weekly',
      created_by_username: 'admin'
    },
    {
      id: 2,
      name: 'Test Group 2',
      description: 'Test description 2',
      group_type: 'therapy',
      status: 'inactive',
      member_count: 3,
      max_members: 8,
      start_date: '2025-02-01',
      meeting_frequency: 'biweekly',
      created_by_username: 'admin'
    }
  ];

  const mockStatistics = {
    total_groups: 10,
    active_groups: 8,
    inactive_groups: 1,
    archived_groups: 1,
    avg_members_per_active_group: 5.5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    api.groupService.getGroups.mockResolvedValue({
      success: true,
      data: mockGroups,
      total: mockGroups.length
    });
    
    api.groupService.getGroupStatistics.mockResolvedValue({
      success: true,
      data: mockStatistics
    });
  });

  test('renders page title and new group button', async () => {
    renderGroupsPage();
    
    expect(screen.getByText('Gruppi di Supporto')).toBeInTheDocument();
    expect(screen.getByText('Nuovo Gruppo')).toBeInTheDocument();
  });

  test('displays statistics cards', async () => {
    renderGroupsPage();
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total groups
      expect(screen.getByText('8')).toBeInTheDocument();  // Active groups
      expect(screen.getByText('6')).toBeInTheDocument();  // Average members (rounded)
      expect(screen.getByText('1')).toBeInTheDocument();  // Inactive groups
    });
  });

  test('renders groups table with data', async () => {
    renderGroupsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
      expect(screen.getByText('Test Group 2')).toBeInTheDocument();
      expect(screen.getByText('support')).toBeInTheDocument();
      expect(screen.getByText('therapy')).toBeInTheDocument();
    });
  });

  test('handles search filter', async () => {
    renderGroupsPage();
    
    const searchInput = screen.getByPlaceholderText('Cerca gruppi...');
    fireEvent.change(searchInput, { target: { value: 'Test Group 1' } });
    
    await waitFor(() => {
      expect(api.groupService.getGroups).toHaveBeenCalledWith({
        search: 'Test Group 1',
        status: '',
        group_type: ''
      });
    });
  });

  test('handles status filter', async () => {
    renderGroupsPage();
    
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    
    const activeOption = screen.getByText('Attivo');
    fireEvent.click(activeOption);
    
    await waitFor(() => {
      expect(api.groupService.getGroups).toHaveBeenCalledWith({
        search: '',
        status: 'active',
        group_type: ''
      });
    });
  });

  test('handles group type filter', async () => {
    renderGroupsPage();
    
    const typeSelect = screen.getByLabelText('Tipo Gruppo');
    fireEvent.mouseDown(typeSelect);
    
    const supportOption = screen.getByText('Supporto');
    fireEvent.click(supportOption);
    
    await waitFor(() => {
      expect(api.groupService.getGroups).toHaveBeenCalledWith({
        search: '',
        status: '',
        group_type: 'support'
      });
    });
  });

  test('navigates to new group form', () => {
    renderGroupsPage();
    
    const newGroupButton = screen.getByText('Nuovo Gruppo');
    fireEvent.click(newGroupButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/groups/new');
  });

  test('opens actions menu for group', async () => {
    renderGroupsPage();
    
    await waitFor(() => {
      const menuButtons = screen.getAllByRole('button', { name: '' });
      const actionButton = menuButtons.find(button => 
        button.querySelector('[data-testid="MoreVertIcon"]')
      );
      
      if (actionButton) {
        fireEvent.click(actionButton);
        expect(screen.getByText('Visualizza')).toBeInTheDocument();
        expect(screen.getByText('Modifica')).toBeInTheDocument();
        expect(screen.getByText('Elimina')).toBeInTheDocument();
      }
    });
  });

  test('handles group deletion', async () => {
    renderGroupsPage();
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    api.groupService.deleteGroup.mockResolvedValue({
      success: true
    });
    
    await waitFor(() => {
      const menuButtons = screen.getAllByRole('button', { name: '' });
      const actionButton = menuButtons.find(button => 
        button.querySelector('[data-testid="MoreVertIcon"]')
      );
      
      if (actionButton) {
        fireEvent.click(actionButton);
        
        const deleteButton = screen.getByText('Elimina');
        fireEvent.click(deleteButton);
        
        expect(window.confirm).toHaveBeenCalledWith(
          'Sei sicuro di voler eliminare questo gruppo?'
        );
        expect(api.groupService.deleteGroup).toHaveBeenCalled();
      }
    });
  });

  test('handles API error gracefully', async () => {
    api.groupService.getGroups.mockRejectedValue(new Error('API Error'));
    
    renderGroupsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Errore nel caricamento dei gruppi')).toBeInTheDocument();
    });
  });

  test('displays empty state when no groups found', async () => {
    api.groupService.getGroups.mockResolvedValue({
      success: true,
      data: [],
      total: 0
    });
    
    renderGroupsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Nessun gruppo trovato')).toBeInTheDocument();
    });
  });

  test('handles permission-based UI rendering', () => {
    // Mock user with limited permissions
    mockAuthContext.hasPermission.mockImplementation((permission) => {
      return permission === 'groups.read';
    });
    
    renderGroupsPage();
    
    expect(screen.queryByText('Nuovo Gruppo')).not.toBeInTheDocument();
  });

  test('formats dates correctly', async () => {
    renderGroupsPage();
    
    await waitFor(() => {
      // Should display formatted Italian date
      expect(screen.getByText('1/1/2025')).toBeInTheDocument();
    });
  });
});
