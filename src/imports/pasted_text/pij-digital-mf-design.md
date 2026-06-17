
PROGRAMME D'INVESTISSEMENT DES JEUNES

Digital Microfinance Operations Platform

Complete Functional & Technical Design Report

PIJ – Empowering Youth Through Digital Finance
 
1. Executive Summary
The Digital Microfinance Operations Platform is a modern web-based system designed to transform and digitize all core operational processes of the Programme d'Investissement des Jeunes (PIJ). By replacing manual registers, spreadsheets, and paper-based workflows with a centralized digital solution, the platform will significantly improve efficiency, transparency, and accountability across the organization.

Mission Statement
To empower PIJ members with a secure, transparent, and scalable digital financial platform that streamlines savings management, tontine participation, and administrative operations — while building the foundation for full Mobile Money and banking integration.

During the pre-production phase, all monetary transactions remain manually recorded by authorized administrators. This deliberate approach minimizes regulatory and technical risk while ensuring the platform is fully validated before live financial automation is introduced.

Key Highlights
•	Full digital member onboarding and KYC verification workflow
•	Dual portal system: Member Portal and Admin Portal
•	Transparent tontine management with visual contribution tracking
•	Role-based access control with comprehensive audit logging
•	Bilingual support (English and French) with light/dark theme options
•	Architecture designed for future Mobile Money and banking integration
 
2. Business Problem & Proposed Solution
2.1 Current Challenges
PIJ currently relies on entirely manual processes to manage member information, financial records, and tontine administration. These legacy processes present significant operational risks and limitations:

Pain Point	Impact on PIJ Operations
Manual member registration	Slow onboarding, inconsistent data quality, duplicate records risk
Paper-based KYC verification	Verification delays, document loss risk, no audit trail
Spreadsheet account tracking	Error-prone balance calculations, no real-time visibility
Manual tontine management	Lack of transparency, disputes over contribution status and payout order
Handwritten audit records	Difficult to audit, no searchability, compliance risks
Siloed data storage	No consolidated reporting, unable to scale with member growth

2.2 Proposed Solution Overview
The platform addresses each pain point through targeted digital solutions organized into two main portals: a Member Portal for end users and an Administrative Portal for PIJ staff.

Solution Approach
Phase 1 (Pre-Production): Full digitization of workflows with manual transaction recording by administrators. All core modules deployed and validated.
Phase 2 (Production): Automated financial processing integrated with Mobile Money (MTN, Orange) and banking APIs.
 
3. Use Case Diagrams
The following use case diagrams illustrate all major interactions between system actors and platform functionalities. Each diagram is organized by functional domain for clarity.
3.1 Member Registration & KYC

USE CASE DIAGRAM: Member Onboarding & KYC Verification
Actor	Use Case	Description
👤 Member	UC-01: Create Account	Register with email, name, phone number, and password
👤 Member	UC-02: Verify Email	Confirm email address via verification link
👤 Member	UC-03: Submit KYC Documents	Upload identity documents (ID card, passport, etc.)
👤 Member	UC-04: Track KYC Status	View approval/rejection status on dashboard
👤 Admin	UC-05: Review KYC Queue	View pending KYC submissions in review queue
👤 Admin	UC-06: Approve KYC	Approve member's identity documents and activate account
👤 Admin	UC-07: Reject KYC	Reject submission with reason; member notified to resubmit
👤 Admin	UC-08: Create/Edit User	Manually create or update member profiles

3.2 Account Management

USE CASE DIAGRAM: Savings & Current Account Management
Actor	Use Case	Description
👤 Member	UC-09: View Current Account	View current account balance and recent activity
👤 Member	UC-10: View Savings Account	View savings balance and contribution history
👤 Member	UC-11: View Transaction History	Browse full transaction ledger with dates and amounts
👤 Member	UC-12: View Transaction Detail	See full details of individual transactions
👤 Member	UC-13: Create Savings Goal	Define a savings target with a name, amount, and deadline
👤 Member	UC-14: Track Savings Goal Progress	Monitor progress towards defined savings goals
👤 Admin	UC-15: Record Deposit	Manually enter deposit amount to member account
👤 Admin	UC-16: Record Withdrawal	Manually enter withdrawal from member account
👤 Admin	UC-17: View Transaction Ledger	Review all recorded transactions across all members
 
