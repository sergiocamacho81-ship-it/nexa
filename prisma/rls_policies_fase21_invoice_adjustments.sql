-- Fase 21 — Invoice adjustments (credits/corrections)
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.invoice_adjustments enable row level security;

-- invoice_adjustments: RLS direta via organization_id (denormalizado, tal
-- como payments)
create policy "Members can view invoice adjustments in their orgs"
  on public.invoice_adjustments for select
  using (public.is_org_member(organization_id));

create policy "Members can insert invoice adjustments in their orgs"
  on public.invoice_adjustments for insert
  with check (public.is_org_member(organization_id));

create policy "Members can update invoice adjustments in their orgs"
  on public.invoice_adjustments for update
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "Members can delete invoice adjustments in their orgs"
  on public.invoice_adjustments for delete
  using (public.is_org_member(organization_id));
