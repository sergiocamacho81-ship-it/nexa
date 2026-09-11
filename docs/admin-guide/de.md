# Continuo Organisations-Administratorhandbuch

Dieses Handbuch richtet sich an Personen, die eine **Continuo-Organisation** selbst
verwalten — ihren Namen und ihre Mitglieder — über die App-Seite **Einstellungen**.
Es geht nicht um die Bereitstellung oder den Betrieb der Continuo-Plattform selbst; dafür
siehe [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (technisch, nur auf Englisch).

## Rollen

Jede Person in einer Organisation hat genau eine Rolle **in dieser Organisation**
(jemand in zwei Organisationen kann in jeder eine andere Rolle haben):

| Rolle | Kann |
|---|---|
| **Mitglied** | Alles aus dem [Benutzerhandbuch](../user-guide/de.md): Kontakte, Unternehmen, Deals, Aktivitäten, Aufgaben, E-Mail, Automatisierungen, Segmente, Kampagnen. Kann den Papierkorb sehen, aber nichts daraus wiederherstellen. Kann Einstellungen nicht öffnen. |
| **Admin** | Alles, was ein Mitglied kann, plus: Organisation umbenennen, SMTP konfigurieren, Mitglieder hinzufügen/entfernen, Rollen von Mitgliedern ändern, Elemente aus dem Papierkorb wiederherstellen. |
| **Owner** | Alles, was ein Admin kann, plus: die Organisation selbst löschen. Der einzige weitere Unterschied zu Admin ist der unten beschriebene "mindestens ein Owner"-Schutz. |

## Organisation umbenennen

Einstellungen → das Namensfeld oben → ändern → **Speichern**. Wirkt sich sofort
überall aus, wo der Organisationsname angezeigt wird.

## Ausgehende E-Mail (SMTP)

Einstellungen → **Ausgehende E-Mail (SMTP)**. Jede Organisation konfiguriert ihr
eigenes SMTP-Konto — es gibt kein gemeinsames Postfach der Plattform, daher
**versenden E-Mail und Kampagnen erst, wenn dies eingerichtet ist**: Server, Port,
Benutzername, Passwort und die Absenderadresse, sowie ob TLS verwendet werden soll.
Wer auch immer das Postfach deiner Organisation verwaltet (IT, Admin-Bereich deines
E-Mail-Anbieters), kann dir diese Angaben geben — dieselben, die du in jedem
E-Mail-Programm eingeben würdest.

Lasse das Passwortfeld beim Speichern anderer Änderungen leer, um das aktuelle
Passwort zu behalten; gib nur dann ein neues ein, wenn du es tatsächlich änderst.

## Mitglied hinzufügen

Einstellungen → **Mitglied hinzufügen** → E-Mail-Adresse eingeben und eine Rolle
wählen (Standard **Mitglied**) → **Hinzufügen**.

**Die Person muss bereits ein Continuo-Konto haben.** Derzeit gibt es keine
E-Mail-Einladung — falls sie sich noch nicht registriert hat, bitte sie, zuerst ein
Konto zu erstellen (siehe Abschnitt "Anmelden" im Benutzerhandbuch), und füge sie
dann mit dieser E-Mail-Adresse hinzu. Versuchst du, jemanden ohne Konto
hinzuzufügen, erhältst du eine entsprechende Fehlermeldung.

## Rolle eines Mitglieds ändern

Einstellungen → die Zeile des Mitglieds finden → das Rollen-Dropdown neben dem
Namen nutzen → die neue Rolle wählen. Wirkt sich sofort aus — kein
Bestätigungsschritt, keine Speichern-Schaltfläche.

## Mitglied entfernen

Einstellungen → die Zeile des Mitglieds finden → **Entfernen**. Dies entfernt nur
den Zugriff auf diese Organisation; das Continuo-Konto der Person wird nicht gelöscht,
und keine andere Organisation, der sie angehört, ist betroffen. Es ist nicht sofort
endgültig — siehe [Papierkorb](#papierkorb-gelöschtes-wiederherstellen) unten — und
sie über dieselbe E-Mail-Adresse erneut hinzuzufügen (Einstellungen → Mitglied
hinzufügen) stellt genau ihre vorherige Rolle wieder her, statt neu zu beginnen.

## Die "mindestens ein Owner"-Regel

Eine Organisation kann nie ohne Owner dastehen: Du kannst den letzten Owner nicht
zu Admin/Mitglied degradieren und auch nicht entfernen. Musst du die Eigentümerschaft
übertragen, befördere zuerst eine andere Person zum Owner und ändere dann erst deine
eigene Rolle oder entferne dich selbst.

## Papierkorb (Gelöschtes wiederherstellen)

Jedes Löschen in Continuo — ein Kontakt, Unternehmen, Deal, eine Aktivität, Aufgabe, ein
Segment, eine Automatisierung, Kampagne oder ein Mitglied — landet zuerst im
**Papierkorb** (im Menü), nicht direkt in der endgültigen Löschung. Es bleibt dort
**30 Tage**; ein OWNER oder ADMIN kann es von dieser Seite aus mit einem Klick
wiederherstellen. Ein Mitglied kann sehen, was im Papierkorb liegt, aber nichts
wiederherstellen. Nach 30 Tagen wird ein noch vorhandenes Element endgültig
gelöscht, sobald als Nächstes jemand die Papierkorb-Seite dieser Organisation öffnet
(es gibt keine geplante Bereinigung — nur eine Prüfung bei jedem Seitenaufruf).

## Organisation löschen

Einstellungen → **Gefahrenzone** → **Organisation löschen** (nur OWNER, mit
Bestätigungsabfrage). Dies verschiebt die gesamte Organisation in einen
papierkorbähnlichen Zustand: Sie verschwindet sofort aus der Organisationsliste
aller Beteiligten, aber **du** (der Owner, der sie gelöscht hat) kannst sie
innerhalb von 30 Tagen aus der Organisationsliste unter `/app` wiederherstellen.
Danach ist sie endgültig weg, samt allem, was sie enthält.

## Was Einstellungen *nicht* abdeckt

- **Abrechnung / Plan-Limits** — gibt es noch nicht; jede Organisation hat vollen,
  unbegrenzten Zugriff auf alle Module.