3.3 Tontine Management

USE CASE DIAGRAM: Tontine Participation & Administration
Actor	Use Case	Description
👤 Member	UC-18: Browse Tontine Marketplace	View available tontines with details and entry requirements
👤 Member	UC-19: Apply to Join Tontine	Submit application to participate in a tontine
👤 Member	UC-20: View My Tontines	See all tontines the member is enrolled in
👤 Member	UC-21: Track Contribution Status	View paid/unpaid status with green/red indicators
👤 Member	UC-22: View Payout Order	See all members' payout sequence and badge for received rounds
👤 Member	UC-23: View Fellow Members	See all participants in a shared tontine
👤 Admin	UC-24: Create Tontine Types	Define tontine categories with contribution amounts and frequencies
👤 Admin	UC-25: Create Tontine Group	Set up a new tontine with start date, capacity, and rules
👤 Admin	UC-26: Manage Members	Add, remove, or update tontine participant list
👤 Admin	UC-27: Record Contribution	Mark member's weekly/monthly contribution as paid
👤 Admin	UC-28: Manage Round Distribution	Track which member receives payout for each round

3.4 Reporting & Administration

USE CASE DIAGRAM: Reporting, Audit & System Administration
Actor	Use Case	Description
👤 Admin	UC-29: View Reports Dashboard	Overview of member statistics, financial summaries, and activity
👤 Admin	UC-30: Export Reports	Download PDF or Excel reports for any period
👤 Admin	UC-31: Search Members	Find members by name, UID, or phone number
👤 Admin	UC-32: View Audit Logs	Review a timestamped log of all system activities
👤 Admin	UC-33: Manage Notifications	View and send system notifications to members
👤 Super Admin	UC-34: Manage Roles & Permissions	Define staff roles and assign granular permissions
👤 Super Admin	UC-35: System Settings	Configure platform-wide settings, languages, and themes
👤 Super Admin	UC-36: Manage Admin Profiles	Create, update, or deactivate administrator accounts
 
4. System Architecture & Technical Design
The platform follows a modern, cloud-native three-tier architecture optimized for performance, security, and future scalability. All components are selected to minimize operational overhead while maximizing reliability.
4.1 Architecture Overview

SYSTEM ARCHITECTURE DIAGRAM
Layer / Component	Details
💻
Presentation Layer	Next.js 15 (React + TypeScript) — Responsive web app served via Vercel CDN. Tailwind CSS + shadcn/ui for consistent, accessible design. TanStack Query for server-state management. Zustand for client-side state. Supports bilingual (EN/FR) and light/dark themes.
🔐
Authentication Layer	Supabase Auth — JWT-based authentication with Row Level Security (RLS). Multi-Factor Authentication (MFA) mandatory for administrators. Session management with secure token refresh. Role-based access control enforced at database level.
⚙️
Business Logic Layer	Supabase Edge Functions (Deno/TypeScript) — KYC Service, Account Service, Tontine Service, Reporting Service, Notification Service. Stateless serverless functions with automatic scaling.
🗄️
Data Layer	Supabase PostgreSQL — Relational database with RLS policies. Supabase Storage for secure KYC document storage. Supabase Realtime for live dashboard updates. Automated daily backups with point-in-time recovery.
📊
Reporting & Export	PDF generation via server-side rendering. Excel exports using SheetJS. Scheduled report generation. Multi-format export support for compliance.
🔔
Notification Layer	Resend (transactional email). WhatsApp/SMS integration planned for Phase 2. In-app notification center. Email templates for KYC status, contribution reminders, payout alerts.
📈
Monitoring & DevOps	Sentry — real-time error tracking and performance monitoring. PostHog — product analytics and user behavior insights. GitHub + Vercel CI/CD pipeline with automated preview deployments.

4.2 Technology Stack Summary

