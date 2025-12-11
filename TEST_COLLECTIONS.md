# Guide de test - Gestion des Collections

## Prérequis

1. **Démarrer le serveur**
```powershell
npm run dev
```

2. **Créer la base de données avec les données de test**
```powershell
npm run db:seed
```

Utilisateurs de test créés :
- **Admin** : `alice@example.com` / `admin123` (ID: 1)
- **User** : `bruno@example.com` / `user123` (ID: 2)
- **User** : `claire@example.com` / `user123` (ID: 3)

---

## Étape 1 : Créer un endpoint de login (temporaire pour tests)

Ajoute ce code temporaire dans `src/server.js` pour générer un token JWT :

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { user } from './db/schema.js';
import { db } from './db/db.js';
import { eq } from 'drizzle-orm';

// Route de login temporaire pour les tests
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await db.select().from(user).where(eq(user.email, email));
        
        if (result.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const userData = result[0];
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const token = jwt.sign(
            { userId: userData.id, isAdmin: userData.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: userData.id,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                is_admin: userData.is_admin
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
```

---

## Étape 2 : Obtenir un token JWT

### Avec cURL (PowerShell)
```powershell
curl -X POST http://localhost:3000/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"bruno@example.com\",\"password\":\"user123\"}'
```

### Avec Postman / Thunder Client
```
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "bruno@example.com",
  "password": "user123"
}
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "bruno@example.com",
    "first_name": "Bruno",
    "last_name": "Lefevre",
    "is_admin": false
  }
}
```

**⚠️ Copie le token pour les tests suivants**

---

## Étape 3 : Tester les endpoints de collections

Remplace `<TOKEN>` par le token obtenu à l'étape 2.

### 1. Créer une collection (POST /collections)

#### Collection publique
```powershell
curl -X POST http://localhost:3000/collections `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"title\":\"Ma première collection\",\"description\":\"Description de test\",\"is_public\":true}'
```

#### Collection privée
```powershell
curl -X POST http://localhost:3000/collections `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"title\":\"Collection privée\",\"description\":\"Accessible uniquement par moi\",\"is_public\":false}'
```

#### Sans description (optionnelle)
```powershell
curl -X POST http://localhost:3000/collections `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"title\":\"Collection simple\",\"is_public\":true}'
```

**Réponse attendue :**
```json
{
  "message": "Collection créée avec succès",
  "collection": {
    "id": 4,
    "owner_id": 2,
    "title": "Ma première collection",
    "description": "Description de test",
    "is_public": true
  }
}
```

---

### 2. Lister ses propres collections (GET /collections/my)

```powershell
curl http://localhost:3000/collections/my `
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse attendue :**
```json
{
  "count": 2,
  "collections": [
    {
      "id": 4,
      "owner_id": 2,
      "title": "Ma première collection",
      "description": "Description de test",
      "is_public": true
    },
    {
      "id": 5,
      "owner_id": 2,
      "title": "Collection privée",
      "description": "Accessible uniquement par moi",
      "is_public": false
    }
  ]
}
```

---

### 3. Rechercher des collections publiques (GET /collections/search)

```powershell
curl "http://localhost:3000/collections/search?q=JavaScript" `
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse attendue :**
```json
{
  "count": 1,
  "collections": [
    {
      "id": 1,
      "owner_id": 1,
      "title": "JavaScript pour debutants",
      "description": "Cartes sur les bases JS (types, scope, async)",
      "is_public": true
    }
  ]
}
```

---

### 4. Consulter une collection (GET /collections/:id)

```powershell
# Collection publique (accessible)
curl http://localhost:3000/collections/1 `
  -H "Authorization: Bearer <TOKEN>"

# Ta propre collection privée (accessible)
curl http://localhost:3000/collections/5 `
  -H "Authorization: Bearer <TOKEN>"

# Collection privée d'un autre utilisateur (403 Forbidden)
curl http://localhost:3000/collections/2 `
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5. Modifier une collection (PUT /collections/:id)

```powershell
curl -X PUT http://localhost:3000/collections/4 `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"title\":\"Collection modifiée\",\"description\":\"Nouvelle description\",\"is_public\":false}'
```

**Réponse attendue :**
```json
{
  "message": "Collection mise à jour avec succès",
  "collection": {
    "id": 4,
    "owner_id": 2,
    "title": "Collection modifiée",
    "description": "Nouvelle description",
    "is_public": false
  }
}
```

---

### 6. Supprimer une collection (DELETE /collections/:id)

```powershell
curl -X DELETE http://localhost:3000/collections/4 `
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse attendue :**
```json
{
  "message": "Collection supprimée avec succès"
}
```

---

## Tests d'erreurs à vérifier

### 1. Sans token (401 Unauthorized)
```powershell
curl http://localhost:3000/collections/my
```

### 2. Titre manquant (400 Bad Request)
```powershell
curl -X POST http://localhost:3000/collections `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"description\":\"Sans titre\"}'
```

### 3. Modifier la collection d'un autre (403 Forbidden)
```powershell
# Essayer de modifier la collection ID 1 (appartient à Alice)
curl -X PUT http://localhost:3000/collections/1 `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"title\":\"Tentative de hack\"}'
```

### 4. Collection inexistante (404 Not Found)
```powershell
curl http://localhost:3000/collections/999 `
  -H "Authorization: Bearer <TOKEN>"
```

---

## Alternative : Utiliser Postman ou Thunder Client (VS Code)

1. Installe l'extension **Thunder Client** dans VS Code
2. Crée une collection de requêtes
3. Configure la variable d'environnement `{{token}}`
4. Teste facilement toutes les routes avec une interface graphique

---

## Résumé des routes

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Obtenir un token JWT |
| POST | `/collections` | Créer une collection |
| GET | `/collections/my` | Lister ses collections |
| GET | `/collections/search?q=terme` | Rechercher des collections publiques |
| GET | `/collections/:id` | Consulter une collection |
| PUT | `/collections/:id` | Modifier une collection |
| DELETE | `/collections/:id` | Supprimer une collection |
