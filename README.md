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

### Différences architecturales (CDC vs Réalité)

| Aspect | Cahier de Charge | Réalité |
|--------|-----------------|---------|
| Framework | REACT.js 15 (SSR + App Router) | Vite + React 18 (SPA) |
| State management | TanStack Query + Zustand | Aucun |
| Backend | Supabase | Aucun (mocké) |
| Hosting | Vercel | Non configuré |
| Tests | Non spécifié | Aucun |
