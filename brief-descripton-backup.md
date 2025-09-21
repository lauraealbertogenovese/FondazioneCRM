1. Gestione Ruoli

Non tutti gli utenti devono avere accesso alle stesse informazioni.

Ruolo Medico/Psicologo/Psichiatra:

Accesso completo alle funzionalità di gestione delle cartelle cliniche e dei gruppi.

Può creare, modificare e visualizzare i dati dei pazienti a lui assegnati o di competenza.

Ruolo Amministrativo:

Accesso limitato alla piattaforma. Non può visualizzare i dati clinici sensibili dei pazienti.

Potrà gestire funzionalità non cliniche (es. fatturazione, anagrafiche di base)

2. Modulo Cartella Clinica Paziente

Questo è il cuore del sistema. Ogni medico deve poter gestire in modo autonomo e tracciabile i propri pazienti.

Anagrafica Paziente:

Creazione di un nuovo profilo paziente completo di:

Dati personali: Nome, Cognome, Data di Nascita, Codice Fiscale, Contatti (telefono, email), Stato Civile, Indirizzo di abitazione.

Informazioni contestuali: Lavoro, Modalità di contatto ("Come vi raggiunge").

Dati clinici primari: Sostanza di abuso, Diagnosi.

Diario Clinico (Note Cronologiche):

Possibilità di aggiungere note testuali per ogni colloquio o interazione.

Ogni nota deve registrare automaticamente l'autore (medico che la inserisce) e la data/ora di inserimento. Questo garantirà un audit log completo delle attività.

Gestione Documentale:

Funzionalità di upload per caricare documenti esterni (referti, consensi, etc.) all'interno della cartella del paziente.

Funzionalità di download per poter esportare i documenti caricati.

Ricerca e Filtri:

Il sistema deve permettere di filtrare l'elenco dei pazienti in base ai criteri anagrafici: Es. Età, Nome, Sostanza, Diagnosi, Abitazione, Stato Civile e Lavoro.

3. Modulo Gestione Gruppi

Il sistema deve prevedere una sezione dedicata anche alla gestione delle attività di gruppo.

Creazione Gruppo:

Un medico (identificato come "Conduttore") può creare un nuovo gruppo.

Attributi del gruppo: Nome (es. "Gruppo Familiari"), Descrizione delle attività o degli obiettivi.

Associazione Pazienti:

Possibilità di associare al gruppo due o più pazienti già registrati sulla piattaforma.

Idealmente, nella cartella clinica del singolo paziente dovrebbe essere presente un riferimento ai gruppi di cui fa parte.

Diario di Gruppo:

Analogamente alla cartella individuale, deve essere possibile inserire aggiornamenti cronologici sull'andamento delle attività di gruppo, con tracciamento di autore e data.

Gestione Documentale:

Funzionalità di upload per caricare documenti esterni all'interno del gruppo.

Funzionalità di download per poter esportare i documenti caricati.

4. Modulo Calendari e Prenotazioni (Fase Successiva)

Questa funzionalità è considerata secondaria e potrà essere implementata in una fase successiva.

Obiettivo Futuro: Superare l'attuale sistema a calendario unico per gestire le disponibilità di più medici contemporaneamente.

Requisiti Futuri:

Ogni medico dovrà avere un proprio calendario personale in cui inserire le proprie disponibilità.

Il sistema di prenotazione online (esposto sul sito web) dovrà aggregare queste disponibilità e mostrare all'utente finale solo gli slot orari in cui almeno un medico è disponibile, senza specificare quale.

Allo stesso modo, anche internamente, deve essere chiara l’organizzazione del singolo calendario del medico e di tutti gli appuntamenti schedulati giornalmente della fondazione.

5. Requisiti di Sistema e Privacy

Sicurezza e Hosting: Tutti i dati clinici devono risiedere su un'infrastruttura sicura e non devono essere trasferiti all'esterno, in conformità con le normative GDPR.

Consenso al Trattamento Dati: Il sistema deve prevedere un meccanismo per tracciare l'avvenuta ricezione del consenso informato da parte del paziente al trattamento dei propri dati.

Gestione Fatturazione: La piattaforma dovrà includere una sezione (probabilmente accessibile al ruolo Amministrativo) per gestire lo stato dei pagamenti, distinguendo tra pazienti paganti e non paganti.

# Requisiti e Acceptance Test del Sistema Gestionale per Medici e Amministrativi

---

## 1) Visualizzare elenco pazienti

