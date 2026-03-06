# MorAi Frontend

Ce dossier contient le frontend de l'application MorAi, développé avec ReactJS.

## Fonctionnalités principales
- Authentification utilisateur (login, inscription)
- Fil d’actualité (posts)
- Chat AI (assistant local)
- Gestion des villes, spots, arnaques
- Tableau de bord admin

## Démarrage
1. Installer les dépendances :
	```bash
	npm install
	```
2. Lancer le serveur de développement :
	```bash
	npm start
	```

## Structure
- `src/` : code source React
- `public/` : fichiers statiques

## Configuration
- Variables d’environnement dans `.env` (ex: REACT_APP_API_URL)

---
Pour toute question, voir le README global à la racine du projet.
│ ├─ routes/
│ │ ├─ AppRoutes.jsx
│ │ ├─ PrivateRoute.jsx
│ │ └─ AdminRoute.jsx
│ │
│ ├─ pages/
│ │ ├─ admin/
│ │ │ ├─ AdminDashboard.jsx
│ │ │ ├─ ManageCities.jsx
│ │ │ ├─ ManageSpots.jsx
│ │ │ ├─ ManageScams.jsx
│ │ │ └─ ManagePosts.jsx
│ │ │
│ │ ├─ ChatPage.jsx
│ │ ├─ CreatePostPage.jsx
│ │ ├─ FeedPage.jsx
│ │ ├─ PostCard.jsx
│ │ ├─ ProfilePage.jsx
│ │ └─ userPosts.jsx
│ │
│ ├─ App.jsx
│ ├─ index.js
│ └─ index.css
│
├─ .env
├─ package.json
└─ README.md

---

## ⚙️ Installation & Lancement

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/your-repo/morocco-ai-guide.git
cd morocco-ai-guide
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer les variables d’environnement

Créer un fichier .env à la racine :
```bash
REACT_APP_GEMINI_KEY=your_api_key_here
```

### 4️⃣ Lancer le serveur JSON
```bash
(Deprecated) npx json-server --watch db/db.json --port 3001  <!-- legacy mock server, backend now uses Express+Mongo -->
```

### 5️⃣ Lancer l’application
```bash
npm run dev
