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
| **Membro** | Tutto ciò che è nella [Guida utente](../user-guide/it.md): contatti, aziende, trattative, attività, attività da svolgere, email, automazioni, segmenti, campagne. Non può aprire Impostazioni. |
| **Admin** | Tutto ciò che può fare un Membro, più: rinominare l'organizzazione, aggiungere/rimuovere membri, cambiare il ruolo dei membri. |
| **Owner** | Tutto ciò che può fare un Admin. L'unica differenza rispetto ad Admin oggi è la protezione "almeno un Owner" descritta sotto. |

## Rinominare l'organizzazione

Impostazioni → il campo del nome in alto → modificalo → **Salva**. Ha effetto
immediato ovunque venga mostrato il nome dell'organizzazione.

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
influisce su altre organizzazioni a cui appartiene. La rimozione è immediata e non
è annullabile — se rimuovi qualcuno per errore, dovrai aggiungerlo di nuovo.

## La regola "almeno un Owner"

Un'organizzazione non può mai restare senza Owner: non puoi retrocedere l'ultimo
Owner ad Admin/Membro, né puoi rimuoverlo. Se devi trasferire la proprietà,
promuovi prima qualcun altro a Owner, poi cambia il tuo ruolo o rimuoviti.

## Cosa le Impostazioni *non* coprono

- **Configurazione SMTP / invio email** — viene impostata una volta a livello di
  piattaforma per l'intera istanza, non per organizzazione, e non è esposta
  nell'interfaccia. Se l'invio email non funziona per la tua organizzazione,
  contatta chi gestisce la tua istanza Nexa (vedi
  [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md)).
- **Fatturazione / limiti di piano** — non esistono ancora; ogni organizzazione ha
  accesso completo e illimitato a tutti i moduli.
- **Eliminare l'organizzazione stessa** — non disponibile dall'interfaccia per ora.
