export function formatXAF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Opportunities store ROI as free text (e.g. "15%") rather than a
// structured number -- pull out the first numeric token so it can be
// used in a projected-return calculation.
export function parseRoiPercent(roi: string | null | undefined): number {
  if (!roi) return 0;
  const match = String(roi).match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}
