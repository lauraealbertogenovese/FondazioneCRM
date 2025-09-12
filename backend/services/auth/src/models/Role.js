const { query } = require('../database/connection');

class Role {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    // Parse permissions JSON if it's a string
    this.permissions = typeof data.permissions === 'string' 
      ? JSON.parse(data.permissions) 
      : (data.permissions || {});
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all roles
  static async findAll() {
    const queryText = `
      SELECT r.*, COUNT(u.id) as user_count
      FROM auth.roles r
      LEFT JOIN auth.users u ON r.id = u.role_id
      GROUP BY r.id, r.name, r.description, r.permissions, r.created_at, r.updated_at
      ORDER BY r.name
    `;
    
    const result = await query(queryText);
    return result.rows.map(row => {
      const role = new Role(row);
      role.user_count = parseInt(row.user_count);
      return role;
    });
  }

  // Find role by ID
  static async findById(id) {
    const queryText = `
      SELECT * FROM auth.roles
      WHERE id = $1
    `;
    
    const result = await query(queryText, [id]);
    return result.rows[0] ? new Role(result.rows[0]) : null;
  }

  // Find role by name
  static async findByName(name) {
    const queryText = `
      SELECT * FROM auth.roles
      WHERE name = $1
    `;
    
    const result = await query(queryText, [name]);
    return result.rows[0] ? new Role(result.rows[0]) : null;
  }

  // Create a new role
  static async create(roleData) {
    const { name, description, permissions = {} } = roleData;
    
    const queryText = `
      INSERT INTO auth.roles (name, description, permissions)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [name, description, JSON.stringify(permissions)];
    const result = await query(queryText, values);
    
    return new Role(result.rows[0]);
  }

  // Update role
  async update(updateData) {
    const allowedFields = ['name', 'description', 'permissions'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'permissions') {
          updates.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const queryText = `
      UPDATE auth.roles 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    const updatedRole = result.rows[0];
    
    // Update current instance
    Object.assign(this, updatedRole);
    return this;
  }

  // Delete role
  async delete() {
    const queryText = `
      DELETE FROM auth.roles
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(queryText, [this.id]);
    return result.rows[0] ? new Role(result.rows[0]) : null;
  }

  // Check if role has permission
  hasPermission(permission) {
    if (!this.permissions) return false;
    
    // Check for wildcard permission
    if (this.permissions.all === true) return true;
    
    // Check specific permission
    const permissionParts = permission.split('.');
    let current = this.permissions;
    
    for (const part of permissionParts) {
      if (current && typeof current === 'object' && current[part] !== undefined) {
        current = current[part];
      } else {
        return false;
      }
    }
    
    return current === true;
  }

  // Get users with this role
  async getUsers() {
    const queryText = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.last_login, u.created_at
      FROM auth.users u
      WHERE u.role_id = $1
      ORDER BY u.username
    `;
    
    const result = await query(queryText, [this.id]);
    return result.rows;
  }

  // Get count of users with this role
  async getUserCount() {
    const queryText = `
      SELECT COUNT(*) as count
      FROM auth.users
      WHERE role_id = $1
    `;
    
    const result = await query(queryText, [this.id]);
    return parseInt(result.rows[0].count);
  }

  // Get role data
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions,
      user_count: this.user_count || 0,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Role;
