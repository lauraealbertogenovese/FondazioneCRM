const { 
  groupSchema, 
  groupUpdateSchema, 
  memberSchema, 
  memberUpdateSchema,
  groupFiltersSchema,
  validateGroup,
  validateGroupUpdate,
  validateMember,
  validateId
} = require('../../middleware/validation');

describe('Validation Schemas', () => {
  describe('groupSchema', () => {
    it('should validate valid group data', () => {
      const validData = {
        name: 'Test Group',
        description: 'A test group',
        group_type: 'support',
        max_members: 15,
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        meeting_frequency: 'weekly',
        meeting_location: 'Room A'
      };

      const { error, value } = groupSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value.name).toBe(validData.name);
      expect(value.description).toBe(validData.description);
      expect(value.group_type).toBe(validData.group_type);
      expect(value.max_members).toBe(validData.max_members);
      expect(value.status).toBe(validData.status);
      expect(value.meeting_frequency).toBe(validData.meeting_frequency);
      expect(value.meeting_location).toBe(validData.meeting_location);
    });

    it('should require name and group_type', () => {
      const invalidData = {
        description: 'Missing required fields'
      };

      const { error } = groupSchema.validate(invalidData, { abortEarly: false });
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(2);
      const errorKeys = error.details.map(d => d.context.key);
      expect(errorKeys).toContain('name');
      expect(errorKeys).toContain('group_type');
    });

    it('should validate group_type enum', () => {
      const invalidData = {
        name: 'Test Group',
        group_type: 'invalid_type'
      };

      const { error } = groupSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('support, therapy, activity, education, rehabilitation');
    });

    it('should validate max_members range', () => {
      const invalidData = {
        name: 'Test Group',
        group_type: 'support',
        max_members: 0
      };

      const { error } = groupSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('almeno 1');
    });

    it('should validate date relationship', () => {
      const invalidData = {
        name: 'Test Group',
        group_type: 'support',
        start_date: '2025-12-31',
        end_date: '2025-01-01'
      };

      const { error } = groupSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('successiva');
    });

    it('should set default values', () => {
      const minimalData = {
        name: 'Test Group',
        group_type: 'support'
      };

      const { value } = groupSchema.validate(minimalData);
      expect(value.max_members).toBe(10);
      expect(value.status).toBe('active');
    });

    it('should trim strings', () => {
      const dataWithSpaces = {
        name: '  Test Group  ',
        group_type: 'support',
        description: '  Trimmed description  '
      };

      const { value } = groupSchema.validate(dataWithSpaces);
      expect(value.name).toBe('Test Group');
      expect(value.description).toBe('Trimmed description');
    });
  });

  describe('memberSchema', () => {
    it('should validate valid member data', () => {
      const validData = {
        patient_id: 1,
        member_type: 'patient',
        role: 'participant',
        notes: 'Initial member'
      };

      const { error, value } = memberSchema.validate(validData);
      expect(error).toBeUndefined();
      expect(value.patient_id).toBe(validData.patient_id);
      expect(value.member_type).toBe(validData.member_type);
      expect(value.role).toBe(validData.role);
      expect(value.notes).toBe(validData.notes);
    });

    it('should require patient_id', () => {
      const invalidData = {
        member_type: 'patient'
      };

      const { error } = memberSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].context.key).toBe('patient_id');
    });

    it('should validate member_type enum', () => {
      const invalidData = {
        patient_id: 1,
        member_type: 'invalid_type'
      };

      const { error } = memberSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('patient, conductor');
    });

    it('should set default member_type', () => {
      const minimalData = {
        patient_id: 1
      };

      const { value } = memberSchema.validate(minimalData);
      expect(value.member_type).toBe('patient');
    });

    it('should validate patient_id as positive integer', () => {
      const invalidData = {
        patient_id: -1,
        member_type: 'patient'
      };

      const { error } = memberSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('positivo');
    });
  });

  describe('groupFiltersSchema', () => {
    it('should validate valid filters', () => {
      const validFilters = {
        status: 'active',
        group_type: 'support',
        search: 'test'
      };

      const { error, value } = groupFiltersSchema.validate(validFilters);
      expect(error).toBeUndefined();
      expect(value.status).toBe(validFilters.status);
      expect(value.group_type).toBe(validFilters.group_type);
      expect(value.search).toBe(validFilters.search);
    });

    it('should allow empty filters', () => {
      const { error } = groupFiltersSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should validate filter enums', () => {
      const invalidFilters = {
        status: 'invalid_status',
        group_type: 'invalid_type'
      };

      const { error } = groupFiltersSchema.validate(invalidFilters);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(1);
      const errorKeys = error.details.map(d => d.context.key);
      expect(errorKeys).toContain('status');
    });
  });
});

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('validateGroup', () => {
    it('should pass valid data', () => {
      req.body = {
        name: 'Test Group',
        group_type: 'support',
        max_members: 10
      };

      validateGroup(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body.max_members).toBe(10);
      expect(req.body.status).toBe('active');
    });

    it('should reject invalid data', () => {
      req.body = {
        name: '',
        group_type: 'invalid'
      };

      validateGroup(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Dati non validi',
        details: expect.any(Array)
      });
    });

    it('should strip unknown fields', () => {
      req.body = {
        name: 'Test Group',
        group_type: 'support',
        unknown_field: 'should be removed',
        created_by: 'should be removed'
      };

      validateGroup(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).not.toHaveProperty('unknown_field');
      expect(req.body).not.toHaveProperty('created_by');
    });
  });

  describe('validateId', () => {
    it('should pass valid ID', () => {
      req.params = { id: '123' };

      validateId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.params.id).toBe(123);
    });

    it('should reject invalid ID', () => {
      req.params = { id: 'abc' };

      validateId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ID non valido',
        message: 'L\'ID deve essere un numero intero positivo'
      });
    });

    it('should reject zero ID', () => {
      req.params = { id: '0' };

      validateId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject negative ID', () => {
      req.params = { id: '-5' };

      validateId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateMember', () => {
    it('should pass valid member data', () => {
      req.body = {
        patient_id: 1,
        member_type: 'patient',
        role: 'participant'
      };

      validateMember(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.member_type).toBe('patient');
    });

    it('should set default member_type', () => {
      req.body = {
        patient_id: 1
      };

      validateMember(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.member_type).toBe('patient');
    });

    it('should reject invalid member data', () => {
      req.body = {
        patient_id: 'invalid',
        member_type: 'invalid_type'
      };

      validateMember(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Dati membro non validi',
        details: expect.any(Array)
      });
    });
  });
});