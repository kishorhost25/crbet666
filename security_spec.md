# Firebase Security Specification and Audit Matrix

## 1. Data Invariants
- A `UserProfile` can only be read or edited by its authenticated owner.
- A `Transaction` or `BetRecord` must reside as a subcollection under a specific user document, ensuring automatic logical partitioning by owner.
- Crucial static fields such as `createdAt`, `uid`, and `username` cannot be updated post-creation.

## 2. Threat Vector Matrix (The "Dirty Dozen")
To protect against identity theft, balance poisoning, and state bypass, the following malicious requests are rejected by our secure rules:

| ID | Description / Vector | Target Path | Payload / Action | Expected Result |
|----|----------------------|-------------|------------------|-----------------|
| 1  | Unauthenticated Reader | /users/user123 | read | PERMISSION_DENIED |
| 2  | Unauthenticated Creator | /users/user123 | create | PERMISSION_DENIED |
| 3  | Cross-User Profile Read | /users/otheruser | read | PERMISSION_DENIED |
| 4  | Cross-User Profile Write | /users/otheruser | write (create/update) | PERMISSION_DENIED |
| 5  | Alter Post-Creation Fields | /users/myuser | update: modify `createdAt` | PERMISSION_DENIED |
| 6  | Account Impersonation | /users/myuser | update: change `username` | PERMISSION_DENIED |
| 7  | Negative Balance Hack | /users/myuser | update: `balance = -100` | PERMISSION_DENIED |
| 8  | Subcollection Cross-Read | /users/otheruser/bets/bet456 | read | PERMISSION_DENIED |
| 9  | Subcollection Orphan Insertion | /users/otheruser/transactions/tx789 | create | PERMISSION_DENIED |
| 10 | Malicious Transaction Amount | /users/myuser/transactions/tx789 | create: `amount = -500` | PERMISSION_DENIED |
| 11 | Malicious Bet Multiplier Type | /users/myuser/bets/bet456 | create: `payoutMultiplier = "NaN"` | PERMISSION_DENIED |
| 12 | Bulk Global Scan Attempt | /users | list (collection query) | PERMISSION_DENIED |

## 3. Deployment Status
- Rules configured and successfully mapped.
- Deployed through strict Attribute-Based Access Control logic.
