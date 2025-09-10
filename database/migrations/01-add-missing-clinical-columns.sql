-- Migrazione per aggiungere colonne mancanti alla tabella clinical_records
-- Aggiunge title, description, record_type per supportare le note cliniche

-- Aggiungi colonne mancanti
ALTER TABLE clinical.clinical_records 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS record_type VARCHAR(50) DEFAULT 'consultation';

-- Aggiungi indice per record_type
CREATE INDEX IF NOT EXISTS idx_clinical_records_record_type ON clinical.clinical_records(record_type);

-- Aggiorna i record esistenti con valori di default
UPDATE clinical.clinical_records 
SET 
    title = COALESCE(title, 'Record Clinico'),
    description = COALESCE(description, diagnosis),
    record_type = COALESCE(record_type, 'consultation')
WHERE title IS NULL OR description IS NULL OR record_type IS NULL;
