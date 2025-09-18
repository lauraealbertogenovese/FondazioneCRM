-- Dati iniziali per Fondazione CRM
-- Inserimento di ruoli e utente amministratore di default
--
-- IMPORTANTE: SuperAdmin è l'utenza principale per il deployment online
-- Username: SuperAdmin
-- Password: SecurePass123!
-- Mantieni queste credenziali per l'accesso in produzione

-- Inserimento ruoli
INSERT INTO auth.roles (name, description, permissions) VALUES
('admin', 'Amministratore del sistema', '{"all": true}'),
('doctor', 'Medico/Dottore', '{"patients": {"read": true, "write": true}, "clinical": {"read": true, "write": true}}'),
('psychologist', 'Psicologo', '{"patients": {"read": true, "write": true}, "clinical": {"read": true, "write": true}, "groups": {"read": true, "write": true}}'),
('referente', 'Referente di gruppo', '{"patients": {"read": true}, "groups": {"read": true, "write": true}}'),
('operator', 'Operatore', '{"patients": {"read": true, "write": true}}')
ON CONFLICT (name) DO NOTHING;

-- Inserimento utenti di default
-- SuperAdmin: username=SuperAdmin, password=SecurePass123!
-- Altri utenti: password=password123
INSERT INTO auth.users (username, email, password_hash, first_name, last_name, phone, role_id) VALUES
('SuperAdmin', 'admin@fondazione-crm.it', '$2a$10$9sqoSOu1yX9fusHqdObUyeLjk/oF09vS0UKtq5X5CJMJ/kQC.bYay', 'Super', 'Admin', '+39 320 0000001', 1),
('dott.bianchi', 'dott.bianchi@fondazione-crm.it', '$2a$10$9k2G.9kfku1JkhKqHX7h9u9YudgDjb6KHpKoF660g5ebvZC4NcWnu', 'Marco', 'Bianchi', '+39 320 0000002', 3),
('testuser', 'test@example.com', '$2a$10$9k2G.9kfku1JkhKqHX7h9u9YudgDjb6KHpKoF660g5ebvZC4NcWnu', 'Test', 'User', '+39 320 0000003', 5)
ON CONFLICT (username) DO NOTHING;

-- Inserimento tipi di gruppi di esempio
INSERT INTO "group".groups (name, description, group_type, max_members, status, meeting_frequency, meeting_location, created_by) VALUES
('Gruppo Supporto Psicologico A', 'Gruppo di supporto psicologico per pazienti con ansia', 'supporto_psicologico', 8, 'active', 'settimanale', 'Sala A - Piano 1', 1),
('Gruppo Riabilitazione B', 'Gruppo di riabilitazione per pazienti post-traumatici', 'riabilitazione', 6, 'active', 'bisettimanale', 'Sala B - Piano 2', 1)
ON CONFLICT DO NOTHING;
