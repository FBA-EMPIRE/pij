// PIJ Platform — Mock Data

export const CURRENT_USER_ID = "PIJ-2024-001";

export const MEMBERS = [
  { id: "PIJ-2024-001", name: "Amara Diallo", email: "amara.diallo@email.com", phone: "+237 6 70 12 34 56", kyc: "Approved", status: "Active", balance_current: 450000, balance_savings: 1200000, balance_investment: 205000, joined: "2024-01-15" },
  { id: "PIJ-2024-002", name: "Fatoumata Koné", email: "fatoumata.kone@email.com", phone: "+237 6 82 23 45 67", kyc: "Approved", status: "Active", balance_current: 125000, balance_savings: 340000, balance_investment: 0, joined: "2024-02-03" },
  { id: "PIJ-2024-003", name: "Moussa Traoré", email: "moussa.traore@email.com", phone: "+237 6 91 34 56 78", kyc: "Pending", status: "Pending", balance_current: 0, balance_savings: 0, balance_investment: 0, joined: "2024-06-10" },
  { id: "PIJ-2024-004", name: "Aïssatou Bah", email: "aissatou.bah@email.com", phone: "+237 6 55 45 67 89", kyc: "Approved", status: "Active", balance_current: 890000, balance_savings: 2100000, balance_investment: 0, joined: "2024-01-28" },
  { id: "PIJ-2024-005", name: "Ibrahim Coulibaly", email: "ibrahim.coulibaly@email.com", phone: "+237 6 44 56 78 90", kyc: "Rejected", status: "Suspended", balance_current: 0, balance_savings: 0, balance_investment: 0, joined: "2024-03-12" },
  { id: "PIJ-2024-006", name: "Mariama Sow", email: "mariama.sow@email.com", phone: "+237 6 33 67 89 01", kyc: "Approved", status: "Active", balance_current: 220000, balance_savings: 780000, balance_investment: 0, joined: "2024-04-05" },
  { id: "PIJ-2024-007", name: "Ousmane Dembélé", email: "ousmane.dembele@email.com", phone: "+237 6 22 78 90 12", kyc: "Pending", status: "Pending", balance_current: 0, balance_savings: 0, balance_investment: 0, joined: "2024-06-08" },
  { id: "PIJ-2024-008", name: "Kadiatou Baldé", email: "kadiatou.balde@email.com", phone: "+237 6 11 89 01 23", kyc: "Approved", status: "Active", balance_current: 560000, balance_savings: 1500000, balance_investment: 0, joined: "2024-02-19" },
];

export const TRANSACTIONS = [
  { id: "TXN-001", date: "2024-06-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed", goalId: "SG-002" },
  { id: "TXN-002", date: "2024-06-08", type: "Withdrawal", amount: -50000, description: "Retrait courant", account: "Courant", status: "Completed" },
  { id: "TXN-003", date: "2024-06-05", type: "Tontine", amount: -75000, description: "Contribution Tontine Alpha - Semaine 8", account: "Courant", status: "Completed" },
  { id: "TXN-004", date: "2024-05-28", type: "Deposit", amount: 200000, description: "Dépôt épargne objectif moto", account: "Épargne", status: "Completed", goalId: "SG-001" },
  { id: "TXN-005", date: "2024-05-20", type: "Tontine", amount: 900000, description: "Paiement tontine reçu - Tour #3", account: "Courant", status: "Completed" },
  { id: "TXN-006", date: "2024-05-15", type: "Withdrawal", amount: -100000, description: "Retrait courant", account: "Courant", status: "Completed" },
  { id: "TXN-007", date: "2024-05-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed", goalId: "SG-002" },
  { id: "TXN-008", date: "2024-04-30", type: "Tontine", amount: -75000, description: "Contribution Tontine Alpha - Semaine 4", account: "Courant", status: "Completed" },
  { id: "TXN-009", date: "2024-04-22", type: "Deposit", amount: 75000, description: "Dépôt courant", account: "Courant", status: "Completed" },
  { id: "TXN-010", date: "2024-04-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed", goalId: "SG-001" },
];

