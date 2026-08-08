-- =====================================================================
-- Let a consultation request optionally reference the course it's
-- about, instead of being purely generic. Nullable: the request form
-- is still reachable directly (not just from a course page), so most
-- existing/future requests may have no course at all.
-- =====================================================================

alter table public.consultation_requests
  add column course_id uuid references public.formation_courses (id) on delete set null;

create index idx_consultation_requests_course on public.consultation_requests (course_id);