**Come** Medico, voglio visualizzare una lista di tutti i pazienti registrati nel sistema, per avere una panoramica rapida e accedere facilmente alle singole cartelle cliniche.

### Acceptance Test:

- Nel menu di navigazione è presente la voce **"Pazienti"**.
- Cliccando su **"Pazienti"** si accede a una pagina con tabella o lista di pazienti.
- Per ogni paziente sono visibili: Nome, Cognome, Codice Fiscale e Sostanza di abuso primaria.
- Se non ci sono pazienti, la pagina mostra un messaggio:  
  _"Nessun paziente presente. Clicca su 'Nuovo Paziente' per iniziare"_
- La pagina contiene un pulsante **"Nuovo Paziente"** ben visibile.

---

## 2) Creare un nuovo paziente

**Come** Medico, voglio creare un nuovo profilo paziente compilando un modulo con dati anagrafici e clinici, per registrare un nuovo assistito e tracciare il percorso.

### Acceptance Test:

- Dalla lista pazienti, cliccando **"Nuovo Paziente"** appare un modulo di inserimento dati.
- Il modulo include i seguenti campi:
  - Nome (obbligatorio)
  - Cognome (obbligatorio)
  - Genere
  - Data di Nascita
  - Codice Fiscale (obbligatorio)
  - Telefono
  - Email
  - Stato Civile
  - Indirizzo
  - Con chi abita (menù a tendina: "Da solo", "In famiglia", "Convivente")
  - Lavoro
  - Come vi raggiunge
  - Sostanza di abuso primaria
  - Abusi secondari
  - Diagnosi
- Il sistema impedisce il salvataggio se Nome, Cognome o Codice Fiscale sono vuoti e mostra messaggio di errore.
- Dopo compilazione, cliccando su **"Salva"** i dati vengono salvati nel database.
- Dopo salvataggio, si viene reindirizzati alla pagina dettaglio del paziente creato.

---

## 3) Visualizzare dettaglio cartella paziente

**Come** Medico, voglio cliccare su un paziente dalla lista per vedere la pagina di dettaglio con tutte le sue informazioni anagrafiche e cliniche.

### Acceptance Test:

- Dalla lista pazienti, cliccando su riga o nome si apre la pagina di dettaglio.
- La pagina mostra in modo chiaro e organizzato tutti i dati inseriti.
- La pagina ha sezioni distinte per **"Diario Clinico"** e **"Documenti"**.
- Presente link/pulsante **"Torna all'elenco"** per tornare alla lista pazienti.

---

## 4) Aggiungere note cronologiche nel diario clinico

**Come** Medico, voglio aggiungere note testuali nel diario clinico del paziente in ordine cronologico.

### Acceptance Test:

- Nella pagina dettaglio paziente, nella sezione **Diario Clinico** è presente area testo e pulsante **"Aggiungi Nota"**.
- Inserendo testo e cliccando il pulsante, la nota viene salvata e mostrata nell'elenco note.
- Ogni nota mostra: testo, Nome e Cognome del medico che l'ha scritta, data e ora di inserimento.
- Le note sono ordinate in ordine cronologico inverso (più recente sopra).

---

## 5) Caricare e scaricare documenti nel paziente

**Come** Medico, voglio caricare e scaricare file nella cartella di un paziente per gestire referti e consensi.

### Acceptance Test:

- Nella pagina dettaglio paziente, nella sezione **Documenti** c'è un pulsante **"Carica Documento"**.
- Permette di selezionare file dal computer (tipi consentiti: PDF, DOCX, JPG, PNG; max 10MB).
- I file caricati appaiono in elenco con nome, data di caricamento e medico che li ha caricati.
- Ogni file ha link o icona **"Scarica"** per avviare il download.

---

## 6) Cercare e filtrare elenco pazienti

**Come** Medico, voglio filtrare la lista pazienti per trovare rapidamente un paziente o gruppi con caratteristiche comuni.

### Acceptance Test:

- Sulla pagina elenco pazienti è presente un'area filtri.
- Filtri almeno per: Nome/Cognome (testo), Sostanza di abuso primaria, Diagnosi.
- Applicando filtri, la lista si aggiorna mostrando solo i pazienti corrispondenti.
- Presente pulsante **"Resetta"** o **"Pulisci Filtri"** per rimuovere i filtri e vedere tutti.

---

## 7) Visualizzare elenco gruppi

