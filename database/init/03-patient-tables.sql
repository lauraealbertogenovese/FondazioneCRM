-- Schema Patient - Gestione anagrafica pazienti
-- Tabelle per il servizio di gestione pazienti

-- Tabella pazienti
CREATE TABLE IF NOT EXISTS patient.patients (
    id SERIAL PRIMARY KEY,
    codice_fiscale VARCHAR(16) UNIQUE NOT NULL,
    numero_tessera_sanitaria VARCHAR(20) UNIQUE,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    data_nascita DATE NOT NULL,
    luogo_nascita VARCHAR(100),
    sesso CHAR(1) CHECK (sesso IN ('M', 'F')),
    indirizzo TEXT,
    citta VARCHAR(100),
    cap VARCHAR(10),
    provincia VARCHAR(2),
    telefono VARCHAR(20),
    email VARCHAR(100),
    anamnesi_medica TEXT,
    note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella documenti pazienti
CREATE TABLE IF NOT EXISTS patient.patient_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient.patients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella storia modifiche pazienti
CREATE TABLE IF NOT EXISTS patient.patient_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient.patients(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES auth.users(id),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_patients_codice_fiscale ON patient.patients(codice_fiscale);
CREATE INDEX IF NOT EXISTS idx_patients_tessera_sanitaria ON patient.patients(numero_tessera_sanitaria);
CREATE INDEX IF NOT EXISTS idx_patients_nome_cognome ON patient.patients(nome, cognome);
CREATE INDEX IF NOT EXISTS idx_patients_data_nascita ON patient.patients(data_nascita);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patient.patients(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON patient.patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON patient.patient_documents(file_type);
CREATE INDEX IF NOT EXISTS idx_history_patient_id ON patient.patient_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON patient.patient_history(created_at);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patient.patients
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();
