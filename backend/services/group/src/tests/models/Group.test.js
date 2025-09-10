const Group = require('../../models/Group');

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

describe('Group Model', () => {
  let mockQuery;

  beforeEach(() => {
    const { Pool } = require('pg');
    const pool = new Pool();
    mockQuery = pool.query;
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all groups with member counts', async () => {
      const mockGroups = [
        {
          id: 1,
          name: 'Test Group 1',
          group_type: 'support',
          status: 'active',
          created_by_username: 'admin',
          member_count: '5'
        },
        {
          id: 2,
          name: 'Test Group 2',
          group_type: 'therapy',
          status: 'inactive',
          created_by_username: 'admin',
          member_count: '3'
        }
      ];

      mockQuery.mockResolvedValue({ rows: mockGroups });

      const result = await Group.findAll();

      expect(result).toEqual(mockGroups);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        []
      );
    });

    it('should apply status filter', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await Group.findAll({ status: 'active' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE g.status = $1'),
        ['active']
      );
    });

    it('should apply group_type filter', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await Group.findAll({ group_type: 'support' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE g.group_type = $1'),
        ['support']
      );
    });

    it('should apply search filter', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await Group.findAll({ search: 'test' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (g.name ILIKE $1 OR g.description ILIKE $1)'),
        ['%test%']
      );
    });

    it('should apply multiple filters', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await Group.findAll({ 
        status: 'active', 
        group_type: 'support',
        search: 'test'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE g.status = $1 AND g.group_type = $2 AND (g.name ILIKE $3 OR g.description ILIKE $3)'),
        ['active', 'support', '%test%']
      );
    });
  });

  describe('findById', () => {
    it('should return group by id with member count', async () => {
      const mockGroup = {
        id: 1,
        name: 'Test Group',
        group_type: 'support',
        status: 'active',
        created_by_username: 'admin',
        member_count: '5'
      };

      mockQuery.mockResolvedValue({ rows: [mockGroup] });

      const result = await Group.findById(1);

      expect(result).toEqual(mockGroup);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE g.id = $1'),
        [1]
      );
    });

    it('should return undefined for non-existent group', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await Group.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create new group with required fields', async () => {
      const groupData = {
        name: 'New Group',
        description: 'Test description',
        group_type: 'support',
        max_members: 10,
        created_by: 1
      };

      const mockCreatedGroup = {
        id: 1,
        ...groupData,
        created_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValue({ rows: [mockCreatedGroup] });

      const result = await Group.create(groupData);

      expect(result).toEqual(mockCreatedGroup);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "group".groups'),
        [
          groupData.name,
          groupData.description,
          groupData.group_type,
          groupData.max_members,
          undefined, // start_date
          undefined, // end_date
          undefined, // meeting_frequency
          undefined, // meeting_location
          groupData.created_by
        ]
      );
    });

    it('should create group with all optional fields', async () => {
      const groupData = {
        name: 'Full Group',
        description: 'Complete description',
        group_type: 'therapy',
        max_members: 15,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        meeting_frequency: 'weekly',
        meeting_location: 'Room A',
        created_by: 2
      };

      const mockCreatedGroup = { id: 1, ...groupData };
      mockQuery.mockResolvedValue({ rows: [mockCreatedGroup] });

      const result = await Group.create(groupData);

      expect(result).toEqual(mockCreatedGroup);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "group".groups'),
        [
          groupData.name,
          groupData.description,
          groupData.group_type,
          groupData.max_members,
          groupData.start_date,
          groupData.end_date,
          groupData.meeting_frequency,
          groupData.meeting_location,
          groupData.created_by
        ]
      );
    });
  });

  describe('update', () => {
    it('should update group with valid fields', async () => {
      const updateData = {
        name: 'Updated Group',
        description: 'Updated description',
        status: 'inactive'
      };

      const mockUpdatedGroup = {
        id: 1,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdatedGroup] });

      const result = await Group.update(1, updateData);

      expect(result).toEqual(mockUpdatedGroup);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "group".groups'),
        ['Updated Group', 'Updated description', 'inactive', 1]
      );
    });

    it('should ignore invalid fields', async () => {
      const updateData = {
        name: 'Updated Group',
        invalid_field: 'should be ignored',
        created_by: 'should be ignored'
      };

      const mockUpdatedGroup = { id: 1, name: 'Updated Group' };
      mockQuery.mockResolvedValue({ rows: [mockUpdatedGroup] });

      await Group.update(1, updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET name = $1'),
        ['Updated Group', 1]
      );
      expect(mockQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('invalid_field'),
        expect.any(Array)
      );
    });

    it('should throw error when no valid fields provided', async () => {
      const updateData = {
        invalid_field: 'invalid',
        another_invalid: 'also invalid'
      };

      await expect(Group.update(1, updateData)).rejects.toThrow('No valid fields to update');
    });

    it('should return null for non-existent group', async () => {
      const updateData = { name: 'Updated Group' };
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await Group.update(999, updateData);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete group by id', async () => {
      const mockDeletedGroup = {
        id: 1,
        name: 'Deleted Group',
        status: 'active'
      };

      mockQuery.mockResolvedValue({ rows: [mockDeletedGroup] });

      const result = await Group.delete(1);

      expect(result).toEqual(mockDeletedGroup);
      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM "group".groups WHERE id = $1 RETURNING *',
        [1]
      );
    });

    it('should return undefined for non-existent group', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await Group.delete(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getStatistics', () => {
    it('should return group statistics', async () => {
      const mockStats = {
        total_groups: '10',
        active_groups: '8',
        inactive_groups: '1',
        archived_groups: '1',
        avg_members_per_active_group: '5.5'
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const result = await Group.getStatistics();

      expect(result).toEqual(mockStats);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
    });

    it('should return statistics with zero values when no groups exist', async () => {
      const mockStats = {
        total_groups: '0',
        active_groups: '0',
        inactive_groups: '0',
        archived_groups: '0',
        avg_members_per_active_group: null
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const result = await Group.getStatistics();

      expect(result).toEqual(mockStats);
    });
  });
});