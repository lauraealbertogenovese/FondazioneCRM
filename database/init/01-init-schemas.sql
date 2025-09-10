-- Inizializzazione schemi per Fondazione CRM
-- Database unico PostgreSQL con schemi separati per servizio

-- Creazione schemi
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS patient;
CREATE SCHEMA IF NOT EXISTS clinical;
CREATE SCHEMA IF NOT EXISTS "group";

-- Configurazione permessi
GRANT USAGE ON SCHEMA auth TO crm_user;
GRANT USAGE ON SCHEMA patient TO crm_user;
GRANT USAGE ON SCHEMA clinical TO crm_user;
GRANT USAGE ON SCHEMA "group" TO crm_user;

-- Configurazione ricerca path
ALTER DATABASE fondazione_crm SET search_path TO auth, patient, clinical, "group", public;