export const SAVINGS_GOALS = [
  { id: "SG-001", memberId: "PIJ-2024-001", name: "Acheter une moto", target: 1000000, current: 700000, deadline: "2024-09-30", icon: "🏍️", color: "#4CAF68" },
  { id: "SG-002", memberId: "PIJ-2024-001", name: "Fonds d'urgence", target: 500000, current: 320000, deadline: "2024-12-31", icon: "🛡️", color: "#6E3A9A" },
  { id: "SG-003", memberId: "PIJ-2024-002", name: "Formation professionnelle", target: 750000, current: 180000, deadline: "2025-03-15", icon: "📚", color: "#F2994A" },
];

export const TONTINES = [
  {
    id: "TON-001",
    name: "Tontine Alpha",
    type: "Hebdomadaire",
    contribution: 75000,
    entry_fee: 25000,
    capacity: 12,
    enrolled: 10,
    duration: "12 semaines",
    status: "In Progress",
    start_date: "2024-03-04",
    frequency: "weekly",
    description: "Tontine hebdomadaire pour entrepreneurs locaux. Rejoignez une communauté solidaire et faites fructifier votre épargne.",
    members: [
      { id: 1, name: "Amara Diallo", avatar: "AD", position: 1, payout_received: true, contributions: [true, true, true, true, true, true, true, true, false, false, false, false] },
      { id: 2, name: "Fatoumata Koné", avatar: "FK", position: 2, payout_received: true, contributions: [true, true, true, true, true, true, true, false, false, false, false, false] },
      { id: 3, name: "Moussa Traoré", avatar: "MT", position: 3, payout_received: true, contributions: [true, true, true, true, true, true, true, true, false, false, false, false] },
      { id: 4, name: "Aïssatou Bah", avatar: "AB", position: 4, payout_received: false, contributions: [true, true, true, true, true, true, true, true, false, false, false, false] },
      { id: 5, name: "Ibrahim Coulibaly", avatar: "IC", position: 5, payout_received: false, contributions: [true, true, true, true, true, true, false, false, false, false, false, false] },
      { id: 6, name: "Mariama Sow", avatar: "MS", position: 6, payout_received: false, contributions: [true, true, true, true, true, true, true, false, false, false, false, false] },
      { id: 7, name: "Ousmane Dembélé", avatar: "OD", position: 7, payout_received: false, contributions: [true, true, true, true, true, true, true, true, false, false, false, false] },
      { id: 8, name: "Kadiatou Baldé", avatar: "KB", position: 8, payout_received: false, contributions: [true, true, true, true, true, true, true, false, false, false, false, false] },
      { id: 9, name: "Seydou Ndiaye", avatar: "SN", position: 9, payout_received: false, contributions: [true, true, true, true, true, true, true, true, false, false, false, false] },
      { id: 10, name: "Rokhaya Fall", avatar: "RF", position: 10, payout_received: false, contributions: [true, true, true, true, true, false, false, false, false, false, false, false] },
    ],
    current_week: 8,
    total_weeks: 12,
    pool_amount: 750000,
  },
  {
    id: "TON-002",
    name: "Tontine Mensuelle Entrepreneurs",
    type: "Mensuel",
    contribution: 200000,
    entry_fee: 50000,
    capacity: 8,
    enrolled: 6,
    duration: "8 mois",
    status: "Open",
    start_date: "2024-07-01",
    frequency: "monthly",
    description: "Tontine mensuelle dédiée aux entrepreneurs. Un capital significatif chaque mois pour financer vos projets.",
    members: [],
    current_week: 0,
    total_weeks: 8,
    pool_amount: 1600000,
  },
  {
    id: "TON-003",
    name: "Tontine Jeunes Femmes",
    type: "Hebdomadaire",
    contribution: 50000,
    entry_fee: 15000,
    capacity: 10,
    enrolled: 10,
    duration: "10 semaines",
    status: "Open",
    start_date: "2024-06-17",
    frequency: "weekly",
    description: "Tontine exclusive pour les femmes entrepreneures de la région. Réseau de soutien et financement rotatif.",
    members: [],
    current_week: 0,
    total_weeks: 10,
    pool_amount: 500000,
  },
  {
    id: "TON-004",
    name: "Tontine Étudiants",
    type: "Mensuel",
    contribution: 30000,
    entry_fee: 10000,
    capacity: 15,
    enrolled: 8,
    duration: "6 mois",
    status: "Open",
    start_date: "2024-08-01",
    frequency: "monthly",
    description: "Tontine mensuelle conçue pour les étudiants et jeunes professionnels. Cotisation accessible, impact réel.",
    members: [],
    current_week: 0,
    total_weeks: 6,
    pool_amount: 450000,
  },
];

