export function validateDeposit(body: Record<string, unknown>) {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  if (body.account_type !== "savings" && body.account_type !== "current") {
    throw new Error("account_type must be 'savings' or 'current'");
  }
  return body as { user_id: string; amount: number; account_type: "savings" | "current" };
}

export function validateWithdrawal(body: Record<string, unknown>) {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  if (body.account_type !== "savings" && body.account_type !== "current") {
    throw new Error("account_type must be 'savings' or 'current'");
  }
  return body as { user_id: string; amount: number; account_type: "savings" | "current" };
}

export function validatePagination(page: unknown, limit: unknown) {
  const p = typeof page === "number" && Number.isInteger(page) && page > 0 ? page : 1;
  const l = typeof limit === "number" && Number.isInteger(limit) && limit > 0
    ? Math.min(limit, 100)
    : 20;
  return { page: p, limit: l };
}

export function validateKycAction(body: Record<string, unknown>) {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }
  if (body.reason !== undefined && typeof body.reason !== "string") {
    throw new Error("reason must be a string if provided");
  }
  return body as { user_id: string; reason?: string };
}

export function validateTontineGroup(body: Record<string, unknown>) {
  if (!body.type_id || typeof body.type_id !== "string") {
    throw new Error("type_id is required and must be a string");
  }
  if (!body.name || typeof body.name !== "string") {
    throw new Error("name is required and must be a string");
  }
  if (!Number.isInteger(body.capacity) || (body.capacity as number) <= 0) {
    throw new Error("capacity is required and must be a positive integer");
  }
  if (body.frequency !== "weekly" && body.frequency !== "monthly") {
    throw new Error("frequency must be 'weekly' or 'monthly'");
  }
  if (typeof body.entry_fee !== "number" || (body.entry_fee as number) < 0) {
    throw new Error("entry_fee is required and must be a non-negative number");
  }
  if (!body.start_date || typeof body.start_date !== "string") {
    throw new Error("start_date is required and must be a string date");
  }
  return body as {
    type_id: string;
    name: string;
    capacity: number;
    frequency: "weekly" | "monthly";
    entry_fee: number;
    start_date: string;
  };
}
