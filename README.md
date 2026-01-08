# Flashcard API
API RESTful de gestion de flashcards pour réviser avec système de répétition espacée

## 📋 Description

Cette API permet de gérer des collections de flashcards avec un système de répétition espacée pour optimiser l'apprentissage. Les utilisateurs peuvent créer des comptes, gérer leurs collections, et réviser leurs flashcards selon un algorithme de répétition espacée sur 5 niveaux.

## 🚀 Technologies utilisées

- **Node.js** + **Express** (JavaScript)
- **SQLite** via `@libsql/client`
- **Drizzle ORM**
- **Zod** pour la validation des données
- **bcrypt** pour le hachage des mots de passe
- **jsonwebtoken** pour l'authentification JWT
- **dotenv** pour les variables d'environnement
- **nodemon** pour le développement

## 📦 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/15cf0408/flashcard_api.git
cd flashcard_api
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Modifier les valeurs dans le fichier `.env` :
```env
PORT=3000
ADDRESS=localhost
DB_FILE_NAME=file:local.sqlite
JWT_SECRET="votre_secret_jwt_super_securise_a_changer"
JWT_EXPIRATION=7d
```

**⚠️ Important** : Changez la valeur de `JWT_SECRET` pour une valeur sécurisée et aléatoire en production !

### 4. Initialiser la base de données

```bash
# Créer les tables dans la base de données
npm run db:push
```

### 5. (Optionnel) Peupler la base avec des données de test

```bash
npm run db:seed
```

## 🏃 Lancement du projet

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### Scripts disponibles

- `npm run dev` : Lance le serveur en mode développement avec nodemon
- `npm run db:push` : Synchronise le schéma Drizzle avec la base de données
- `npm run db:studio` : Ouvre l'interface Drizzle Studio pour explorer la base
- `npm run db:seed` : Peuple la base avec des données de test

## 📚 Documentation de l'API

La documentation complète de l'API (endpoints, authentification, schéma de base de données) est disponible dans le fichier **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**.

### Résumé rapide des endpoints

#### Authentification
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Informations du compte connecté

#### Collections
- `POST /collections/create` - Créer une collection
- `GET /collections/:id` - Consulter une collection
- `GET /collections/my` - Lister ses collections
- `GET /collections/search?q=terme` - Rechercher des collections publiques
- `PUT /collections/update/:id` - Modifier une collection
- `DELETE /collections/delete/:id` - Supprimer une collection

#### Flashcards
- `POST /flashcards/create` - Créer une flashcard
- `GET /flashcards/:id` - Consulter une flashcard
- `GET /flashcards/collection/:collectionId` - Lister les flashcards d'une collection
- `GET /flashcards/collection/:collectionId/due` - Flashcards à réviser
- `PUT /flashcards/update/:id` - Modifier une flashcard
- `DELETE /flashcards/delete/:id` - Supprimer une flashcard
- `POST /flashcards/:id/review` - Enregistrer une révision

#### Administration (admin uniquement)
- `GET /admin/users` - Lister tous les utilisateurs
- `GET /admin/users/:id` - Consulter un utilisateur
- `DELETE /admin/users/:id` - Supprimer un utilisateur

#### Statistiques (nouveau !)
- `GET /stats/dashboard` - Statistiques du tableau de bord
- `GET /stats/collection/:id` - Statistiques d'une collection

## 🎯 Système de répétition espacée

Le système utilise 5 niveaux de répétition :

| Niveau | Délai de révision |
|--------|-------------------|
| 1      | 1 jour            |
| 2      | 2 jours           |
| 3      | 4 jours           |
| 4      | 8 jours           |
| 5      | 16 jours          |

- **Réponse correcte** : le niveau augmente de 1 (maximum 5)
- **Réponse incorrecte** : retour au niveau 1
- La progression est personnelle pour chaque utilisateur, même sur les collections publiques

## 🗃️ Structure de la base de données

### Tables principales :
- **user** : Utilisateurs (email, nom, prénom, mot de passe haché, statut admin)
- **collection** : Collections de flashcards (titre, description, visibilité public/privé)
- **flashcard** : Cartes individuelles (recto, verso, URLs optionnelles)
- **study** : Suivi de la progression de révision (niveau, dates de révision)

Voir le schéma détaillé dans [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#schéma-de-la-base-de-données)


## 👥 Auteurs

- HOULLEGATTE Tom
- CHOLOT Tom
- RAMDANE Nassim

## 📄 Licence

ISC
