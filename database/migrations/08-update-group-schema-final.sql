-- Migrazione: Aggiornamento Schema Gruppi - Versione Finale
-- Aggiorna constraint member_type e semplifica tabella groups

-- =====================================================
-- 1. AGGIORNAMENTO CONSTRAINT MEMBER_TYPE
-- =====================================================

-- Aggiornare il constraint per accettare 'conductor' invece di 'psychologist'
ALTER TABLE "group".group_members 
DROP CONSTRAINT IF EXISTS group_members_member_type_check;

ALTER TABLE "group".group_members 
ADD CONSTRAINT group_members_member_type_check 
CHECK (member_type IN ('patient', 'conductor'));

-- Aggiornare tutti i record esistenti da 'psychologist' a 'conductor'
UPDATE "group".group_members 
SET member_type = 'conductor' 
WHERE member_type = 'psychologist';

-- =====================================================
-- 2. SEMPLIFICAZIONE TABELLA GROUPS (OPZIONALE)
-- =====================================================

-- Le colonne group_type e max_members non sono più utilizzate nel frontend
-- ma le manteniamo per compatibilità con dati esistenti
-- Aggiungiamo solo commenti per documentare che sono deprecate

COMMENT ON COLUMN "group".groups.group_type IS 'DEPRECATED: Non più utilizzato nel frontend - mantenuto per compatibilità';
COMMENT ON COLUMN "group".groups.max_members IS 'DEPRECATED: Non più utilizzato nel frontend - mantenuto per compatibilità';

-- =====================================================
-- 3. AGGIORNAMENTO INDICI E PERFORMANCE
-- =====================================================

-- Verificare che l'indice per user_id esista (dovrebbe già esistere)
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON "group".group_members(user_id);

-- Aggiungere indice composito per query frequenti
CREATE INDEX IF NOT EXISTS idx_group_members_group_active_type 
ON "group".group_members(group_id, is_active, member_type);

-- =====================================================
-- 4. VERIFICA INTEGRITÀ DATI
-- =====================================================

-- Verificare che tutti i member_type siano validi
SELECT 
    'Verifica member_type' as check_type,
    member_type,
    COUNT(*) as count
FROM "group".group_members 
GROUP BY member_type
ORDER BY member_type;

-- Verificare che non ci siano record con member_type 'psychologist'
SELECT 
    'Record con psychologist' as check_type,
    COUNT(*) as count
FROM "group".group_members 
WHERE member_type = 'psychologist';

-- Verificare che tutti i conductor abbiano user_id
SELECT 
    'Conductor senza user_id' as check_type,
    COUNT(*) as count
FROM "group".group_members 
WHERE member_type = 'conductor' AND user_id IS NULL;

-- Verificare che tutti i patient abbiano patient_id
SELECT 
    'Patient senza patient_id' as check_type,
    COUNT(*) as count
FROM "group".group_members 
WHERE member_type = 'patient' AND patient_id IS NULL;

-- =====================================================
-- 5. AGGIORNAMENTO COMMENTI E DOCUMENTAZIONE
-- =====================================================

-- Aggiornare commenti per documentare la nuova struttura
COMMENT ON TABLE "group".group_members IS 'Membri dei gruppi: patient (pazienti) e conductor (conduttori/staff)';
COMMENT ON COLUMN "group".group_members.member_type IS 'Tipo membro: patient (paziente) o conductor (conduttore)';
COMMENT ON COLUMN "group".group_members.user_id IS 'ID utente per conductor (staff), NULL per patient';
COMMENT ON COLUMN "group".group_members.patient_id IS 'ID paziente per patient, NULL per conductor';

-- =====================================================
-- 6. VERIFICA FINALE E REPORT
-- =====================================================

-- Mostrare struttura finale della tabella
SELECT 
    'Struttura finale group_members' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'group' 
  AND table_name = 'group_members'
ORDER BY ordinal_position;

-- Mostrare constraint aggiornato
SELECT 
    'Constraint member_type aggiornato' as info,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = '"group".group_members'::regclass 
  AND conname = 'group_members_member_type_check';

-- Mostrare riepilogo migrazione
SELECT 
    'Migrazione 08 completata: Schema gruppi aggiornato a versione finale' as message,
    NOW() as applied_at;

-- =====================================================
-- 7. STATISTICHE FINALI
-- =====================================================

-- Mostrare distribuzione membri per tipo
SELECT 
    'Distribuzione membri per tipo' as info,
    member_type,
    COUNT(*) as total_members,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_members,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_members
FROM "group".group_members 
GROUP BY member_type
ORDER BY member_type;
