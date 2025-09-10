# Piano di Aggiornamento Librerie e Framework
## Fondazione CRM - Settembre 2025

### 📋 Stato Attuale
- **Progetto sviluppato**: Settembre 2025
- **Stack attuale**: React 18.2.0, Express 4.18.2, Material-UI 5.14.11
- **Età delle librerie**: 2-3 anni (tecnologie del 2022-2023)
- **Architettura**: Microservizi + SPA React

### 📏 Analisi Lunghezza File (Progetto Attuale)
**File Problematici (>500 righe):**
- `ProfessionalScheduler.js`: **1,908 righe** 🔴 CRITICO
- `ModernCalendar.js`: **1,063 righe** 🔴 CRITICO
- `EnhancedCalendar.js`: **951 righe** 🔴 CRITICO
- `PatientsPageNew.js`: **754 righe** 🔴 CRITICO
- `OnlineBooking.js`: **752 righe** 🔴 CRITICO
- `GroupsPage.js`: **707 righe** 🔴 CRITICO
- `VisitsPage.js`: **704 righe** 🔴 CRITICO
- `PatientFormPage.js`: **655 righe** 🔴 CRITICO
- `ClinicalRecordsPage.js`: **656 righe** 🔴 CRITICO

**File Accettabili (200-500 righe):**
- `DashboardPage.js`: 566 righe ⚠️
- `theme.js`: 558 righe ⚠️
- `UsersPageNew.js`: 558 righe ⚠️
- `PatientDetailPage.js`: 582 righe ⚠️

**Totale file >500 righe**: **9 file** (36% del frontend)
**Righe totali eccedenti**: ~4,500 righe oltre il limite

---

## 🎯 Obiettivi dell'Aggiornamento

### Benefici Attesi
- **Performance**: Miglioramenti significativi nelle prestazioni
- **Sicurezza**: Patch di sicurezza e vulnerabilità risolte
- **Funzionalità**: Accesso a nuove API e feature moderne
- **Manutenibilità**: Supporto community più attivo
- **Developer Experience**: Tooling migliorato
- **Refactoring File**: Riduzione lunghezza file durante l'aggiornamento

### Metriche di Successo
- ✅ Zero breaking changes per l'utente finale
- ✅ Miglioramento performance del 15-20%
- ✅ Riduzione bundle size del 10%
- ✅ Compatibilità con browser moderni
- ✅ **Tutti i file <500 righe** (nuovo target)

---

## 📊 Analisi del Rischio

### 🟢 **Basso Rischio** (Settimana 1-2)
- Librerie utility e dipendenze minori
- Aggiornamenti di patch e minor version
- Testing automatizzato sufficiente

### 🟡 **Medio Rischio** (Settimana 3-4)
- Aggiornamenti React ecosystem
- Material-UI major updates
- Possibili breaking changes documentati

### 🔴 **Alto Rischio** (Settimana 5-8)
- Express.js major version
- Node.js runtime updates
- Potential database driver changes

---

## 🗓️ Piano di Implementazione

### **FASE 1: Preparazione e Analisi** (3 giorni)

#### Giorno 1: Audit Completo
```bash
# Analisi dipendenze obsolete
npm outdated
npm audit

# Backup completo del progetto
git tag v1.0.0-pre-upgrade
git push origin v1.0.0-pre-upgrade
```

#### Giorno 2: Setup Environment di Test
- Creazione branch `feature/library-updates`
- Setup ambiente di staging isolato
- Configurazione CI/CD per testing automatico

#### Giorno 3: Documentazione Baseline
- Performance baseline measurements
- Screenshooting interfacce critiche
- Test suite completeness check

---

### **FASE 2: Aggiornamenti Sicuri** (5 giorni)

#### Frontend - Librerie Utility
```json
{
  "axios": "^1.8.0",          // da 1.5.0
  "date-fns": "^3.0.0",       // da 2.30.0  
  "helmet": "^8.0.0",         // da 7.1.0
  "morgan": "^2.0.0",         // da 1.10.0
  "cors": "^3.0.0"            // da 2.8.5
}
```

#### Procedura per ogni libreria:
1. **Aggiornamento singolo**
   ```bash
   npm install axios@latest
   npm run test
   npm run build
   ```

2. **Testing completo**
   - Test automatici esistenti
   - Test manuali per funzionalità critiche
   - Performance testing

3. **Commit atomico**
   ```bash
   git add .
   git commit -m "upgrade: axios 1.5.0 → 1.8.0"
   ```

---

### **FASE 3: React Ecosystem** (1 settimana)