export const KYC_QUEUE = [
  { id: "KYC-001", member_id: "PIJ-2024-003", name: "Moussa Traoré", email: "moussa.traore@email.com", phone: "+237 6 91 34 56 78", submitted: "2024-06-10T09:32:00", id_type: "Carte Nationale d'Identité", status: "Pending", priority: "Normal" },
  { id: "KYC-002", member_id: "PIJ-2024-007", name: "Ousmane Dembélé", email: "ousmane.dembele@email.com", phone: "+237 6 22 78 90 12", submitted: "2024-06-08T14:15:00", id_type: "Passeport", status: "Pending", priority: "High" },
  { id: "KYC-003", member_id: "PIJ-2024-009", name: "Ndeye Gueye", email: "ndeye.gueye@email.com", phone: "+237 6 88 90 12 34", submitted: "2024-06-07T11:00:00", id_type: "Carte Nationale d'Identité", status: "Pending", priority: "Normal" },
  { id: "KYC-004", member_id: "PIJ-2024-010", name: "Lamine Diop", email: "lamine.diop@email.com", phone: "+237 6 77 01 23 45", submitted: "2024-06-06T08:45:00", id_type: "Permis de conduire", status: "Pending", priority: "Normal" },
];

export const AUDIT_LOGS = [
  { id: "LOG-001", actor: "Admin Kone", action: "KYC Approved", entity: "Member PIJ-2024-001", timestamp: "2024-06-10T16:42:00", ip: "192.168.1.45" },
  { id: "LOG-002", actor: "Admin Kone", action: "Deposit Recorded", entity: "Account ACC-001", timestamp: "2024-06-10T14:30:00", ip: "192.168.1.45" },
  { id: "LOG-003", actor: "Super Admin", action: "Tontine Created", entity: "Tontine TON-004", timestamp: "2024-06-09T11:15:00", ip: "10.0.0.1" },
  { id: "LOG-004", actor: "Admin Diallo", action: "Contribution Recorded", entity: "Tontine TON-001 / Member 4", timestamp: "2024-06-08T09:00:00", ip: "192.168.1.72" },
  { id: "LOG-005", actor: "Admin Kone", action: "KYC Rejected", entity: "Member PIJ-2024-005", timestamp: "2024-06-07T15:20:00", ip: "192.168.1.45" },
  { id: "LOG-006", actor: "Super Admin", action: "Role Assigned", entity: "Admin Diallo → Treasurer", timestamp: "2024-06-06T10:00:00", ip: "10.0.0.1" },
  { id: "LOG-007", actor: "Admin Diallo", action: "Withdrawal Recorded", entity: "Account ACC-003", timestamp: "2024-06-05T14:10:00", ip: "192.168.1.72" },
  { id: "LOG-008", actor: "Admin Kone", action: "Round Payout Recorded", entity: "Tontine TON-001 / Round 3", timestamp: "2024-06-05T09:30:00", ip: "192.168.1.45" },
];

export const ADMIN_KPI = {
  total_members: 847,
  active_members: 712,
  pending_kyc: 4,
  active_tontines: 7,
  total_savings: 284500000,
  total_current: 97200000,
  monthly_growth: 8.3,
  kyc_approval_rate: 94,
};

