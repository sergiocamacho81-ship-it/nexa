-- Fase 3 — Companies
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.companies enable row level security;

create policy "Members can view companies in their orgs"
  on public.companies for select
  using (public.is_org_member(organization_id));

create policy "Members can insert companies in their orgs"
  on public.companies for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update companies in their orgs"
  on public.companies for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete companies in their orgs"
  on public.companies for delete
  using (public.is_org_member(organization_id));