**Come** Medico, voglio vedere la lista di tutti i gruppi creati per accedere ai dettagli di ciascuno.

### Acceptance Test:

- Nel menu di navigazione è presente la voce **"Gruppi"**.
- Cliccando su **"Gruppi"** si vede una tabella o lista dei gruppi esistenti.
- Per ogni gruppo visibili: Nome del Gruppo, Psicologi , Numero di Pazienti membri.
- Se non ci sono gruppi, si mostra il messaggio:  
  _"Nessun gruppo presente. Clicca su 'Nuovo Gruppo' per iniziare"_
- Presente pulsante ben visibile **"Nuovo Gruppo"**.

---

## 8) Creare nuovo gruppo

**Come** Medico, voglio creare un nuovo gruppo definendo nome, descrizione e psicologi per iniziare un'attività terapeutica di gruppo.

### Acceptance Test:

- Dalla lista gruppi, cliccando **"Nuovo Gruppo"** appare un modulo.
- Il modulo contiene:
  - Nome (testo, obbligatorio)
  - Descrizione (area testo estesa)
  - Psicologi(selezione multipla di utenti con ruolo "Medico")
- Almeno un conduttore è obbligatorio.
- Dopo compilazione e clic su **"Salva"**, il gruppo viene creato.
- Dopo salvataggio, si viene reindirizzati alla pagina dettaglio del gruppo.

---

## 9) Visualizzare pagina dettaglio gruppo

**Come** Medico, voglio accedere alla pagina di un gruppo per vedere informazioni e funzionalità specifiche.

### Acceptance Test:

- Dalla lista gruppi, cliccando su riga o nome si apre pagina dettaglio.
- La pagina mostra Nome, Descrizione, elenco Psicologi .
- Presente sezioni distinte per:
  - Pazienti Membri
  - Diario di Gruppo
  - Documenti
- Presente link/pulsante **"Torna all'elenco"**.

---

## 10) Aggiungere e rimuovere pazienti da un gruppo

**Come** Medico, voglio associare pazienti a un gruppo e gestirne l'appartenenza.

### Acceptance Test:

- Nella pagina dettaglio gruppo, nella sezione Pazienti Membri c'è pulsante **"Aggiungi/Gestisci Pazienti"**.
- Si apre interfaccia per cercare pazienti per nome, cognome o CF.
- Si possono selezionare pazienti da associare.
- L'elenco pazienti membri si aggiorna con i nomi aggiunti.
- Accanto a ogni paziente membro c'è un'opzione per rimuoverlo.

---

## 11) Aggiungere note cronologiche nel diario di un gruppo

**Come** Medico, voglio aggiungere aggiornamenti nel diario di gruppo per tracciare sessioni e dinamiche.

### Acceptance Test:

- Nella pagina dettaglio gruppo, nella sezione **Diario di Gruppo** c'è area testo e pulsante **"Aggiungi Nota"**.
- Inserendo testo e cliccando il pulsante, la nota viene salvata e appare nell'elenco.
- Ogni nota mostra testo, medico autore (Nome e Cognome), data e ora.
- Le note si ordinano in ordine cronologico inverso.

---

## 12) Caricare e scaricare documenti per un gruppo

**Come** Medico, voglio allegare documenti a un gruppo per condivisione e archiviazione.

### Acceptance Test:

- Nella pagina dettaglio gruppo, nella sezione **Documenti** c'è pulsante **"Carica Documento"**.
- Si possono selezionare file (PDF, DOCX, JPG, max 10MB).
- I documenti caricati appaiono in elenco con nome, data caricamento, medico autore.
- Ogni file ha link **"Scarica"** per download.

---

## 13) Visualizzare gruppi di un paziente

**Come** Medico, nella cartella di un paziente voglio vedere i gruppi a cui partecipa.

### Acceptance Test:

- Nella pagina dettaglio paziente c'è sezione **Gruppi di Appartenenza**.
- Elenca i nomi di tutti i gruppi di cui il paziente è membro.
- Ogni nome è link cliccabile che porta alla pagina dettaglio gruppo.
- Se nessun gruppo, si mostra:  
  _"Il paziente non è membro di nessun gruppo"_

---

## 14) Creare nuova fattura per un paziente

**Come** utente Amministrativo, voglio emettere una fattura selezionando paziente e inserendo dettagli prestazione.

### Acceptance Test:

