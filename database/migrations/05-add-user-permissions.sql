-- Migrazione: Aggiungere colonna permissions agli utenti
-- Permettere permessi personalizzati per singoli utenti oltre ai permessi di ruolo

-- Aggiungere colonna permissions JSONB alla tabella users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Aggiungere commento per documentazione
COMMENT ON COLUMN auth.users.permissions IS 'Permessi personalizzati per l''utente, integrano i permessi del ruolo';

-- Creare indice per performance delle query sui permessi
CREATE INDEX IF NOT EXISTS idx_users_permissions ON auth.users USING GIN (permissions);

-- Verifica della migrazione
SELECT 'Migrazione completata: colonna permissions aggiunta alla tabella users' as message;

-- Mostra esempio della struttura
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users' 
  AND column_name = 'permissions';
