-- Fase 4 — Deals / Pipeline
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.deals enable row level security;

create policy "Members can view deals in their orgs"
  on public.deals for select
  using (public.is_org_member(organization_id));

create policy "Members can insert deals in their orgs"
  on public.deals for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update deals in their orgs"
  on public.deals for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete deals in their orgs"
  on public.deals for delete
  using (public.is_org_member(organization_id));
