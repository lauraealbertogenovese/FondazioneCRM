-- Schema Auth - Gestione autenticazione e utenti
-- Tabelle per il servizio di autenticazione

-- Tabella ruoli
CREATE TABLE IF NOT EXISTS auth.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella utenti
CREATE TABLE IF NOT EXISTS auth.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER REFERENCES auth.roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella sessioni utente
CREATE TABLE IF NOT EXISTS auth.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON auth.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON auth.users(role_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON auth.user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.user_sessions(expires_at);

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON auth.roles
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();
