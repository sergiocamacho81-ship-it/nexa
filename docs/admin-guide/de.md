# Nexa Organisations-Administratorhandbuch

Dieses Handbuch richtet sich an Personen, die eine **Nexa-Organisation** selbst
verwalten — ihren Namen und ihre Mitglieder — über die App-Seite **Einstellungen**.
Es geht nicht um die Bereitstellung oder den Betrieb der Nexa-Plattform selbst; dafür
siehe [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (technisch, nur auf Englisch).

## Rollen

Jede Person in einer Organisation hat genau eine Rolle **in dieser Organisation**
(jemand in zwei Organisationen kann in jeder eine andere Rolle haben):

| Rolle | Kann |
|---|---|
| **Mitglied** | Alles aus dem [Benutzerhandbuch](../user-guide/de.md): Kontakte, Unternehmen, Deals, Aktivitäten, Aufgaben, E-Mail, Automatisierungen, Segmente, Kampagnen. Kann Einstellungen nicht öffnen. |
| **Admin** | Alles, was ein Mitglied kann, plus: Organisation umbenennen, Mitglieder hinzufügen/entfernen, Rollen von Mitgliedern ändern. |
| **Owner** | Alles, was ein Admin kann. Der einzige Unterschied zu Admin ist heute der unten beschriebene "mindestens ein Owner"-Schutz. |

## Organisation umbenennen

Einstellungen → das Namensfeld oben → ändern → **Speichern**. Wirkt sich sofort
überall aus, wo der Organisationsname angezeigt wird.

## Mitglied hinzufügen

Einstellungen → **Mitglied hinzufügen** → E-Mail-Adresse eingeben und eine Rolle
wählen (Standard **Mitglied**) → **Hinzufügen**.

**Die Person muss bereits ein Nexa-Konto haben.** Derzeit gibt es keine
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
den Zugriff auf diese Organisation; das Nexa-Konto der Person wird nicht gelöscht,
und keine andere Organisation, der sie angehört, ist betroffen. Das Entfernen
erfolgt sofort und ist nicht rückgängig zu machen — entfernst du jemanden
versehentlich, musst du ihn erneut hinzufügen.

## Die "mindestens ein Owner"-Regel

Eine Organisation kann nie ohne Owner dastehen: Du kannst den letzten Owner nicht
zu Admin/Mitglied degradieren und auch nicht entfernen. Musst du die Eigentümerschaft
übertragen, befördere zuerst eine andere Person zum Owner und ändere dann erst deine
eigene Rolle oder entferne dich selbst.

## Was Einstellungen *nicht* abdeckt

- **SMTP- / E-Mail-Versandkonfiguration** — wird einmalig auf Plattformebene für die
  gesamte Instanz festgelegt, nicht pro Organisation, und ist in der Oberfläche nicht
  einsehbar. Funktioniert der E-Mail-Versand für deine Organisation nicht, wende dich
  an die Person, die deine Nexa-Instanz betreibt (siehe
  [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md)).
- **Abrechnung / Plan-Limits** — gibt es noch nicht; jede Organisation hat vollen,
  unbegrenzten Zugriff auf alle Module.
- **Die Organisation selbst löschen** — derzeit nicht über die Oberfläche verfügbar.
