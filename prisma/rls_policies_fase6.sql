-- Fase 6 — Tasks
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.tasks enable row level security;

create policy "Members can view tasks in their orgs"
  on public.tasks for select
  using (public.is_org_member(organization_id));

create policy "Members can insert tasks in their orgs"
  on public.tasks for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update tasks in their orgs"
  on public.tasks for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete tasks in their orgs"
  on public.tasks for delete
  using (public.is_org_member(organization_id));
