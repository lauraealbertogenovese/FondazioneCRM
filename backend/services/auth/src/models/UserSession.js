const { query } = require('../database/connection');

class UserSession {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token_hash = data.token_hash;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.is_active = data.is_active;
  }

  // Create a new session
  static async create(sessionData) {
    const { user_id, token_hash, expires_at } = sessionData;
    
    const queryText = `
      INSERT INTO auth.user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [user_id, token_hash, expires_at];
    const result = await query(queryText, values);
    
    return new UserSession(result.rows[0]);
  }

  // Find session by token hash
  static async findByTokenHash(tokenHash) {
    const queryText = `
      SELECT * FROM auth.user_sessions
      WHERE token_hash = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `;
    
    const result = await query(queryText, [tokenHash]);
    return result.rows[0] ? new UserSession(result.rows[0]) : null;
  }

  // Find all active sessions for a user
  static async findByUserId(userId) {
    const queryText = `
      SELECT * FROM auth.user_sessions
      WHERE user_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `;
    
    const result = await query(queryText, [userId]);
    return result.rows.map(row => new UserSession(row));
  }

  // Deactivate session
  async deactivate() {
    const queryText = `
      UPDATE auth.user_sessions 
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(queryText, [this.id]);
    const updatedSession = result.rows[0];
    
    this.is_active = updatedSession.is_active;
    return this;
  }

  // Deactivate all sessions for a user
  static async deactivateAllForUser(userId) {
    const queryText = `
      UPDATE auth.user_sessions 
      SET is_active = false
      WHERE user_id = $1 AND is_active = true
      RETURNING *
    `;
    
    const result = await query(queryText, [userId]);
    return result.rows.map(row => new UserSession(row));
  }

  // Clean up expired sessions
  static async cleanupExpired() {
    const queryText = `
      UPDATE auth.user_sessions 
      SET is_active = false
      WHERE expires_at <= CURRENT_TIMESTAMP AND is_active = true
      RETURNING *
    `;
    
    const result = await query(queryText);
    return result.rows.map(row => new UserSession(row));
  }

  // Check if session is valid
  isValid() {
    return this.is_active && new Date(this.expires_at) > new Date();
  }

  // Get session data
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      expires_at: this.expires_at,
      created_at: this.created_at,
      is_active: this.is_active
    };
  }
}

module.exports = UserSession;
