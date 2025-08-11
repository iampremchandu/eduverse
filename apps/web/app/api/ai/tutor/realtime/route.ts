import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { retrieveRelevant } from '@/ai/lib/rag';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function sse(cb:(ctrl:WritableStreamDefaultController)=>Promise<void>) {
  return new Response(new ReadableStream({ start: cb }), {
    headers: {
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive'
    }
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const mode = (searchParams.get('mode') || 'socratic') as 'socratic'|'teach'|'speedrun';
  const locale = searchParams.get('locale') || 'en';

  // If you use Supabase Auth SSR, swap this for createServerClient.
  // Here we accept an x-institution-id header to keep it simple on Vercel previews.
  const inst = req.headers.get('x-institution-id') || undefined;

  const grounding = await retrieveRelevant({ institution_id: inst, query: q });
  const ctxBlock = grounding.map((g, i)=>`[S${i+1}] ${g.snippet} (source: ${g.source})`).join('\n');

  const systemPrompt = (
    mode === 'socratic'
      ? 'You are an empathetic multilingual tutor. First ask a short probe. Guide with questions, then explain briefly with a worked example. Cite sources as [S1], [S2] from provided context only. Do NOT reveal chain-of-thought; give final steps only.'
      : mode === 'speedrun'
      ? 'You are a drill coach. Give 3 quick questions with terse feedback. Cite sources if used. No chain-of-thought.'
      : 'You are a rigorous teacher. Give a concise explanation, 1 worked example, and a 1-question check. Cite sources as [S1], [S2] from provided context only. No chain-of-thought.'
  ) + ` Locale: ${locale}.`;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return sse(async (ctrl) => {
    const send = (obj:any) => ctrl.enqueue(`data: ${JSON.stringify(obj)}\n\n`);

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question: ${q}\nUseful context (cite ONLY if used):\n${ctxBlock}` }
      ]
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;
      if (delta.content) send({ type: 'token', token: delta.content });
      if (delta.content?.includes('<quiz-question>')) {
        const m = delta.content.match(/<quiz-question>([\s\S]*?)<\/quiz-question>/);
        if (m) send({ type:'quiz', question: m[1].trim() });
      }
      if (delta.content?.includes('<draw ')) {
        const payload = delta.content.split('</draw>')[0].split('>')[1];
        try { send({ type:'tool', name:'draw', args: JSON.parse(payload) }); } catch {}
      }
    }

    if (grounding.length) {
      const cites = grounding.slice(0,3).map((g,i)=>({ label:`S${i+1}`, source:g.source }));
      send({ type:'citations', cites });
    }
    send({ type: 'final' });
    ctrl.close();
  });
}