export const MEMBER_GROWTH_DATA = [
  { month: "Jan", members: 620 },
  { month: "Fév", members: 665 },
  { month: "Mar", members: 695 },
  { month: "Avr", members: 720 },
  { month: "Mai", members: 780 },
  { month: "Juin", members: 847 },
];

export const CONTRIBUTION_DATA = [
  { month: "Jan", amount: 38500000 },
  { month: "Fév", amount: 42000000 },
  { month: "Mar", amount: 46750000 },
  { month: "Avr", amount: 51200000 },
  { month: "Mai", amount: 58900000 },
  { month: "Juin", amount: 64300000 },
];

export const TONTINE_STATUS_DATA = [
  { name: "Active", value: 7, color: "#4CAF68" },
  { name: "Ouverte", value: 3, color: "#6E3A9A" },
  { name: "Terminée", value: 12, color: "#CBD5E1" },
];

export const KYC_TREND_DATA = [
  { month: "Jan", approved: 45, rejected: 3 },
  { month: "Fév", approved: 52, rejected: 4 },
  { month: "Mar", approved: 38, rejected: 2 },
  { month: "Avr", approved: 61, rejected: 5 },
  { month: "Mai", approved: 74, rejected: 3 },
  { month: "Juin", approved: 28, rejected: 1 },
];

export const formatXAF = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount)) + ' XAF';
};

export const FORMATION_CATEGORIES = [
  { id: "entrepreneurship", name: "Entrepreneuriat", nameEn: "Entrepreneurship", description: "Créer et structurer une activité rentable", color: "#4CAF68", status: "Active" },
  { id: "marketing", name: "Marketing", nameEn: "Marketing", description: "Trouver, convaincre et fidéliser ses clients", color: "#6E3A9A", status: "Active" },
  { id: "leadership", name: "Leadership", nameEn: "Leadership", description: "Piloter une équipe et décider avec clarté", color: "#F2994A", status: "Active" },
  { id: "investment", name: "Investissement", nameEn: "Investment", description: "Comprendre le risque, le rendement et la croissance", color: "#1F9D55", status: "Active" },
];

export const FORMATION_COURSES = [
  { id: "course-entreprendre", categoryId: "entrepreneurship", title: "Fondements de l'Entrepreneuriat", titleEn: "Entrepreneurship Fundamentals", description: "De l'idée au modèle économique: valider un problème, définir une offre et préparer son lancement.", instructor: "Jean-Pierre M.", duration: "1h 45min", lessonCount: 8, level: "Débutant", progress: 62, featured: true, status: "Published", image: "linear-gradient(135deg, #2d5a27 0%, #4a7c44 50%, #6b9e65 100%)" },
  { id: "course-tresorerie", categoryId: "entrepreneurship", title: "Gestion de Trésorerie", titleEn: "Cash Flow Management", description: "Suivre les entrées, anticiper les sorties et protéger son fonds de roulement.", instructor: "Aminata S.", duration: "2h 10min", lessonCount: 10, level: "Intermédiaire", progress: 28, featured: true, status: "Published", image: "linear-gradient(135deg, #1a3a4a 0%, #2d5a6a 50%, #4a7c8a 100%)" },
  { id: "course-marketing-local", categoryId: "marketing", title: "Marketing Digital Local", titleEn: "Local Digital Marketing", description: "Acquérir ses premiers clients avec WhatsApp Business, Facebook local et recommandations.", instructor: "Marc O.", duration: "55min", lessonCount: 6, level: "Débutant", progress: 100, featured: true, status: "Published", image: "linear-gradient(135deg, #3d2a5c 0%, #5a4a7c 50%, #7a6a9c 100%)" },
  { id: "course-investir", categoryId: "investment", title: "Investir avec Discipline", titleEn: "Disciplined Investing", description: "Comparer les opportunités, lire le risque et décider selon ses objectifs.", instructor: "Ruth N.", duration: "1h 20min", lessonCount: 7, level: "Intermédiaire", progress: 0, featured: false, status: "Draft", image: "linear-gradient(135deg, #1E2530 0%, #3A4558 55%, #4CAF68 100%)" },
];

