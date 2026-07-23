# Identifiants du seed

Comptes principaux créés par `npm run seed` (voir [src/seed.ts](src/seed.ts)).

Mot de passe commun à tous les comptes : **`password123`**

| Nom            | Email                       | Mot de passe  | Rôle  |
| -------------- | --------------------------- | ------------- | ----- |
| Alice Martin   | `alice.martin@example.com`  | `password123` | ADMIN |
| Karim Benali   | `karim.benali@example.com`  | `password123` | COACH |
| Lucas Dubois   | `lucas.dubois@example.com`  | `password123` | USER  |
| Emma Leroy     | `emma.leroy@example.com`    | `password123` | USER  |

Chacun de ces 4 comptes possède :

- au moins **5 programmes en favoris** ;
- au moins **5 séances terminées** dans l'historique, avec des **poids différents** enregistrés en fin de séance (progression simulée autour du poids de l'utilisateur).

## Comptes secondaires

Des utilisateurs supplémentaires sont également créés pour donner du volume aux données
(`hugo.moreau@example.com` (COACH), `chloe.petit@example.com`, `nathan.roux@example.com`,
`lea.fournier@example.com`, `tom.garcia@example.com`, `ines.vincent@example.com`),
tous avec le même mot de passe `password123`.
