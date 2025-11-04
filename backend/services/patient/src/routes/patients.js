const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const PatientDocument = require("../models/PatientDocument");
const AuthMiddleware = require("../middleware/auth");
const PatientValidationUtils = require("../utils/validation");

// Define permissions

const readOnlyPermissions = ["patients.read", "billing.read"];
// GET /patients/statistics - Get patient statistics
router.get(
  "/patients/statistics",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission("patients.read"),
  async (req, res) => {
    try {
      const stats = await Patient.getStatistics();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get patient statistics error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /patients - Get all patients with pagination and filters
router.get(
  "/patients",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission(readOnlyPermissions),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sesso,
        citta,
        data_nascita_da,
        data_nascita_a,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      console.log('Received sort params:', { sortBy, sortOrder }); // Debug log

      const offset = (page - 1) * limit;
      const filters = { 
        sesso, 
        citta, 
        data_nascita_da, 
        data_nascita_a,
        search 
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => 
        (filters[key] === undefined || filters[key] === '') && delete filters[key]
      );

      let patients;
      let total;

      if (search) {
        // Passing sorting parameters to search method
        patients = await Patient.search(search, parseInt(limit), parseInt(offset), sortBy, sortOrder);
        total = await Patient.searchCount(search);
      } else {
        // Passing sorting parameters to findAll method
        patients = await Patient.findAll(filters, parseInt(limit), parseInt(offset), sortBy, sortOrder);
        total = await Patient.count(filters);
      }

      res.json({
        patients: patients.map((patient) => patient.getPublicData()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  }
);

// GET /patients/:id - Get patient by ID
router.get(
  "/patients/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission(readOnlyPermissions),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: "Invalid patient ID",
        });
      }

      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      res.json({
        patient: patient.getPublicData(),
      });
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /patients/cf/:codice_fiscale - Get patient by Codice Fiscale
router.get(
  "/patients/cf/:codice_fiscale",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission(readOnlyPermissions),
  async (req, res) => {
    try {
      const { codice_fiscale } = req.params;

      const patient = await Patient.findByCodiceFiscale(codice_fiscale);
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      res.json({
        patient: patient.getPublicData(),
      });
    } catch (error) {
      console.error("Get patient by CF error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /patients/ts/:numero_tessera_sanitaria - Get patient by Numero Tessera Sanitaria
router.get(
  "/patients/ts/:numero_tessera_sanitaria",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission(readOnlyPermissions),
  async (req, res) => {
    try {
      const { numero_tessera_sanitaria } = req.params;

      const patient = await Patient.findByNumeroTesseraSanitaria(
        numero_tessera_sanitaria
      );
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      res.json({
        patient: patient.getPublicData(),
      });
    } catch (error) {
      console.error("Get patient by TS error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// POST /patients - Create new patient
router.post(
  "/patients",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission("patients.write"),
  async (req, res) => {
    try {
      const patientData = PatientValidationUtils.sanitizeInput(req.body);

      // Validate input
      const validation =
        PatientValidationUtils.validatePatientCreation(patientData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors,
        });
      }

      // Check if patient with same Codice Fiscale already exists
      const existingPatientByCF = await Patient.findByCodiceFiscale(
        validation.cleaned.codice_fiscale
      );
      if (existingPatientByCF) {
        return res.status(409).json({
          error: "Patient with this Codice Fiscale already exists",
        });
      }

      // Check if patient with same Numero Tessera Sanitaria already exists (only if not null/empty)
      if (validation.cleaned.numero_tessera_sanitaria) {
        const existingPatientByTS = await Patient.findByNumeroTesseraSanitaria(
          validation.cleaned.numero_tessera_sanitaria
        );
        if (existingPatientByTS) {
          return res.status(409).json({
            error: "Patient with this Numero Tessera Sanitaria already exists",
          });
        }
      }

      // Add created_by from authenticated user
      patientData.created_by = req.user.id;

      // Use cleaned data
      patientData.codice_fiscale = validation.cleaned.codice_fiscale;
      patientData.numero_tessera_sanitaria =
        validation.cleaned.numero_tessera_sanitaria;

      // Create patient
      const patient = await Patient.create(patientData);

      res.status(201).json({
        message: "Patient created successfully",
        patient: patient.getPublicData(),
      });
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// PUT /patients/:id - Update patient
router.put(
  "/patients/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission("patients.write"),
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log("🔄 UPDATE Patient - Raw body:", req.body);
      const updateData = PatientValidationUtils.sanitizeInput(req.body);
      console.log("🧼 UPDATE Patient - Sanitized data:", updateData);
      console.log(
        "🩺 medico_curante field:",
        updateData.medico_curante,
        "type:",
        typeof updateData.medico_curante
      );

      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: "Invalid patient ID",
        });
      }

      // Validate input
      const validation =
        PatientValidationUtils.validatePatientUpdate(updateData);
      if (!validation.isValid) {
        console.error("Patient update validation failed:", validation.errors);
        console.error("Update data:", updateData);
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors,
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      // Check if Codice Fiscale is being changed and already exists
      if (
        updateData.codice_fiscale &&
        updateData.codice_fiscale !== patient.codice_fiscale
      ) {
        const existingPatient = await Patient.findByCodiceFiscale(
          validation.cleaned.codice_fiscale
        );
        if (existingPatient) {
          return res.status(409).json({
            error: "Patient with this Codice Fiscale already exists",
          });
        }
      }

      // Check if Numero Tessera Sanitaria is being changed and already exists (only if not null/empty)
      if (
        updateData.numero_tessera_sanitaria &&
        updateData.numero_tessera_sanitaria !==
          patient.numero_tessera_sanitaria &&
        validation.cleaned.numero_tessera_sanitaria
      ) {
        const existingPatient = await Patient.findByNumeroTesseraSanitaria(
          validation.cleaned.numero_tessera_sanitaria
        );
        if (existingPatient) {
          return res.status(409).json({
            error: "Patient with this Numero Tessera Sanitaria already exists",
          });
        }
      }

      // Use cleaned data
      if (updateData.codice_fiscale) {
        updateData.codice_fiscale = validation.cleaned.codice_fiscale;
      }
      if (updateData.numero_tessera_sanitaria !== undefined) {
        updateData.numero_tessera_sanitaria =
          validation.cleaned.numero_tessera_sanitaria;
      }

      // Update patient
      await patient.update(updateData);

      res.json({
        message: "Patient updated successfully",
        patient: patient.getPublicData(),
      });
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// DELETE /patients/:id - Delete patient (soft delete)
router.delete(
  "/patients/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission("patients.delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: "Invalid patient ID",
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      // Soft delete patient
      await patient.delete();

      res.json({
        message: "Patient deleted successfully",
      });
    } catch (error) {
      console.error("Delete patient error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// GET /patients/:id/documents - Get patient documents
router.get(
  "/patients/:id/documents",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requirePermission("patients.read"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
          error: "Invalid patient ID",
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      const documents = await PatientDocument.findByPatientId(id);

      res.json({
        documents: documents.map((doc) => doc.toJSON()),
      });
    } catch (error) {
      console.error("Get patient documents error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

module.exports = router;
