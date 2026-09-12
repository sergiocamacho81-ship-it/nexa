-- Fase 18 — Quotes
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;

-- quotes: RLS direta via organization_id
create policy "Members can view quotes in their orgs"
  on public.quotes for select
  using (public.is_org_member(organization_id));

create policy "Members can insert quotes in their orgs"
  on public.quotes for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update quotes in their orgs"
  on public.quotes for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete quotes in their orgs"
  on public.quotes for delete
  using (public.is_org_member(organization_id));

-- quote_line_items: nao tem organization_id proprio, verifica via o quote-mae
create policy "Members can view quote line items in their orgs"
  on public.quote_line_items for select
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
        and public.is_org_member(q.organization_id)
    )
  );

create policy "Members can insert quote line items in their orgs"
  on public.quote_line_items for insert
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
        and public.is_org_member(q.organization_id)
    )
  );

create policy "Members can update quote line items in their orgs"
  on public.quote_line_items for update
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
        and public.is_org_member(q.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
        and public.is_org_member(q.organization_id)
    )
  );

create policy "Members can delete quote line items in their orgs"
  on public.quote_line_items for delete
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_line_items.quote_id
        and public.is_org_member(q.organization_id)
    )
  );
