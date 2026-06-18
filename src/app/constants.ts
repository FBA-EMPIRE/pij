export const ACCOUNT_TYPES = [
  { value: "current", label: "Courant", labelEn: "Current" },
  { value: "savings", label: "Épargne", labelEn: "Savings" },
  { value: "investment", label: "Investissement", labelEn: "Investment" },
] as const;

export const ACCOUNT_TYPE_MAP: Record<string, string> = {
  current: "Courant",
  savings: "Épargne",
  investment: "Investissement",
};

export const ACCOUNT_TYPE_MAP_EN: Record<string, string> = {
  current: "Current",
  savings: "Savings",
  investment: "Investment",
};