Category	Technology	Purpose
Frontend	Next.js 15 + React + TypeScript	Server-side rendering, routing, UI components
Styling	Tailwind CSS + shadcn/ui	Responsive design system, accessible components
State Management	TanStack Query + Zustand	Server state caching, client state management
Backend	Supabase (PostgreSQL + Auth)	Database, authentication, real-time, storage
Serverless	Supabase Edge Functions	Business logic, service orchestration
Hosting	Vercel	Global CDN, automatic deployments, preview environments
Email	Resend	Transactional email delivery
Monitoring	Sentry	Error tracking, performance monitoring
Analytics	PostHog	User behavior, product analytics
CI/CD	GitHub + Vercel	Automated testing and deployment pipelines
 
5. Database Design
The database schema is designed around clear domain boundaries, ensuring data integrity, auditability, and scalability. All tables implement Row Level Security (RLS) policies to enforce data access at the database level.
5.1 Core Entity Relationship Overview

Domain	Tables	Key Relationships
Identity & Access	users, profiles, admins, roles, permissions	users (1) → profiles (1); admins → roles → permissions
KYC & Verification	kyc_documents	kyc_documents (M) → users (1)
Financial Accounts	accounts, transactions	accounts (M) → users (1); transactions (M) → accounts (1)
Savings	savings_goals	savings_goals (M) → users (1); linked to accounts
Tontines	tontine_types, tontines, tontine_members, tontine_contributions, tontine_rounds	tontine_types (1) → tontines (M); tontines (1) → tontine_members (M); tontine_rounds (1) → tontine_contributions (M)
System	notifications, audit_logs	All actions → audit_logs; notifications → users

5.2 Key Table Descriptions

users
Core identity table storing authentication credentials, unique member ID (UID), email, phone, status, and KYC state.
•	id (UUID, PK)
•	uid (unique member code)
•	email
•	phone
•	status (pending/active/suspended)
•	kyc_status
•	created_at

accounts
Stores both savings and current account records for each verified member.
•	id (UUID, PK)
•	user_id (FK → users)
•	account_type (savings/current)
•	balance (decimal)
•	currency
•	is_active
•	created_at

tontines
Manages tontine group instances with capacity, contribution frequency, and lifecycle status.
•	id (UUID, PK)
•	type_id (FK → tontine_types)
•	name
•	capacity
•	frequency (weekly/monthly)
•	entry_fee
•	status (open/active/closed)
•	start_date

audit_logs
Immutable log of all significant system events for compliance and traceability.
•	id (UUID, PK)
•	actor_id
•	action
•	entity_type
•	entity_id
•	metadata (JSONB)
•	ip_address
•	created_at

 
6. Portal Screen Catalog
6.1 Admin Portal — All Screens

#	Screen Name	Key Functionality
01	Login / Forgot Password	Secure admin authentication with MFA, password recovery flow
02	Dashboard	KPIs: active members, pending KYC, account balances, recent activity
03	Users List	Searchable, filterable member directory with quick-action buttons
04	User Details	Full member profile with account history, KYC status, tontine memberships
05	KYC Review Queue	Sorted queue of pending verifications with priority indicators
06	KYC Review Detail	Document viewer with approve/reject controls and note field
07	Create / Edit User	Form to manually register or update member information
08	Current Accounts	Overview of all current accounts with balance summaries
09	Savings Accounts	Overview of all savings accounts with goal tracking
10	Deposit Entry	Form to manually record a deposit to a member account
11	Withdrawal Entry	Form to manually record a withdrawal from a member account
12	Transaction Ledger	Full chronological transaction log with filters and search
13	Tontine Types Mgmt	Create and manage tontine categories and configuration
14	Tontine Creation	Set up a new tontine group with all parameters
15	Tontine Members	Member list for a tontine with status and payout order
16	Contribution Tracker	Visual grid: green (paid) / red (unpaid) per member per cycle
17	Round Distribution	Record and track payout rounds for each tontine
18	Reports Dashboard	Analytics overview with charts, trends, and summaries
19	Export Reports	Generate and download PDF / Excel reports for any date range
20	Notifications Center	View and send notifications to individual members or groups
21	Role & Permission Mgmt	Define roles and assign granular permissions to admin staff
22	Audit Logs	Searchable, filterable immutable system activity log
23	System Settings	Platform configuration, theme, language, backup settings
24	Profile Settings	Admin's own profile and password management
 
