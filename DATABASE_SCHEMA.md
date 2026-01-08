# Schéma de Base de Données - API Flashcard

Ce fichier contient le schéma de base de données au format SQL pour documentation.

## Création des Tables

```sql
-- Table des utilisateurs
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    first_name TEXT(30) NOT NULL,
    last_name TEXT(50) NOT NULL,
    email TEXT(150) NOT NULL UNIQUE,
    password TEXT(256) NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0  -- Boolean: 0 = false, 1 = true
);

-- Table des collections
CREATE TABLE collection (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT(100) NOT NULL,
    description TEXT(500) NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 1,  -- Boolean: 0 = false, 1 = true
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des recherches
CREATE INDEX idx_collection_owner ON collection(owner_id);
CREATE INDEX idx_collection_public ON collection(is_public);
CREATE INDEX idx_collection_title ON collection(title);

-- Table des flashcards
CREATE TABLE flashcard (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL,
    front_side TEXT(500) NOT NULL,
    back_side TEXT(1000) NOT NULL,
    front_url TEXT(200),
    back_url TEXT(200),
    FOREIGN KEY (collection_id) REFERENCES collection(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_flashcard_collection ON flashcard(collection_id);

-- Table de suivi des révisions (répétition espacée)
CREATE TABLE study (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    flashcard_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,       -- Timestamp en millisecondes
    last_study INTEGER NOT NULL,       -- Timestamp de la dernière révision
    next_study INTEGER NOT NULL,       -- Timestamp de la prochaine révision
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (flashcard_id) REFERENCES flashcard(id) ON DELETE CASCADE,
    UNIQUE(user_id, flashcard_id)      -- Un utilisateur ne peut avoir qu'une seule entrée par flashcard
);

-- Index pour améliorer les performances des requêtes de révision
CREATE INDEX idx_study_user ON study(user_id);
CREATE INDEX idx_study_flashcard ON study(flashcard_id);
CREATE INDEX idx_study_next ON study(next_study);
CREATE INDEX idx_study_user_flashcard ON study(user_id, flashcard_id);
```

## Diagramme Entité-Relation (ASCII)

```
┌──────────────────────────────────┐
│             user                 │
├──────────────────────────────────┤
│ PK  id            TEXT           │
│     first_name    TEXT(30)  NN   │
│     last_name     TEXT(50)  NN   │
│     email         TEXT(150) NN U │
│     password      TEXT(256) NN   │
│     is_admin      BOOL      NN D │
└─────────┬────────────────────────┘
          │
          │ 1
          │
          │ owns
          │
          │ N
┌─────────▼────────────────────────┐
│          collection              │
├──────────────────────────────────┤
│ PK  id            TEXT           │
│ FK  owner_id      TEXT      NN   │◄───┐
│     title         TEXT(100) NN   │    │ Reference
│     description   TEXT(500) NN   │    │
│     is_public     BOOL      NN D │    │
└─────────┬────────────────────────┘    │
          │                              │
          │ 1                            │
          │                              │
          │ contains                     │
          │                              │
          │ N                            │
┌─────────▼────────────────────────┐    │
│          flashcard               │    │
├──────────────────────────────────┤    │
│ PK  id            TEXT           │    │
│ FK  collection_id TEXT      NN   │────┘
│     front_side    TEXT(500) NN   │
│     back_side     TEXT(1000) NN  │
│     front_url     TEXT(200)      │
│     back_url      TEXT(200)      │
└─────────┬────────────────────────┘
          │                     ▲
          │ N                   │ N
          │                     │
          │   ┌─────────────────┘
          │   │
          │   │ tracks progress
          │   │
┌─────────▼───▼────────────────────┐
│            study                 │
├──────────────────────────────────┤
│ PK  id            TEXT           │
│ FK  user_id       TEXT      NN   │
│ FK  flashcard_id  TEXT      NN   │
│     level         INT       NN D │
│     created_at    INT       NN   │
│     last_study    INT       NN   │
│     next_study    INT       NN   │
│ UQ (user_id, flashcard_id)       │
└──────────────────────────────────┘
```

