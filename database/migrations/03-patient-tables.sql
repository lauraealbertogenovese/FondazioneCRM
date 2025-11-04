-- Database migration to add diagnosi_psichiatrica field
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS diagnosi_psichiatrica TEXT;

-- Add comment for documentation (will overwrite if exists)
COMMENT ON COLUMN patient.patients.diagnosi_psichiatrica IS 'Psychiatric diagnosis - free text field for mental health diagnoses';