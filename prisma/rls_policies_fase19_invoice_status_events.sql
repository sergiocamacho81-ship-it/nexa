-- Fase 19 — Invoice status events (audit trail)
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.invoice_status_events enable row level security;

-- invoice_status_events: nao tem organization_id proprio, verifica via a invoice-mae.
-- Append-only por convencao da aplicacao (ver app/actions/invoices.ts) — sem
-- policy de update/delete, so select e insert.
create policy "Members can view invoice status events in their orgs"
  on public.invoice_status_events for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_status_events.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );

create policy "Members can insert invoice status events in their orgs"
  on public.invoice_status_events for insert
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_status_events.invoice_id
        and public.is_org_member(i.organization_id)
    )
  );
