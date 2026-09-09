# Guide utilisateur — Nexa

Nexa est le CRM de votre équipe : contacts, entreprises, affaires, activités, tâches,
email et automatisations, le tout au même endroit. Ce guide couvre l'usage
quotidien. Pour gérer l'organisation elle-même (membres, rôles), consultez le
[Guide administrateur](../admin-guide/fr.md).

## Se connecter

Allez sur l'adresse de l'application et connectez-vous avec votre email et votre
mot de passe. Si vous n'avez pas encore de compte, utilisez "Pas encore de compte ?
Inscrivez-vous" — vous recevrez un email de confirmation pour valider votre adresse
avant de pouvoir vous connecter.

**Mot de passe oublié ?** Cliquez sur "Mot de passe oublié ?" sur l'écran de
connexion, indiquez votre email et suivez le lien reçu. Le lien expire au bout d'un
certain temps — s'il ne fonctionne plus, demandez-en simplement un nouveau.

**Changer de langue :** utilisez le sélecteur de langue en haut à droite de
l'application. Le choix est mémorisé sur cet appareil/navigateur ; il ne modifie pas
l'adresse web.

## Choisir une organisation

Si vous appartenez à plusieurs organisations, une liste s'affiche après connexion —
choisissez "Ouvrir" sur celle où vous voulez travailler. Tout ce que vous voyez et
faites ensuite est limité à cette organisation ; les données des autres organisations
ne sont jamais visibles.

## Tableau de bord

La première chose que vous voyez dans une organisation : le nombre de contacts et
d'entreprises, la valeur et le nombre d'affaires ouvertes, la valeur totale gagnée,
votre pipeline par étape, les tâches en attente et en retard, le nombre de
campagnes, et un flux d'activité récente.

## Contacts

Des personnes. Chaque contact a un prénom (obligatoire), un nom, un email, un
téléphone et, éventuellement, une entreprise associée. Cliquez sur un contact pour
voir toute son activité, ses affaires et ses tâches. Supprimer un contact est
définitif.

## Entreprises

Les organisations avec qui vous travaillez. Une entreprise a un nom et,
éventuellement, un domaine de site web. Associer des contacts et des affaires à une
entreprise permet de voir tout ce qui la concerne au même endroit.

## Affaires

Une opportunité commerciale : un titre, une valeur optionnelle et une étape. Le
pipeline compte six étapes :

**Prospect → Qualifié → Proposition → Négociation → Gagné / Perdu**

Faites avancer une affaire d'étape en étape. Le tableau de pipeline du tableau de
bord et les totaux ouvert/gagné se mettent à jour automatiquement. Une affaire peut,
en option, être liée à un contact et/ou une entreprise.

## Activités

Une entrée associée à un contact, une entreprise et/ou une affaire : un **Appel**,
**Email**, **Réunion** ou **Note**, avec un contenu libre et une date/heure. Les
activités sont l'historique de tout ce qui s'est passé — elles ne déclenchent pas
d'automatisation par elles-mêmes (les automatisations réagissent à des contacts
*créés*, des affaires dont l'*étape change*, et des tâches *terminées*, pas à des
activités enregistrées).

## Tâches

Une tâche avec un titre, une échéance optionnelle, et un statut (**En attente** /
**Terminée**). Elle peut être liée à un contact, une entreprise et/ou une affaire, et
assignée à un membre précis de l'organisation. Les tâches en attente en retard sont
signalées sur le tableau de bord.

## Email

Envoyez un email ponctuel à un contact — éventuellement lié à une affaire précise,
pour apparaître dans le contexte de cette affaire — via le compte email configuré
pour votre organisation. Chaque envoi (réussi ou échoué) est enregistré avec son
objet, son destinataire et son horodatage, pour garder une trace de ce qui a été
envoyé et quand.

> L'envoi nécessite que le compte SMTP de l'organisation soit configuré (un
> administrateur de l'organisation s'en occupe au niveau de la plateforme —
> consultez le Guide administrateur ou contactez la personne qui a configuré votre
> instance Nexa si l'envoi ne fonctionne pas).

## Automatisations

Des règles « quand X se produit, fais Y » qui s'exécutent automatiquement — sans
aucune étape manuelle une fois configurées.

**Déclencheurs :** un contact est créé · l'étape d'une affaire change · une tâche est
terminée.

**Actions** (une automatisation peut en exécuter plusieurs, dans l'ordre) : créer une
tâche · enregistrer une activité · envoyer un email.

Chaque automatisation a un nom, peut être activée ou désactivée indépendamment, et
conserve un journal d'exécution — à chaque déclenchement, vous voyez si chacune de
ses actions a réussi ou échoué, et pourquoi.

## Segments

Un filtre enregistré et réutilisable sur vos contacts — par exemple « contacts chez
Acme Corp avec un email » ou « contacts créés après une date donnée ». Un segment
n'est pas une liste figée : il est recalculé à chaque utilisation, donc il reflète
toujours vos contacts actuels. Les segments existent surtout pour alimenter les
Campagnes (voir ci-dessous), mais la même logique de filtre est réutilisable partout
où une liste de contacts ciblée est utile.

## Campagnes

Un email envoyé en masse à un segment — ou à « tous ceux qui ont un email » si vous
ne choisissez pas de segment. Une campagne a un objet et un corps de message ; une
fois envoyée, vous voyez combien de destinataires ont réussi et combien ont échoué,
avec l'erreur précise pour chaque échec. Les campagnes sont à usage unique : une fois
envoyée, le statut passe de **Brouillon** à **Envoi en cours** à **Envoyée**, et ne
peut pas être renvoyée en tant que même campagne.

## Astuces

- Supprimer quoi que ce soit (un contact, un segment, un membre) est définitif — il
  n'y a ni annulation ni corbeille.
- Chaque liste est limitée à votre organisation actuelle ; changer d'organisation
  (via le lien « Ouvrir » dans la liste des organisations) change tout ce que vous
  voyez.
- Si quelque chose que vous attendez de voir manque, vérifiez que vous êtes dans la
  bonne organisation et que votre rôle y a accès (consultez le
  [Guide administrateur](../admin-guide/fr.md) pour savoir ce que chaque rôle peut
  faire).
