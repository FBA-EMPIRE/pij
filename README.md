# PIJ — Programme d'Investissement des Jeunes

Plateforme digitale de microfinance — Vite + React + TypeScript (frontend) et Supabase (backend).

---

## Architecture

| Couche | Technologie |
|--------|-------------|
| Frontend | Vite + React 18 (SPA), React Router 7 |
| UI | Tailwind CSS 4 + Radix UI + composants shadcn (`src/app/components/ui`) |
| State | React Context (`AppContext`) + `useState` (pas de TanStack Query / Zustand) |
| Backend | Supabase — Auth, PostgreSQL, Storage, Edge Functions (Deno) |
| Hosting | Vercel (SPA fallback via `vercel.json`) |

### Variables d'environnement (`.env`)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Les Edge Functions utilisent `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` (configurées côté Supabase, jamais commit).

---

## Portails

- **Public** : landing, login, register, mot de passe oublié, vérification email, acceptation d'invitation admin, KYC onboarding.
- **Membre** : dashboard, transactions (+ détail), objectifs d'épargne (+ détail/contribution), formations, investissements, marketplace de tontines, mes tontines (+ détail/archives), notifications, profil, paramètres.
- **Admin** : dashboard (admin / super-admin), gestion des membres, revue KYC, comptes (dépôts/retraits), tontines (types, groupes, participants, archives), formations, investissements, rapports, notifications, administrateurs, audit, monitoring système, paramètres.

Le rôle est résolu via la fonction `current_admin_role()` ; les routes sensibles sont protégées par `ProtectedRoute` et `SuperAdminRoute`.

---

## Base de données — Supabase PostgreSQL

Le schéma est découpé en migrations dans `supabase/migrations/` (appliquées dans l'ordre lexicographique du nom de fichier).

### Domaines couverts

| Domaine | Tables principales |
|---------|--------------------|
| **Identity & Access** | `users`, `profiles`, `admins`, `roles`, `permissions`, `role_permissions`, `admin_invitations` |
| **KYC** | `kyc_documents` (+ bucket privé `kyc-documents`) |
| **Financial** | `accounts`, `transactions` (grand livre append-only) |
| **Savings** | `savings_goals` |
| **Tontines** | `tontine_types`, `tontines`, `tontine_members`, `tontine_rounds`, `tontine_contributions` |
| **Formations** | `formation_categories`, `formation_courses`, `formation_content`, `formation_enrollments`, `formation_content_completions` (+ bucket `formation-assets`) |
| **Investissements** | `investment_opportunities`, `investment_portfolio`, `investment_requests` |
| **Système** | `notifications`, `audit_logs`, `system_settings`, `verification_codes`, `consultation_requests`, `user_notification_preferences` |

Les colonnes de solde dénormalisées (`users.balance_current / balance_savings / balance_investment`) sont maintenues automatiquement à partir de `accounts` par le trigger `sync_user_balances()`.

### Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables exposées ; membres limités à leurs propres données, staff par rôle (`super_admin`, `admin`, `kyc_officer`, `support_agent`).
- `verification_codes` : RLS activé sans policy — accès réservé aux Edge Functions (service role).
- `audit_logs` : insert-only, immutable par conception.
- `transactions` : mouvements d'argent effectués uniquement par Edge Functions (service role) qui recalculent le solde et écrivent le grand livre.
- Documents KYC : bucket privé, accès admin + propriétaire, lecture par URL signée uniquement.

### Application des migrations

```bash
npx supabase db push        # base distante
# ou en local :
npx supabase start
npx supabase migration up
```

Le script `supabase/promote_to_admin.sql` permet de promouvoir manuellement un utilisateur en administrateur.

---

## Edge Functions (`supabase/functions/`, 24)

Mouvements financiers et actions privilégiées : `record-deposit`, `record-withdrawal`, `goal-contribute`, `get-transactions`, `tontine-create-group`, `tontine-apply`, `tontine-approve-member`, `tontine-reject-member`, `tontine-record-contribution`, `kyc-approve`, `kyc-reject`, `delete-account`, la famille `admin-*` (invitations, promote/demote, suspend/reactivate) et la vérification email (`send-verification-code`, `verify-email-code`).

Conventions :
- Les fonctions d'administration valident l'appelant via `getCallerAdmin()` (table `admins` + rôle).
- Les fonctions membre dérivent l'identité du JWT (`extractUserId`) et n'agissent que pour cet utilisateur.
- La vérification de signature JWT est assurée par la passerelle Supabase (`verify_jwt` par défaut).

---

## Développement

```bash
npm install
npm run dev      # serveur Vite
npm run build    # build de production
```

---

## Améliorations connues (non bloquantes)

- [ ] **Tests** — aucun framework de test installé (Vitest / Playwright).
- [ ] **`tsconfig.json`** — absent ; le projet s'appuie sur la configuration TypeScript par défaut de Vite.
- [ ] **State management serveur** — pas de cache/refetch (TanStack Query) ; les données sont chargées à la demande via `useState`.
