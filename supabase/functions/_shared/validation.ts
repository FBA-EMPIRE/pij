const TONTINE_FREQUENCIES = ["weekly", "monthly", "daily", "quarterly"] as const;
type TontineFrequency = typeof TONTINE_FREQUENCIES[number];

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

export function validateGetTransactions(body: Record<string, unknown>) {
  const user_id = typeof body.user_id === "string" && body.user_id ? body.user_id : undefined;
  const account_type = body.account_type === "savings" || body.account_type === "current"
    ? body.account_type
    : undefined;
  return { user_id, account_type: account_type as "savings" | "current" | undefined };
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
  if (!TONTINE_FREQUENCIES.includes(body.frequency as TontineFrequency)) {
    throw new Error(`frequency must be one of: ${TONTINE_FREQUENCIES.join(", ")}`);
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
    frequency: TontineFrequency;
    entry_fee: number;
    start_date: string;
  };
}

export function validateTontineUpdate(body: Record<string, unknown>) {
  if (!body.id || typeof body.id !== "string") {
    throw new Error("id is required and must be a string");
  }
  const patch: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name) {
      throw new Error("name must be a non-empty string");
    }
    patch.name = body.name;
  }
  if (body.capacity !== undefined) {
    if (!Number.isInteger(body.capacity) || (body.capacity as number) <= 0) {
      throw new Error("capacity must be a positive integer");
    }
    patch.capacity = body.capacity;
  }
  if (body.frequency !== undefined) {
    if (!TONTINE_FREQUENCIES.includes(body.frequency as TontineFrequency)) {
      throw new Error(`frequency must be one of: ${TONTINE_FREQUENCIES.join(", ")}`);
    }
    patch.frequency = body.frequency;
  }
  if (body.entry_fee !== undefined) {
    if (typeof body.entry_fee !== "number" || (body.entry_fee as number) < 0) {
      throw new Error("entry_fee must be a non-negative number");
    }
    patch.entry_fee = body.entry_fee;
  }
  if (body.start_date !== undefined) {
    if (typeof body.start_date !== "string" || !body.start_date) {
      throw new Error("start_date must be a non-empty string date");
    }
    patch.start_date = body.start_date;
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("At least one field to update must be provided");
  }

  return { id: body.id as string, patch: patch as {
    name?: string;
    capacity?: number;
    frequency?: TontineFrequency;
    entry_fee?: number;
    start_date?: string;
  } };
}

export function validateTontineApply(body: Record<string, unknown>) {
  if (!body.tontine_id || typeof body.tontine_id !== "string") {
    throw new Error("tontine_id is required and must be a string");
  }
  return body as { tontine_id: string };
}