export const FORMATION_CONTENT = [
  { id: "vid-1", courseId: "course-entreprendre", type: "video", title: "Identifier un vrai problème client", duration: "14 min", format: "MP4", completed: true },
  { id: "vid-2", courseId: "course-entreprendre", type: "video", title: "Construire une proposition de valeur", duration: "18 min", format: "URL", completed: true },
  { id: "book-1", courseId: "course-entreprendre", type: "book", title: "Guide PIJ du business plan", duration: "42 pages", format: "PDF", completed: false },
  { id: "note-1", courseId: "course-entreprendre", type: "note", title: "Checklist de validation marché", duration: "Lecture 6 min", format: "Note", completed: false },
  { id: "assign-1", courseId: "course-entreprendre", type: "assignment", title: "Décrire son client cible", duration: "20 min", format: "Devoir", completed: false },
  { id: "vid-3", courseId: "course-tresorerie", type: "video", title: "Tableau simple de flux de trésorerie", duration: "22 min", format: "MP4", completed: true },
  { id: "book-2", courseId: "course-tresorerie", type: "book", title: "Modèle budget mensuel", duration: "12 pages", format: "Document", completed: false },
];

export const CONSULTATION_REQUESTS = [
  { id: "CONS-001", type: "Mentorat", member: "Amara Diallo", project: "Boutique alimentation locale", status: "Scheduled", consultant: "Jean-Pierre M.", meetingDate: "2024-06-21 10:00" },
  { id: "CONS-002", type: "Business Review", member: "Fatoumata Koné", project: "Transformation manioc", status: "Pending", consultant: "Non assigné", meetingDate: "À planifier" },
];

export const INVESTMENT_OPPORTUNITIES = [
  { id: "INV-001", title: "Coopérative Cacao Douala", titleEn: "Douala Cocoa Cooperative", category: "Agriculture", description: "Modernisation des équipements de séchage pour 50 petits exploitants.", roi: "12%", duration: "12 mois", risk: "Faible", minAmount: 50000, maxAmount: 1000000, goal: 5000000, raised: 3750000, status: "Published", featured: true, image: "linear-gradient(135deg, #2d5a27 0%, #4a7c44 50%, #6b9e65 100%)" },
  { id: "INV-002", title: "FinTech Jeune Yaoundé", titleEn: "FinTech Youth Yaoundé", category: "Technologie", description: "Application de micro-credit instantané pour jeunes entrepreneurs vérifiés.", roi: "18%", duration: "18 mois", risk: "Modéré", minAmount: 100000, maxAmount: 2000000, goal: 12000000, raised: 5040000, status: "Published", featured: true, image: "linear-gradient(135deg, #1a2a4a 0%, #2d4a6a 50%, #4a6a8a 100%)" },
  { id: "INV-003", title: "Solaire pour le Nord", titleEn: "Solar for the North", category: "Énergie", description: "Installation de kits solaires résidentiels dans trois villages de l'Extrême-Nord.", roi: "10%", duration: "10 mois", risk: "Faible", minAmount: 75000, maxAmount: 1500000, goal: 8500000, raised: 7650000, status: "Published", featured: false, image: "linear-gradient(135deg, #5a3a0a 0%, #8a5a1a 50%, #c48a2a 100%)" },
];

export const INVESTMENT_PORTFOLIO = [
  { id: "PORT-001", opportunityId: "INV-001", title: "Coopérative Cacao Douala", amount: 125000, currentValue: 134500, returns: 9500, status: "Active", started: "2024-04-15" },
  { id: "PORT-002", opportunityId: "INV-003", title: "Solaire pour le Nord", amount: 80000, currentValue: 88000, returns: 8000, status: "Completed", started: "2023-11-02" },
];

