-- Migrazione per aggiungere campi clinici avanzati alla tabella patients
-- Aggiunge medico_curante, sostanza_abuso, abusi_secondari, professione, stato_civile

-- Aggiungi colonna medico_curante (foreign key verso auth.users)
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS medico_curante INTEGER REFERENCES auth.users(id);

-- Aggiungi colonne per sostanze di abuso
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS sostanza_abuso VARCHAR(255),
ADD COLUMN IF NOT EXISTS abusi_secondari TEXT[];

-- Aggiungi colonne per informazioni personali/professionali  
ALTER TABLE patient.patients 
ADD COLUMN IF NOT EXISTS professione VARCHAR(255),
ADD COLUMN IF NOT EXISTS stato_civile VARCHAR(100);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_patients_medico_curante ON patient.patients(medico_curante);
CREATE INDEX IF NOT EXISTS idx_patients_sostanza_abuso ON patient.patients(sostanza_abuso);
CREATE INDEX IF NOT EXISTS idx_patients_professione ON patient.patients(professione);
CREATE INDEX IF NOT EXISTS idx_patients_stato_civile ON patient.patients(stato_civile);

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN patient.patients.medico_curante IS 'ID dell''utente assegnato come clinico di riferimento del paziente';
COMMENT ON COLUMN patient.patients.sostanza_abuso IS 'Sostanza di abuso primaria del paziente';
COMMENT ON COLUMN patient.patients.abusi_secondari IS 'Array di sostanze di abuso secondarie';
COMMENT ON COLUMN patient.patients.professione IS 'Professione/occupazione del paziente';
COMMENT ON COLUMN patient.patients.stato_civile IS 'Stato civile del paziente (single, married, divorced, etc.)';