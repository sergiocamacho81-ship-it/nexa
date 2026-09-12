-- Fase 20 — Payments
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.payments enable row level security;

-- payments: RLS direta via organization_id (denormalizado, tal como
-- time_entries/material_usages, ao contrario de invoice_line_items)
create policy "Members can view payments in their orgs"
  on public.payments for select
  using (public.is_org_member(organization_id));

create policy "Members can insert payments in their orgs"
  on public.payments for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update payments in their orgs"
  on public.payments for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete payments in their orgs"
  on public.payments for delete
  using (public.is_org_member(organization_id));
