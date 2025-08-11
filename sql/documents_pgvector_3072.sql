-- Enable pgvector and create documents table for 3072-D embeddings (text-embedding-3-large)
create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  institution_id uuid references public.institutions(id) on delete cascade,
  source text not null,
  content text not null,
  embedding vector(3072),
  created_at timestamptz default now()
);

create or replace function public.embed_text(input text)
returns table(embedding vector)
language sql as $$
  select null::vector as embedding; -- placeholder; you embed client-side
$$;

create or replace function public.match_documents(query_text text, match_count int default 3, inst_id uuid default null)
returns table(source text, snippet text, similarity float)
language plpgsql as $$
begin
  return query
  select d.source,
         substr(d.content, greatest(1, strpos(d.content, split_part(query_text,' ',1)) - 120), 240) as snippet,
         0.0 as similarity
  from public.documents d
  where (inst_id is null or d.institution_id = inst_id)
  limit match_count;
end; $$;

alter table public.documents enable row level security;

create policy if not exists "Members read documents"
  on public.documents for select
  using (exists (select 1 from public.memberships m where m.institution_id = documents.institution_id and m.user_id = auth.uid()));

create policy if not exists "Admins manage documents"
  on public.documents for all
  using (exists (select 1 from public.memberships m where m.institution_id = documents.institution_id and m.user_id = auth.uid() and m.role in ('owner','admin','teacher')));
