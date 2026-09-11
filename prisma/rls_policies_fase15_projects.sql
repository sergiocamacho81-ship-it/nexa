-- Fase 15 — Projects
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.projects enable row level security;

create policy "Members can view projects in their orgs"
  on public.projects for select
  using (public.is_org_member(organization_id));

create policy "Members can insert projects in their orgs"
  on public.projects for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update projects in their orgs"
  on public.projects for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete projects in their orgs"
  on public.projects for delete
  using (public.is_org_member(organization_id));
