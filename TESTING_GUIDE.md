# Guide de Test de l'API

Ce document vous guide pour tester manuellement tous les endpoints de l'API.

## Prérequis

1. Assurez-vous que le serveur est lancé : `npm run dev`
2. Utilisez un outil comme **Postman**, **Insomnia**, ou **curl**

## Variables à réutiliser

Durant les tests, vous devrez sauvegarder certaines valeurs :
- `TOKEN` : Token JWT reçu après login
- `USER_ID` : ID de l'utilisateur créé
- `COLLECTION_ID` : ID d'une collection créée
- `FLASHCARD_ID` : ID d'une flashcard créée

## 1. Tests d'Authentification

### 1.1 Inscription d'un utilisateur

**POST** `http://localhost:3000/auth/register`

Body (JSON) :
```json
{
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User"
}
```

✅ **Résultat attendu** : 201, vous recevez un `token` et les infos user (sans mot de passe)

💾 **Sauvegarder** : `TOKEN` et `USER_ID`

---

### 1.2 Connexion

**POST** `http://localhost:3000/auth/login`

Body (JSON) :
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

✅ **Résultat attendu** : 200, vous recevez un `token`

---

### 1.3 Récupérer ses informations

**GET** `http://localhost:3000/auth/me`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, vos informations utilisateur

---

## 2. Tests des Collections

### 2.1 Créer une collection

**POST** `http://localhost:3000/collections/create`

Headers :
```
Authorization: Bearer <TOKEN>
```

Body (JSON) :
```json
{
  "title": "Ma première collection",
  "description": "Collection de test",
  "is_public": true
}
```

✅ **Résultat attendu** : 201, collection créée

💾 **Sauvegarder** : `COLLECTION_ID`

---

### 2.2 Lister mes collections

**GET** `http://localhost:3000/collections/my`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, liste avec votre collection

---

### 2.3 Consulter une collection

**GET** `http://localhost:3000/collections/<COLLECTION_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, détails de la collection

---

### 2.4 Rechercher des collections publiques

**GET** `http://localhost:3000/collections/search?q=première`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, liste des collections correspondantes

---

### 2.5 Modifier une collection

**PUT** `http://localhost:3000/collections/update/<COLLECTION_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

Body (JSON) :
```json
{
  "title": "Collection modifiée",
  "is_public": false
}
```

✅ **Résultat attendu** : 200, collection mise à jour

---

### 2.6 (À la fin) Supprimer une collection

**DELETE** `http://localhost:3000/collections/delete/<COLLECTION_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, message de confirmation

---

## 3. Tests des Flashcards

### 3.1 Créer une flashcard

**POST** `http://localhost:3000/flashcards/create`

Headers :
```
Authorization: Bearer <TOKEN>
```

Body (JSON) :
```json
{
  "textFront": "Qu'est-ce que Node.js ?",
  "textBack": "Un environnement d'exécution JavaScript côté serveur",
  "collectionID": "<COLLECTION_ID>"
}
```

✅ **Résultat attendu** : 201, flashcard créée

💾 **Sauvegarder** : `FLASHCARD_ID`

---

### 3.2 Créer une deuxième flashcard (pour les révisions)

**POST** `http://localhost:3000/flashcards/create`

Body (JSON) :
```json
{
  "textFront": "Qu'est-ce qu'Express ?",
  "textBack": "Un framework web minimaliste pour Node.js",
  "URLFront": "https://expressjs.com",
  "collectionID": "<COLLECTION_ID>"
}
```

✅ **Résultat attendu** : 201, flashcard créée

---

### 3.3 Lister les flashcards d'une collection

**GET** `http://localhost:3000/flashcards/collection/<COLLECTION_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, liste de vos 2 flashcards

---

### 3.4 Consulter une flashcard

**GET** `http://localhost:3000/flashcards/<FLASHCARD_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, détails de la flashcard

---

### 3.5 Récupérer les flashcards à réviser

**GET** `http://localhost:3000/flashcards/collection/<COLLECTION_ID>/due`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, toutes les flashcards (jamais révisées = à réviser)

---

### 3.6 Réviser une flashcard (réponse correcte)

**POST** `http://localhost:3000/flashcards/<FLASHCARD_ID>/review`

Headers :
```
Authorization: Bearer <TOKEN>
```

Body (JSON) :
```json
{
  "correct": true
}
```

✅ **Résultat attendu** : 200, study record créé avec level = 2

---

### 3.7 Réviser à nouveau (réponse incorrecte)

**POST** `http://localhost:3000/flashcards/<FLASHCARD_ID>/review`

Body (JSON) :
```json
{
  "correct": false
}
```

✅ **Résultat attendu** : 200, level retourne à 1

---

### 3.8 Vérifier les flashcards dues

