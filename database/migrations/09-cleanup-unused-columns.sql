-- Migrazione: Pulizia colonne non utilizzate e aggiunta phone
-- Rimuove colonne non utilizzate nel frontend e aggiunge phone a users

-- =====================================================
-- 1. AGGIUNTA COLONNA PHONE A AUTH.USERS
-- =====================================================

-- Aggiungi colonna phone alla tabella users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Aggiungi commento per documentazione
COMMENT ON COLUMN auth.users.phone IS 'Numero di telefono dell''utente';

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON auth.users(phone);

-- =====================================================
-- 2. RIMOZIONE COLONNE NON UTILIZZATE DA PATIENT.PATIENTS
-- =====================================================

-- Rimuovi colonne non utilizzate nel frontend
ALTER TABLE patient.patients 
DROP COLUMN IF EXISTS allergie,
DROP COLUMN IF EXISTS farmaci_assunti,
DROP COLUMN IF EXISTS contatto_emergenza_nome,
DROP COLUMN IF EXISTS contatto_emergenza_telefono,
DROP COLUMN IF EXISTS contatto_emergenza_relazione,
DROP COLUMN IF EXISTS consenso_marketing;

-- =====================================================
-- 3. VERIFICA INTEGRITÀ DATI
-- =====================================================

-- Verifica che la colonna phone sia stata aggiunta
SELECT 
    'Verifica colonna phone aggiunta' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users' 
  AND column_name = 'phone';

-- Verifica che le colonne non utilizzate siano state rimosse
SELECT 
    'Verifica colonne rimosse da patient.patients' as check_type,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'patient' 
  AND table_name = 'patients' 
  AND column_name IN ('allergie', 'farmaci_assunti', 'contatto_emergenza_nome', 
                      'contatto_emergenza_telefono', 'contatto_emergenza_relazione',
                      'consenso_marketing');

-- Mostra colonne rimanenti in patient.patients
SELECT 
    'Colonne rimanenti in patient.patients' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'patient' 
  AND table_name = 'patients'
ORDER BY ordinal_position;

-- =====================================================
-- 4. REPORT FINALE
-- =====================================================

-- Mostra riepilogo migrazione
SELECT 
    'Migrazione 09 completata: Pulizia colonne non utilizzate e aggiunta phone' as message,
    NOW() as applied_at;
