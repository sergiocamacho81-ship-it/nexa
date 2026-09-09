# Guida amministratore dell'organizzazione — Nexa

Questa guida è per chi gestisce un'**organizzazione Nexa** stessa — il suo nome e i
suoi membri — dalla pagina **Impostazioni** dell'app. Non riguarda la distribuzione
o la gestione della piattaforma Nexa stessa; per questo, consulta
[PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (tecnico, solo in inglese).

## Ruoli

Ogni persona in un'organizzazione ha esattamente un ruolo **in quell'organizzazione**
(qualcuno presente in due organizzazioni può avere un ruolo diverso in ciascuna):

| Ruolo | Può fare |
|---|---|
| **Membro** | Tutto ciò che è nella [Guida utente](../user-guide/it.md): contatti, aziende, trattative, attività, attività da svolgere, email, automazioni, segmenti, campagne. Può vedere il Cestino ma non ripristinare da esso. Non può aprire Impostazioni. |
| **Admin** | Tutto ciò che può fare un Membro, più: rinominare l'organizzazione, configurare l'SMTP, aggiungere/rimuovere membri, cambiare il ruolo dei membri, ripristinare elementi dal Cestino. |
| **Owner** | Tutto ciò che può fare un Admin, più: eliminare l'organizzazione stessa. L'unica altra differenza rispetto ad Admin è la protezione "almeno un Owner" descritta sotto. |

## Rinominare l'organizzazione

Impostazioni → il campo del nome in alto → modificalo → **Salva**. Ha effetto
immediato ovunque venga mostrato il nome dell'organizzazione.

## Email in uscita (SMTP)

Impostazioni → **Email in uscita (SMTP)**. Ogni organizzazione configura il proprio
account SMTP — non esiste una casella di posta condivisa a livello di piattaforma,
quindi **Email e Campagne non invieranno finché questo non è configurato**: server,
porta, nome utente, password e indirizzo mittente, più se usare TLS. Chiunque gestisca
la casella di posta della tua organizzazione (IT, pannello di amministrazione del tuo
provider email) può darti questi dati — gli stessi che useresti in qualsiasi client
di posta.

Lascia il campo della password vuoto quando salvi altre modifiche per mantenere
quella attuale; scrivine una nuova solo quando la stai effettivamente cambiando.

## Aggiungere un membro

Impostazioni → **Aggiungi membro** → inserisci la sua email e scegli un ruolo
(predefinito **Membro**) → **Aggiungi**.

**La persona deve già avere un account Nexa.** Al momento non esiste un invito via
email — se non si è ancora registrata, chiedile di creare prima un account (vedi la
sezione "Accedere" della Guida utente), poi aggiungila con quella email. Se provi ad
aggiungere qualcuno senza account, riceverai un errore che lo indica.

## Cambiare il ruolo di un membro

Impostazioni → trova la riga del membro → usa il menu a tendina del ruolo accanto
al nome → scegli il nuovo ruolo. Ha effetto immediato — nessun passaggio di
conferma, nessun pulsante di salvataggio.

## Rimuovere un membro

Impostazioni → trova la riga del membro → **Rimuovi**. Questo rimuove solo
l'accesso a questa organizzazione; non elimina l'account Nexa della persona né
influisce su altre organizzazioni a cui appartiene. Non è subito definitivo — vedi
[Cestino](#cestino-recuperare-elementi-eliminati) sotto — e riaggiungerla con la
stessa email (Impostazioni → Aggiungi membro) ripristina esattamente il ruolo che
aveva prima, invece di ripartire da zero.

## La regola "almeno un Owner"

Un'organizzazione non può mai restare senza Owner: non puoi retrocedere l'ultimo
Owner ad Admin/Membro, né puoi rimuoverlo. Se devi trasferire la proprietà,
promuovi prima qualcun altro a Owner, poi cambia il tuo ruolo o rimuoviti.

## Cestino (recuperare elementi eliminati)

Ogni eliminazione in Nexa — un contatto, azienda, trattativa, attività, attività da
svolgere, segmento, automazione, campagna o membro — finisce prima nel **Cestino**
(nel menu), non direttamente in un'eliminazione definitiva. Resta lì **30 giorni**;
un OWNER o ADMIN può ripristinarlo da quella pagina con un clic. Un Membro può
vedere cosa c'è nel Cestino ma non può ripristinare nulla. Dopo 30 giorni, un
elemento ancora presente viene eliminato definitivamente la prossima volta che
qualcuno apre la pagina Cestino di quell'organizzazione (non c'è una pulizia
programmata — solo un controllo ogni volta che la pagina viene visualizzata).

## Eliminare l'organizzazione

Impostazioni → **Zona pericolosa** → **Elimina organizzazione** (solo OWNER, con
richiesta di conferma). Questo sposta l'intera organizzazione in uno stato simile al
cestino: scompare immediatamente dall'elenco delle organizzazioni di tutti, ma **tu**
(l'Owner che l'ha eliminata) puoi ripristinarla dall'elenco delle organizzazioni su
`/app` entro 30 giorni. Dopodiché, scompare definitivamente con tutto ciò che
contiene.

## Cosa le Impostazioni *non* coprono

- **Fatturazione / limiti di piano** — non esistono ancora; ogni organizzazione ha
  accesso completo e illimitato a tutti i moduli.
