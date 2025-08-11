import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(url, anon);

export async function retrieveRelevant({ institution_id, query }:{ institution_id?: string, query: string }){
  try {
    const { data } = await sb.rpc('match_documents', { query_text: query, match_count: 3, inst_id: institution_id||null });
    if (Array.isArray(data)) {
      return data.map((d:any)=>({ source: d.source as string, snippet: d.snippet as string }));
    }
  } catch {}
  return [] as { source:string, snippet:string }[];
}
