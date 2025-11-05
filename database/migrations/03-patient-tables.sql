-- Database migration to add diagnosi_psichiatrica field and make codice_fiscale optional
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS diagnosi_psichiatrica TEXT,
ADD COLUMN IF NOT EXISTS consenso_invio_sts BOOLEAN DEFAULT NULL,
ALTER COLUMN codice_fiscale DROP NOT NULL;

-- Drop existing unique constraint and create partial unique index for codice_fiscale
-- This allows multiple NULL values but keeps uniqueness for non-NULL values
DROP INDEX IF EXISTS patient_patients_codice_fiscale_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_codice_fiscale_unique 
ON patient.patients(codice_fiscale) 
WHERE codice_fiscale IS NOT NULL AND codice_fiscale != '';

-- Add comments for documentation (will overwrite if exists)
COMMENT ON COLUMN patient.patients.diagnosi_psichiatrica IS 'Psychiatric diagnosis - free text field for mental health diagnoses';
COMMENT ON COLUMN patient.patients.consenso_invio_sts IS 'Patient consent for STS data transmission: true=consent, false=no consent, null=not specified';
COMMENT ON COLUMN patient.patients.codice_fiscale IS 'Patient fiscal code - optional field, unique when provided';