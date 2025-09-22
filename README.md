# Fondazione CRM

Sistema CRM per la gestione di pazienti, cartelle cliniche e gruppi di supporto psicologico.

## 🏗️ Architettura

Il sistema è basato su un'architettura a microservizi:

- **API Gateway** - Punto di ingresso unico (Porta 3000)
- **Auth Service** - Gestione autenticazione e utenti (Porta 3001)
- **Patient Service** - Gestione anagrafica pazienti (Porta 3002)
- **Clinical Service** - Gestione cartelle cliniche (Porta 3003)
- **Group Service** - Gestione gruppi di supporto (Porta 3004)
- **Frontend** - Applicazione React (Porta 3005)

## 🗄️ Database

- **PostgreSQL** con schemi separati per servizio
- **Schemi**: `auth`, `patient`, `clinical`, `group`

## 🚀 Avvio Rapido

### Prerequisiti

- Docker e Docker Compose
- Node.js (per sviluppo locale)

### Sviluppo

```bash
# Clona il repository
git clone <repository-url>
cd fondazione-crm

# Copia il file di configurazione
cp .env.example .env

# Avvia tutti i servizi
npm run dev

# Oppure direttamente con Docker Compose
docker-compose -f docker/docker-compose.dev.yml up --build
```

### Produzione

```bash
# Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con i valori di produzione

# Avvia in produzione
npm run prod
```

## 📁 Struttura Progetto

```
fondazione-crm/
├── backend/
│   ├── api-gateway/          # API Gateway
│   └── services/
│       ├── auth/             # Servizio Autenticazione
│       ├── patient/          # Servizio Pazienti
│       ├── clinical/         # Servizio Cartelle Cliniche
│       └── group/            # Servizio Gruppi
├── frontend/                 # Applicazione React
├── database/
│   ├── init/                 # Script di inizializzazione
│   ├── migrations/           # Migrazioni database
│   └── seeds/                # Dati di esempio
├── docker/                   # Configurazioni Docker
└── docs/                     # Documentazione
```

## 🔧 Comandi Utili

```bash
# Sviluppo
npm run dev              # Avvia ambiente di sviluppo
npm run stop             # Ferma ambiente di sviluppo
npm run logs             # Visualizza log dei servizi

# Database
npm run db:setup         # Setup database e migrazioni
npm run db:migrate       # Esegui migrazioni
npm run db:seed          # Inserisci dati di esempio

# Produzione
npm run prod             # Avvia ambiente di produzione
npm run stop:prod        # Ferma ambiente di produzione
```

## 🌐 Endpoints API

### Autenticazione

- `POST /auth/login` - Login utente
- `POST /auth/logout` - Logout utente
- `GET /auth/profile` - Profilo utente

### Pazienti

- `GET /patients` - Lista pazienti
- `POST /patients` - Crea paziente
- `GET /patients/:id` - Dettaglio paziente
- `PUT /patients/:id` - Aggiorna paziente

### Cartelle Cliniche

- `GET /clinical/records` - Lista cartelle
- `POST /clinical/records` - Crea cartella
- `GET /clinical/visits` - Lista visite

### Gruppi

- `GET /groups` - Lista gruppi
- `POST /groups` - Crea gruppo
- `GET /groups/:id/members` - Membri gruppo

## 🔐 Sicurezza

- Autenticazione JWT
- Validazione input su tutti gli endpoint
- Sanitizzazione dati
- Logging delle operazioni sensibili

## 📊 Funzionalità

### Gestione Pazienti

- Anagrafica completa (CF, tessera sanitaria, anamnesi medica)
- Gestione documenti (DOC, PDF)
- Storia modifiche
- Export dati

### Cartelle Cliniche

- Creazione e gestione cartelle
- Visite e appuntamenti
- Documenti clinici
- Note e osservazioni

### Gruppi di Supporto

- Gestione gruppi conduttorici
- Assegnazione pazienti con referenti
- Calendario eventi
- Documenti di gruppo

### Dashboard

- Calendario attività personalizzato
- Panoramica generale
- Accesso rapido alle funzionalità

## 🔮 Integrazioni Future

- Sistema Tessera Sanitaria
- Fatturazione Elettronica
- Notifiche email/SMS
- Reportistica avanzata

## 🛠️ Tecnologie

- **Frontend**: React + Material-UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose
- **Hosting**: AWS

## 📝 Licenza

MIT License

## 👥 Team

Fondazione CRM Development Team
