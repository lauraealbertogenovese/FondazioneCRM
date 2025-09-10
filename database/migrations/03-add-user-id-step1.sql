-- Migrazione step 1: Aggiungi solo la colonna user_id senza vincoli
BEGIN;

-- Aggiungi la colonna user_id
ALTER TABLE "group".group_members 
ADD COLUMN user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE;

-- Aggiungi indice per performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON "group".group_members(user_id);

COMMIT;
