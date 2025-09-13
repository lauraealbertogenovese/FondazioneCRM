# Database Migrations - Fondazione CRM

Questo sistema di migration gestisce l'evoluzione dello schema del database in modo controllato e tracciabile.

## 📁 Struttura

```
database/
├── migrations/
│   ├── 01-add-missing-clinical-columns.sql
│   ├── 02-simplify-member-types.sql  
│   ├── 03-add-user-id-step1.sql
│   ├── 04-update-member-types-conductor.sql
│   ├── 05-add-user-permissions.sql
│   ├── 06-add-patient-clinical-fields.sql
│   ├── 07-cleanup-roles-and-permissions.sql
│   ├── 08-update-group-schema-final.sql ✨ NUOVO
│   └── README.md
└── apply-migrations.js
```

## 🚀 Comandi Disponibili

### Applicare Migration Automaticamente
```bash
npm run db:migrate:new
```

### Applicare Migration Manualmente (Docker)
```bash
# Copia la migration nel container
docker cp database/migrations/06-add-patient-clinical-fields.sql fondazione-crm-postgres:/tmp/

# Esegui la migration
docker exec -i fondazione-crm-postgres psql -U crm_user -d fondazione_crm -f /tmp/06-add-patient-clinical-fields.sql
```

## 📋 Migration `06-add-patient-clinical-fields.sql`

### Cosa Aggiunge:
- ✅ `medico_curante` (INTEGER) - Foreign key verso `auth.users`
- ✅ `sostanza_abuso` (VARCHAR) - Sostanza di abuso primaria  
- ✅ `abusi_secondari` (TEXT[]) - Array sostanze secondarie
- ✅ `professione` (VARCHAR) - Professione del paziente
- ✅ `stato_civile` (VARCHAR) - Stato civile del paziente

### Indici Creati:
- `idx_patients_medico_curante` - Per ricerche per clinico
- `idx_patients_sostanza_abuso` - Per filtri sostanze
- `idx_patients_professione` - Per statistiche professionali
- `idx_patients_stato_civile` - Per demographic insights

### Commenti Aggiunti:
Ogni colonna ha commenti SQL per documentazione automatica.

## 📋 Migration `07-cleanup-roles-and-permissions.sql` ✨ NUOVO

### Cosa Fa:
- ✅ **Unifica ruoli duplicati**: Sposta utenti da 'operator' a 'Operatore'
- ✅ **Rimuove ruoli inutilizzati**: social_worker, viewer, volunteer
- ✅ **Ripara utenti orfani**: Assegna ruolo 'Operatore' come fallback
- ✅ **Aggiorna permessi**: Template granulare per ruolo 'Operatore'
- ✅ **Verifica integrità**: Controlli di consistenza dati

### Ruoli Finali:
- `admin` - Sistema (non eliminabile)
- `Operatore` - Base (personalizzabile) 
- `doctor`, `psychologist`, `counselor` - Custom (eliminabili)

### Sicurezza:
- ✅ Protezione utenti orfani
- ✅ Verifica integrità referenziale
- ✅ Rollback-safe (solo pulizia, nessuna struttura)

## 📋 Migration `08-update-group-schema-final.sql` ✨ NUOVO

### Cosa Fa:
- ✅ **Aggiorna constraint member_type**: Da 'psychologist' a 'conductor'
- ✅ **Migra dati esistenti**: Converte tutti 'psychologist' in 'conductor'
- ✅ **Ottimizza indici**: Aggiunge indice composito per performance
- ✅ **Depreca colonne**: Marca group_type e max_members come deprecate
- ✅ **Verifica integrità**: Controlli completi su dati e relazioni

### Modifiche Schema:
- `group_members.member_type`: `('patient', 'psychologist')` → `('patient', 'conductor')`
- **Indici aggiunti**: `idx_group_members_group_active_type` per query ottimizzate
- **Commenti aggiornati**: Documentazione completa della nuova struttura

### Compatibilità:
- ✅ **Backward compatible**: Mantiene colonne deprecate per compatibilità
- ✅ **Dati preservati**: Nessuna perdita di informazioni
- ✅ **Performance migliorate**: Indici ottimizzati per query frequenti

## ✅ Status Migration

| Migration | Status | Applicata | Note |
|-----------|--------|-----------|------|
| 01-add-missing-clinical-columns.sql | ✅ Applied | Auto | Clinical records support |
| 02-simplify-member-types.sql | ✅ Applied | Auto | Group member types |
| 03-add-user-id-step1.sql | ✅ Applied | Auto | User ID support |
| 04-update-member-types-conductor.sql | ✅ Applied | Auto | Conductor role |
| 05-add-user-permissions.sql | ✅ Applied | Auto | User permissions |
| 06-add-patient-clinical-fields.sql | ✅ Applied | Manual | Patient clinical data |
| 07-cleanup-roles-and-permissions.sql | ✅ Applied | Manual | Roles cleanup & unification |
| **08-update-group-schema-final.sql** | ✅ **Applied** | **Manual** | **Group schema final update** |

## 🔍 Tracking

Il sistema di migration automatico crea una tabella `public.migrations` per tracciare:
- ✅ Filename della migration
- ✅ Checksum per integrità  
- ✅ Timestamp di applicazione

## 🏥 Integrazione con Patient Model

Le modifiche al database sono completamente integrate con:
- ✅ **Backend Patient Model** - Tutti i campi mappati nel constructor
- ✅ **API Responses** - `getPublicData()` include i nuovi campi
- ✅ **Frontend Forms** - PatientFormPage supporta tutti i campi
- ✅ **Frontend Display** - PatientDetailPage mostra tutte le informazioni
- ✅ **Database JOIN** - Clinico di riferimento con nome e ruolo

## 🎯 Prossimi Passi

Per nuove migration:
1. Creare file `08-nome-migration.sql` in questo directory
2. Utilizzare `ALTER TABLE IF NOT EXISTS` per sicurezza
3. Aggiungere indici appropriati
4. Documentare con commenti SQL
5. Testare con `npm run db:migrate:new`

## 🔄 Applicare Migration 08

```bash
# Copia la migration nel container
docker cp database/migrations/08-update-group-schema-final.sql fondazione-crm-postgres:/tmp/

# Esegui la migration
docker exec -i fondazione-crm-postgres psql -U crm_user -d fondazione_crm -f /tmp/08-update-group-schema-final.sql
```

## 🔄 Applicare Migration 07

```bash
# Copia la migration nel container
docker cp database/migrations/07-cleanup-roles-and-permissions.sql fondazione-crm-postgres:/tmp/

# Esegui la migration
docker exec -i fondazione-crm-postgres psql -U crm_user -d fondazione_crm -f /tmp/07-cleanup-roles-and-permissions.sql
```

---

**✅ Sistema Migration Completo e Funzionale**