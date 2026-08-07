export const ACCOUNT_TYPES = [
  { value: "savings", label: "Compte Épargne Bloqué", labelEn: "Locked Savings Account" },
  { value: "current", label: "Compte Épargne courant", labelEn: "Current Savings Account" },
] as const;

export const ACCOUNT_TYPE_MAP: Record<string, string> = {
  savings: "Compte Épargne Bloqué",
  current: "Compte Épargne courant",
};

export const ACCOUNT_TYPE_MAP_EN: Record<string, string> = {
  savings: "Locked Savings Account",
  current: "Current Savings Account",
};
