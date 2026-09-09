-- Fase 7 — Email
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.email_messages enable row level security;

create policy "Members can view email messages in their orgs"
  on public.email_messages for select
  using (public.is_org_member(organization_id));

create policy "Members can insert email messages in their orgs"
  on public.email_messages for insert
  with check (public.is_org_member(organization_id));

create policy "Members can delete email messages in their orgs"
  on public.email_messages for delete
  using (public.is_org_member(organization_id));
