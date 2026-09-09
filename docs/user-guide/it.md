# Guida utente — Nexa

Nexa è il CRM del tuo team: contatti, aziende, trattative, attività, attività da
svolgere, email e automazioni, tutto in un unico posto. Questa guida copre l'uso
quotidiano. Per gestire l'organizzazione stessa (membri, ruoli), consulta la
[Guida amministratore](../admin-guide/it.md).

## Accedere

Vai all'indirizzo dell'app e accedi con la tua email e password. Se non hai ancora
un account, usa "Non hai ancora un account? Registrati" — riceverai un'email di
conferma per verificare il tuo indirizzo prima di poter accedere.

**Password dimenticata?** Clicca su "Password dimenticata?" nella schermata di
accesso, inserisci la tua email e segui il link ricevuto. Il link scade dopo un po'
di tempo — se smette di funzionare, richiedine semplicemente uno nuovo.

**Cambiare lingua:** usa il selettore di lingua in alto a destra nell'app. La scelta
viene ricordata su questo dispositivo/browser e non cambia l'indirizzo web.

## Scegliere un'organizzazione

Se appartieni a più di un'organizzazione, dopo l'accesso vedrai un elenco — scegli
"Apri" su quella in cui vuoi lavorare. Tutto ciò che vedi e fai da quel momento è
limitato a quell'organizzazione; i dati delle altre organizzazioni non sono mai
visibili.

## Dashboard

La prima cosa che vedi dentro un'organizzazione: conteggio di contatti e aziende,
valore e numero di trattative aperte, valore totale vinto, la tua pipeline per fase,
attività da svolgere in sospeso e scadute, numero di campagne, e un feed delle
attività recenti.

## Contatti

Persone. Ogni contatto ha un nome (obbligatorio), cognome, email, telefono,
facoltativamente un'azienda collegata, una lingua preferita, e una città/cantone
(cantoni svizzeri — utili per i filtri geografici in Segmenti). La creazione è una
breve procedura guidata in 2 passaggi: prima i dati di base, poi i dettagli
facoltativi. Clicca su **Modifica** su qualsiasi contatto per cambiarlo in seguito.

**Importare più contatti insieme:** usa **Importa CSV** sopra l'elenco dei contatti.
La prima riga deve essere l'intestazione; solo `firstName` è obbligatorio. `company`
viene associata per nome esatto a un'azienda esistente (lasciata vuota se non c'è
corrispondenza — non crea mai un'azienda al posto tuo). Vedrai quante righe sono
state importate e il motivo di eventuali fallimenti.

Eliminare un contatto non è subito permanente — vedi [Cestino](#cestino) più sotto.

## Aziende

Organizzazioni con cui fai affari. Un'azienda ha un nome e, facoltativamente, un
dominio del sito web. Collegare contatti e trattative a un'azienda permette di
vedere tutto ciò che la riguarda in un unico posto.

## Trattative

Un'opportunità di vendita: un titolo, un valore facoltativo e una fase. La pipeline
ha sei fasi:

**Lead → Qualificato → Proposta → Negoziazione → Vinto / Perso**

Sposta una trattativa tra le fasi man mano che avanza. La tabella della pipeline
nella dashboard e i totali aperto/vinto si aggiornano automaticamente. Una
trattativa può, facoltativamente, essere collegata a un contatto e/o un'azienda.

## Attività

Una voce collegata a un contatto, azienda e/o trattativa: una **Chiamata**,
**Email**, **Riunione** o **Nota**, con contenuto libero e data/ora. Le attività
sono la cronologia di tutto ciò che è accaduto — non avviano automazioni da sole (le
automazioni reagiscono a contatti *creati*, trattative che *cambiano fase*, e
attività da svolgere *completate*, non alle attività registrate).

## Attività da svolgere

Un'attività da svolgere con un titolo, una scadenza facoltativa, e uno stato
(**In sospeso** / **Completata**). Può essere collegata a un contatto, azienda e/o
trattativa, e assegnata a un membro specifico dell'organizzazione. Le attività da
svolgere scadute e in sospeso vengono segnalate nella dashboard.

## Email

Invia un'email singola a un contatto — facoltativamente collegata a una trattativa
specifica, così da comparire nel contesto di quella trattativa — tramite l'account
email configurato per la tua organizzazione. Ogni invio (riuscito o fallito) viene
registrato con oggetto, destinatario e data/ora, così hai sempre traccia di cosa è
stato inviato e quando.

> L'invio richiede che l'account SMTP proprio dell'organizzazione sia configurato
> nelle Impostazioni — consulta la [Guida amministratore](../admin-guide/it.md) o
> contatta un amministratore dell'organizzazione se l'invio non funziona.

## Automazioni

Regole "quando succede X, fai Y" che vengono eseguite automaticamente — nessun
passaggio manuale una volta configurate.

**Trigger:** un contatto viene creato · la fase di una trattativa cambia · un'attività
da svolgere viene completata.

**Azioni** (un'automazione può eseguirne più di una, in ordine): crea un'attività da
svolgere · registra un'attività · invia un'email.

Ogni automazione ha un nome, può essere attivata o disattivata indipendentemente, e
mantiene un registro delle esecuzioni — ogni volta che si attiva puoi vedere se
ciascuna delle sue azioni è riuscita o fallita, e perché.

## Segmenti

Un filtro salvato e riutilizzabile sui tuoi contatti — per azienda, presenza di
un'email, intervallo di date di creazione, cantone svizzero o città (ad esempio
"contatti presso Acme Corp con email" o "contatti a Ginevra"). Un segmento non è un
elenco fisso: viene ricalcolato ogni volta che viene usato, quindi riflette sempre i
tuoi contatti attuali. I segmenti esistono principalmente per alimentare le
Campagne (vedi sotto), ma la stessa logica di filtro è riutilizzabile ovunque serva
un elenco di contatti mirato.

## Campagne

Un'email inviata in massa a un segmento — o a "tutti quelli con un'email" se non
scegli un segmento. Una campagna ha un oggetto e un corpo del messaggio; una volta
inviata, vedi quanti destinatari hanno avuto successo e quanti sono falliti, con
l'errore specifico per ogni fallimento. Le campagne sono a invio unico: una volta
inviata, lo stato passa da **Bozza** a **Invio in corso** a **Inviata**, e non può
essere reinviata come la stessa campagna.

## Cestino

Eliminare un contatto, azienda, trattativa, attività, attività da svolgere,
segmento, automazione o campagna non li rimuove subito — vanno nel **Cestino**, dove
restano **30 giorni** e possono essere ripristinati da un OWNER o ADMIN
dell'organizzazione. Dopo 30 giorni spariscono definitivamente. Se hai eliminato
qualcosa per errore, chiedi a un amministratore di ripristinarlo dal **Cestino** nel
menu — oppure fallo tu stesso, se hai quel ruolo.

## Consigli

- Ogni elenco è limitato alla tua organizzazione attuale; cambiare organizzazione
  (tramite il link "Apri" nell'elenco delle organizzazioni) cambia tutto ciò che
  vedi.
- Se manca qualcosa che ti aspetti di vedere, verifica di essere nell'organizzazione
  giusta, che il tuo ruolo vi abbia accesso (consulta la
  [Guida amministratore](../admin-guide/it.md) per sapere cosa può fare ciascun
  ruolo), e che non sia nel Cestino.