#### React Core Update
```bash
# Backup specifico
git branch backup-before-react-19

# Aggiornamento graduale
npm install react@19.0.0 react-dom@19.0.0
npm install react-scripts@latest
```

#### Testing Checklist React:
- [ ] Authentication flow
- [ ] Route navigation (React Router)
- [ ] Context API functionality
- [ ] Form submissions
- [ ] API calls and interceptors
- [ ] Error boundaries

#### Possibili Breaking Changes:
```javascript
// Possibili modifiche necessarie
// 1. React 19 StrictMode changes
// 2. useEffect cleanup improvements
// 3. Concurrent features compatibility
```

---

### **FASE 4: Material-UI Upgrade** (1 settimana)

#### MUI 5.14.11 → 6.x
```bash
npm install @mui/material@6 @mui/icons-material@6 @mui/x-date-pickers@7
```

#### Testing Specifico MUI:
- [ ] Theme consistency
- [ ] Icon compatibility
- [ ] Date picker functionality
- [ ] Table components
- [ ] Form components (TextField, Select, etc.)
- [ ] Modal/Dialog components

#### Potenziali Issues MUI 6:
1. **API Breaking Changes**
   ```javascript
   // Possibili modifiche needed
   // - Prop renaming
   // - Component restructuring
   // - Theme structure changes
   ```

2. **Visual Regression Testing**
   - Screenshot comparison
   - Mobile responsiveness
   - Accessibility compliance

---

### **FASE 5: Backend Updates** (2 settimane)

#### Express.js 4.18.2 → 5.x
**Strategia**: Un microservizio per volta

##### Settimana 1: Auth Service
```bash
cd backend/services/auth
npm install express@5.0.0
npm test
npm run dev # Local testing
```

##### Testing per Express 5:
- [ ] Route handlers compatibility
- [ ] Middleware stack functionality
- [ ] Error handling
- [ ] Authentication flows
- [ ] Database connections

##### Settimana 2: Altri Services
```bash
# Patient Service
cd backend/services/patient && npm install express@5.0.0

# Clinical Service  
cd backend/services/clinical && npm install express@5.0.0

# Group Service
cd backend/services/group && npm install express@5.0.0

# Billing Service
cd backend/services/billing && npm install express@5.0.0
```

---

### **FASE 6: Database & Security Updates** (1 settimana)

#### PostgreSQL Client
```bash
npm install pg@8.12.0  # Latest stable
```

#### Security Libraries
```bash
npm install bcrypt@6.0.0         # da bcryptjs (migrazione)
npm install jsonwebtoken@10.0.0  # da 9.0.2
```

#### Migrazione bcryptjs → bcrypt:
```javascript
// Vecchio (bcryptjs)
const bcrypt = require('bcryptjs');

// Nuovo (bcrypt nativo)
const bcrypt = require('bcrypt');
// API identica, performance migliori
```

---

### **FASE 7: File Refactoring & Development Tools** (1 settimana)

#### Refactoring File Critici (Giorni 1-4)
**Target**: Ridurre tutti i file sotto le 500 righe

##### ProfessionalScheduler.js (1,908 → <500 righe)
```javascript
// Decomposizione in:
// - ProfessionalScheduler.js (300 righe)
// - SchedulerCalendar.js (250 righe)  
// - SchedulerEvents.js (200 righe)
// - SchedulerFilters.js (150 righe)
// - hooks/useScheduler.js (200 righe)
// - utils/schedulerUtils.js (150 righe)
```

##### ModernCalendar.js (1,063 → <500 righe)
```javascript
// Decomposizione in:
// - ModernCalendar.js (350 righe)
// - CalendarGrid.js (250 righe)
// - CalendarEvents.js (200 righe)
// - hooks/useCalendar.js (150 righe)
// - utils/calendarUtils.js (113 righe)
```

##### PatientsPageNew.js (754 → <500 righe)
```javascript
// Decomposizione in:
// - PatientsPage.js (300 righe)
// - PatientsTable.js (200 righe)
// - PatientsFilters.js (150 righe)
// - hooks/usePatients.js (104 righe)
```

#### Build Tools (Giorni 5-7)
```bash
# Considerare migrazione da Create React App a Vite
npm install vite @vitejs/plugin-react

# Testing Framework
npm install jest@30.0.0 @testing-library/react@15.0.0

# Development Server
npm install nodemon@4.0.0
```

---

## 🧪 Strategia di Testing

### Automated Testing
```bash
# Frontend
npm run test:coverage
npm run test:e2e

# Backend (per ogni servizio)
npm run test:unit
npm run test:integration
```

