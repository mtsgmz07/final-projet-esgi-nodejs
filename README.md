# Final Project — Node.js API

REST API built with Express 5, Mongoose, TypeScript (tsx), Zod and Swagger.

---

## ⚠️ Avant toute chose : récupérer le `.env`

Le fichier `.env` n'est **pas versionné**. Il faut l'**importer depuis le Drive commun du projet** et le placer à la racine du dossier `nodejs/` avant de lancer quoi que ce soit.

Sans ce fichier, le serveur ne pourra pas se connecter à MongoDB.

Variables attendues (voir [.env.example](.env.example)) :

```
MONGODB_URI="..."
PORT="3000"
```

---

## Prérequis

- Node.js 22+ **ou** Docker / Docker Compose

---

## Lancer en local (sans Docker)

```bash
npm install
npm run watch     # hot reload (tsx watch)
# ou
npm start         # run simple
```

- API : http://localhost:3000
- Swagger UI : http://localhost:3000/docs
- OpenAPI JSON : http://localhost:3000/docs.json

---

## Lancer avec Docker

Le `docker-compose.yml` démarre l'API **et** une instance MongoDB locale.

```bash
docker compose up --build
```

- API : http://localhost:3000
- Swagger : http://localhost:3000/docs
- Mongo : `localhost:27017` (données persistées dans le volume `mongo-data`)

### Utiliser le Mongo Atlas du projet plutôt que le Mongo local

Si ton `.env` contient déjà un `MONGODB_URI` pointant vers Atlas, il sera utilisé automatiquement par le service `app`. Tu peux alors démarrer uniquement l'API :

```bash
docker compose up --build app
```

---

## Structure

```
src/
├── app.ts                  # Express app + middlewares + swagger
├── server.ts               # Bootstrap (connectDB + listen)
├── db.ts                   # Connexion Mongoose
├── swagger.ts              # Génération du spec OpenAPI
├── class/                  # HttpError
├── controllers/            # Logique HTTP (CRUD)
├── interface/              # Types métier
├── middlewares/            # error, validate
├── models/                 # Schemas Mongoose
├── repositories/           # Accès données
├── routes/                 # Définition des routes + annotations OpenAPI
└── validators/             # Schémas Zod
```

---

## Endpoints

Tous les endpoints sont documentés et testables depuis Swagger UI (`/docs`).

| Méthode | Route          | Description       |
| ------- | -------------- | ----------------- |
| GET     | `/users`       | Liste des users   |
| GET     | `/users/:id`   | Détail d'un user  |
| POST    | `/users`       | Création          |
| PATCH   | `/users/:id`   | Update partiel    |
| DELETE  | `/users/:id`   | Suppression       |

---

## Scripts npm

| Script          | Action                          |
| --------------- | ------------------------------- |
| `npm start`     | Démarre le serveur (tsx)        |
| `npm run watch` | Démarre avec hot reload         |
