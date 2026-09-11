# Continuo Benutzerhandbuch

Continuo ist das CRM deines Teams: Kontakte, Unternehmen, Deals, Aktivitäten, Aufgaben,
E-Mail und Automatisierungen, alles an einem Ort. Dieses Handbuch behandelt die
alltägliche Nutzung. Zur Verwaltung der Organisation selbst (Mitglieder, Rollen)
siehe das [Administratorhandbuch](../admin-guide/de.md).

## Anmelden

Rufe die App-Adresse auf und melde dich mit E-Mail und Passwort an. Falls du noch
kein Konto hast, nutze "Noch kein Konto? Registrieren" — du erhältst eine
Bestätigungs-E-Mail, um deine Adresse zu verifizieren, bevor du dich anmelden
kannst.

**Passwort vergessen?** Klicke auf dem Anmeldebildschirm auf "Passwort vergessen?",
gib deine E-Mail-Adresse ein und folge dem erhaltenen Link. Der Link läuft nach
einiger Zeit ab — funktioniert er nicht mehr, fordere einfach einen neuen an.

**Sprache ändern:** Nutze den Sprachwähler oben rechts in der App. Die Auswahl wird
für dieses Gerät/diesen Browser gespeichert und ändert nicht die Webadresse.

## Eine Organisation auswählen

Gehörst du zu mehr als einer Organisation, siehst du nach der Anmeldung eine Liste —
wähle "Öffnen" bei der, in der du arbeiten möchtest. Alles, was du danach siehst und
tust, ist auf diese Organisation beschränkt; Daten anderer Organisationen sind nie
sichtbar.

## Dashboard

Das Erste, was du in einer Organisation siehst: Anzahl der Kontakte und Unternehmen,
Wert und Anzahl offener Deals, gesamter gewonnener Wert, deine Pipeline nach Phase,
ausstehende und überfällige Aufgaben, Anzahl der Kampagnen, sowie ein Feed der
letzten Aktivitäten.

## Kontakte

Personen. Jeder Kontakt hat einen Vornamen (Pflichtfeld), Nachname, E-Mail, Telefon,
optional ein verknüpftes Unternehmen, eine bevorzugte Sprache und eine Stadt/einen
Kanton (Schweizer Kantone — nützlich für die geografischen Filter in Segmenten). Das
Anlegen ist ein kurzer Assistent in 2 Schritten: erst die Grunddaten, dann die
optionalen Details. Klicke bei einem Kontakt auf **Bearbeiten**, um ihn später zu
ändern.

**Mehrere auf einmal importieren:** Nutze **CSV importieren** oberhalb der
Kontaktliste. Die erste Zeile muss die Kopfzeile sein; nur `firstName` ist Pflicht.
`company` wird per exaktem Namen einem bestehenden Unternehmen zugeordnet (bleibt
ohne Treffer leer — es wird nie ein Unternehmen für dich erstellt). Du siehst, wie
viele Zeilen importiert wurden und den Grund für jeden Fehlschlag.

