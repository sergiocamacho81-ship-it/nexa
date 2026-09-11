-- Fase 14 — Jobs
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.jobs enable row level security;

create policy "Members can view jobs in their orgs"
  on public.jobs for select
  using (public.is_org_member(organization_id));

create policy "Members can insert jobs in their orgs"
  on public.jobs for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update jobs in their orgs"
  on public.jobs for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete jobs in their orgs"
  on public.jobs for delete
  using (public.is_org_member(organization_id));
