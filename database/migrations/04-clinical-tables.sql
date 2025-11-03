-- Migration to add missing columns to clinical_records tables

-- Add missing columns to clinical_records table
ALTER TABLE clinical.clinical_records
ADD COLUMN IF NOT EXISTS session_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

