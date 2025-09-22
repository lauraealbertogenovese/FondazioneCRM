-- Dati di test per pazienti e cartelle cliniche
-- Inserimento pazienti di esempio

INSERT INTO patient.patients (
    nome, cognome, data_nascita, luogo_nascita, sesso, telefono, email,
    indirizzo, citta, cap, provincia, codice_fiscale, numero_tessera_sanitaria,
    consenso_trattamento_dati, medico_curante, sostanza_abuso, professione,
    stato_civile, note, created_by
) VALUES
('Mario', 'Rossi', '1985-03-15', 'Milano', 'M', '+39 320 1234567', 'mario.rossi@email.com',
 'Via Roma 123', 'Milano', '20100', 'MI', 'RSSMRA85C15F205X', '80380800301',
 true, 1, 'Alcol', 'Operaio', 'married', 'Paziente molto collaborativo', 1),

('Lucia', 'Bianchi', '1990-07-22', 'Roma', 'F', '+39 335 9876543', 'lucia.bianchi@email.com',
 'Corso Italia 45', 'Roma', '00100', 'RM', 'BNCLCU90L62H501Y', '80380800302',
 true, 1, 'Cocaina', 'Impiegata', 'single', 'Prima volta in terapia', 1),

('Andrea', 'Verdi', '1978-11-08', 'Napoli', 'M', '+39 347 5555666', 'andrea.verdi@email.com',
 'Piazza Garibaldi 12', 'Napoli', '80100', 'NA', 'VRDNDR78S08F839Z', '80380800303',
 false, 1, 'Eroina', 'Muratore', 'divorced', 'Necessita supporto familiare', 1),

('Sofia', 'Neri', '1995-01-30', 'Torino', 'F', '+39 368 3333444', 'sofia.neri@email.com',
 'Via Dante 67', 'Torino', '10100', 'TO', 'NRISFO95A70L219W', '80380800304',
 true, 1, 'Cannabis', 'Studentessa', 'single', 'Molto motivata al cambiamento', 1),

('Francesco', 'Gialli', '1988-09-12', 'Firenze', 'M', '+39 349 9999000', 'francesco.gialli@email.com',
 'Viale Europa 89', 'Firenze', '50100', 'FI', 'GLLFNC88P12D612Q', '80380800305',
 true, 1, 'Metadone', 'Cameriere', 'cohabiting', 'In programma di mantenimento', 1);

-- Inserimento cartelle cliniche per i pazienti
INSERT INTO clinical.clinical_records (
    patient_id, record_number, diagnosis, treatment_plan, notes, status, created_by
) VALUES
(1, 'CR-2025-001', 'Disturbo d''ansia generalizzato', 
 'Terapia cognitivo-comportamentale, esercizi di rilassamento, supporto psicologico settimanale',
 'Paziente presenta sintomi di ansia da circa 6 mesi. Buona compliance alle indicazioni terapeutiche.',
 'active', 1),

(2, 'CR-2025-002', 'Episodio depressivo maggiore', 
 'Psicoterapia individuale, valutazione farmacologica, monitoraggio settimanale',
 'Prima valutazione. Paziente motivata al percorso terapeutico.',
 'active', 1),

(3, 'CR-2025-003', 'Disturbo post-traumatico da stress', 
 'Terapia EMDR, supporto psicologico intensivo, tecniche di grounding',
 'Trauma legato a incidente stradale. Paziente in fase iniziale di elaborazione.',
 'active', 1),

(4, 'CR-2025-004', 'Disturbi dell''alimentazione', 
 'Approccio multidisciplinare, supporto nutrizionale, terapia familiare',
 'Anoressia nervosa. Coinvolgimento della famiglia nel percorso terapeutico.',
 'active', 1),

(5, 'CR-2025-005', 'Disturbo bipolare', 
 'Stabilizzazione dell''umore, psicoeducazione, monitoraggio farmacologico',
 'Diagnosi recente. Paziente in fase di stabilizzazione.',
 'active', 1);

-- Aggiornamento delle visite esistenti per collegarle ai pazienti
UPDATE clinical.visits 
SET clinical_record_id = 1 
WHERE id = 1;

UPDATE clinical.visits 
SET clinical_record_id = 2 
WHERE id = 2;

UPDATE clinical.visits 
SET clinical_record_id = 3 
WHERE id = 3;