Das Löschen eines Kontakts ist nicht sofort endgültig — siehe [Papierkorb](#papierkorb)
weiter unten.

## Unternehmen

Organisationen, mit denen du Geschäfte machst. Ein Unternehmen hat einen Namen und
optional eine Website-Domain. Wenn du Kontakte und Deals mit einem Unternehmen
verknüpfst, siehst du alles Zugehörige an einem Ort.

## Deals

Eine Verkaufschance: ein Titel, ein optionaler Wert und eine Phase. Die Pipeline hat
sechs Phasen:

**Lead → Qualifiziert → Angebot → Verhandlung → Gewonnen / Verloren**

Bewege einen Deal zwischen den Phasen, während er voranschreitet. Die
Pipeline-Tabelle im Dashboard sowie die Summen für offen/gewonnen aktualisieren sich
automatisch. Ein Deal kann optional mit einem Kontakt und/oder einem Unternehmen
verknüpft werden.

## Aktivitäten

Ein Eintrag zu einem Kontakt, Unternehmen und/oder Deal: ein **Anruf**, eine
**E-Mail**, eine **Besprechung** oder eine **Notiz**, mit Freitext-Inhalt und
Datum/Uhrzeit. Aktivitäten sind das Protokoll von allem, was passiert ist — sie
lösen selbst keine Automatisierung aus (Automatisierungen reagieren auf *erstellte*
Kontakte, *geänderte* Deal-Phasen und *erledigte* Aufgaben, nicht auf erfasste
Aktivitäten).

## Aufgaben

Eine Aufgabe mit Titel, optionalem Fälligkeitsdatum und Status (**Ausstehend** /
**Erledigt**). Sie kann mit einem Kontakt, Unternehmen und/oder Deal verknüpft und
einem bestimmten Mitglied der Organisation zugewiesen werden. Überfällige,
ausstehende Aufgaben werden im Dashboard hervorgehoben.

## E-Mail

Sende eine einmalige E-Mail an einen Kontakt — optional mit einem bestimmten Deal
verknüpft, damit sie im Kontext dieses Deals erscheint — über das für deine
Organisation konfigurierte E-Mail-Konto. Jeder Versand (erfolgreich oder
fehlgeschlagen) wird mit Betreff, Empfänger und Zeitstempel protokolliert, sodass du
immer nachvollziehen kannst, was wann versendet wurde.

> Für den Versand muss das eigene SMTP-Konto der Organisation in den Einstellungen
> konfiguriert sein — siehe das [Administratorhandbuch](../admin-guide/de.md) oder
> wende dich an einen Organisations-Admin, falls der Versand nicht funktioniert.

## Automatisierungen

Regeln nach dem Muster "wenn X passiert, tue Y", die automatisch ausgeführt werden —
kein manueller Schritt nötig, sobald sie eingerichtet sind.

**Auslöser:** ein Kontakt wird erstellt · die Phase eines Deals ändert sich · eine
Aufgabe wird erledigt.

**Aktionen** (eine Automatisierung kann mehrere davon der Reihe nach ausführen):
eine Aufgabe erstellen · eine Aktivität erfassen · eine E-Mail senden.

Jede Automatisierung hat einen Namen, kann unabhängig aktiviert oder deaktiviert
werden und führt ein Ausführungsprotokoll — bei jeder Auslösung siehst du, ob jede
ihrer Aktionen erfolgreich war oder fehlgeschlagen ist, und warum.

## Segmente

Ein gespeicherter, wiederverwendbarer Filter über deine Kontakte — nach Unternehmen,
ob eine E-Mail vorhanden ist, Erstellungsdatum-Bereich, Schweizer Kanton oder Stadt
(z. B. "Kontakte bei Acme Corp mit E-Mail" oder "Kontakte in Genf"). Ein Segment ist
keine feste Liste: Es wird bei jeder Verwendung neu berechnet und spiegelt daher
immer deine aktuellen Kontakte wider. Segmente dienen hauptsächlich dazu, Kampagnen
zu speisen (siehe unten), aber dieselbe Filterlogik ist überall dort
wiederverwendbar, wo eine gezielte Kontaktliste nützlich ist.

## Kampagnen

Eine Massen-E-Mail an ein Segment — oder an "alle mit E-Mail-Adresse", wenn du kein
Segment auswählst. Eine Kampagne hat einen Betreff und einen Nachrichtentext; nach
dem Versand siehst du, wie viele Empfänger erfolgreich waren und wie viele
fehlgeschlagen sind, mit dem genauen Fehler für jeden Fehlschlag. Kampagnen sind
einmalig: Nach dem Versand wechselt der Status von **Entwurf** zu **Wird gesendet**
zu **Gesendet** und kann nicht als dieselbe Kampagne erneut gesendet werden.

## Papierkorb

Das Löschen eines Kontakts, Unternehmens, Deals, einer Aktivität, Aufgabe, eines
Segments, einer Automatisierung oder Kampagne entfernt sie nicht sofort — sie
wandern in den **Papierkorb**, wo sie **30 Tage** bleiben und von einem OWNER oder
ADMIN der Organisation wiederhergestellt werden können. Nach 30 Tagen sind sie
endgültig weg. Hast du versehentlich etwas gelöscht, bitte einen Admin, es aus dem
**Papierkorb** im Menü wiederherzustellen — oder mach es selbst, falls du diese
Rolle hast.

## Tipps

- Jede Liste ist auf deine aktuelle Organisation beschränkt; der Wechsel der
  Organisation (über den Link "Öffnen" in der Organisationsliste) ändert alles, was
  du siehst.
- Fehlt etwas, das du erwartest, prüfe, ob du in der richtigen Organisation bist, ob
  deine Rolle darauf Zugriff hat (siehe das
  [Administratorhandbuch](../admin-guide/de.md) für die Rechte jeder Rolle), und ob
  es nicht im Papierkorb liegt.
