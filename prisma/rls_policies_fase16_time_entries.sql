-- Fase 16 — Time Entries
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.time_entries enable row level security;

create policy "Members can view time entries in their orgs"
  on public.time_entries for select
  using (public.is_org_member(organization_id));

create policy "Members can insert time entries in their orgs"
  on public.time_entries for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update time entries in their orgs"
  on public.time_entries for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete time entries in their orgs"
  on public.time_entries for delete
  using (public.is_org_member(organization_id));