export function validateTontineContribution(body: Record<string, unknown>) {
  if (!body.round_id || typeof body.round_id !== "string") {
    throw new Error("round_id is required and must be a string");
  }
  if (!body.member_id || typeof body.member_id !== "string") {
    throw new Error("member_id is required and must be a string");
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  return body as { round_id: string; member_id: string; amount: number };
}

export function validateTontineMemberAction(body: Record<string, unknown>) {
  if (!body.member_id || typeof body.member_id !== "string") {
    throw new Error("member_id is required and must be a string");
  }
  if (body.reason !== undefined && typeof body.reason !== "string") {
    throw new Error("reason must be a string if provided");
  }
  return body as { member_id: string; reason?: string };
}

export function validateLoanCreate(body: Record<string, unknown>) {
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  if (body.interest !== undefined && (typeof body.interest !== "number" || body.interest < 0)) {
    throw new Error("interest must be a non-negative number if provided");
  }
  if (!body.loan_date || typeof body.loan_date !== "string") {
    throw new Error("loan_date is required and must be a string date");
  }
  if (!body.repayment_date || typeof body.repayment_date !== "string") {
    throw new Error("repayment_date is required and must be a string date");
  }
  if (new Date(body.repayment_date as string) < new Date(body.loan_date as string)) {
    throw new Error("repayment_date must be on or after loan_date");
  }
  return body as { amount: number; interest?: number; loan_date: string; repayment_date: string };
}

export function validateLoanUpdate(body: Record<string, unknown>) {
  if (!body.loan_id || typeof body.loan_id !== "string") {
    throw new Error("loan_id is required and must be a string");
  }
  if (body.is_repaid !== undefined && typeof body.is_repaid !== "boolean") {
    throw new Error("is_repaid must be a boolean if provided");
  }
  if (body.result !== undefined && typeof body.result !== "string") {
    throw new Error("result must be a string if provided");
  }
  return body as { loan_id: string; is_repaid?: boolean; result?: string };
}

export function validateInvestmentRequestId(body: Record<string, unknown>) {
  if (!body.request_id || typeof body.request_id !== "string") {
    throw new Error("request_id is required and must be a string");
  }
  return body as { request_id: string };
}

export function validateTransactionRequestId(body: Record<string, unknown>) {
  if (!body.request_id || typeof body.request_id !== "string") {
    throw new Error("request_id is required and must be a string");
  }
  if (body.reason !== undefined && typeof body.reason !== "string") {
    throw new Error("reason must be a string if provided");
  }
  return body as { request_id: string; reason?: string };
}

export function validateInvestmentAdjustment(body: Record<string, unknown>) {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  if (body.action !== "credit" && body.action !== "debit") {
    throw new Error("action must be 'credit' or 'debit'");
  }
  return body as { user_id: string; amount: number; action: "credit" | "debit" };
}

export function validateInvestmentDistribution(body: Record<string, unknown>) {
  if (!body.portfolio_id || typeof body.portfolio_id !== "string") {
    throw new Error("portfolio_id is required and must be a string");
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    throw new Error("amount is required and must be a positive number");
  }
  if (body.kind !== "profit" && body.kind !== "loss") {
    throw new Error("kind must be 'profit' or 'loss'");
  }
  return body as { portfolio_id: string; amount: number; kind: "profit" | "loss" };
}

export function validateAdminId(body: Record<string, unknown>) {
  if (!body.admin_id || typeof body.admin_id !== "string") {
    throw new Error("admin_id is required and must be a string");
  }
  return body as { admin_id: string };
}

export function validateFormateurAction(body: Record<string, unknown>) {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }
  if (body.action !== "assign" && body.action !== "revoke") {
    throw new Error("action must be 'assign' or 'revoke'");
  }
  return body as { user_id: string; action: "assign" | "revoke" };
}

export function validateInvitationId(body: Record<string, unknown>) {
  if (!body.invitation_id || typeof body.invitation_id !== "string") {
    throw new Error("invitation_id is required and must be a string");
  }
  return body as { invitation_id: string };
}

const FORMATION_STATUSES = ["Draft", "Published", "Archived"] as const;
type FormationStatus = typeof FORMATION_STATUSES[number];

export function validateFormationCreate(body: Record<string, unknown>) {
  if (!body.title || typeof body.title !== "string") {
    throw new Error("title is required and must be a string");
  }
  if (body.status !== undefined && !FORMATION_STATUSES.includes(body.status as FormationStatus)) {
    throw new Error(`status must be one of: ${FORMATION_STATUSES.join(", ")}`);
  }
  for (const field of ["title_en", "description", "description_en", "cover_image"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      throw new Error(`${field} must be a string if provided`);
    }
  }
  return body as {
    title: string;
    title_en?: string;
    description?: string;
    description_en?: string;
    cover_image?: string;
    status?: FormationStatus;
  };
}

export function validateFormationUpdate(body: Record<string, unknown>) {
  if (!body.id || typeof body.id !== "string") {
    throw new Error("id is required and must be a string");
  }
  const patch: Record<string, unknown> = {};
  for (const field of ["title", "title_en", "description", "description_en", "cover_image"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") throw new Error(`${field} must be a string`);
      patch[field] = body[field];
    }
  }
  if (body.status !== undefined) {
    if (!FORMATION_STATUSES.includes(body.status as FormationStatus)) {
      throw new Error(`status must be one of: ${FORMATION_STATUSES.join(", ")}`);
    }
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) {
    throw new Error("At least one field to update must be provided");
  }
  return { id: body.id as string, patch };
}

export function validateIdBody(body: Record<string, unknown>) {
  if (!body.id || typeof body.id !== "string") {
    throw new Error("id is required and must be a string");
  }
  return { id: body.id as string };
}