6.2 Member Portal — All Screens

#	Screen Name	Key Functionality
01	Landing Page	Platform overview, features, sign-up and login call-to-action
02	Sign Up	Self-registration form with validation and terms acceptance
03	Login	Email/password authentication with remember-me option
04	Email Verification	One-click email confirmation to activate account access
05	KYC Submission	Multi-step form for uploading identity documents
06	KYC Pending Status	Friendly waiting page with status tracker and timeline
07	Dashboard	Personal overview: balances, recent transactions, tontine status
08	Current Account Overview	Balance, statement, and recent activity for current account
09	Savings Account Overview	Savings balance, goals progress, and contribution history
10	Transaction History	Full paginated transaction list with filters by date and type
11	Transaction Detail	Complete details of a single transaction with receipt option
12	Savings Goals List	All defined savings goals with progress bars
13	Create Savings Goal	Form to define target amount, name, and deadline
14	Savings Goal Detail	Progress visualization, history, and goal management
15	Tontine Marketplace	Browse all open tontines with entry requirements and capacity
16	Tontine Application	Application form with entry fee acknowledgment
17	My Tontines	All enrolled tontines with status and next contribution due date
18	Tontine Detail	Full tontine info: rules, schedule, round distribution overview
19	Tontine Members View	All participants list, payout badges for completed rounds
20	Contribution Status	Personal contribution grid — green (paid) / red (unpaid)
21	Notifications	In-app notification inbox with read/unread status
22	Profile	Personal information management and photo upload
23	Security Settings	Password change, active sessions, MFA management
24	Language Settings	Switch between English and French
25	Theme Settings	Toggle between light and dark mode
 
7. Tontine Module — Detailed Design
The Tontine module is one of PIJ's most strategic features, enabling the platform to digitize the traditional rotating savings and credit association (ROSCA) model. The design prioritizes trust, transparency, and ease of use for all participants.
7.1 How Tontines Work on the Platform
1.	Administrator creates a Tontine Type defining contribution amount, frequency, and general rules.
2.	Administrator creates a Tontine Group using that type, setting capacity, start date, and entry fee.
3.	Members browse available tontines in the Tontine Marketplace and submit an application.
4.	Administrator validates the entry fee payment and confirms the member's participation.
5.	Each cycle (weekly or monthly), the administrator records each member's contribution payment.
6.	The system displays a visual contribution grid: green cells for paid, red for unpaid.
7.	Each round, one member receives the pooled contributions as their payout.
8.	Members who have received their payout are marked with a visible badge for full transparency.

7.2 Contribution Status Visual Design

Contribution Status Indicators
🟢 GREEN CELL = Contribution has been paid and validated by administrator
🔴 RED CELL = Contribution is outstanding / not yet recorded as paid
🏆 PAYOUT BADGE = Member has already received their round's payout
All participants in a tontine can see the status of all other members, fostering accountability and trust.

7.3 Tontine Data Flow

SYSTEM ARCHITECTURE DIAGRAM
Layer / Component	Details
1️⃣
Setup	Admin creates Tontine Type → Admin creates Tontine Group → System opens tontine for applications
2️⃣
Enrollment	Member browses marketplace → Member applies → Admin validates entry fee → Member status: Active Participant
3️⃣
Contributions	Cycle begins → Admin records each payment → System updates contribution grid (green/red) → Members view real-time status
4️⃣
Round Payout	Admin selects round recipient → Admin records payout distribution → System marks recipient with payout badge → All members notified
5️⃣
Completion	All rounds completed → All members have received payout → Admin closes tontine → Full history archived
 
8. Security Architecture
Security is a foundational pillar of the platform design. Given the sensitive nature of financial and personal identity data, multiple layers of protection are implemented throughout the system.
8.1 Security Controls Overview

