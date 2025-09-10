const { Pool } = require('pg');

// Configurazione database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class Group {
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        g.*,
        u.username as created_by_username,
        COUNT(DISTINCT gm.patient_id) as member_count
      FROM "group".groups g
      LEFT JOIN auth.users u ON g.created_by = u.id
      LEFT JOIN "group".group_members gm ON g.id = gm.group_id AND gm.is_active = true
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      conditions.push(`g.status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.group_type) {
      paramCount++;
      conditions.push(`g.group_type = $${paramCount}`);
      values.push(filters.group_type);
    }

    if (filters.search) {
      paramCount++;
      conditions.push(`(g.name ILIKE $${paramCount} OR g.description ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY g.id, u.username ORDER BY g.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        g.*,
        u.username as created_by_username,
        COUNT(DISTINCT gm.patient_id) as member_count
      FROM "group".groups g
      LEFT JOIN auth.users u ON g.created_by = u.id
      LEFT JOIN "group".group_members gm ON g.id = gm.group_id AND gm.is_active = true
      WHERE g.id = $1
      GROUP BY g.id, u.username
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const query = `
      SELECT 
        g.*,
        u.username as created_by_username,
        COUNT(DISTINCT gm.patient_id) as member_count
      FROM "group".groups g
      LEFT JOIN auth.users u ON g.created_by = u.id
      LEFT JOIN "group".group_members gm ON g.id = gm.group_id AND gm.is_active = true
      WHERE g.name = $1
      GROUP BY g.id, u.username
    `;
    
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  static async create(groupData) {
    const {
      name,
      description,
      group_type,
      max_members = 10,
      start_date,
      end_date,
      meeting_frequency,
      meeting_location,
      created_by
    } = groupData;

    const query = `
      INSERT INTO "group".groups 
      (name, description, group_type, max_members, start_date, end_date, 
       meeting_frequency, meeting_location, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      name,
      description,
      group_type,
      max_members,
      start_date,
      end_date,
      meeting_frequency,
      meeting_location,
      created_by
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, groupData) {
    const allowedFields = [
      'name',
      'description', 
      'group_type',
      'max_members',
      'status',
      'start_date',
      'end_date',
      'meeting_frequency',
      'meeting_location'
    ];

    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(groupData).forEach(key => {
      if (allowedFields.includes(key) && groupData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(groupData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE "group".groups 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM "group".groups WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_groups,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_groups,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_groups,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_groups,
        AVG(CASE WHEN status = 'active' THEN 
          (SELECT COUNT(*) FROM "group".group_members gm WHERE gm.group_id = g.id AND gm.is_active = true)
        END) as avg_members_per_active_group
      FROM "group".groups g
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM "group".groups 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Group;
