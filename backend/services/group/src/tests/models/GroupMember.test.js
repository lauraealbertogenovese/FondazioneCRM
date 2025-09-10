const GroupMember = require('../../models/GroupMember');

// Mock the database pool
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = {
    query: mockQuery
  };
  
  return {
    Pool: jest.fn(() => mockPool)
  };
});

describe('GroupMember Model', () => {
  let mockQuery;

  beforeEach(() => {
    const { Pool } = require('pg');
    const pool = new Pool();
    mockQuery = pool.query;
    jest.clearAllMocks();
  });

  describe('findByGroupId', () => {
    it('should return all members for a group', async () => {
      const mockMembers = [
        {
          id: 1,
          group_id: 1,
          patient_id: 1,
          member_type: 'patient',
          is_active: true,
          nome: 'Mario',
          cognome: 'Rossi',
          email: 'mario@example.com',
          telefono: '123456789',
          created_by_username: 'admin'
        },
        {
          id: 2,
          group_id: 1,
          patient_id: 2,
          member_type: 'psychologist',
          is_active: true,
          nome: 'Anna',
          cognome: 'Bianchi',
          email: 'anna@example.com',
          telefono: '987654321',
          created_by_username: 'admin'
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockMembers });

      const result = await GroupMember.findByGroupId(1);

      expect(result).toEqual(mockMembers);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE gm.group_id = $1'),
        [1]
      );
    });

    it('should return empty array for group with no members', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await GroupMember.findByGroupId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findActiveMembers', () => {
    it('should return only active members', async () => {
      const mockActiveMembers = [
        {
          id: 1,
          group_id: 1,
          patient_id: 1,
          member_type: 'patient',
          is_active: true,
          nome: 'Mario',
          cognome: 'Rossi'
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockActiveMembers });

      const result = await GroupMember.findActiveMembers(1);

      expect(result).toEqual(mockActiveMembers);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE gm.group_id = $1 AND gm.is_active = true'),
        [1]
      );
    });
  });

  describe('findByPatientId', () => {
    it('should return all groups for a patient', async () => {
      const mockPatientGroups = [
        {
          id: 1,
          group_id: 1,
          patient_id: 1,
          is_active: true,
          group_name: 'Support Group',
          group_description: 'Test group',
          group_status: 'active',
          created_by_username: 'admin'
        },
        {
          id: 2,
          group_id: 2,
          patient_id: 1,
          is_active: false,
          group_name: 'Therapy Group',
          group_description: 'Another group',
          group_status: 'inactive',
          created_by_username: 'admin'
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockPatientGroups });

      const result = await GroupMember.findByPatientId(1);

      expect(result).toEqual(mockPatientGroups);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE gm.patient_id = $1'),
        [1]
      );
    });
  });

  describe('addMember', () => {
    it('should add new member to group', async () => {
      const memberData = {
        group_id: 1,
        patient_id: 1,
        member_type: 'patient',
        role: 'participant',
        notes: 'Initial member',
        created_by: 1
      };

      // Mock checks
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // No existing member
        .mockResolvedValueOnce({ rows: [{ max_members: 10 }] }) // Group info
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // Active members count
        .mockResolvedValueOnce({ rows: [{ id: 1, ...memberData }] }); // Insert result

      const result = await GroupMember.addMember(memberData);

      expect(result).toEqual({ id: 1, ...memberData });
      expect(mockQuery).toHaveBeenCalledTimes(4);
    });

    it('should throw error when patient is already active member', async () => {
      const memberData = {
        group_id: 1,
        patient_id: 1,
        member_type: 'patient',
        created_by: 1
      };

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Existing member found

      await expect(GroupMember.addMember(memberData)).rejects.toThrow(
        'Patient is already an active member of this group'
      );
    });

    it('should throw error when group not found', async () => {
      const memberData = {
        group_id: 999,
        patient_id: 1,
        member_type: 'patient',
        created_by: 1
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // No existing member
        .mockResolvedValueOnce({ rows: [] }); // Group not found

      await expect(GroupMember.addMember(memberData)).rejects.toThrow('Group not found');
    });

    it('should throw error when group is full', async () => {
      const memberData = {
        group_id: 1,
        patient_id: 1,
        member_type: 'patient',
        created_by: 1
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // No existing member
        .mockResolvedValueOnce({ rows: [{ max_members: 5 }] }) // Group info
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Group is full

      await expect(GroupMember.addMember(memberData)).rejects.toThrow(
        'Group has reached maximum member limit'
      );
    });

    it('should use default member_type when not provided', async () => {
      const memberData = {
        group_id: 1,
        patient_id: 1,
        created_by: 1
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ max_members: 10 }] })
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, ...memberData, member_type: 'patient' }] });

      const result = await GroupMember.addMember(memberData);

      expect(mockQuery).toHaveBeenLastCalledWith(
        expect.stringContaining('INSERT INTO "group".group_members'),
        [1, 1, 'patient', undefined, undefined, 1]
      );
    });
  });

  describe('updateMember', () => {
    it('should update member with valid fields', async () => {
      const updateData = {
        member_type: 'psychologist',
        role: 'facilitator',
        notes: 'Updated notes'
      };

      const mockUpdatedMember = {
        id: 1,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdatedMember] });

      const result = await GroupMember.updateMember(1, updateData);

      expect(result).toEqual(mockUpdatedMember);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "group".group_members'),
        ['psychologist', 'facilitator', 'Updated notes', 1]
      );
    });

    it('should set left_date when deactivating member', async () => {
      const updateData = {
        is_active: false,
        notes: 'Left group'
      };

      mockQuery.mockResolvedValue({ rows: [{ id: 1, is_active: false }] });

      await GroupMember.updateMember(1, updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = $1, notes = $2, left_date = $3'),
        [false, 'Left group', expect.any(String), 1]
      );
    });

    it('should ignore invalid fields', async () => {
      const updateData = {
        role: 'leader',
        invalid_field: 'should be ignored',
        patient_id: 'should be ignored'
      };

      mockQuery.mockResolvedValue({ rows: [{ id: 1, role: 'leader' }] });

      await GroupMember.updateMember(1, updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET role = $1'),
        ['leader', 1]
      );
    });

    it('should throw error when no valid fields provided', async () => {
      const updateData = {
        invalid_field: 'invalid',
        another_invalid: 'also invalid'
      };

      await expect(GroupMember.updateMember(1, updateData)).rejects.toThrow('No valid fields to update');
    });
  });

  describe('removeMember', () => {
    it('should deactivate member and set left_date', async () => {
      const mockRemovedMember = {
        id: 1,
        is_active: false,
        left_date: new Date().toISOString().split('T')[0]
      };

      mockQuery.mockResolvedValue({ rows: [mockRemovedMember] });

      const result = await GroupMember.removeMember(1);

      expect(result).toEqual(mockRemovedMember);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "group".group_members'),
        [1]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = false, left_date = CURRENT_DATE'),
        [1]
      );
    });

    it('should return undefined for non-existent member', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await GroupMember.removeMember(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getMemberStatistics', () => {
    it('should return member statistics for group', async () => {
      const mockStats = {
        total_members: '10',
        active_members: '8',
        active_patients: '6',
        active_psychologists: '1',
        active_referenti: '1'
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const result = await GroupMember.getMemberStatistics(1);

      expect(result).toEqual(mockStats);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE group_id = $1'),
        [1]
      );
    });

    it('should return statistics with zero values for empty group', async () => {
      const mockStats = {
        total_members: '0',
        active_members: '0',
        active_patients: '0',
        active_psychologists: '0',
        active_referenti: '0'
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const result = await GroupMember.getMemberStatistics(999);

      expect(result).toEqual(mockStats);
    });
  });
});