Security Domain	Controls Implemented	Scope
Access Control	Role-Based Access Control (RBAC) with granular permissions; Row Level Security (RLS) in PostgreSQL	All portal users
Authentication	Supabase Auth with JWT tokens; mandatory MFA for administrators; session timeout policies	Admins + Members
Data Protection	Encrypted passwords (bcrypt); TLS 1.3 for all data in transit; AES-256 for data at rest	All data layers
Document Security	KYC documents stored in Supabase private storage; access only via signed URLs with expiry	KYC Documents
Audit Logging	Immutable timestamped logs for all significant actions including login, data changes, approvals	All admin actions
Activity Tracking	IP address logging, device fingerprinting, suspicious activity detection	All sessions
Backup Policy	Automated daily PostgreSQL backups; 30-day retention; point-in-time recovery capability	Database
Monitoring	Sentry real-time error alerting; anomaly detection on failed authentication attempts	Entire platform

8.2 Data Privacy Principles
•	Members can only access their own accounts, transactions, and tontine data
•	Administrators access only data within the scope of their assigned role
•	KYC documents are never publicly accessible; all access is logged
•	Personally Identifiable Information (PII) is encrypted at rest
•	Data retention policies align with applicable financial regulatory requirements
 
9. Future Integration Roadmap
The current architecture has been intentionally designed to support a phased evolution toward a fully automated digital financial platform. All integration points are defined and reserved in the architecture from Day 1.

Phase	Integration	Description	Timeline
2A	MTN Mobile Money	Automated deposit and withdrawal processing via MTN MoMo API. Members can top up and withdraw directly from the platform.	Phase 2
2B	Orange Money	Parallel integration with Orange Money for members using Orange network services.	Phase 2
2C	Payment Reconciliation	Automated matching of incoming Mobile Money transfers to member accounts, reducing manual admin workload.	Phase 2
3A	Banking API Integration	Direct integration with partner bank APIs for account verification and fund transfers.	Phase 3
3B	Loan Management	Credit scoring, loan application, disbursement, and repayment tracking module.	Phase 3
3C	Advanced Risk Scoring	AI-driven member risk assessment based on contribution history, savings behavior, and tontine performance.	Phase 3
3D	Financial Analytics	Detailed BI dashboards, forecasting tools, and regulatory compliance reporting.	Phase 3

Architecture Future-Proofing
All API integration points are pre-defined in the Edge Functions layer. Financial transaction tables include transaction_reference and external_id fields reserved for automated payment IDs. No major database schema changes will be required when Phase 2 integrations are activated.
 
10. Key Benefits & Expected Outcomes
10.1 Operational Benefits

Before: Manual Operations	After: Digital Platform
Paper-based member registration	Instant online registration with email verification
Manual KYC document handling	Digital KYC with structured review queue
Spreadsheet balance tracking	Real-time account balances with full transaction history
Verbal tontine status updates	Visual contribution grids with instant status visibility
No audit trail	Immutable, searchable audit logs for all actions
Manual monthly reports	On-demand PDF and Excel reports in seconds
No member self-service	24/7 member portal with full account visibility
Difficult to scale	Cloud infrastructure scales to thousands of members

10.2 Strategic Value for PIJ
•	Member Trust & Transparency: Visible contribution status and payout tracking builds confidence among all tontine participants
•	Regulatory Readiness: Audit logs, KYC records, and transaction history provide evidence of compliance
•	Scalability: The platform can grow from dozens to thousands of members without architectural changes
•	Cost Reduction: Elimination of paper records and reduced manual reconciliation lowers operational costs
•	Future Revenue: The architecture directly enables future loan products and financial services that generate institutional revenue

Appendix A: Glossary

Term	Definition
KYC	Know Your Customer — the process of verifying member identity using official documents
Tontine	A rotating savings and credit association where members pool contributions and take turns receiving the pooled amount
RBAC	Role-Based Access Control — a security model where permissions are assigned by role, not individually
RLS	Row Level Security — a database feature ensuring users can only access rows they are authorized to see
MFA	Multi-Factor Authentication — requiring a second verification step beyond username and password
Edge Functions	Serverless functions deployed at the network edge for low-latency business logic execution
JWT	JSON Web Token — a secure, compact token format used for authentication and authorization
ROSCA	Rotating Savings and Credit Association — the formal name for a tontine-style financial group
PIJ	Programme d'Investissement des Jeunes — the organization implementing this platform
UID	Unique Identifier — a system-generated unique code assigned to each PIJ member

— End of Document —
