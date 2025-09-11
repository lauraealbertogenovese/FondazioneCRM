-- Migration: Update member types to use 'conductor' instead of 'psychologist'
-- This allows any staff member to be a group conductor, not just psychologists

-- First, update existing psychologist records to conductor
UPDATE "group".group_members 
SET member_type = 'conductor' 
WHERE member_type = 'psychologist';

-- Drop the old constraint
ALTER TABLE "group".group_members
DROP CONSTRAINT IF EXISTS group_members_member_type_check;

-- Add new constraint with 'conductor' instead of 'psychologist'
ALTER TABLE "group".group_members
ADD CONSTRAINT group_members_member_type_check
CHECK (member_type IN ('patient', 'conductor'));

-- Verify the update
SELECT 'Verifica member_types dopo migrazione:' as message;
SELECT member_type, COUNT(*) 
FROM "group".group_members 
GROUP BY member_type;