**GET** `http://localhost:3000/flashcards/collection/<COLLECTION_ID>/due`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, la flashcard révisée ne devrait plus apparaître (next_study dans le futur)

---

### 3.9 Modifier une flashcard

**PUT** `http://localhost:3000/flashcards/update/<FLASHCARD_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

Body (JSON) :
```json
{
  "textFront": "Node.js : définition ?",
  "textBack": "Environnement JavaScript runtime côté serveur basé sur V8"
}
```

✅ **Résultat attendu** : 200, flashcard modifiée

---

### 3.10 (À la fin) Supprimer une flashcard

**DELETE** `http://localhost:3000/flashcards/delete/<FLASHCARD_ID>`

Headers :
```
Authorization: Bearer <TOKEN>
```

✅ **Résultat attendu** : 200, message de confirmation

---

## 4. Tests Administration (Optionnel)

**Note** : Pour ces tests, vous devez avoir un compte admin. Vous pouvez :
- Soit utiliser le seed : `npm run db:seed` et utiliser `alice@example.com` / `admin123`
- Soit modifier manuellement un utilisateur dans la base pour mettre `is_admin = true`

### 4.1 Se connecter en admin

**POST** `http://localhost:3000/auth/login`

Body (JSON) :
```json
{
  "email": "alice@example.com",
  "password": "admin123"
}
```

💾 **Sauvegarder** : `ADMIN_TOKEN`

---

### 4.2 Lister tous les utilisateurs

**GET** `http://localhost:3000/admin/users`

Headers :
```
Authorization: Bearer <ADMIN_TOKEN>
```

✅ **Résultat attendu** : 200, liste de tous les utilisateurs

---

### 4.3 Consulter un utilisateur

**GET** `http://localhost:3000/admin/users/<USER_ID>`

Headers :
```
Authorization: Bearer <ADMIN_TOKEN>
```

✅ **Résultat attendu** : 200, détails de l'utilisateur

---

### 4.4 Supprimer un utilisateur

**DELETE** `http://localhost:3000/admin/users/<USER_ID>`

Headers :
```
Authorization: Bearer <ADMIN_TOKEN>
```

✅ **Résultat attendu** : 200, utilisateur supprimé (avec ses collections et flashcards)

---

## 5. Tests de Sécurité

### 5.1 Accéder à une collection privée (sans être propriétaire)

1. Créez une collection privée (`is_public: false`)
2. Créez un deuxième compte utilisateur
3. Essayez d'accéder à la collection privée du premier utilisateur

✅ **Résultat attendu** : 403 Forbidden

---

### 5.2 Modifier la collection d'un autre utilisateur

1. Avec le deuxième utilisateur, essayez de modifier une collection du premier

✅ **Résultat attendu** : 403 Forbidden

---

### 5.3 Accéder aux routes admin sans être admin

1. Avec un compte non-admin, essayez d'accéder à `GET /admin/users`

✅ **Résultat attendu** : 403 Forbidden

---

## 6. Tests du Système de Répétition Espacée

### 6.1 Vérifier la progression des niveaux

1. Créez une flashcard
2. Révisez-la 5 fois avec `correct: true`
3. Vérifiez que le niveau monte de 1 à 5 (maximum)
4. Révisez à nouveau avec `correct: true`
5. Vérifiez que le niveau reste à 5

---

### 6.2 Vérifier le calcul des dates

1. Après une révision au niveau 3, vérifiez que `next_study` est environ 4 jours dans le futur
2. Utilisez : `new Date(next_study)` pour convertir le timestamp

**Formule** : `next_study = now + (2^(level-1)) * 86400000 ms`

- Niveau 1 : +1 jour
- Niveau 2 : +2 jours
- Niveau 3 : +4 jours
- Niveau 4 : +8 jours
- Niveau 5 : +16 jours

---

## ✅ Checklist Complète

- [ ] Inscription d'un utilisateur
- [ ] Connexion
- [ ] Récupération du profil
- [ ] Création d'une collection
- [ ] Liste de mes collections
- [ ] Recherche de collections publiques
- [ ] Consultation d'une collection
- [ ] Modification d'une collection
- [ ] Création de flashcards
- [ ] Liste des flashcards d'une collection
- [ ] Flashcards à réviser
- [ ] Révision de flashcard (correct/incorrect)
- [ ] Modification de flashcard
- [ ] Tests de sécurité (accès privé/public)
- [ ] Tests admin (si implémenté)
- [ ] Suppression de flashcard
- [ ] Suppression de collection

---

## Outils Recommandés

- **Postman** : Interface graphique intuitive
- **Insomnia** : Alternative à Postman
- **REST Client (VS Code)** : Extension pour tester directement dans VS Code
- **curl** : En ligne de commande

### Exemple avec curl

```bash
# Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Avec authentification
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <votre_token>"
```
