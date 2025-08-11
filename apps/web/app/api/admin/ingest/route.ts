import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdf from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest){
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const institution = (form.get('institution') as string) || '';
  if (!file || !institution) return NextResponse.json({ error:'file and institution required' }, { status:400 });

  const buf = Buffer.from(await file.arrayBuffer());
  let text = '';
  if (file.name.toLowerCase().endsWith('.pdf')) {
    const parsed = await pdf(buf);
    text = parsed.text || '';
  } else { text = buf.toString('utf8'); }
  text = text.replace(/\s+/g,' ').trim();
  const chunk = (s:string, n=900, o=150) => { const a:string[]=[]; for (let i=0;i<s.length;i+=n-o) a.push(s.slice(i, Math.min(s.length, i+n))); return a; };
  const chunks = chunk(text);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const vectors = await openai.embeddings.create({ model: 'text-embedding-3-large', input: chunks });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const rows = chunks.map((c, i)=> ({ institution_id: institution, source: `${file.name}#${i}`, content: c, embedding: vectors.data[i].embedding }));
  const { error } = await admin.from('documents').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ inserted: rows.length });
}