export const INVESTMENT_WALLET = {
  available: 450000,
  invested: 205000,
  earnings: 17500,
};

export const INVESTMENT_REQUESTS = [
  { id: "IREQ-001", member: "Amara Diallo", opportunity: "FinTech Jeune Yaoundé", amount: 150000, status: "Pending", submitted: "2024-06-12" },
  { id: "IREQ-002", member: "Aïssatou Bah", opportunity: "Coopérative Cacao Douala", amount: 300000, status: "Approved", submitted: "2024-06-08" },
];

export const INVESTMENT_ACCOUNTS = [
  { id: "IA-001", memberId: "PIJ-2024-001", productId: "INV-001", amount: 125000, currentValue: 134500, returns: 9500, status: "Active", startedAt: "2024-04-15" },
  { id: "IA-002", memberId: "PIJ-2024-001", productId: "INV-003", amount: 80000, currentValue: 88000, returns: 8000, status: "Completed", startedAt: "2023-11-02" },
];

export const INVESTMENT_TRANSACTIONS = [
  { id: "ITXN-001", accountId: "IA-001", type: "Deposit", amount: 125000, description: "Investissement Coopérative Cacao Douala", createdAt: "2024-04-15" },
  { id: "ITXN-002", accountId: "IA-001", type: "Return", amount: 9500, description: "Retour sur investissement (trimestre 1)", createdAt: "2024-07-15" },
  { id: "ITXN-003", accountId: "IA-002", type: "Deposit", amount: 80000, description: "Investissement Solaire pour le Nord", createdAt: "2023-11-02" },
  { id: "ITXN-004", accountId: "IA-002", type: "Return", amount: 8000, description: "Retour sur investissement (final)", createdAt: "2024-09-02" },
];

// ── Tontine Lifecycle ──

export const JOIN_REQUESTS = [
  { id: "JREQ-001", userId: "PIJ-2024-002", tontineId: "TON-003", status: "Pending Entry Fee" as const, createdAt: "2024-06-12T10:30:00" },
  { id: "JREQ-002", userId: "PIJ-2024-004", tontineId: "TON-004", status: "Pending" as const, createdAt: "2024-06-14T14:00:00" },
  { id: "JREQ-003", userId: "PIJ-2024-006", tontineId: "TON-002", status: "Approved" as const, createdAt: "2024-06-10T09:15:00" },
];

export const CONTRIBUTION_LOGS = [
  { id: "CLOG-001", adminId: "Admin Kone", memberId: 1, tontineId: "TON-001", round: 8, previousStatus: false, newStatus: true, timestamp: "2024-06-10T14:30:00" },
  { id: "CLOG-002", adminId: "Admin Diallo", memberId: 3, tontineId: "TON-001", round: 8, previousStatus: false, newStatus: true, timestamp: "2024-06-10T15:00:00" },
  { id: "CLOG-003", adminId: "Admin Kone", memberId: 5, tontineId: "TON-001", round: 7, previousStatus: false, newStatus: true, timestamp: "2024-06-05T09:30:00" },
];

export const ROUND_RECIPIENTS = [
  { id: "RR-001", tontineId: "TON-001", round: 1, memberId: 1, amount: 750000, assignedAt: "2024-03-04" },
  { id: "RR-002", tontineId: "TON-001", round: 2, memberId: 2, amount: 750000, assignedAt: "2024-03-11" },
  { id: "RR-003", tontineId: "TON-001", round: 3, memberId: 3, amount: 750000, assignedAt: "2024-03-18" },
];

