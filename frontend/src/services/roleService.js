import api from './api';

const roleService = {
  // Get all roles
  async getRoles() {
    try {
      const response = await api.get('/roles');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get role by ID
  async getRole(id) {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // Create new role
  async createRole(roleData) {
    try {
      const response = await api.post('/roles', roleData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update role
  async updateRole(id, roleData) {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Delete role
  async deleteRole(id) {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  // Get users with specific role
  async getRoleUsers(id) {
    try {
      const response = await api.get(`/roles/${id}/users`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching role users:', error);
      throw error;
    }
  }
};

export default roleService;