Légende :
- PK = Primary Key (Clé primaire)
- FK = Foreign Key (Clé étrangère)
- NN = NOT NULL (Non nul)
- U = UNIQUE (Unique)
- D = DEFAULT (Valeur par défaut)
- UQ = UNIQUE Constraint (Contrainte d'unicité)

## Relations

### 1. user → collection (1:N)
- Un utilisateur peut posséder plusieurs collections
- Une collection appartient à un seul utilisateur
- **ON DELETE CASCADE** : Quand un utilisateur est supprimé, toutes ses collections sont supprimées

### 2. collection → flashcard (1:N)
- Une collection peut contenir plusieurs flashcards
- Une flashcard appartient à une seule collection
- **ON DELETE CASCADE** : Quand une collection est supprimée, toutes ses flashcards sont supprimées

### 3. user + flashcard → study (N:N)
- Un utilisateur peut réviser plusieurs flashcards
- Une flashcard peut être révisée par plusieurs utilisateurs
- La table `study` est une table de liaison qui stocke la progression personnelle
- **UNIQUE(user_id, flashcard_id)** : Un utilisateur ne peut avoir qu'une seule entrée de progression par flashcard
- **ON DELETE CASCADE** : Quand un utilisateur ou une flashcard est supprimé(e), les entrées study correspondantes sont supprimées

## Logique de Répétition Espacée

La table `study` implémente le système de répétition espacée :

### Niveaux de répétition
| Niveau | Délai avant prochaine révision |
|--------|--------------------------------|
| 1      | 1 jour (86400000 ms)          |
| 2      | 2 jours (172800000 ms)        |
| 3      | 4 jours (345600000 ms)        |
| 4      | 8 jours (691200000 ms)        |
| 5      | 16 jours (1382400000 ms)      |

### Calcul de next_study
```javascript
// Formule : next_study = last_study + (2^(level-1)) * 86400000
next_study = last_study + Math.pow(2, level - 1) * 24 * 60 * 60 * 1000
```

### Règles de progression
- **Réponse correcte** : level = Math.min(level + 1, 5)
- **Réponse incorrecte** : level = 1

### Déterminer si une flashcard est "due" (à réviser)
Une flashcard est considérée comme "à réviser" si :
1. Aucune entrée dans `study` pour cet utilisateur (jamais révisée)
2. OU `next_study <= Date.now()` (date de révision dépassée)

## Exemples de Requêtes

### Récupérer les flashcards à réviser pour un utilisateur
```sql
-- Flashcards jamais révisées
SELECT f.* 
FROM flashcard f
WHERE f.collection_id = ? 
AND NOT EXISTS (
    SELECT 1 FROM study s 
    WHERE s.flashcard_id = f.id 
    AND s.user_id = ?
);

-- Flashcards dont la date de révision est dépassée
SELECT f.* 
FROM flashcard f
INNER JOIN study s ON s.flashcard_id = f.id
WHERE f.collection_id = ?
AND s.user_id = ?
AND s.next_study <= ?;
```

### Progression d'un utilisateur sur une collection
```sql
SELECT 
    COUNT(*) as total_flashcards,
    COUNT(s.id) as reviewed_flashcards,
    AVG(s.level) as avg_level
FROM flashcard f
LEFT JOIN study s ON s.flashcard_id = f.id AND s.user_id = ?
WHERE f.collection_id = ?;
```

## Notes de Performance

### Index créés
- `collection.owner_id` : Pour lister rapidement les collections d'un utilisateur
- `collection.is_public` : Pour filtrer les collections publiques
- `collection.title` : Pour les recherches par titre
- `flashcard.collection_id` : Pour lister les flashcards d'une collection
- `study.user_id` : Pour les révisions d'un utilisateur
- `study.flashcard_id` : Pour les révisions d'une flashcard
- `study.next_study` : Pour trouver les flashcards dues
- `study(user_id, flashcard_id)` : Index composite pour les requêtes de progression

### Optimisations possibles
1. Ajouter un champ `created_at` sur `user` pour trier par date de création
2. Ajouter un champ `updated_at` sur `collection` et `flashcard`
3. Ajouter des index full-text sur `title` et `description` pour la recherche
4. Créer une vue matérialisée pour les statistiques de progression
