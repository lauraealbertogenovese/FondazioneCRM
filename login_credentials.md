# 🔐 Credenziali di Accesso - Fondazione CRM

## 📋 Panoramica
Questo documento contiene tutte le credenziali di accesso disponibili per il sistema Fondazione CRM, organizzate per ruolo e livello di accesso.

## ⚠️ **IMPORTANTE - SICUREZZA**
- **NON CONDIVIDERE** queste credenziali in ambienti di produzione
- **CAMBIARE IMMEDIATAMENTE** le password in produzione
- **USARE SOLO** per sviluppo e testing

---

## 👑 **AMMINISTRATORI (Ruolo: admin)**

### 🔑 **Admin Principale**
- **Username:** `admin.fondazione`
- **Email:** admin@fondazionecura.it
- **Password:** `SecurePass123!`
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

### 🔑 **Admin Standard**
- **Username:** `admin`
- **Email:** admin@fondazione-crm.it
- **Password:** `Admin123!` ✅ RIPARATO
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

### 🔑 **Admin Alternativo 1**
- **Username:** `admin2`
- **Email:** admin2@fondazione-crm.it
- **Password:** `Admin123!` ✅ RIPARATO
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

### 🔑 **Super Admin**
- **Username:** `superadmin`
- **Email:** superadmin@fondazione-crm.it
- **Password:** `Admin123!` ✅ RIPARATO
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

### 🔑 **Test Admin**
- **Username:** `testadmin`
- **Email:** test@admin.com
- **Password:** `Admin123!` ✅ RIPARATO
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

### 🔑 **Test Login**
- **Username:** `testlogin`
- **Email:** testlogin@test.com
- **Password:** `password123` ✅ GIÀ FUNZIONANTE
- **Ruolo:** admin
- **Accesso:** Completo a tutte le funzionalità

---

## 👨‍💼 **OPERATORI (Ruolo: Operatore)**

### 🔑 **Operatore Daniel**
- **Username:** `Daniel`
- **Email:** daniel.montese@gmail.com
- **Password:** `Operatore123!` ✅ RIPARATO
- **Ruolo:** Operatore
- **Accesso:** Limitato secondo permessi del ruolo

### 🔑 **Test User 1**
- **Username:** `testuser`
- **Email:** test@example.com
- **Password:** `Operatore123!` ✅ RIPARATO
- **Ruolo:** Operatore
- **Accesso:** Limitato secondo permessi del ruolo

### 🔑 **Test User 2**
- **Username:** `testuser2`
- **Email:** test2@example.com
- **Password:** `Operatore123!` ✅ RIPARATO
- **Ruolo:** Operatore
- **Accesso:** Limitato secondo permessi del ruolo

---

## 🎯 **RUOLI E PERMESSI**

### 👑 **Admin (Ruolo: admin)**
- ✅ **Accesso completo** a tutte le funzionalità
- ✅ **Gestione utenti** (crea, modifica, elimina)
- ✅ **Gestione ruoli** (crea, modifica, elimina)
- ✅ **Gestione pazienti** (accesso completo)
- ✅ **Gestione gruppi** (accesso completo)
- ✅ **Gestione fatturazione** (accesso completo)
- ✅ **Gestione documenti** (accesso completo)
- ✅ **Configurazioni sistema** (email, audit, etc.)

### 👨‍💼 **Operatore (Ruolo: Operatore)**
- ✅ **Gestione pazienti** (accesso, creazione, modifica - NO eliminazione)
- ✅ **Gestione gruppi** (accesso, creazione, modifica - NO eliminazione)
- ✅ **Gestione documenti** (accesso, upload, download - NO eliminazione)
- ✅ **Record clinici** (accesso, creazione, modifica propri record)
- ❌ **Gestione utenti** (solo visualizzazione)
- ❌ **Gestione ruoli** (solo visualizzazione)
- ❌ **Gestione fatturazione** (nessun accesso)
- ❌ **Configurazioni sistema** (nessun accesso)

---

## 🚀 **COME ACCEDERE**

### 1. **Aprire il Browser**
- Vai su: `http://localhost:3007`

### 2. **Effettuare il Login**
- Inserisci **Username** e **Password** da una delle credenziali sopra
- Clicca su **"Accedi"**

### 3. **Navigazione**
- **Admin:** Accesso completo a tutte le sezioni
- **Operatore:** Accesso limitato secondo i permessi del ruolo

---

## 🔧 **NOTE TECNICHE**

### **Sistema di Permessi**
- Il sistema usa **permessi granulari** per controllare l'accesso
- I permessi sono gestiti a livello di **ruolo** e **utente**
- Gli **admin** hanno accesso completo
- Gli **operatori** hanno accesso limitato e personalizzabile

### **Password di Default** ⚠️ AGGIORNATE
- **Admin principali:** `Admin123!` (riparati il 12-09-2025)
- **Admin.fondazione:** `SecurePass123!` (riparata il 12-09-2025)  
- **Testlogin:** `password123` (già funzionante)
- **Operatori:** `Operatore123!` (riparati il 12-09-2025)

### **Ambiente di Sviluppo**
- **Database:** PostgreSQL (porta 5433)
- **Frontend:** React (porta 3007)
- **Backend:** Microservizi (porte 3000-3006)

---

## 📞 **SUPPORTO**

Per problemi di accesso o domande:
1. Controllare che i servizi Docker siano attivi
2. Verificare la connessione al database
3. Controllare i log dei servizi per errori

---

**Ultimo aggiornamento:** 12 Settembre 2025 (password admin riparate)
**Versione:** 1.1.0
