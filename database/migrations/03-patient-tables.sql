-- Database migration to add diagnosi_psichiatrica field
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS diagnosi_psichiatrica TEXT,
ADD COLUMN IF NOT EXISTS consenso_invio_sts BOOLEAN DEFAULT NULL;

-- Add comment for documentation (will overwrite if exists)
COMMENT ON COLUMN patient.patients.diagnosi_psichiatrica IS 'Psychiatric diagnosis - free text field for mental health diagnoses';
COMMENT ON COLUMN patient.patients.consenso_invio_sts IS 'Patient consent for STS data transmission: true=consent, false=no consent, null=not specified';