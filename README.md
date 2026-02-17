# Pokédex - No-SQL

Application web complète de Pokédex avec système d'authentification, gestion de favoris et création d'équipes Pokémon.

![Screenshot du Pokédex](_screenshots/pokedex-homepage.png)

## 📋 Table des matières

- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
  - [Routes d&#39;authentification](#-routes-dauthentification)
  - [Routes Pokémon](#-routes-pokémon)
  - [Routes Favoris](#-routes-favoris)
  - [Routes Équipes](#-routes-équipes)
  - [Routes Statistiques](#-routes-statistiques)
- [Frontend](#-frontend)

---

## 🛠 Technologies utilisées

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** (jsonwebtoken) - Authentification par tokens
- **bcrypt** - Hashage des mots de passe

### Frontend

- **HTML5** - Structure
- **CSS3** - Styling avec variables CSS et animations
- **JavaScript Vanilla** - Logique client avec async/await

---

## 📦 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)

### Étapes

1. **Cloner le projet**

```bash
git clone <url-du-repo>
cd tp-nosql
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de la base de données**

   - Modifier la chaîne de connexion dans `db/connect.js` si nécessaire
   - Par défaut : `mongodb://127.0.0.1:27017/pokedex`
4. **Importer les données Pokémon**

```bash
node db/seed.js
```

5. **Démarrer le serveur**

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📁 Structure du projet

```
.
├── index.js                     # Point d'entrée du serveur Express
├── package.json                 # Dépendances et scripts
├── db/
│   ├── connect.js              # Configuration MongoDB
│   └── seed.js                 # Script d'import des Pokémon
├── middleware/
│   └── auth.js                 # Middleware d'authentification JWT
├── models/
│   ├── pokemon.js              # Modèle Pokémon
│   ├── user.js                 # Modèle User
│   └── team.js                 # Modèle Team
├── routes/
│   ├── auth.js                 # Routes d'authentification
│   ├── pokemons.js             # Routes CRUD Pokémon
│   ├── favorites.js            # Routes de gestion des favoris
│   ├── teams.js                # Routes de gestion des équipes
│   └── stats.js                # Routes de statistiques
├── data/
│   └── pokemons.json           # Données Pokémon source
└── public/
    ├── index.html              # Page HTML principale
    ├── style.css               # Feuilles de styles
    └── script.js               # Logique JavaScript frontend
```

---

## 🔌 API Documentation

Base URL : `http://localhost:3000/api`

---

## 🔐 Routes d'authentification

### Inscription

Créer un nouveau compte utilisateur.

**Endpoint :** `POST /api/auth/register`

**Body (JSON) :**

```json
{
  "username": "dresseur_sacha",
  "password": "pikachu123"
}
```

**Validation :**

- `username` : requis, 3-30 caractères, unique
- `password` : requis, minimum 6 caractères

**Réponse réussie (201) :**

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "dresseur_sacha"
  }
}
```

**Erreurs possibles :**

- `400` : Données manquantes ou invalides
- `409` : Nom d'utilisateur déjà existant

### Connexion

Se connecter et recevoir un token JWT.

**Endpoint :** `POST /api/auth/login`

**Body (JSON) :**

```json
{
  "username": "dresseur_sacha",
  "password": "pikachu123"
}
```

**Réponse réussie (200) :**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "dresseur_sacha"
  }
}
```

**Durée du token :** 24 heures

**Erreurs possibles :**

- `400` : Données manquantes
- `401` : Identifiants invalides

## 🎮 Routes Pokémon

### Lister tous les Pokémon

Récupérer la liste des Pokémon avec options de filtrage, recherche et pagination.

**Endpoint :** `GET /api/pokemons`

**Paramètres de requête (optionnels) :**

- `type` : Filtrer par type (ex: `Fire`, `Water`, `Grass`)
- `name` : Recherche par nom (insensible à la casse, regex)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de résultats par page (défaut: 20)
- `sort` : Tri (`id`, `name`, `-id`, `-name`)

**Exemple de requête :**

```
GET /api/pokemons?type=Fire&limit=10&sort=name
```

**Réponse (200) :**

```json
[
  {
    "id": 4,
    "name": {
      "english": "Charmander",
      "japanese": "ヒトカゲ",
      "chinese": "小火龙",
      "french": "Salamèche"
    },
    "type": ["Fire"],
    "base": {
      "HP": 39,
      "Attack": 52,
      "Defense": 43,
      "SpecialAttack": 60,
      "SpecialDefense": 50,
      "Speed": 65
    }
  }
  // ... autres pokémon
]
```

![Screenshot liste Pokémon](_screenshots/pokemons-filtre.png)

### Obtenir un Pokémon par ID

Récupérer les détails complets d'un Pokémon spécifique.

**Endpoint :** `GET /api/pokemons/:id`

**Exemple de requête :**

```
GET /api/pokemons/25
```

**Réponse (200) :**

```json
{
  "id": 25,
  "name": {
    "english": "Pikachu",
    "japanese": "ピカチュウ",
    "chinese": "皮卡丘",
    "french": "Pikachu"
  },
  "type": ["Electric"],
  "base": {
    "HP": 35,
    "Attack": 55,
    "Defense": 40,
    "SpecialAttack": 50,
    "SpecialDefense": 50,
    "Speed": 90
  }
}
```

**Erreur (404) :**

```json
{
  "error": "Pokémon non trouvé"
}
```

![Screenshot détail Pokémon](_screenshots/pokemon-details.png)

### Créer un Pokémon

Ajouter un nouveau Pokémon à la base de données.

**Endpoint :** `POST /api/pokemons`

**Authentification requise :** ✅ Bearer Token

**Headers :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body (JSON) :**

```json
{
  "id": 1000,
  "name": {
    "english": "CustomMon",
    "french": "MonPerso"
  },
  "type": ["Normal"],
  "base": {
    "HP": 50,
    "Attack": 50,
    "Defense": 50,
    "SpecialAttack": 50,
    "SpecialDefense": 50,
    "Speed": 50
  }
}
```

**Réponse (201) :**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "id": 1000,
  "name": {
    "english": "CustomMon",
    "french": "MonPerso"
  },
  "type": ["Normal"],
  "base": {
    "HP": 50,
    "Attack": 50,
    "Defense": 50,
    "SpecialAttack": 50,
    "SpecialDefense": 50,
    "Speed": 50
  }
}
```

**Erreurs possibles :**

- `400` : Données invalides
- `401` : Non authentifié
- `409` : ID déjà existant

---

### Modifier un Pokémon

Mettre à jour les informations d'un Pokémon existant.

**Endpoint :** `PUT /api/pokemons/:id`

**Authentification requise :** ✅ Bearer Token

**Body (JSON) :** Champs à modifier

```json
{
  "base": {
    "HP": 60,
    "Attack": 60
  }
}
```

**Réponse (200) :** Pokémon mis à jour

**Erreurs possibles :**

- `400` : Données invalides
- `401` : Non authentifié
- `404` : Pokémon non trouvé

---

### Supprimer un Pokémon

Supprimer un Pokémon de la base de données.

**Endpoint :** `DELETE /api/pokemons/:id`

**Authentification requise :** ✅ Bearer Token

**Réponse (204) :** Aucun contenu (suppression réussie)

**Erreurs possibles :**

- `401` : Non authentifié
- `404` : Pokémon non trouvé

---

## ⭐ Routes Favoris

### Ajouter un Pokémon aux favoris

Ajouter un Pokémon à la liste des favoris de l'utilisateur connecté.

**Endpoint :** `POST /api/favorites/:pokemonId`

**Authentification requise :** ✅ Bearer Token

**Exemple de requête :**

```
POST /api/favorites/25
```

**Réponse (200) :**

```json
{
  "favorites": [1, 25, 150],
  "message": "Pokémon ajouté aux favoris"
}
```

**Particularité :** Utilise `$addToSet` pour éviter les doublons

**Erreurs possibles :**

- `401` : Non authentifié
- `404` : Pokémon non trouvé

### Retirer un Pokémon des favoris

Supprimer un Pokémon de la liste des favoris.

**Endpoint :** `DELETE /api/favorites/:pokemonId`

**Authentification requise :** ✅ Bearer Token

**Exemple de requête :**

```
DELETE /api/favorites/25
```

**Réponse (200) :**

```json
{
  "favorites": [1, 150],
  "message": "Pokémon retiré des favoris"
}
```

**Erreurs possibles :**

- `401` : Non authentifié

---

### Lister mes favoris

Récupérer tous les Pokémon favoris avec leurs données complètes.

**Endpoint :** `GET /api/favorites`

**Authentification requise :** ✅ Bearer Token

**Réponse (200) :**

```json
{
  "favorites": [1, 25, 150],
  "pokemonsDetails": [
    {
      "id": 1,
      "name": {
        "english": "Bulbasaur",
        "french": "Bulbizarre"
      },
      "type": ["Grass", "Poison"],
      "base": { ... }
    },
    {
      "id": 25,
      "name": {
        "english": "Pikachu",
        "french": "Pikachu"
      },
      "type": ["Electric"],
      "base": { ... }
    }
    // ...
  ]
}
```

![Screenshot liste favoris](_screenshots/favorites.png)

## 👥 Routes Équipes

### Créer une équipe

Créer une nouvelle équipe de Pokémon.

**Endpoint :** `POST /api/teams`

**Authentification requise :** ✅ Bearer Token

**Body (JSON) :**

```json
{
  "name": "Équipe Feu",
  "pokemons": [4, 5, 6, 37, 58, 77]
}
```

**Validation :**

- `name` : requis
- `pokemons` : tableau d'IDs de Pokémon (optionnel, max 6 recommandé)
- Vérifie que tous les Pokémon existent

**Réponse (201) :**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "user": "64a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Équipe Feu",
  "pokemons": [4, 5, 6, 37, 58, 77],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erreurs possibles :**

- `400` : Nom manquant ou Pokémon inexistant
- `401` : Non authentifié

### Lister mes équipes

Obtenir toutes les équipes de l'utilisateur connecté.

**Endpoint :** `GET /api/teams`

**Authentification requise :** ✅ Bearer Token

**Réponse (200) :**

```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "user": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Équipe Feu",
    "pokemons": [4, 5, 6, 37, 58, 77],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "user": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Équipe Eau",
    "pokemons": [7, 8, 9, 54, 55, 72],
    "createdAt": "2024-01-16T14:20:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
]
```

![Screenshot liste équipes](_screenshots/team.png)

### Obtenir le détail d'une équipe

Récupérer une équipe avec les données complètes de tous les Pokémon.

**Endpoint :** `GET /api/teams/:id`

**Authentification requise :** ✅ Bearer Token

**Réponse (200) :**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Équipe Feu",
  "user": "64a1b2c3d4e5f6g7h8i9j0k1",
  "pokemons": [
    {
      "id": 4,
      "name": {
        "english": "Charmander",
        "french": "Salamèche"
      },
      "type": ["Fire"],
      "base": { ... }
    },
    {
      "id": 5,
      "name": {
        "english": "Charmeleon",
        "french": "Reptincel"
      },
      "type": ["Fire"],
      "base": { ... }
    }
    // ... autres pokémon avec données complètes
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erreurs possibles :**

- `401` : Non authentifié
- `404` : Équipe non trouvée ou non autorisée

### Modifier une équipe

Mettre à jour le nom ou les Pokémon d'une équipe.

**Endpoint :** `PUT /api/teams/:id`

**Authentification requise :** ✅ Bearer Token

**Body (JSON) :**

```json
{
  "name": "Équipe Feu Ultime",
  "pokemons": [4, 5, 6, 37, 58, 77, 136]
}
```

**Réponse (200) :** Équipe mise à jour

**Erreurs possibles :**

- `400` : Pokémon inexistant
- `401` : Non authentifié
- `404` : Équipe non trouvée

---

### Supprimer une équipe

Supprimer définitivement une équipe.

**Endpoint :** `DELETE /api/teams/:id`

**Authentification requise :** ✅ Bearer Token

**Réponse (204) :** Aucun contenu (suppression réussie)

**Erreurs possibles :**

- `401` : Non authentifié
- `404` : Équipe non trouvée

---

## 📊 Routes Statistiques

### Obtenir les statistiques globales

Récupérer des statistiques complètes sur tous les Pokémon.

**Endpoint :** `GET /api/stats`

**Authentification requise :** ❌ Aucune

**Réponse (200) :**

```json
{
  "totalPokemon": 809,
  "statsByType": [
    {
      "_id": "Water",
      "count": 126,
      "avgHP": 69.52,
      "avgAttack": 72.14,
      "avgDefense": 72.89,
      "avgSpecialAttack": 73.45,
      "avgSpecialDefense": 71.58,
      "avgSpeed": 62.11
    },
    {
      "_id": "Normal",
      "count": 102,
      "avgHP": 78.12,
      "avgAttack": 73.52,
      "avgDefense": 59.44,
      "avgSpecialAttack": 55.26,
      "avgSpecialDefense": 60.19,
      "avgSpeed": 71.85
    }
    // ... autres types triés par nombre de Pokémon
  ],
  "champions": {
    "strongestAttack": {
      "id": 150,
      "name": { "english": "Mewtwo", "french": "Mewtwo" },
      "type": ["Psychic"],
      "base": {
        "HP": 106,
        "Attack": 110,
        "Defense": 90,
        "SpecialAttack": 154,
        "SpecialDefense": 90,
        "Speed": 130
      }
    },
    "strongestSpecialAttack": { ... },
    "mostHP": { ... },
    "strongestDefense": { ... },
    "strongestSpecialDefense": { ... },
    "fastest": { ... }
  }
}
```

**Données fournies :**

- **totalPokemon** : Nombre total de Pokémon
- **statsByType** : Pour chaque type (triés par popularité) :
  - Nombre de Pokémon
  - Moyennes de toutes les stats de base
- **champions** : Le Pokémon champion dans chaque catégorie :
  - Plus forte Attaque
  - Plus forte Attaque Spéciale
  - Plus de PV
  - Plus forte Défense
  - Plus forte Défense Spéciale
  - Plus rapide

![Screenshot statistiques](_screenshots/stats-global.png)

![Screenshot statistiques](_screenshots/stats.png)

## 🎨 Frontend

### Architecture

Le frontend est une **Single Page Application (SPA)** en JavaScript vanilla divisée en 3 fichiers :

- **index.html** : Structure HTML avec navigation et modales
- **style.css** : Styles professionnels avec variables CSS, animations et design responsive
- **script.js** : Logique applicative complète

### Fonctionnalités principales

#### 1. Authentification

- Formulaires d'inscription et de connexion
- Stockage du token JWT dans localStorage
- UI adaptative selon l'état de connexion

#### 2. Navigation

- **Vue Pokédex** : Liste complète avec recherche et filtres
- **Vue Favoris** : Affichage des Pokémon favoris
- **Vue Statistiques** : Visualisation des statistiques par type avec barres de progression

#### 3. Recherche et filtres

- Recherche par nom
- Filtre par type de Pokémon
- Tri (ID, nom, croissant/décroissant)

#### 4. Gestion d'équipes

- Sélecteur d'équipes dans la navigation
- Création, modification et suppression d'équipes
- Ajout/retrait de Pokémon (max 6)
- Affichage visuel de l'équipe active

#### 5. Interactions

- Modal de détails pour chaque Pokémon
- Boutons favoris (étoile)
- Boutons d'ajout/retrait de l'équipe
- Animations et retours visuels
