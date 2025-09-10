const User = require('../../src/models/User');

// Mock database pool
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn()
  }))
}));

describe('User Model', () => {
  let mockQuery;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock query
    const { Pool } = require('pg');
    const pool = new Pool();
    mockQuery = pool.query;
  });

  describe('findAll', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' },
        { id: 2, username: 'user', email: 'user@test.com', role: 'user' }
      ];

      mockQuery.mockResolvedValue({ rows: mockUsers });

      const users = await User.findAll();

      expect(users).toEqual(mockUsers);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, username, email, role')
      );
    });

    test('should apply filters correctly', async () => {
      const filters = { role: 'admin', search: 'admin' };
      mockQuery.mockResolvedValue({ rows: [] });

      await User.findAll(filters);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['admin', '%admin%'])
      );
    });
  });

  describe('findById', () => {
    test('should return user by id', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@test.com' };
      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const user = await User.findById(1);

      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [1]
      );
    });

    test('should return undefined if user not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const user = await User.findById(999);

      expect(user).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    test('should return user by username', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@test.com' };
      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const user = await User.findByUsername('admin');

      expect(user).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE username = $1'),
        ['admin']
      );
    });
  });

  describe('create', () => {
    test('should create new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password_hash: 'hashedpassword',
        role: 'user'
      };

      const mockCreatedUser = { id: 3, ...userData };
      mockQuery.mockResolvedValue({ rows: [mockCreatedUser] });

      const user = await User.create(userData);

      expect(user).toEqual(mockCreatedUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auth.users'),
        expect.arrayContaining([
          userData.username,
          userData.email,
          userData.password_hash,
          userData.role
        ])
      );
    });

    test('should throw error for duplicate username', async () => {
      const userData = {
        username: 'admin',
        email: 'admin2@test.com',
        password_hash: 'hashedpassword',
        role: 'user'
      };

      const duplicateError = new Error('duplicate key value violates unique constraint');
      duplicateError.code = '23505';
      mockQuery.mockRejectedValue(duplicateError);

      await expect(User.create(userData)).rejects.toThrow('duplicate key');
    });
  });

  describe('update', () => {
    test('should update user fields', async () => {
      const updateData = { email: 'updated@test.com', role: 'admin' };
      const mockUpdatedUser = { id: 1, username: 'user', ...updateData };
      
      mockQuery.mockResolvedValue({ rows: [mockUpdatedUser] });

      const user = await User.update(1, updateData);

      expect(user).toEqual(mockUpdatedUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE auth\.users SET.*WHERE id = \$\d+/),
        expect.arrayContaining([updateData.email, updateData.role, 1])
      );
    });

    test('should return undefined if user not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const user = await User.update(999, { email: 'test@test.com' });

      expect(user).toBeUndefined();
    });
  });

  describe('delete', () => {
    test('should delete user by id', async () => {
      const mockDeletedUser = { id: 1, username: 'user', email: 'user@test.com' };
      mockQuery.mockResolvedValue({ rows: [mockDeletedUser] });

      const user = await User.delete(1);

      expect(user).toEqual(mockDeletedUser);
      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM auth.users WHERE id = $1 RETURNING *',
        [1]
      );
    });
  });

  describe('getUserStatistics', () => {
    test('should return user statistics', async () => {
      const mockStats = {
        total_users: '10',
        active_users: '8',
        admin_users: '2',
        user_users: '6'
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const stats = await User.getUserStatistics();

      expect(stats).toEqual(mockStats);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_users')
      );
    });
  });
});
