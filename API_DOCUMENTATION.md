# Documentation de l'API Flashcard

## Table des matières
1. [Endpoints d'Authentification](#endpoints-dauthentification)
2. [Endpoints de Collections](#endpoints-de-collections)
3. [Endpoints de Flashcards](#endpoints-de-flashcards)
4. [Endpoints d'Administration](#endpoints-dadministration)
5. [Schéma de la Base de Données](#schéma-de-la-base-de-données)

---

## Endpoints d'Authentification

### POST /auth/register
**Rôle** : Créer un nouveau compte utilisateur

**Authentification** : Publique (aucune authentification requise)

**Corps de la requête** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

**Réponse** (201) :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "is_admin": false
  },
  "token": "jwt_token"
}
```

---

### POST /auth/login
**Rôle** : Se connecter avec un compte existant

**Authentification** : Publique

**Corps de la requête** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse** (200) :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "is_admin": false
  },
  "token": "jwt_token"
}
```

---

### GET /auth/me
**Rôle** : Récupérer les informations du compte connecté

**Authentification** : Authentifiée (JWT requis)

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200) :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "is_admin": false
  }
}
```

---

## Endpoints de Collections

### POST /collections/create
**Rôle** : Créer une nouvelle collection de flashcards

**Authentification** : Authentifiée

**Corps de la requête** :
```json
{
  "title": "Vocabulaire Anglais",
  "description": "Liste de vocabulaire pour l'examen",
  "is_public": true
}
```

**Réponse** (201) :
```json
{
  "message": "Collection created successfully",
  "collection": {
    "id": "uuid",
    "owner_id": "user_uuid",
    "title": "Vocabulaire Anglais",
    "description": "Liste de vocabulaire pour l'examen",
    "is_public": true
  }
}
```

---

### GET /collections/:id
**Rôle** : Consulter une collection par son ID

**Authentification** : Authentifiée

**Paramètres de route** :
- `id` : ID de la collection

**Conditions d'accès** :
- Collection publique : accessible à tous les utilisateurs authentifiés
- Collection privée : accessible uniquement au propriétaire ou admin

**Réponse** (200) :
```json
{
  "collection": {
    "id": "uuid",
    "owner_id": "user_uuid",
    "title": "Vocabulaire Anglais",
    "description": "Liste de vocabulaire pour l'examen",
    "is_public": true
  }
}
```

---

### GET /collections/my
**Rôle** : Lister toutes les collections de l'utilisateur connecté

**Authentification** : Authentifiée

**Réponse** (200) :
```json
{
  "count": 5,
  "collections": [
    {
      "id": "uuid1",
      "owner_id": "user_uuid",
      "title": "Collection 1",
      "description": "Description",
      "is_public": false
    },
    // ...
  ]
}
```

---

### GET /collections/search
**Rôle** : Rechercher des collections publiques par titre

**Authentification** : Authentifiée

**Query parameters** :
- `q` : Terme de recherche (obligatoire)

**Exemple** : `/collections/search?q=anglais`

**Réponse** (200) :
```json
{
  "count": 3,
  "collections": [
    {
      "id": "uuid",
      "owner_id": "user_uuid",
      "title": "Vocabulaire Anglais",
      "description": "...",
      "is_public": true
    },
    // ...
  ]
}
```

---

### PUT /collections/update/:id
**Rôle** : Modifier une collection (titre, description, visibilité)

**Authentification** : Authentifiée (propriétaire uniquement)

**Paramètres de route** :
- `id` : ID de la collection

**Corps de la requête** :
```json
{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "is_public": false
}
```

**Réponse** (200) :
```json
{
  "message": "Collection updated successfully",
  "collection": {
    "id": "uuid",
    "owner_id": "user_uuid",
    "title": "Nouveau titre",
    "description": "Nouvelle description",
    "is_public": false
  }
}
```

---

### DELETE /collections/delete/:id
**Rôle** : Supprimer une collection et toutes ses flashcards

**Authentification** : Authentifiée (propriétaire uniquement)

**Paramètres de route** :
- `id` : ID de la collection

**Réponse** (200) :
```json
{
  "message": "Collection deleted successfully"
}
```

---

## Endpoints de Flashcards

### POST /flashcards/create
**Rôle** : Créer une flashcard dans une collection

**Authentification** : Authentifiée (propriétaire de la collection uniquement)

**Corps de la requête** :
```json
{
  "textFront": "Hello",
  "textBack": "Bonjour",
  "URLFront": "https://example.com/image1.jpg",
  "URLBack": "https://example.com/image2.jpg",
  "collectionID": "collection_uuid"
}
```

**Note** : `URLFront` et `URLBack` sont optionnels

**Réponse** (201) :
```json
{
  "message": "Flashcard created",
  "flashcard": {
    "id": "uuid",
    "collection_id": "collection_uuid",
    "front_side": "Hello",
    "back_side": "Bonjour",
    "front_url": "https://example.com/image1.jpg",
    "back_url": "https://example.com/image2.jpg"
  }
}
```

---

### GET /flashcards/:id
**Rôle** : Consulter une flashcard par son ID

**Authentification** : Authentifiée

**Paramètres de route** :
- `id` : ID de la flashcard

**Conditions d'accès** :
- Collection publique : accessible à tous
- Collection privée : accessible au propriétaire ou admin

**Réponse** (200) :
```json
{
  "flashcard": {
    "id": "uuid",
    "collection_id": "collection_uuid",
    "front_side": "Hello",
    "back_side": "Bonjour",
    "front_url": "...",
    "back_url": "..."
  }
}
```

---

### GET /flashcards/collection/:collectionId
**Rôle** : Lister toutes les flashcards d'une collection

**Authentification** : Authentifiée

**Paramètres de route** :
- `collectionId` : ID de la collection

**Conditions d'accès** : Même logique que pour consulter une collection

**Réponse** (200) :
```json
{
  "count": 10,
  "flashcards": [
    {
      "id": "uuid1",
      "collection_id": "collection_uuid",
      "front_side": "Hello",
      "back_side": "Bonjour",
      "front_url": null,
      "back_url": null
    },
    // ...
  ]
}
```

---

### GET /flashcards/collection/:collectionId/due
**Rôle** : Récupérer les flashcards à réviser d'une collection

**Authentification** : Authentifiée (propriétaire ou admin uniquement)

**Paramètres de route** :
- `collectionId` : ID de la collection

**Logique** :
- Renvoie les flashcards jamais révisées par l'utilisateur
- Renvoie les flashcards dont la date de prochaine révision est dépassée

**Réponse** (200) :
```json
{
  "count": 5,
  "flashcards": [
    {
      "id": "uuid1",
      "collection_id": "collection_uuid",
      "front_side": "Hello",
      "back_side": "Bonjour",
      "front_url": null,
      "back_url": null
    },
    // ...
  ]
}
```

---

### PUT /flashcards/update/:id
**Rôle** : Modifier une flashcard (textes et URLs)

**Authentification** : Authentifiée (propriétaire de la collection uniquement)

**Paramètres de route** :
- `id` : ID de la flashcard

**Corps de la requête** :
```json
{
  "textFront": "Hi",
  "textBack": "Salut",
  "URLFront": "https://example.com/new.jpg",
  "URLBack": null
}
```

**Réponse** (200) :
```json
{
  "message": "Flashcard updated",
  "flashcard": {
    "id": "uuid",
    "collection_id": "collection_uuid",
    "front_side": "Hi",
    "back_side": "Salut",
    "front_url": "https://example.com/new.jpg",
    "back_url": null
  }
}
```

---

### DELETE /flashcards/delete/:id
**Rôle** : Supprimer une flashcard

**Authentification** : Authentifiée (propriétaire de la collection uniquement)

**Paramètres de route** :
- `id` : ID de la flashcard

**Réponse** (200) :
```json
{
  "message": "Flashcard deleted"
}
```

---

### POST /flashcards/:id/review
**Rôle** : Enregistrer une révision de flashcard et mettre à jour le système de répétition espacée

**Authentification** : Authentifiée

**Paramètres de route** :
- `id` : ID de la flashcard

**Corps de la requête** :
```json
{
  "correct": true
}
```

**Logique de répétition espacée** :
- Si `correct = true` : le niveau augmente de 1 (maximum 5)
- Si `correct = false` : le niveau retourne à 1
- La date de prochaine révision est calculée selon le niveau :
  - Niveau 1 : 1 jour
  - Niveau 2 : 2 jours
  - Niveau 3 : 4 jours
  - Niveau 4 : 8 jours
  - Niveau 5 : 16 jours

**Note importante** : Si la flashcard appartient à une collection publique dont l'utilisateur n'est pas propriétaire, la progression est personnelle (table `study` dédiée)

**Réponse** (200) :
```json
{
  "message": "Review recorded",
  "study": {
    "id": "uuid",
    "user_id": "user_uuid",
    "flashcard_id": "flashcard_uuid",
    "level": 2,
    "created_at": 1704672000000,
    "last_study": 1704758400000,
    "next_study": 1704931200000
  }
}
```

---

## Endpoints d'Administration

**Note** : Tous les endpoints `/admin/*` nécessitent d'être authentifié ET d'avoir le statut administrateur (`is_admin = true`)

### GET /admin/users
**Rôle** : Lister tous les utilisateurs

**Authentification** : Admin uniquement

**Réponse** (200) :
```json
{
  "count": 25,
  "users": [
    {
      "id": "uuid1",
      "email": "user1@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "is_admin": false
    },
    // ...
  ]
}
```

---

### GET /admin/users/:id
**Rôle** : Consulter un utilisateur par son ID

**Authentification** : Admin uniquement

**Paramètres de route** :
- `id` : ID de l'utilisateur

**Réponse** (200) :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "is_admin": false
  }
}
```

---

### DELETE /admin/users/:id
**Rôle** : Supprimer un utilisateur et toutes ses données

**Authentification** : Admin uniquement

**Paramètres de route** :
- `id` : ID de l'utilisateur

**Conséquences** : Suppression en cascade de :
- Toutes les collections de l'utilisateur
- Toutes les flashcards de ces collections
- Tous les enregistrements de révision (table `study`)

**Réponse** (200) :
```json
{
  "message": "User deleted successfully (including all their collections, flashcards, and study records)"
}
```

---

## Schéma de la Base de Données

### Table : `user`
| Colonne | Type | Contraintes | Description |
|---------|------|------------|-------------|
| id | TEXT | PRIMARY KEY | UUID généré automatiquement |
| first_name | TEXT(30) | NOT NULL | Prénom de l'utilisateur |
| last_name | TEXT(50) | NOT NULL | Nom de l'utilisateur |
| email | TEXT(150) | NOT NULL, UNIQUE | Email de l'utilisateur |
| password | TEXT(256) | NOT NULL | Mot de passe haché (bcrypt) |
| is_admin | BOOLEAN | NOT NULL, DEFAULT false | Statut administrateur |

### Table : `collection`
| Colonne | Type | Contraintes | Description |
|---------|------|------------|-------------|
| id | TEXT | PRIMARY KEY | UUID généré automatiquement |
| owner_id | TEXT | NOT NULL, FK(user.id) | ID du propriétaire |
| title | TEXT(100) | NOT NULL | Titre de la collection |
| description | TEXT(500) | NOT NULL | Description de la collection |
| is_public | BOOLEAN | NOT NULL, DEFAULT true | Visibilité (public/privé) |

**Relations** :
- `owner_id` → `user.id` (ON DELETE CASCADE)

### Table : `flashcard`
| Colonne | Type | Contraintes | Description |
|---------|------|------------|-------------|
| id | TEXT | PRIMARY KEY | UUID généré automatiquement |
| collection_id | TEXT | NOT NULL, FK(collection.id) | ID de la collection |
| front_side | TEXT(500) | NOT NULL | Texte du recto |
| back_side | TEXT(1000) | NOT NULL | Texte du verso |
| front_url | TEXT(200) | NULLABLE | URL optionnelle du recto |
| back_url | TEXT(200) | NULLABLE | URL optionnelle du verso |

**Relations** :
- `collection_id` → `collection.id` (ON DELETE CASCADE)

### Table : `study`
| Colonne | Type | Contraintes | Description |
|---------|------|------------|-------------|
| id | TEXT | PRIMARY KEY | UUID généré automatiquement |
| user_id | TEXT | NOT NULL, FK(user.id) | ID de l'utilisateur |
| flashcard_id | TEXT | NOT NULL, FK(flashcard.id) | ID de la flashcard |
| level | INTEGER | NOT NULL, DEFAULT 1 | Niveau de répétition (1-5) |
| created_at | INTEGER | NOT NULL | Timestamp de création |
| last_study | INTEGER | NOT NULL | Timestamp de dernière révision |
| next_study | INTEGER | NOT NULL | Timestamp de prochaine révision |

**Relations** :
- `user_id` → `user.id` (ON DELETE CASCADE)
- `flashcard_id` → `flashcard.id` (ON DELETE CASCADE)

**Note** : Cette table permet de suivre la progression personnelle de chaque utilisateur sur chaque flashcard, y compris pour les collections publiques créées par d'autres utilisateurs.

---

## Diagramme Entité-Relation

```
┌─────────────┐
│    user     │
├─────────────┤
│ id (PK)     │
│ first_name  │
│ last_name   │
│ email       │
│ password    │
│ is_admin    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│   collection    │
├─────────────────┤
│ id (PK)         │
│ owner_id (FK)   │
│ title           │
│ description     │
│ is_public       │
└──────┬──────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐         ┌─────────────┐
│   flashcard     │◄────────┤    study    │
├─────────────────┤  N:N    ├─────────────┤
│ id (PK)         │         │ id (PK)     │
│ collection_id   │         │ user_id (FK)│
│ front_side      │         │ flashcard_id│
│ back_side       │         │ level       │
│ front_url       │         │ created_at  │
│ back_url        │         │ last_study  │
└─────────────────┘         │ next_study  │
                            └─────────────┘
```

**Explications des relations** :
1. Un utilisateur (`user`) peut avoir plusieurs collections (`collection`)
2. Une collection appartient à un seul utilisateur
3. Une collection peut contenir plusieurs flashcards (`flashcard`)
4. Une flashcard appartient à une seule collection
5. La table `study` crée une relation N:N entre `user` et `flashcard` pour suivre la progression personnelle
