-- Fase 13 — Products & Invoices
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;

-- products: RLS direta via organization_id
create policy "Members can view products in their orgs"
  on public.products for select
  using (public.is_org_member(organization_id));

create policy "Members can insert products in their orgs"
  on public.products for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update products in their orgs"
  on public.products for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete products in their orgs"
  on public.products for delete
  using (public.is_org_member(organization_id));

-- invoices: RLS direta via organization_id
create policy "Members can view invoices in their orgs"
  on public.invoices for select
  using (public.is_org_member(organization_id));

create policy "Members can insert invoices in their orgs"
  on public.invoices for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update invoices in their orgs"
  on public.invoices for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete invoices in their orgs"
  on public.invoices for delete
  using (public.is_org_member(organization_id));

-- invoice_line_items: nao tem organization_id proprio, verifica via a invoice-mae
create policy "Members can view invoice line items in their orgs"
  on public.invoice_line_items for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );

create policy "Members can insert invoice line items in their orgs"
  on public.invoice_line_items for insert
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );

create policy "Members can update invoice line items in their orgs"
  on public.invoice_line_items for update
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );

create policy "Members can delete invoice line items in their orgs"
  on public.invoice_line_items for delete
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );
