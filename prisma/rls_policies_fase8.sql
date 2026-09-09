-- Fase 8 — Automation engine
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.automations enable row level security;
alter table public.automation_actions enable row level security;
alter table public.automation_runs enable row level security;

-- automations: RLS direta via organization_id
create policy "Members can view automations in their orgs"
  on public.automations for select
  using (public.is_org_member(organization_id));

create policy "Members can insert automations in their orgs"
  on public.automations for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update automations in their orgs"
  on public.automations for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete automations in their orgs"
  on public.automations for delete
  using (public.is_org_member(organization_id));

-- automation_actions: nao tem organization_id proprio, verifica via a automation-mae
create policy "Members can view automation actions in their orgs"
  on public.automation_actions for select
  using (
    exists (
      select 1 from public.automations a
      where a.id = automation_actions.automation_id
        and public.is_org_member(a.organization_id)
    )
  );

create policy "Members can insert automation actions in their orgs"
  on public.automation_actions for insert
  with check (
    exists (
      select 1 from public.automations a
      where a.id = automation_actions.automation_id
        and public.is_org_member(a.organization_id)
    )
  );

create policy "Members can update automation actions in their orgs"
  on public.automation_actions for update
  using (
    exists (
      select 1 from public.automations a
      where a.id = automation_actions.automation_id
        and public.is_org_member(a.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.automations a
      where a.id = automation_actions.automation_id
        and public.is_org_member(a.organization_id)
    )
  );

create policy "Members can delete automation actions in their orgs"
  on public.automation_actions for delete
  using (
    exists (
      select 1 from public.automations a
      where a.id = automation_actions.automation_id
        and public.is_org_member(a.organization_id)
    )
  );

-- automation_runs: log só de leitura para membros (escrita feita pelo motor via service connection)
create policy "Members can view automation runs in their orgs"
  on public.automation_runs for select
  using (public.is_org_member(organization_id));
