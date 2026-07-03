export const ACCOUNT_TYPES = [
  { value: "savings", label: "Épargne", labelEn: "Savings" },
  { value: "current", label: "Courant", labelEn: "Current" },
] as const;

export const ACCOUNT_TYPE_MAP: Record<string, string> = {
  savings: "Épargne",
  current: "Courant",
};

export const ACCOUNT_TYPE_MAP_EN: Record<string, string> = {
  savings: "Savings",
  current: "Current",
};
