# Roles & Permissions

Ce document définit les permissions pour chaque rôle de l'application HelloDoggo.

---

## Rôles disponibles

| Rôle     | Description                                                   |
|----------|---------------------------------------------------------------|
| `admin`  | Accès total. Peut tout faire.                                 |
| `editor` | Peut créer/éditer/supprimer des `dogs`, mais pas les `users`. |
| `user`   | Peut créer/éditer son propre `user`,                          |
|          | ne peut pas consulter/editer/supprimer les autres `users`,    |
|          | Peut consulter mais pas créer/éditer/supprimer les `dogs`.    |

---

## Endpoints & Permissions

### Utilisateurs (`/user`)

| Méthode & Route           | Description                          | admin | editor | user |
|---------------------------|--------------------------------------|:-----:|:------:|:----:|
| `GET /user/all`           | Voir tous les utilisateurs           | ✅    | ❌    | ❌   |
| `GET /user/:id`           | Voir un utilisateur par ID           | ✅    | ❌    | ❌   |
| `GET /user/me`            | Voir son propre profil               | ✅    | ✅    | ✅   |
| `PATCH /user/:id`         | Modifier un utilisateur              | ✅    | ❌    | ❌   |
| `PATCH /user/me`          | Modifier son propre profil           | ✅    | ✅    | ✅   |
| `DELETE /user/:id`        | Supprimer un utilisateur             | ✅    | ❌    | ❌   |
| `DELETE /user/me`         | Supprimer son propre profil          | ✅    | ✅    | ✅   |

> Un utilisateur ne peut modifier/consulter que **ses propres** données.

---

### Chiens (`/dog`)

| Méthode & Route          | Description                    | admin | editor | user |
|--------------------------|--------------------------------|:-----:|:------:|:----:|
| `GET /dog/all`           | Voir tous les chiens           | ✅    | ✅    | ✅   |
| `GET /dog/:id`           | Voir un chien par ID           | ✅    | ✅    | ✅   |
| `POST /dog`              | Créer un chien                 | ✅    | ✅    | ❌   |
| `PATCH /dog/:id`         | Modifier un chien              | ✅    | ✅    | ❌   |
| `DELETE /dog/:id`        | Supprimer un chien             | ✅    | ✅    | ❌   |


---

### Authentification (`/auth`)

| Méthode & Route           | Description                | Public |
|---------------------------|----------------------------|:------:|
| `POST /auth/signup`       | S'inscrire                 | ✅     |
| `POST /auth/login`        | Se connecter               | ✅     |

---

## Notes

- Les routes avec `@Public()` sont accessibles sans token.
- La suppression (`DELETE`) est restreinte à `admin` pour les `users` et à `admin` et `editor` pour les `dogs`.
- Les rôles sont définis dans `role.enum.ts`.
- Le `RolesGuard` gère les restrictions, via le décorateur `@Roles(...)`.

---


