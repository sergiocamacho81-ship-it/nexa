-- Fase 12 (extra) — Segments
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.segments enable row level security;

create policy "Members can view segments in their orgs"
  on public.segments for select
  using (public.is_org_member(organization_id));

create policy "Members can insert segments in their orgs"
  on public.segments for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update segments in their orgs"
  on public.segments for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete segments in their orgs"
  on public.segments for delete
  using (public.is_org_member(organization_id));
