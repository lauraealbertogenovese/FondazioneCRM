-- Migrazione per semplificare i tipi di membro dei gruppi
-- Rimuove 'referente' e 'observer' dal vincolo, lasciando solo 'patient' e 'psychologist'

BEGIN;

-- Rimuovi il vecchio vincolo
ALTER TABLE "group".group_members DROP CONSTRAINT IF EXISTS group_members_member_type_check;

-- Aggiungi il nuovo vincolo semplificato
ALTER TABLE "group".group_members ADD CONSTRAINT group_members_member_type_check 
    CHECK (member_type IN ('patient', 'psychologist'));

COMMIT;

-- Verifica che tutti i dati esistenti rispettino il nuovo vincolo
SELECT 'Verifica tipi membro dopo migrazione:' as message;
SELECT member_type, COUNT(*) as count 
FROM "group".group_members 
GROUP BY member_type 
ORDER BY member_type;
