-- Migrazione per allineare schema database con backend
-- Correzione tabella group_members e groups

-- 1. Aggiungere colonna user_id per supportare conduttori/staff come membri
ALTER TABLE "group".group_members
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Modificare constraint per permettere patient_id OR user_id (ma non entrambi)
ALTER TABLE "group".group_members
DROP CONSTRAINT IF EXISTS group_members_member_check;

ALTER TABLE "group".group_members
ADD CONSTRAINT group_members_member_check
CHECK (
    (patient_id IS NOT NULL AND user_id IS NULL AND member_type = 'patient') OR
    (user_id IS NOT NULL AND patient_id IS NULL AND member_type IN ('conductor'))
);

-- 3. Rimuovere max_members (non più usato nel backend)
ALTER TABLE "group".groups
DROP COLUMN IF EXISTS max_members;

-- 4. Aggiornare member_type constraint per includere 'conductor' se necessario
-- (Oppure confermare che usiamo 'conductor')
ALTER TABLE "group".group_members
DROP CONSTRAINT IF EXISTS group_members_member_type_check;

ALTER TABLE "group".group_members
ADD CONSTRAINT group_members_member_type_check
CHECK (member_type IN ('patient', 'conductor'));

-- 5. Creare indice per user_id
CREATE INDEX IF NOT EXISTS idx_group_members_user_id
ON "group".group_members(user_id);