### Manual Testing Checklist

#### 🔐 Authentication & Authorization
- [ ] Login/logout flows
- [ ] Permission-based access
- [ ] Token refresh mechanism
- [ ] Session management

#### 👥 Patient Management
- [ ] Create/read/update/delete patients
- [ ] Search and filtering
- [ ] Document upload/download
- [ ] Patient data export

#### 🏥 Clinical Features
- [ ] Clinical records CRUD
- [ ] Visit scheduling
- [ ] Calendar functionality
- [ ] Medical history tracking

#### 💰 Billing System
- [ ] Invoice generation
- [ ] PDF creation
- [ ] Payment tracking
- [ ] Financial reports

#### 👨‍👩‍👧‍👦 Group Management
- [ ] Group creation/management
- [ ] Member assignments
- [ ] Group permissions

---

## 🚀 Deployment Strategy

### Staging Environment
1. **Pre-deployment Testing**
   ```bash
   # Build verification
   npm run build:prod
   docker-compose -f docker-compose.staging.yml up
   ```

2. **Load Testing**
   - Performance benchmarks
   - Concurrent user simulation
   - Database stress testing

3. **Security Scanning**
   ```bash
   npm audit
   docker scan <image-name>
   ```

### Production Deployment

#### Blue-Green Deployment
1. **Prepare Green Environment**
   - Deploy updated services to parallel infrastructure
   - Run smoke tests

2. **Traffic Switch**
   - Gradual traffic migration
   - Monitoring dashboards
   - Rollback plan ready

3. **Monitoring Post-Deployment**
   - Application metrics
   - Error rate monitoring  
   - Performance tracking

---

## 📋 Rollback Plan

### Emergency Rollback Procedure
```bash
# Immediate rollback (< 5 minutes)
git checkout v1.0.0-pre-upgrade
docker-compose down
docker-compose up -d

# Database rollback (if needed)
psql -f backup_pre_upgrade.sql
```

### Rollback Triggers
- Error rate > 5%
- Performance degradation > 25%
- Critical functionality broken
- Security vulnerabilities exposed

---

## 📊 Timeline Summary

| Fase | Durata | Rischio | Componenti |
|------|--------|---------|------------|
| **Fase 1** | 3 giorni | 🟢 Basso | Preparazione |
| **Fase 2** | 5 giorni | 🟢 Basso | Librerie utility |
| **Fase 3** | 1 settimana | 🟡 Medio | React ecosystem |
| **Fase 4** | 1 settimana | 🟡 Medio | Material-UI |
| **Fase 5** | 2 settimane | 🟡 Medio | Express.js |
| **Fase 6** | 1 settimana | 🔴 Alto | Database/Security |
| **Fase 7** | 1 settimana | 🟡 Medio | Refactoring + Dev tools |

### **Durata Totale: 7-8 settimane**

---

## 📏 Best Practices per Lunghezza File

### **🎯 Linee Guida Raccomandate**

#### **JavaScript/TypeScript**
- **Ottimale**: 50-200 righe
- **Accettabile**: 200-300 righe  
- **Limite massimo**: **500 righe**
- **Critico**: >500 righe (richiede refactoring)

#### **React Components**
- **Functional Component**: 50-150 righe
- **Complex Page Component**: 200-300 righe
- **Hook personalizzato**: 50-100 righe
- **Utility file**: 100-200 righe

#### **Backend Files**
- **Route handler**: 100-200 righe
- **Model/Schema**: 200-300 righe
- **Service layer**: 150-250 righe
- **Middleware**: 50-150 righe

### **⚠️ Indicatori di Refactoring Necessario**

#### **Quando splitare un file:**
1. **>500 righe totali**
2. **>3 responsabilità diverse**
3. **>10 funzioni/metodi**
4. **Scroll verticale eccessivo**
5. **Difficoltà nel trovare codice**
6. **Testing complesso**

#### **Strategie di Decomposizione:**

##### **1. Separazione per Responsabilità**
```javascript
// Da: PatientsPage.js (754 righe)
// A:
├── PatientsPage.js          // 300 righe (UI principale)
├── PatientsTable.js         // 200 righe (tabella)
├── PatientsFilters.js       // 150 righe (filtri)
└── hooks/usePatients.js     // 104 righe (logica)
```

##### **2. Extract Custom Hooks**
```javascript
// Da: componente 800 righe
// A:
├── Component.js           // 250 righe (UI)
├── useComponentData.js    // 200 righe (data fetching)
├── useComponentState.js   // 150 righe (state management)
└── componentUtils.js      // 200 righe (utilities)
```

