-- =====================================================================
-- Migration: Formation / Training module tables
-- =====================================================================

-- 1. Formation categories
create table public.formation_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  description text,
  color text not null default '#4CAF68',
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

-- 2. Formation courses
create table public.formation_courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.formation_categories (id) on delete set null,
  title text not null,
  title_en text,
  description text,
  instructor text,
  duration text,
  lesson_count integer not null default 1,
  level text default 'Débutant',
  status text not null default 'Draft',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  featured boolean not null default false,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Formation content items
create table public.formation_content (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.formation_courses (id) on delete cascade,
  type text not null default 'video',
  title text not null,
  duration text,
  format text,
  completed boolean not null default false,
  file_name text,
  file_size text,
  created_at timestamptz not null default now()
);

-- 4. Per-user course enrollments (tracks progress per user)
create table public.formation_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  course_id uuid not null references public.formation_courses (id) on delete cascade,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

-- 5. Per-user content completion tracking
create table public.formation_content_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  content_id uuid not null references public.formation_content (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- Indexes
create index idx_formation_courses_category on public.formation_courses (category_id);
create index idx_formation_content_course on public.formation_content (course_id);
create index idx_formation_enrollments_user on public.formation_enrollments (user_id);
create index idx_formation_enrollments_course on public.formation_enrollments (course_id);
create index idx_formation_content_completions_user on public.formation_content_completions (user_id);

-- Triggers
create trigger trg_formation_courses_updated_at before update on public.formation_courses
  for each row execute function public.set_updated_at();

-- RLS
alter table public.formation_categories enable row level security;
alter table public.formation_courses enable row level security;
alter table public.formation_content enable row level security;
alter table public.formation_enrollments enable row level security;
alter table public.formation_content_completions enable row level security;

-- Everyone (authenticated) can read formation catalog
create policy formation_categories_read_all on public.formation_categories
  for select using (true);
create policy formation_courses_read_all on public.formation_courses
  for select using (true);
create policy formation_content_read_all on public.formation_content
  for select using (true);

-- Only admins can manage formation catalog
create policy formation_categories_admin_all on public.formation_categories
  for all using (public.is_admin()) with check (public.is_admin());
create policy formation_courses_admin_all on public.formation_courses
  for all using (public.is_admin()) with check (public.is_admin());
create policy formation_content_admin_all on public.formation_content
  for all using (public.is_admin()) with check (public.is_admin());

-- Enrollments: users manage their own, admins see all
create policy formation_enrollments_select_own on public.formation_enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy formation_enrollments_insert_own on public.formation_enrollments
  for insert with check (user_id = auth.uid());
create policy formation_enrollments_update_own on public.formation_enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Content completions: users manage their own, admins see all
create policy formation_content_completions_select_own on public.formation_content_completions
  for select using (user_id = auth.uid() or public.is_admin());
create policy formation_content_completions_insert_own on public.formation_content_completions
  for insert with check (user_id = auth.uid());
