const { Pool } = require('pg');

// Configurazione database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class GroupMember {
  static async findByGroupId(groupId) {
    const query = `
      SELECT 
        gm.*,
        COALESCE(p.nome, staff.first_name) as nome,
        COALESCE(p.cognome, staff.last_name) as cognome,
        COALESCE(p.email, staff.email) as email,
        COALESCE(p.telefono, '') as telefono,
        u.username as created_by_username
      FROM "group".group_members gm
      LEFT JOIN patient.patients p ON gm.patient_id = p.id
      LEFT JOIN auth.users staff ON gm.user_id = staff.id
      LEFT JOIN auth.users u ON gm.created_by = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_date DESC
    `;
    
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }

  static async findActiveMembers(groupId) {
    const query = `
      SELECT 
        gm.*,
        COALESCE(p.nome, staff.first_name) as nome,
        COALESCE(p.cognome, staff.last_name) as cognome,
        COALESCE(p.email, staff.email) as email,
        COALESCE(p.telefono, '') as telefono,
        u.username as created_by_username
      FROM "group".group_members gm
      LEFT JOIN patient.patients p ON gm.patient_id = p.id
      LEFT JOIN auth.users staff ON gm.user_id = staff.id
      LEFT JOIN auth.users u ON gm.created_by = u.id
      WHERE gm.group_id = $1 AND gm.is_active = true
      ORDER BY gm.joined_date DESC
    `;
    
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT 
        gm.*,
        g.name as group_name,
        g.description as group_description,
        g.status as group_status,
        u.username as created_by_username
      FROM "group".group_members gm
      LEFT JOIN "group".groups g ON gm.group_id = g.id
      LEFT JOIN auth.users u ON gm.created_by = u.id
      WHERE gm.patient_id = $1
      ORDER BY gm.joined_date DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  static async addMember(memberData) {
    const {
      group_id,
      patient_id,
      user_id,
      member_type = 'patient',
      role,
      notes,
      created_by
    } = memberData;

    // Verifica che il paziente non sia già nel gruppo attivo
    const existingMember = await pool.query(
      'SELECT id FROM "group".group_members WHERE group_id = $1 AND patient_id = $2 AND is_active = true',
      [group_id, patient_id]
    );

    if (existingMember.rows.length > 0) {
      throw new Error('Patient is already an active member of this group');
    }

    // Verifica limiti gruppo
    const groupInfo = await pool.query(
      'SELECT max_members FROM "group".groups WHERE id = $1',
      [group_id]
    );

    if (groupInfo.rows.length === 0) {
      throw new Error('Group not found');
    }

    const activeMembers = await pool.query(
      'SELECT COUNT(*) as count FROM "group".group_members WHERE group_id = $1 AND is_active = true',
      [group_id]
    );

    if (parseInt(activeMembers.rows[0].count) >= groupInfo.rows[0].max_members) {
      throw new Error('Group has reached maximum member limit');
    }

    const query = `
      INSERT INTO "group".group_members 
      (group_id, patient_id, user_id, member_type, role, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [group_id, patient_id, user_id, member_type, role, notes, created_by];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async updateMember(id, memberData) {
    const allowedFields = ['member_type', 'role', 'notes', 'is_active'];
    
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(memberData).forEach(key => {
      if (allowedFields.includes(key) && memberData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(memberData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Se si sta disattivando il membro, aggiungi left_date
    if (memberData.is_active === false) {
      paramCount++;
      fields.push(`left_date = $${paramCount}`);
      values.push(new Date().toISOString().split('T')[0]);
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE "group".group_members 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async removeMember(id) {
    const query = `
      UPDATE "group".group_members 
      SET is_active = false, left_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getMemberStatistics(groupId) {
    const query = `
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_members,
        COUNT(CASE WHEN member_type = 'patient' AND is_active = true THEN 1 END) as active_patients,
        COUNT(CASE WHEN member_type = 'psychologist' AND is_active = true THEN 1 END) as active_psychologists,
        COUNT(CASE WHEN member_type = 'referente' AND is_active = true THEN 1 END) as active_referenti
      FROM "group".group_members
      WHERE group_id = $1
    `;
    
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
  }

  static async removeMember(memberId) {
    const query = `
      UPDATE "group".group_members 
      SET is_active = false, 
          left_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [memberId]);
    return result.rows[0];
  }
}

module.exports = GroupMember;
