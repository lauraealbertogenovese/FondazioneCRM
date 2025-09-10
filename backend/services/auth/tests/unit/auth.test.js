const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken, hashPassword, comparePassword } = require('../../src/utils/jwt');

describe('Auth Utils', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should compare password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
      
      const isNotMatch = await comparePassword('wrongpassword', hashedPassword);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    const testUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin'
    };

    test('should generate valid JWT token', () => {
      const token = generateToken(testUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should verify valid JWT token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });

    test('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    test('should reject expired JWT token', () => {
      // Create token with very short expiration
      const shortLivedToken = jwt.sign(
        testUser, 
        process.env.JWT_SECRET, 
        { expiresIn: '1ms' }
      );
      
      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(shortLivedToken);
          }).toThrow();
          resolve();
        }, 10);
      });
    });
  });

  describe('Token Payload Validation', () => {
    test('should include required user fields in token', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      };
      
      const token = generateToken(user);
      const decoded = verifyToken(token);
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('username');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expires at
    });

    test('should handle missing user fields gracefully', () => {
      const incompleteUser = { id: 1 };
      
      const token = generateToken(incompleteUser);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(1);
      expect(decoded.username).toBeUndefined();
    });
  });
});
