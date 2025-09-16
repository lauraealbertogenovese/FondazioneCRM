-- Migration: Remove unused patient fields
-- Date: 2025-01-16
-- Description: Remove anamnesi_medica and luogo_nascita fields from patient.patients table
-- These fields are not used in the frontend and have 0% utilization in the database

-- Remove the unused columns
ALTER TABLE patient.patients DROP COLUMN IF EXISTS anamnesi_medica;
ALTER TABLE patient.patients DROP COLUMN IF EXISTS luogo_nascita;