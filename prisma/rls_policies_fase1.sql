-- Fase 1 — Auth + modelo de organizacao
-- Aplicar manualmente no SQL editor do Supabase. NAO faz parte do fluxo `prisma migrate`.

alter table public.memberships
  add constraint memberships_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

create policy "Members can view their organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Members can update their organizations"
  on public.organizations for update
  using (public.is_org_member(id));

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

create policy "Members can view memberships in their orgs"
  on public.memberships for select
  using (public.is_org_member(organization_id));

create policy "Owners/admins can manage memberships"
  on public.memberships for all
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('OWNER', 'ADMIN')
    )
  );