- Nell'archivio fatture, cliccando **"Nuova Fattura"** inizia la procedura.
- Primo passo: campo ricerca paziente per Nome, Cognome, CF.
- Dopo selezione paziente, mostra modulo con:
  - Descrizione servizio/trattamento (obbligatoria)
  - Importo (numerico, obbligatorio)
- Cliccando **"Emetti Fattura"** crea record con numero progressivo, data odierna e stato “Da Pagare”.
- Dopo emissione, reindirizza all'archivio dove la nuova fattura è visibile in cima.

---

## 15) Visualizzare e filtrare archivio fatture

**Come** utente Amministrativo, voglio una pagina con tutte le fatture e filtri per monitorare situazioni contabili.

### Acceptance Test:

- Nel menu compare voce **"Fatturazione"** (non visibile a Medico).
- Cliccando, si apre pagina con tabella fatture.
- Nella tabella visibili: Numero Fattura, Data Emissione, Paziente Intestatario, Importo, Stato Pagamento.
- Presente controllo filtri per: Paziente, intervallo date, stato pagamento.
- Se nessuna fattura, messaggio:  
  _"Nessuna fattura presente in archivio"_
- Pulsante ben visibile **"Nuova Fattura"**.

---

## 16) Aggiornare stato pagamento fattura

**Come** utente Amministrativo, voglio cambiare stato fattura da "Da Pagare" a "Pagata" e viceversa.

### Acceptance Test:

- Nell'archivio, ogni fattura "Da Pagare" ha azione tipo **"Segna come Pagata"**.
- Eseguendo azione, stato si aggiorna nel database.
- Visualizzazione archivio si aggiorna immediatamente.
- Possibile anche invertire azione (da "Pagata" a "Da Pagare").
- Il filtro per stato pagamento funziona con stati aggiornati.

---

## 17) Visualizzare e scaricare documento fattura

**Come** utente Amministrativo, voglio generare e scaricare PDF di una fattura.

### Acceptance Test:

- Accanto a ogni fattura c'è azione **"Visualizza/Scarica PDF"**.
- Cliccando, sistema genera file PDF dinamico.
- PDF contiene: dati fondazione, dati paziente (nome, cognome, CF, indirizzo), numero e data fattura, descrizione prestazione, importo totale.
- PDF si apre in nuova scheda o si scarica.

---

## 18) Accesso sicuro al sistema

**Come** utente registrato (Medico o Amministrativo), voglio login e logout sicuri.

### Acceptance Test:

- Da non loggato, visitando app si reindirizza a pagina login con email e password.
- Inserendo credenziali corrette, si arriva alla dashboard (elenco pazienti per medico, archivio fatture per amministrativo).
- Credenziali errate mostrano messaggio generico _"Credenziali non valide"_.
- Da loggato, sempre visibile pulsante/link **"Logout"**.
- Cliccando logout, sessione termina e si torna a login.

---

## 19) Creare e gestire account utente

**Come** utente Root, voglio creare nuovi account e assegnare ruoli.

### Acceptance Test:

- Nel menu navigazione voce **"Utenti"** visibile a root.
- Sezione mostra elenco utenti con: Nome, Cognome, Email, Ruolo.
- Pulsante **"Nuovo Utente"** presente.
- Modulo creazione richiede Nome, Cognome, Email, Password, Ruolo (menù a tendina obbligatorio con "Medico", "Amministrativo", "Root").
- Nuovo utente salvato con ruolo assegnato.
- Nell'elenco possibile disattivare o eliminare utenti.

---

## 20) Accessi e permessi in base al ruolo

**Come** utente, voglio accedere solo alle sezioni permesse dal mio ruolo.

### Acceptance Test:

- **Ruolo Medico**:

  - Menu mostra solo **"Pazienti"** e **"Gruppi"**.
  - Non mostra **"Fatturazione"** e **"Gestione Utenti"**.
  - Accesso manuale a URL riservate mostra errore "Accesso Negato".
  - In scheda paziente, i dati clinici sensibili sono nascosti e non accessibili.

- **Ruolo Amministrativo**:

  - Menu mostra solo **"Fatturazione"**.
  - Non mostra **"Gruppi"**.
  - Accesso manuale a URL gruppi mostra errore "Accesso Negato".

- **Ruolo Root**:
  - Accesso completo a tutte le pagine e operazioni.

---

# Requisiti per Gestionale Fondazione

---

## 1. Ruoli

Non tutti gli utenti devono avere accesso alle stesse informazioni.

### Ruolo Clinico

