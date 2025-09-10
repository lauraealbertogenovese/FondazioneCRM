const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.role_id = data.role_id;
    this.is_active = data.is_active;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password, first_name, last_name, role_id = 5 } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const queryText = `
      INSERT INTO auth.users (username, email, password_hash, first_name, last_name, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [username, email, password_hash, first_name, last_name, role_id];
    const result = await query(queryText, values);
    
    return new User(result.rows[0]);
  }

  // Find user by ID
  static async findById(id) {
    const queryText = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM auth.users u
      LEFT JOIN auth.roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    
    const result = await query(queryText, [id]);
    if (result.rows[0]) {
      const user = new User(result.rows[0]);
      if (result.rows[0].role_name) {
        user.role = {
          name: result.rows[0].role_name,
          permissions: result.rows[0].permissions
        };
      }
      return user;
    }
    return null;
  }

  // Find user by username
  static async findByUsername(username) {
    const queryText = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM auth.users u
      LEFT JOIN auth.roles r ON u.role_id = r.id
      WHERE u.username = $1
    `;
    
    const result = await query(queryText, [username]);
    if (result.rows[0]) {
      const user = new User(result.rows[0]);
      if (result.rows[0].role_name) {
        user.role = {
          name: result.rows[0].role_name,
          permissions: result.rows[0].permissions
        };
      }
      return user;
    }
    return null;
  }

  // Find user by email
  static async findByEmail(email) {
    const queryText = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM auth.users u
      LEFT JOIN auth.roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    
    const result = await query(queryText, [email]);
    if (result.rows[0]) {
      const user = new User(result.rows[0]);
      if (result.rows[0].role_name) {
        user.role = {
          name: result.rows[0].role_name,
          permissions: result.rows[0].permissions
        };
      }
      return user;
    }
    return null;
  }

  // Get all users with pagination
  static async findAll(limit = 10, offset = 0) {
    const queryText = `
      SELECT u.*, r.name as role_name
      FROM auth.users u
      LEFT JOIN auth.roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(queryText, [limit, offset]);
    return result.rows.map(row => new User(row));
  }

  // Find users by role
  static async findByRole(roleId) {
    const queryText = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM auth.users u
      LEFT JOIN auth.roles r ON u.role_id = r.id
      WHERE u.role_id = $1 AND u.is_active = true
      ORDER BY u.username
    `;
    
    const result = await query(queryText, [roleId]);
    return result.rows.map(row => {
      const user = new User(row);
      if (row.role_name) {
        user.role = {
          name: row.role_name,
          permissions: row.permissions
        };
      }
      return user;
    });
  }

  // Count users by role
  static async countByRole(roleId) {
    const queryText = `
      SELECT COUNT(*) as count
      FROM auth.users
      WHERE role_id = $1 AND is_active = true
    `;
    
    const result = await query(queryText, [roleId]);
    return parseInt(result.rows[0].count);
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['first_name', 'last_name', 'email', 'role_id', 'is_active'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const queryText = `
      UPDATE auth.users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    const updatedUser = result.rows[0];
    
    // Update current instance
    Object.assign(this, updatedUser);
    return this;
  }

  // Update password
  async updatePassword(newPassword) {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const queryText = `
      UPDATE auth.users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(queryText, [password_hash, this.id]);
    const updatedUser = result.rows[0];
    
    this.password_hash = updatedUser.password_hash;
    this.updated_at = updatedUser.updated_at;
    return this;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Update last login
  async updateLastLogin() {
    const queryText = `
      UPDATE auth.users 
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;
    
    const result = await query(queryText, [this.id]);
    this.last_login = result.rows[0].last_login;
    return this;
  }

  // Delete user (soft delete)
  async delete() {
    const queryText = `
      UPDATE auth.users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(queryText, [this.id]);
    const deletedUser = result.rows[0];
    
    this.is_active = deletedUser.is_active;
    this.updated_at = deletedUser.updated_at;
    return this;
  }

  // Get user data without sensitive information
  toJSON() {
    const { password_hash, ...userData } = this;
    return userData;
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.role || !this.role.permissions) return false;
    
    // Check for wildcard permission
    if (this.role.permissions.all === true) return true;
    
    // Check specific permission
    const permissionParts = permission.split('.');
    let current = this.role.permissions;
    
    for (const part of permissionParts) {
      if (current && typeof current === 'object' && current[part] !== undefined) {
        current = current[part];
      } else {
        return false;
      }
    }
    
    return current === true;
  }

  // Get public user data
  getPublicData() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      role_id: this.role_id,
      role_name: this.role ? this.role.name : null,
      permissions: this.role ? this.role.permissions : null,
      is_active: this.is_active,
      last_login: this.last_login,
      created_at: this.created_at
    };
  }
}

module.exports = User;
