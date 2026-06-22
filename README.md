# PIJ — Programme d'Investissement des Jeunes

Plateforme digitale de microfinance — Frontend (Vite + React + TypeScript)

---

## Rapport d'Écart vs Cahier de Charge

### Écrans encore manquants du CDC

#### Portail Membre (2 écrans sur 25)
- [ ] **Vérification email** (UC-02) — flux de confirmation d'adresse email après inscription
- [ ] **Détail transaction** (UC-12) — vue détaillée d'une transaction individuelle avec reçu
- [ ] **Détail objectif épargne** (UC-14) — page de détail avec historique et suivi de progression

#### Portail Admin (4 écrans sur 24)
- [ ] **Gestion des types de tontine** (UC-24) — interface CRUD pour les catégories de tontine (montant cotisation, fréquence, règles)
- [ ] **Export de rapports** (UC-30) — téléchargement de rapports PDF et Excel pour toute période
- [ ] **Centre de notifications** (UC-33) — vue et envoi de notifications aux membres
- [ ] **Gestion des rôles et permissions** (UC-34) — définition des rôles staff et attribution de permissions granulaires
- [ ] **Gestion des profils administrateurs** (UC-36) — création, modification et désactivation des comptes admin

---

### Modules ajoutés (non spécifiés dans le CDC)

Ces modules ont été développés mais ne figurent pas dans le cahier de charge original :

| Module | Routes | Composants |
|--------|--------|------------|
| **Formations** | `/formations`, `/formations/courses/:id`, `/formations/learning`, `/formations/consultation`, `/admin/formations` | `Formations.tsx` (117 lignes), `AdminFormations.tsx` (170 lignes) |
| **Investissements** | `/investissements`, `/investissements/portfolio`, `/investissements/wallet`, `/investissements/:id`, `/admin/investissements` | `Investments.tsx` (75 lignes), `AdminInvestments.tsx` (130 lignes) |
| **System Monitoring** | `/admin/system-audit` | `SystemMonitoring.tsx` (367 lignes) |

---

### Infrastructures et bonnes pratiques manquantes

- [ ] **Tests** — Aucun framework de test installé (Vitest, Playwright, Cypress, etc.)
- [ ] **State management** — TanStack Query et Zustand spécifiés mais non implémentés (utilisation de `useState` uniquement)
- [ ] **Backend / API** — Aucune intégration Supabase (Auth, PostgreSQL, Storage, Edge Functions). Toutes les données sont mockées dans `mockData.ts`
- [ ] **TypeScript config** — `tsconfig.json` absent (configuration par défaut de Vite)
- [ ] **Composant orphelin** — `AuditLogs.tsx` existe mais n'est importé dans aucune route

---

### Base de données — Supabase PostgreSQL

Le schéma de la base de données a été conçu d'après le document `supabase/PIJ_Database_Design_PostgreSQL.pdf` et découpé en 12 migrations Supabase dans `supabase/migrations/`.

#### Domaines couverts (16 tables)

| Domaine | Tables | Description |
|---------|--------|-------------|
| **Identity & Access** | `users`, `profiles`, `admins`, `roles`, `permissions`, `role_permissions` | Authentification, profils membres, staff et contrôle d'accès RBAC |
| **KYC & Verification** | `kyc_documents` | Documents d'identité soumis par les membres, workflow de vérification |
| **Financial Accounts** | `accounts`, `transactions` | Comptes épargne/courant, grand livre immobilisable des dépôts/retraits |
| **Savings** | `savings_goals` | Objectifs d'épargne définis par les membres avec suivi de progression |
| **Tontines** | `tontine_types`, `tontines`, `tontine_members`, `tontine_rounds`, `tontine_contributions` | Groupes d'épargne tournante avec cycles de cotisation et paiements |
| **System** | `notifications`, `audit_logs` | Boîte de réception notifications, journal d'audit immutable |

#### Ordre des migrations

| # | Fichier | Contenu |
|---|--------|---------|
| 01 | `20250621000001_extensions.sql` | Extensions `pgcrypto`, `pg_trgm` |
| 02 | `20250621000002_enums.sql` | 11 types ENUM (`user_status`, `kyc_status`, `account_type`, etc.) |
| 03 | `20250621000003_core_tables.sql` | Tables du domaine Identity & Access (6 tables) |
| 04 | `20250621000004_kyc.sql` | Table `kyc_documents` |
| 05 | `20250621000005_financial.sql` | Tables `accounts`, `transactions` |
| 06 | `20250621000006_savings.sql` | Table `savings_goals` |
| 07 | `20250621000007_tontine.sql` | Tables du domaine Tontine (5 tables) |
| 08 | `20250621000008_system.sql` | Tables `notifications`, `audit_logs` |
| 09 | `20250621000009_indexes.sql` | 15 indexes (dont trigram search sur `profiles`) |
| 10 | `20250621000010_triggers.sql` | Fonction `set_updated_at()` + 4 triggers |
| 11 | `20250621000011_rls.sql` | Fonctions `is_admin()`, `current_admin_role()` + 30+ politiques RLS |
| 12 | `20250621000012_missing_policies.sql` | Trigger `handle_new_user()` sur `auth.users`, 5 politiques manquantes |

#### Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- Membres : accès en lecture/écriture limité à leurs propres données
- Staff : accès limité par rôle (`super_admin`, `admin`, `kyc_officer`, etc.)
- `audit_logs` : insert-only, immutable par conception
- `transactions` : insert-only (Phase 1, saisie manuelle par les admins)
- Documents KYC : stockés dans un bucket Supabase privé, accès par URL signée uniquement

#### Utilisation

```bash
# Appliquer les migrations à la base distante
npx supabase db push

# (optionnel) Démarrer en local
npx supabase start
npx supabase migration up
```

---

### Différences architecturales (CDC vs Réalité)

| Aspect | Cahier de Charge | Réalité |
|--------|-----------------|---------|
| Framework | REACT.js 15 (SSR + App Router) | Vite + React 18 (SPA) |
| State management | TanStack Query + Zustand | Aucun |
| Backend | Supabase | Aucun (mocké) |
| Hosting | Vercel | Non configuré |
| Tests | Non spécifié | Aucun |