- Membro dell’Equipe Clinica, composta da Psicologi, Medici (Psichiatri e altri), Infermieri.
- Accesso completo alle funzionalità di gestione cartelle cliniche e gruppi.
- Può creare, modificare e visualizzare dati di pazienti e gruppi.

### Ruolo Amministrativo

- Accesso limitato alla piattaforma.
- Non può visualizzare dati clinici sensibili dei pazienti.
- Gestisce le funzionalità di fatturazione.

### Ruolo Root/Admin

- Accesso completo a tutte le utenze e sezioni.
- Può gestire e creare gli altri account.

### Azioni di un Root/Admin:

- Posso accedere e uscire dal sistema in modo sicuro.
- Posso creare e gestire gli account utente per la piattaforma.
- Posso vedere e usare solo le sezioni per cui sono autorizzato.

---

## 2. Pazienti e Cartella Clinica

Visibile solo ai ruoli Clinici. Ogni clinico gestisce in modo autonomo e tracciabile i propri pazienti.

### Anagrafica Paziente

- Creazione profilo paziente con:
  - Dati personali: Nome, Cognome, Genere, Data di Nascita, Codice Fiscale, Contatti (telefono, email), Stato Civile, Indirizzo abitazione, Con chi abita (da solo, in famiglia, convivente).
  - Informazioni contestuali: Lavoro, Modalità di contatto ("Come vi raggiunge").
  - Dati clinici primari: Sostanza di abuso primaria, Abusi secondari, Diagnosi.

### Diario Clinico (Note Cronologiche)

- Possibilità di aggiungere note testuali per aggiornamenti/interazioni.
- Ogni nota registra automaticamente autore (clinico) e data/ora, garantendo audit log.

### Gestione Documentale

- Upload di documenti esterni (referti, consensi).
- Download per esportare i documenti caricati.

### Ricerca e Filtri

- Filtraggio elenco pazienti per criteri anagrafici: es. Età, Nome, Sostanza, Diagnosi.

### Azioni per Clinico

- Posso visualizzare elenco di tutti i pazienti.
- Posso creare un nuovo paziente.
- Posso visualizzare dettaglio cartella di un paziente.
- Posso aggiungere note cronologiche nel diario clinico.
- Posso caricare e scaricare documenti nella cartella paziente.
- Posso cercare e filtrare elenco pazienti.

---

## 3. Gruppi

Visibile solo ai ruoli Clinici. Gestione dedicata delle attività di gruppo.

### Creazione Gruppo

- Un clinico può creare un nuovo gruppo.
- Attributi: Nome (es. "Gruppo Familiari"), Psicologi(uno o più utenti Clinici), Descrizione attività/obiettivi.

### Associazione Pazienti

- Possibilità di associare al gruppo due o più pazienti registrati.
- Nella cartella di ogni paziente si dovrebbe vedere riferimento ai gruppi di appartenenza.

### Diario di Gruppo

- Inserimento aggiornamenti cronologici sull’andamento con tracciamento di autore e data.

### Gestione Documentale

- Upload e download documenti esterni nel gruppo.

### Azioni per Clinico

- Posso visualizzare elenco di tutti i gruppi.
- Posso creare un nuovo gruppo.
- Posso visualizzare pagina dettaglio gruppo.
- Posso aggiungere e rimuovere pazienti da un gruppo.
- Posso aggiungere note cronologiche nel diario di gruppo.
- Posso caricare e scaricare documenti per un gruppo.

---

## 4. Fatturazione

Modulo dedicato alla gestione amministrativa e contabile, accessibile solo a Ruolo Amministrativo.

### Creazione Fattura

- L’utente amministrativo può avviare emissione nuova fattura.

### Selezione Paziente

- Ricerca e selezione paziente registrato per nome, cognome o codice fiscale a cui intestare fattura.

### Dettagli Prestazione

- Campi da inserire:
  - Descrizione trattamento/servizio (campo testo o a selezione).
  - Importo della prestazione.
  - Modalità di Pagamento: Contanti o Tracciabile (assegni, carte).

### Archivio Fatture

- Storico fatture emesse consultabile dall’amministrazione.
- Possibilità di filtrare fatture per paziente e data.

### Azioni per Utente Amministrativo

- Posso creare una nuova fattura per un paziente.
- Posso visualizzare e filtrare archivio di tutte le fatture.
- Posso aggiornare lo stato di pagamento di una fattura.
- Posso visualizzare e scaricare il documento di una fattura.
