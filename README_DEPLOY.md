# Eduverse — Vercel-Ready Branch

This branch contains everything needed to deploy the **Tutor** quickly on Vercel.

## Steps
1) In Supabase SQL editor, run: `sql/documents_pgvector_3072.sql` (ensures 3072-D pgvector table + policies).
2) In Vercel Project → Environment Variables, set:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - OPENAI_API_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3) Deploy (root is `apps/web`). Vercel auto-detects Next.js.
4) Ingest a PDF at `/founder/ingest` (enter your institution UUID). Or use your existing CLI ingestor.
5) Test `/student/tutor`.

## Notes
- API routes are pinned to Node runtime for SSE.
- `ai/lib/rag.ts` uses an RPC `match_documents` to fetch snippets; you'll get citations once documents are ingested.
- For production auth/tenancy, replace the `x-institution-id` header approach with SSR-aware Supabase session lookup.
