-- Migrazione: Pulizia Ruoli e Unificazione Sistema Permessi
-- Rimuove ruoli duplicati e inutilizzati, unifica sistema ruoli

-- =====================================================
-- 1. PULIZIA RUOLI DUPLICATI E INUTILIZZATI
-- =====================================================

-- Spostare tutti gli utenti da 'operator' a 'Operatore' (se esistono ancora)
UPDATE auth.users 
SET role_id = (SELECT id FROM auth.roles WHERE name = 'Operatore')
WHERE role_id = (SELECT id FROM auth.roles WHERE name = 'operator');

-- Rimuovere ruolo 'operator' duplicato (se esiste)
DELETE FROM auth.roles WHERE name = 'operator';

-- Rimuovere ruoli inutilizzati (se non hanno utenti assegnati)
DELETE FROM auth.roles 
WHERE name IN ('social_worker', 'viewer', 'volunteer')
  AND id NOT IN (SELECT DISTINCT role_id FROM auth.users WHERE role_id IS NOT NULL);

-- =====================================================
-- 2. VERIFICA INTEGRITÀ DATI
-- =====================================================

-- Verificare che non ci siano utenti orfani
SELECT 
    u.id, 
    u.username, 
    u.role_id,
    r.name as role_name
FROM auth.users u
LEFT JOIN auth.roles r ON u.role_id = r.id
WHERE r.id IS NULL;

-- Se ci sono utenti orfani, assegnarli al ruolo 'Operatore' come fallback
UPDATE auth.users 
SET role_id = (SELECT id FROM auth.roles WHERE name = 'Operatore')
WHERE role_id IS NULL;

-- =====================================================
-- 3. AGGIORNAMENTO PERMESSI RUOLI BASE
-- =====================================================

-- Aggiornare permessi del ruolo 'Operatore' con template granulare
UPDATE auth.roles 
SET permissions = '{
  "pages": {
    "patients": {"access": true, "create": true, "edit": true, "delete": false, "view_sensitive": true},
    "clinical": {"access": true, "create_records": true, "edit_own_records": true, "edit_all_records": false},
    "groups": {"access": true, "create": true, "edit": true, "delete": false},
    "billing": {"access": false, "create": false, "edit": false, "delete": false}
  },
  "features": {
    "documents": {"access": true, "upload": true, "download": true, "delete": false}
  },
  "administration": {
    "users": {"access": false, "create": false, "edit": false, "delete": false},
    "roles": {"access": false, "create": false, "edit": false, "delete": false},
    "system": {"access": false, "email_config": false, "audit_logs": false}
  }
}'::jsonb
WHERE name = 'Operatore';

-- =====================================================
-- 4. DOCUMENTAZIONE E VERIFICA FINALE
-- =====================================================

-- Mostrare stato finale dei ruoli
SELECT 
    r.name,
    r.id,
    COUNT(u.id) as total_users,
    CASE 
        WHEN r.name = 'admin' THEN 'Sistema - Non eliminabile'
        WHEN r.name = 'Operatore' THEN 'Base - Personalizzabile'
        ELSE 'Custom - Eliminabile'
    END as role_type
FROM auth.roles r
LEFT JOIN auth.users u ON r.id = u.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- Verificare che tutti gli utenti abbiano un ruolo valido
SELECT 
    'Utenti senza ruolo' as check_type,
    COUNT(*) as count
FROM auth.users 
WHERE role_id IS NULL;

-- Mostrare riepilogo migrazione
SELECT 
    'Migrazione 07 completata: Pulizia ruoli e unificazione sistema permessi' as message,
    NOW() as applied_at;

-- =====================================================
-- 5. COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE auth.roles IS 'Ruoli sistema: admin (sistema), Operatore (base), altri (custom)';
COMMENT ON COLUMN auth.roles.permissions IS 'Permessi granulari in formato JSONB con sezioni: pages, features, administration';

-- Mostrare struttura finale
SELECT 
    'Struttura ruoli finale' as info,
    string_agg(r.name, ', ' ORDER BY r.name) as available_roles
FROM auth.roles r;
