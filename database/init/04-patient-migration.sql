-- Migration to add missing columns to patient tables

-- Add missing columns to patients table
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS allergie TEXT,
ADD COLUMN IF NOT EXISTS farmaci_assunti TEXT,
ADD COLUMN IF NOT EXISTS contatto_emergenza_nome VARCHAR(100),
ADD COLUMN IF NOT EXISTS contatto_emergenza_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS contatto_emergenza_relazione VARCHAR(50),
ADD COLUMN IF NOT EXISTS consenso_trattamento_dati BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consenso_marketing BOOLEAN DEFAULT false;

-- Update sesso constraint to include 'Altro'
ALTER TABLE patient.patients DROP CONSTRAINT IF EXISTS patients_sesso_check;
ALTER TABLE patient.patients ADD CONSTRAINT patients_sesso_check CHECK (sesso IN ('M', 'F', 'Altro'));

-- Add missing columns to patient_documents table
ALTER TABLE patient.patient_documents 
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for document_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON patient.patient_documents(document_type);

-- Create trigger for patient_documents updated_at if it doesn't exist
CREATE TRIGGER update_patient_documents_updated_at BEFORE UPDATE ON patient.patient_documents
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();