export const ARCHIVES = [
  {
    id: "ARC-001",
    originalId: "TON-ARCH-2023",
    name: "Tontine Test 2023",
    description: "Tontine test terminée avec tous les versements effectués.",
    contribution: 50000,
    entry_fee: 10000,
    capacity: 6,
    total_weeks: 6,
    start_date: "2023-07-01",
    end_date: "2023-08-05",
    frequency: "weekly" as const,
    total_collected: 1800000,
    members: [
      { id: 1, name: "Amara Diallo", avatar: "AD", position: 1, payout_received: true, contributions: [true, true, true, true, true, true] },
      { id: 2, name: "Fatoumata Koné", avatar: "FK", position: 2, payout_received: true, contributions: [true, true, true, true, true, true] },
      { id: 3, name: "Aïssatou Bah", avatar: "AB", position: 3, payout_received: true, contributions: [true, true, true, true, true, true] },
      { id: 4, name: "Mariama Sow", avatar: "MS", position: 4, payout_received: true, contributions: [true, true, true, true, true, true] },
      { id: 5, name: "Kadiatou Baldé", avatar: "KB", position: 5, payout_received: true, contributions: [true, true, true, true, true, true] },
      { id: 6, name: "Seydou Ndiaye", avatar: "SN", position: 6, payout_received: true, contributions: [true, true, true, true, true, true] },
    ],
    recipients: [
      { id: "ARC-RR-001", tontineId: "TON-ARCH-2023", round: 1, memberId: 1, amount: 300000, assignedAt: "2023-07-01" },
      { id: "ARC-RR-002", tontineId: "TON-ARCH-2023", round: 2, memberId: 2, amount: 300000, assignedAt: "2023-07-08" },
      { id: "ARC-RR-003", tontineId: "TON-ARCH-2023", round: 3, memberId: 3, amount: 300000, assignedAt: "2023-07-15" },
      { id: "ARC-RR-004", tontineId: "TON-ARCH-2023", round: 4, memberId: 4, amount: 300000, assignedAt: "2023-07-22" },
      { id: "ARC-RR-005", tontineId: "TON-ARCH-2023", round: 5, memberId: 5, amount: 300000, assignedAt: "2023-07-29" },
      { id: "ARC-RR-006", tontineId: "TON-ARCH-2023", round: 6, memberId: 6, amount: 300000, assignedAt: "2023-08-05" },
    ],
  },
];

export const NOTIFICATIONS = [
  { id: "NOTIF-001", userId: "PIJ-2024-001", type: "contribution" as const, title: "Contribution marquée comme payée", titleEn: "Contribution marked as paid", message: "Votre cotisation pour la Tontine Alpha - Semaine 8 a été marquée comme payée.", messageEn: "Your contribution for Tontine Alpha - Week 8 has been marked as paid.", read: false, createdAt: "2024-06-10T14:30:00" },
  { id: "NOTIF-002", userId: "PIJ-2024-001", type: "payout" as const, title: "Tour de paiement reçu", titleEn: "Payout round received", message: "Vous avez reçu votre paiement pour le Tour #3 de la Tontine Alpha (750 000 XAF).", messageEn: "You received your payout for Round #3 of Tontine Alpha (750,000 XAF).", read: false, createdAt: "2024-06-05T09:30:00" },
  { id: "NOTIF-003", userId: "PIJ-2024-001", type: "completion" as const, title: "Tontine terminée", titleEn: "Tontine completed", message: "La Tontine Test 2023 est terminée. Consultez vos archives pour les détails.", messageEn: "Tontine Test 2023 is completed. Check your archives for details.", read: true, createdAt: "2023-08-05T12:00:00" },
  { id: "NOTIF-004", userId: "PIJ-2024-002", type: "join_request" as const, title: "Demande d'adhésion soumise", titleEn: "Join request submitted", message: "Votre demande pour rejoindre Tontine Jeunes Femmes a été soumise.", messageEn: "Your request to join Tontine Jeunes Femmes has been submitted.", read: false, createdAt: "2024-06-12T10:30:00" },
  { id: "NOTIF-005", userId: "PIJ-2024-002", type: "entry_fee" as const, title: "Frais d'entrée en attente", titleEn: "Entry fee pending", message: "Veuillez payer les frais d'entrée de 15 000 XAF pour valider votre adhésion.", messageEn: "Please pay the entry fee of 15,000 XAF to validate your membership.", read: false, createdAt: "2024-06-12T10:30:00" },
];