##### **3. Composizione Componenti**
```javascript
// Da: Dashboard.js (600 righe)
// A:
├── Dashboard.js           // 200 righe (layout)
├── DashboardStats.js      // 150 righe (statistiche)
├── DashboardCharts.js     // 150 righe (grafici)
└── DashboardActions.js    // 100 righe (azioni)
```

### **🔧 Strumenti per Monitoraggio**

#### **ESLint Rules**
```javascript
// .eslintrc.js
rules: {
  'max-lines': ['error', { max: 500, skipBlankLines: true }],
  'max-lines-per-function': ['warn', 50],
  'complexity': ['warn', 10]
}
```

#### **Script di Monitoraggio**
```bash
# Trova file >500 righe
find src -name "*.js" -exec wc -l {} + | awk '$1 > 500'

# Report lunghezza file
cloc src --by-file --csv | sort -t, -k5 -nr
```

### **📈 Benefici del Refactoring**

#### **Manutenibilità**
- ✅ Codice più leggibile
- ✅ Easier debugging
- ✅ Testing più focale
- ✅ Code review semplificati

#### **Performance**
- ✅ Tree shaking migliorato
- ✅ Code splitting naturale
- ✅ Lazy loading componenti
- ✅ Bundle size ridotto

#### **Developer Experience**
- ✅ Navigate più veloce
- ✅ IntelliSense migliore
- ✅ Git diff più chiari
- ✅ Merge conflict ridotti

---

## 🎯 Milestone e Deliverables

### Milestone 1 (Fine Settimana 2)
- ✅ Librerie utility aggiornate
- ✅ Suite di test completa
- ✅ Performance baseline documented

### Milestone 2 (Fine Settimana 4)  
- ✅ React 19 completamente integrato
- ✅ Material-UI 6 migrato
- ✅ Frontend completamente testato

### Milestone 3 (Fine Settimana 6)
- ✅ Tutti i microservizi aggiornati
- ✅ Express 5 in produzione
- ✅ Database layer modernizzato

### Milestone 4 (Fine Settimana 7)
- ✅ Development tools aggiornati
- ✅ CI/CD pipeline ottimizzata
- ✅ Documentazione aggiornata

---

## 💰 Budget Stimato

### Effort Developement
- **Senior Developer**: 6-7 settimane full-time
- **QA Testing**: 2 settimane part-time
- **DevOps Support**: 1 settimana part-time

### Infrastructure
- **Staging Environment**: Costi temporanei
- **Monitoring Tools**: Upgrade subscriptions
- **Backup Storage**: Incrementale

### Rischi/Contingency
- **Buffer time**: +20% (1.5 settimane)
- **Emergency support**: Budget reserved

---

## 📚 Documentazione da Aggiornare

### Technical Documentation
- [ ] API documentation updates
- [ ] Architecture diagrams refresh
- [ ] Database schema versioning
- [ ] Security compliance docs

### Operational Documentation  
- [ ] Deployment procedures
- [ ] Monitoring playbooks
- [ ] Incident response plans
- [ ] Performance benchmarks

### User Documentation
- [ ] Feature updates guide
- [ ] UI/UX changes documentation
- [ ] Training materials update

---

## 🔍 Post-Upgrade Monitoring

### Performance Metrics (30 giorni)
- Response time improvements
- Memory usage optimization
- Bundle size reduction
- Database query performance

### Stability Metrics (60 giorni)
- Error rate trends
- Uptime measurements
- User satisfaction scores
- Support ticket volume

### Success Criteria
- Zero critical bugs introduced
- Performance improvement achieved
- Team productivity increased
- Maintenance overhead reduced

---

## 📞 Support & Escalation

### Internal Team
- **Technical Lead**: Piano implementation
- **Senior Developer**: Hands-on upgrades  
- **QA Lead**: Testing coordination
- **DevOps Engineer**: Infrastructure support

### External Resources
- **React Community**: GitHub issues, Discord
- **Material-UI Support**: Premium support plan
- **Express.js**: Community forums
- **Database Vendor**: Professional support

---

## 📝 Final Notes

### Success Factors
1. **Gradual approach**: Minimize risk through incremental updates
2. **Comprehensive testing**: Never skip testing phases
3. **Team communication**: Daily standups during upgrade period
4. **Documentation**: Keep all changes well documented

### Lessons Learned Planning
- Document all unexpected issues
- Note performance improvements
- Record time spent per phase
- Collect team feedback for future upgrades

---

**Created**: September 2025  
**Version**: 1.0  
**Next Review**: Post-implementation (7-8 settimane)
