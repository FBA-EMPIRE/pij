// PIJ Platform — Mock Data

export const MEMBERS = [
  { id: "PIJ-2024-001", name: "Amara Diallo", email: "amara.diallo@email.com", phone: "+237 6 70 12 34 56", kyc: "Approved", status: "Active", balance_current: 450000, balance_savings: 1200000, joined: "2024-01-15" },
  { id: "PIJ-2024-002", name: "Fatoumata Koné", email: "fatoumata.kone@email.com", phone: "+237 6 82 23 45 67", kyc: "Approved", status: "Active", balance_current: 125000, balance_savings: 340000, joined: "2024-02-03" },
  { id: "PIJ-2024-003", name: "Moussa Traoré", email: "moussa.traore@email.com", phone: "+237 6 91 34 56 78", kyc: "Pending", status: "Pending", balance_current: 0, balance_savings: 0, joined: "2024-06-10" },
  { id: "PIJ-2024-004", name: "Aïssatou Bah", email: "aissatou.bah@email.com", phone: "+237 6 55 45 67 89", kyc: "Approved", status: "Active", balance_current: 890000, balance_savings: 2100000, joined: "2024-01-28" },
  { id: "PIJ-2024-005", name: "Ibrahim Coulibaly", email: "ibrahim.coulibaly@email.com", phone: "+237 6 44 56 78 90", kyc: "Rejected", status: "Suspended", balance_current: 0, balance_savings: 0, joined: "2024-03-12" },
  { id: "PIJ-2024-006", name: "Mariama Sow", email: "mariama.sow@email.com", phone: "+237 6 33 67 89 01", kyc: "Approved", status: "Active", balance_current: 220000, balance_savings: 780000, joined: "2024-04-05" },
  { id: "PIJ-2024-007", name: "Ousmane Dembélé", email: "ousmane.dembele@email.com", phone: "+237 6 22 78 90 12", kyc: "Pending", status: "Pending", balance_current: 0, balance_savings: 0, joined: "2024-06-08" },
  { id: "PIJ-2024-008", name: "Kadiatou Baldé", email: "kadiatou.balde@email.com", phone: "+237 6 11 89 01 23", kyc: "Approved", status: "Active", balance_current: 560000, balance_savings: 1500000, joined: "2024-02-19" },
];

export const TRANSACTIONS = [
  { id: "TXN-001", date: "2024-06-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed" },
  { id: "TXN-002", date: "2024-06-08", type: "Withdrawal", amount: -50000, description: "Retrait courant", account: "Courant", status: "Completed" },
  { id: "TXN-003", date: "2024-06-05", type: "Tontine", amount: -75000, description: "Contribution Tontine Alpha - Semaine 8", account: "Courant", status: "Completed" },
  { id: "TXN-004", date: "2024-05-28", type: "Deposit", amount: 200000, description: "Dépôt épargne objectif moto", account: "Épargne", status: "Completed" },
  { id: "TXN-005", date: "2024-05-20", type: "Tontine", amount: 900000, description: "Paiement tontine reçu - Tour #3", account: "Courant", status: "Completed" },
  { id: "TXN-006", date: "2024-05-15", type: "Withdrawal", amount: -100000, description: "Retrait courant", account: "Courant", status: "Completed" },
  { id: "TXN-007", date: "2024-05-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed" },
  { id: "TXN-008", date: "2024-04-30", type: "Tontine", amount: -75000, description: "Contribution Tontine Alpha - Semaine 4", account: "Courant", status: "Completed" },
  { id: "TXN-009", date: "2024-04-22", type: "Deposit", amount: 75000, description: "Dépôt courant", account: "Courant", status: "Completed" },
  { id: "TXN-010", date: "2024-04-10", type: "Deposit", amount: 150000, description: "Dépôt mensuel", account: "Épargne", status: "Completed" },
];

export const SAVINGS_GOALS = [
  { id: "SG-001", name: "Acheter une moto", target: 1000000, current: 700000, deadline: "2024-09-30", icon: "🏍️", color: "#4CAF68" },
  { id: "SG-002", name: "Fonds d'urgence", target: 500000, current: 320000, deadline: "2024-12-31", icon: "🛡️", color: "#6E3A9A" },
  { id: "SG-003", name: "Formation professionnelle", target: 750000, current: 180000, deadline: "2025-03-15", icon: "📚", color: "#F2994A" },
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
    status: "Active",
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
    status: "Almost Full",
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
