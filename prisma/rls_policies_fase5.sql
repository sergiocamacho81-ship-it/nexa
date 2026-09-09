-- Fase 5 — Activities
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.activities enable row level security;

create policy "Members can view activities in their orgs"
  on public.activities for select
  using (public.is_org_member(organization_id));

create policy "Members can insert activities in their orgs"
  on public.activities for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update activities in their orgs"
  on public.activities for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete activities in their orgs"
  on public.activities for delete
  using (public.is_org_member(organization_id));
