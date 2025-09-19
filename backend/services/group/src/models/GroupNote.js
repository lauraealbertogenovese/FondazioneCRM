const db = require('../database/connection');

class GroupNote {
  // Create a new group note
  static async create({ group_id, note_type, content, is_private = false, created_by }) {
    const query = `
      INSERT INTO "group".group_notes
        (group_id, note_type, content, is_private, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [group_id, note_type, content, is_private, created_by];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Get all notes for a group
  static async findByGroupId(group_id, limit = 50, offset = 0) {
    const query = `
      SELECT gn.*, u.username as created_by_username
      FROM "group".group_notes gn
      LEFT JOIN auth.users u ON gn.created_by = u.id
      WHERE gn.group_id = $1
      ORDER BY gn.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [group_id, limit, offset]);
    return result.rows;
  }

  // Get a single note by ID
  static async findById(id) {
    const query = `
      SELECT gn.*, u.username as created_by_username
      FROM "group".group_notes gn
      LEFT JOIN auth.users u ON gn.created_by = u.id
      WHERE gn.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update a note
  static async update(id, { note_type, content, is_private }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (note_type !== undefined) {
      fields.push(`note_type = $${idx++}`);
      values.push(note_type);
    }
    if (content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(content);
    }
    if (is_private !== undefined) {
      fields.push(`is_private = $${idx++}`);
      values.push(is_private);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE "group".group_notes
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Delete a note
  static async delete(id) {
    const query = `DELETE FROM "group".group_notes WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
    // Get statistics about group notes
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) AS total_notes,
        COUNT(DISTINCT group_id) AS groups_with_notes,
        COUNT(DISTINCT created_by) AS users_with_notes
      FROM "group".group_notes
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = GroupNote;