export function validateCourseCreate(body: Record<string, unknown>) {
  if (!body.formation_id || typeof body.formation_id !== "string") {
    throw new Error("formation_id is required and must be a string");
  }
  if (!body.title || typeof body.title !== "string") {
    throw new Error("title is required and must be a string");
  }
  if (body.status !== undefined && !FORMATION_STATUSES.includes(body.status as FormationStatus)) {
    throw new Error(`status must be one of: ${FORMATION_STATUSES.join(", ")}`);
  }
  if (body.lesson_count !== undefined && (!Number.isInteger(body.lesson_count) || (body.lesson_count as number) < 0)) {
    throw new Error("lesson_count must be a non-negative integer if provided");
  }
  if (body.featured !== undefined && typeof body.featured !== "boolean") {
    throw new Error("featured must be a boolean if provided");
  }
  for (const field of ["title_en", "description", "instructor", "duration", "level", "cover_image_path", "image"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      throw new Error(`${field} must be a string if provided`);
    }
  }
  return body as {
    formation_id: string;
    title: string;
    title_en?: string;
    description?: string;
    instructor?: string;
    duration?: string;
    lesson_count?: number;
    level?: string;
    status?: FormationStatus;
    featured?: boolean;
    cover_image_path?: string;
    image?: string;
  };
}

export function validateCourseUpdate(body: Record<string, unknown>) {
  if (!body.id || typeof body.id !== "string") {
    throw new Error("id is required and must be a string");
  }
  const patch: Record<string, unknown> = {};
  for (const field of ["title", "title_en", "description", "instructor", "duration", "level", "cover_image_path", "image"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") throw new Error(`${field} must be a string`);
      patch[field] = body[field];
    }
  }
  if (body.lesson_count !== undefined) {
    if (!Number.isInteger(body.lesson_count) || (body.lesson_count as number) < 0) {
      throw new Error("lesson_count must be a non-negative integer");
    }
    patch.lesson_count = body.lesson_count;
  }
  if (body.featured !== undefined) {
    if (typeof body.featured !== "boolean") throw new Error("featured must be a boolean");
    patch.featured = body.featured;
  }
  if (body.status !== undefined) {
    if (!FORMATION_STATUSES.includes(body.status as FormationStatus)) {
      throw new Error(`status must be one of: ${FORMATION_STATUSES.join(", ")}`);
    }
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) {
    throw new Error("At least one field to update must be provided");
  }
  return { id: body.id as string, patch };
}

export function validateConsultationCreate(body: Record<string, unknown>) {
  if (!body.type || typeof body.type !== "string") {
    throw new Error("type is required and must be a string");
  }
  // The task spec calls this field "message"; the live consultation_requests
  // table calls it "need" -- accept either so both callers work.
  const need = typeof body.need === "string" ? body.need : typeof body.message === "string" ? body.message : undefined;
  if (!need) {
    throw new Error("need (or message) is required and must be a non-empty string");
  }
  if (body.project !== undefined && typeof body.project !== "string") {
    throw new Error("project must be a string if provided");
  }
  if (body.formation_id !== undefined && typeof body.formation_id !== "string") {
    throw new Error("formation_id must be a string if provided");
  }
  if (body.course_id !== undefined && typeof body.course_id !== "string") {
    throw new Error("course_id must be a string if provided");
  }
  return {
    type: body.type as string,
    need,
    project: (body.project as string | undefined) ?? "",
    formation_id: body.formation_id as string | undefined,
    course_id: body.course_id as string | undefined,
  };
}

const CONSULTATION_RESPOND_STATUSES = ["approved", "completed", "cancelled"] as const;

export function validateConsultationRespond(body: Record<string, unknown>) {
  if (!body.id || typeof body.id !== "string") {
    throw new Error("id is required and must be a string");
  }
  if (!body.response || typeof body.response !== "string") {
    throw new Error("response is required and must be a string");
  }
  if (
    body.status !== undefined &&
    !CONSULTATION_RESPOND_STATUSES.includes(body.status as typeof CONSULTATION_RESPOND_STATUSES[number])
  ) {
    throw new Error(`status must be one of: ${CONSULTATION_RESPOND_STATUSES.join(", ")}`);
  }
  return {
    id: body.id as string,
    response: body.response as string,
    status: (body.status as typeof CONSULTATION_RESPOND_STATUSES[number] | undefined) ?? "completed",
  };
}

export function validateAdminInvite(body: Record<string, unknown>) {
  if (!body.firstName || typeof body.firstName !== "string") {
    throw new Error("firstName is required and must be a string");
  }
  if (!body.lastName || typeof body.lastName !== "string") {
    throw new Error("lastName is required and must be a string");
  }
  if (!body.email || typeof body.email !== "string") {
    throw new Error("email is required and must be a string");
  }
  if (body.role !== "admin" && body.role !== "super_admin") {
    throw new Error("role must be 'admin' or 'super_admin'");
  }
  if (body.phone !== undefined && typeof body.phone !== "string") {
    throw new Error("phone must be a string if provided");
  }
  return body as {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "admin" | "super_admin";
  };
}
