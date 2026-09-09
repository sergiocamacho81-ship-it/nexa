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
| **Membre** | Tout ce qui est dans le [Guide utilisateur](../user-guide/fr.md) : contacts, entreprises, affaires, activités, tâches, email, automatisations, segments, campagnes. Peut voir la Corbeille mais pas y restaurer. Ne peut pas ouvrir les Paramètres. |
| **Admin** | Tout ce qu'un Membre peut faire, plus : renommer l'organisation, configurer son SMTP, ajouter/retirer des membres, changer leur rôle, restaurer des éléments depuis la Corbeille. |
| **Propriétaire** | Tout ce qu'un Admin peut faire, plus : supprimer l'organisation elle-même. La seule autre différence avec Admin est la protection « au moins un Propriétaire » décrite ci-dessous. |

## Renommer l'organisation

Paramètres → le champ du nom en haut → modifiez-le → **Enregistrer**. Effet immédiat
partout où le nom de l'organisation est affiché.

## Email sortant (SMTP)

Paramètres → **Email sortant (SMTP)**. Chaque organisation configure son propre
compte SMTP — il n'y a pas de boîte mail partagée au niveau de la plateforme, donc
**Email et Campagnes n'enverront rien tant que cela n'est pas configuré** : serveur,
port, nom d'utilisateur, mot de passe et adresse d'expédition, plus l'usage ou non de
TLS. Quiconque gère la boîte mail de votre organisation (IT, panneau d'administration
de votre fournisseur d'email) peut vous donner ces informations — les mêmes que vous
mettriez dans n'importe quel client de messagerie.

Laissez le champ du mot de passe vide en enregistrant d'autres modifications pour
conserver le mot de passe actuel ; n'en saisissez un nouveau que si vous le changez
réellement.

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
aucune autre organisation à laquelle il appartient. Ce n'est pas immédiatement
définitif — voir [Corbeille](#corbeille-récupérer-des-éléments-supprimés) ci-dessous
— et le réajouter avec le même email (Paramètres → Ajouter un membre) restaure
exactement son rôle précédent au lieu de repartir de zéro.

## La règle « au moins un Propriétaire »

Une organisation ne peut jamais se retrouver sans Propriétaire : vous ne pouvez pas
rétrograder le dernier Propriétaire en Admin/Membre, ni le retirer. Si vous devez
transmettre la propriété, promouvez d'abord quelqu'un d'autre au rôle de
Propriétaire, puis changez votre propre rôle ou retirez-vous.

## Corbeille (récupérer des éléments supprimés)

Toute suppression dans Nexa — un contact, une entreprise, une affaire, une activité,
une tâche, un segment, une automatisation, une campagne ou un membre — va d'abord
dans la **Corbeille** (dans le menu), pas directement vers une suppression
définitive. Elle y reste **30 jours** ; un OWNER ou un ADMIN peut la restaurer depuis
cette page en un clic. Un Membre peut voir ce qui se trouve dans la Corbeille mais ne
peut rien restaurer. Après 30 jours, un élément encore présent est supprimé
définitivement la prochaine fois que quelqu'un ouvre la page Corbeille de cette
organisation (il n'y a pas de nettoyage planifié — juste une vérification à chaque
consultation de la page).

## Supprimer l'organisation

Paramètres → **Zone dangereuse** → **Supprimer l'organisation** (OWNER uniquement,
avec une invite de confirmation). Cela déplace toute l'organisation vers un état de
type corbeille : elle disparaît immédiatement de la liste d'organisations de tout le
monde, mais **vous** (le Propriétaire qui l'a supprimée) pouvez la restaurer depuis
la liste des organisations sur `/app` dans les 30 jours. Après cela, elle disparaît
définitivement avec tout ce qu'elle contient.

## Ce que les Paramètres ne couvrent *pas*

- **Facturation / limites de plan** — n'existent pas encore ; chaque organisation a
  un accès complet et illimité à tous les modules.
