# Guide administrateur d'organisation — Nexa

Ce guide s'adresse aux personnes qui gèrent une **organisation Nexa** elle-même — son
nom et ses membres — depuis la page **Paramètres** de l'application. Il ne concerne
pas le déploiement ou l'exploitation de la plateforme Nexa elle-même ; pour cela,
consultez [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md) (technique, en anglais
uniquement).

## Rôles

Chaque personne dans une organisation détient exactement un rôle **dans cette
organisation** (quelqu'un présent dans deux organisations peut avoir un rôle
différent dans chacune) :

| Rôle | Peut faire |
|---|---|
| **Membre** | Tout ce qui est dans le [Guide utilisateur](../user-guide/fr.md) : contacts, entreprises, affaires, activités, tâches, email, automatisations, segments, campagnes. Ne peut pas ouvrir les Paramètres. |
| **Admin** | Tout ce qu'un Membre peut faire, plus : renommer l'organisation, ajouter/retirer des membres, changer leur rôle. |
| **Propriétaire** | Tout ce qu'un Admin peut faire. La seule différence avec Admin aujourd'hui est la protection « au moins un Propriétaire » décrite ci-dessous. |

## Renommer l'organisation

Paramètres → le champ du nom en haut → modifiez-le → **Enregistrer**. Effet immédiat
partout où le nom de l'organisation est affiché.

## Ajouter un membre

Paramètres → **Ajouter un membre** → indiquez son email et choisissez un rôle
(par défaut **Membre**) → **Ajouter**.

**La personne doit déjà avoir un compte Nexa.** Il n'y a actuellement pas
d'invitation par email — si elle ne s'est pas encore inscrite, demandez-lui de créer
un compte d'abord (voir la section « Se connecter » du Guide utilisateur), puis
ajoutez-la avec cet email. Si vous essayez d'ajouter quelqu'un sans compte, vous
recevrez une erreur l'indiquant.

## Changer le rôle d'un membre

Paramètres → trouvez la ligne du membre → utilisez le menu déroulant du rôle à côté
de son nom → choisissez le nouveau rôle. Effet immédiat — aucune étape de
confirmation, aucun bouton d'enregistrement.

## Retirer un membre

Paramètres → trouvez la ligne du membre → **Supprimer**. Cela retire uniquement son
accès à cette organisation ; cela ne supprime pas son compte Nexa et n'affecte
aucune autre organisation à laquelle il appartient. Le retrait est immédiat et sans
annulation possible — si vous retirez quelqu'un par erreur, vous devrez l'ajouter à
nouveau.

## La règle « au moins un Propriétaire »

Une organisation ne peut jamais se retrouver sans Propriétaire : vous ne pouvez pas
rétrograder le dernier Propriétaire en Admin/Membre, ni le retirer. Si vous devez
transmettre la propriété, promouvez d'abord quelqu'un d'autre au rôle de
Propriétaire, puis changez votre propre rôle ou retirez-vous.

## Ce que les Paramètres ne couvrent *pas*

- **Configuration SMTP / envoi d'email** — définie une fois au niveau de la
  plateforme pour toute l'instance, pas par organisation, et non accessible dans
  l'interface. Si l'envoi d'email ne fonctionne pas pour votre organisation,
  contactez la personne qui exploite votre instance Nexa (voir
  [PLATFORM_ADMIN.md](../PLATFORM_ADMIN.md)).
- **Facturation / limites de plan** — n'existent pas encore ; chaque organisation a
  un accès complet et illimité à tous les modules.
- **Supprimer l'organisation elle-même** — non disponible dans l'interface pour
  l'instant.
