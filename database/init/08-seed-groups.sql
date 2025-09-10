-- Seed data per gruppi e membri
-- Aggiunge membri ai gruppi esistenti per testing

-- Aggiungi membri al Gruppo Supporto Psicologico A (ID: 1)
INSERT INTO "group".group_members (group_id, patient_id, member_type, role, joined_date, is_active, created_by) VALUES
(1, 1, 'patient', 'Membro attivo', '2025-09-01', true, 1),
(1, 2, 'patient', 'Membro attivo', '2025-09-02', true, 1),
(1, 3, 'patient', 'Membro attivo', '2025-09-03', true, 1);

-- Aggiungi membri al Gruppo Riabilitazione B (ID: 2)
INSERT INTO "group".group_members (group_id, patient_id, member_type, role, joined_date, is_active, created_by) VALUES
(2, 4, 'patient', 'Membro attivo', '2025-09-01', true, 1),
(2, 5, 'patient', 'Membro attivo', '2025-09-02', true, 1);

-- Aggiungi alcuni psicologi come membri dei gruppi (usando patient_id temporaneo)
-- Nota: In un sistema reale, questi dovrebbero essere utenti con ruolo psicologo
INSERT INTO "group".group_members (group_id, patient_id, member_type, role, joined_date, is_active, notes, created_by) VALUES
(1, 1, 'psychologist', 'Coordinatore', '2025-08-30', true, 'Psicologo coordinatore del gruppo', 1),
(2, 2, 'psychologist', 'Terapeuta principale', '2025-08-30', true, 'Responsabile delle sessioni di riabilitazione', 1);

-- Aggiungi un gruppo aggiuntivo per test
INSERT INTO "group".groups (name, description, group_type, max_members, status, start_date, meeting_frequency, meeting_location, created_by) VALUES
('Gruppo Attività Ricreative', 'Gruppo per attività ricreative e socializzazione', 'activity', 12, 'active', '2025-09-15', 'mensile', 'Sala Ricreativa - Piano Terra', 1);

-- Aggiungi membri al nuovo gruppo
INSERT INTO "group".group_members (group_id, patient_id, member_type, role, joined_date, is_active, created_by) VALUES
(3, 6, 'patient', 'Partecipante', '2025-09-15', true, 1),
(3, 7, 'patient', 'Partecipante', '2025-09-15', true, 1);

-- Aggiungi alcuni eventi di gruppo per test
INSERT INTO "group".group_events (group_id, title, description, event_date, duration_minutes, event_type, location, created_by) VALUES
(1, 'Sessione Settimanale', 'Sessione di supporto psicologico settimanale', '2025-09-10 15:00:00', 90, 'session', 'Sala A - Piano 1', 1),
(1, 'Incontro di Valutazione', 'Valutazione progressi del gruppo', '2025-09-17 15:00:00', 60, 'evaluation', 'Sala A - Piano 1', 1),
(2, 'Sessione Riabilitazione', 'Sessione di riabilitazione bisettimanale', '2025-09-12 10:00:00', 120, 'therapy', 'Sala B - Piano 2', 1),
(3, 'Attività Ludica', 'Giochi e attività ricreative mensili', '2025-09-20 14:00:00', 180, 'activity', 'Sala Ricreativa - Piano Terra', 1);
