-- Fase 2 — Contacts
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.contacts enable row level security;

create policy "Members can view contacts in their orgs"
  on public.contacts for select
  using (public.is_org_member(organization_id));

create policy "Members can insert contacts in their orgs"
  on public.contacts for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update contacts in their orgs"
  on public.contacts for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete contacts in their orgs"
  on public.contacts for delete
  using (public.is_org_member(organization_id));
