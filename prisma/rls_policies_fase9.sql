-- Fase 9 — Campaigns
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;

create policy "Members can view campaigns in their orgs"
  on public.campaigns for select
  using (public.is_org_member(organization_id));

create policy "Members can insert campaigns in their orgs"
  on public.campaigns for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update campaigns in their orgs"
  on public.campaigns for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete campaigns in their orgs"
  on public.campaigns for delete
  using (public.is_org_member(organization_id));

-- campaign_recipients: nao tem organization_id proprio, verifica via a campanha-mae
create policy "Members can view campaign recipients in their orgs"
  on public.campaign_recipients for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_recipients.campaign_id
        and public.is_org_member(c.organization_id)
    )
  );

create policy "Members can insert campaign recipients in their orgs"
  on public.campaign_recipients for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_recipients.campaign_id
        and public.is_org_member(c.organization_id)
    )
  );

create policy "Members can update campaign recipients in their orgs"
  on public.campaign_recipients for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_recipients.campaign_id
        and public.is_org_member(c.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_recipients.campaign_id
        and public.is_org_member(c.organization_id)
    )
  );

create policy "Members can delete campaign recipients in their orgs"
  on public.campaign_recipients for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_recipients.campaign_id
        and public.is_org_member(c.organization_id)
    )
  );
