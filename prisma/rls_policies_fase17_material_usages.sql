-- Fase 17 — Material Usages
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.material_usages enable row level security;

create policy "Members can view material usages in their orgs"
  on public.material_usages for select
  using (public.is_org_member(organization_id));

create policy "Members can insert material usages in their orgs"
  on public.material_usages for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update material usages in their orgs"
  on public.material_usages for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete material usages in their orgs"
  on public.material_usages for delete
  using (public.is_org_member(organization_id));
