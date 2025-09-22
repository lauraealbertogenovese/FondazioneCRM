-- Schema Group - Gestione gruppi di supporto psicologico
-- Tabelle per il servizio di gestione gruppi

-- Tabella gruppi
CREATE TABLE IF NOT EXISTS "group".groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(50) NOT NULL,
    max_members INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    start_date DATE,
    end_date DATE,
    meeting_frequency VARCHAR(50),
    meeting_location VARCHAR(200),
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella membri dei gruppi
CREATE TABLE IF NOT EXISTS "group".group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES "group".groups(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patient.patients(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES auth.users(id), -- <--- Added user_id column
    member_type VARCHAR(20) NOT NULL CHECK (member_type IN ('patient', 'conductor')),
    role VARCHAR(50),
    joined_date DATE DEFAULT CURRENT_DATE,
    left_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella documenti di gruppo
CREATE TABLE IF NOT EXISTS "group".group_documents (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES "group".groups(id) ON DELETE CASCADE,
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

-- Tabella eventi e appuntamenti di gruppo
CREATE TABLE IF NOT EXISTS "group".group_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES "group".groups(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    event_type VARCHAR(50) NOT NULL,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabella note gruppo
CREATE TABLE IF NOT EXISTS "group".group_notes (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES "group".groups(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_groups_name ON "group".groups(name);
CREATE INDEX IF NOT EXISTS idx_groups_status ON "group".groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON "group".groups(group_type);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON "group".group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_patient_id ON "group".group_members(patient_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON "group".group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_member_type ON "group".group_members(member_type);
CREATE INDEX IF NOT EXISTS idx_group_members_is_active ON "group".group_members(is_active);
CREATE INDEX IF NOT EXISTS idx_group_documents_group_id ON "group".group_documents(group_id);
CREATE INDEX IF NOT EXISTS idx_group_documents_document_type ON "group".group_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON "group".group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_event_date ON "group".group_events(event_date);
CREATE INDEX IF NOT EXISTS idx_group_events_status ON "group".group_events(status);
CREATE INDEX IF NOT EXISTS idx_group_notes_group_id ON "group".group_notes(group_id);
CREATE INDEX IF NOT EXISTS idx_group_note_type ON "group".group_notes(note_type);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON "group".groups
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON "group".group_members
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_group_events_updated_at BEFORE UPDATE ON "group".group_events
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_group_notes_updated_at BEFORE UPDATE ON "group".group_notes
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();