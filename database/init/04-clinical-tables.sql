-- Schema Clinical - Gestione cartelle cliniche
-- Tabelle per il servizio di gestione cartelle cliniche

-- Tabella cartelle cliniche
CREATE TABLE IF NOT EXISTS clinical.clinical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient.patients(id) ON DELETE CASCADE,
    record_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella visite e appuntamenti
CREATE TABLE IF NOT EXISTS clinical.visits (
    id SERIAL PRIMARY KEY,
    clinical_record_id INTEGER REFERENCES clinical.clinical_records(id) ON DELETE CASCADE,
    visit_date TIMESTAMP NOT NULL,
    visit_type VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(100),
    visit_notes TEXT,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella documenti clinici
CREATE TABLE IF NOT EXISTS clinical.clinical_documents (
    id SERIAL PRIMARY KEY,
    clinical_record_id INTEGER REFERENCES clinical.clinical_records(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES clinical.visits(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    document_type VARCHAR(50) NOT NULL,
    description TEXT,
    uploaded_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella note cliniche
CREATE TABLE IF NOT EXISTS clinical.notes (
    id SERIAL PRIMARY KEY,
    clinical_record_id INTEGER REFERENCES clinical.clinical_records(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES clinical.visits(id) ON DELETE SET NULL,
    note_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_clinical_records_patient_id ON clinical.clinical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_record_number ON clinical.clinical_records(record_number);
CREATE INDEX IF NOT EXISTS idx_clinical_records_status ON clinical.clinical_records(status);
CREATE INDEX IF NOT EXISTS idx_visits_clinical_record_id ON clinical.visits(clinical_record_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON clinical.visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON clinical.visits(status);
CREATE INDEX IF NOT EXISTS idx_clinical_documents_clinical_record_id ON clinical.clinical_documents(clinical_record_id);
CREATE INDEX IF NOT EXISTS idx_clinical_documents_visit_id ON clinical.clinical_documents(visit_id);
CREATE INDEX IF NOT EXISTS idx_clinical_documents_document_type ON clinical.clinical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_notes_clinical_record_id ON clinical.notes(clinical_record_id);
CREATE INDEX IF NOT EXISTS idx_notes_visit_id ON clinical.notes(visit_id);
CREATE INDEX IF NOT EXISTS idx_notes_note_type ON clinical.notes(note_type);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_clinical_records_updated_at BEFORE UPDATE ON clinical.clinical_records
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON clinical.visits
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON clinical.notes
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();
