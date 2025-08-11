'use client';
import { useRef, useState } from 'react';
import Whiteboard from '@/components/tutor/Whiteboard';
import ConfidenceMeter from '@/components/tutor/ConfidenceMeter';
import ModeSwitch from '@/components/tutor/ModeSwitch';

interface Msg { role: 'user'|'assistant'|'tool'|'system'; content: string; meta?: any }

export default function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'socratic'|'teach'|'speedrun'>('socratic');
  const [locale, setLocale] = useState<'en'|'hi'|'ar'>('en');
  const [streaming, setStreaming] = useState(false);
  const wbRef = useRef<{ draw: (cmd: any)=>void }>(null);

  const send = async () => {
    if (!input || streaming) return;
    const userMsg: Msg = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    const es = new EventSource(`/api/ai/tutor/realtime?mode=${mode}&locale=${locale}&q=${encodeURIComponent(userMsg.content)}`);
    setStreaming(true);
    es.onmessage = (evt) => {
      let data: any; try { data = JSON.parse(evt.data); } catch { return; }
      if (data.type === 'token') {
        setMessages((m) => {
          const last = m[m.length-1];
          if (!last || last.role !== 'assistant' || last.meta?.final) return [...m, { role: 'assistant', content: data.token }];
          const copy = [...m]; copy[copy.length-1] = { ...last, content: (last.content||'') + data.token }; return copy;
        });
      } else if (data.type === 'tool' && data.name === 'draw' && wbRef.current) {
        wbRef.current.draw(data.args);
        setMessages((m)=>[...m, { role:'tool', content:`[whiteboard:${data.args.shape}]`, meta:data.args }]);
      } else if (data.type === 'quiz') {
        setMessages((m)=>[...m, { role:'assistant', content:`Check: ${data.question}` }]);
      } else if (data.type === 'citations') {
        setMessages((m)=>[...m, { role:'system', content: data.cites.map((c:any)=>`[${c.label}] ${c.source}`).join('\n') }]);
      } else if (data.type === 'final') {
        setMessages((m)=>{ const copy = [...m]; if (copy.length && copy[copy.length-1].role==='assistant') { copy[copy.length-1] = { ...copy[copy.length-1], meta:{ final:true } }; } return copy; });
        es.close(); setStreaming(false);
      }
    }; es.onerror = () => { es.close(); setStreaming(false); };
  };

  return (
    <div className="p-6 grid gap-4 md:grid-cols-[1fr_420px]">
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <ModeSwitch mode={mode} onChange={setMode} />
          <select className="border rounded px-2 py-1 text-sm" value={locale} onChange={(e)=>setLocale(e.target.value as any)}>
            <option value="en">English</option><option value="hi">Hindi</option><option value="ar">Arabic</option>
          </select>
        </div>
        <div className="border rounded-2xl p-4 h-[520px] overflow-y-auto bg-white/50 dark:bg-black/20">
          {messages.length===0 && (<div className="text-sm text-muted-foreground">Try: "I’m stuck on quadratic factorisation"</div>)}
          {messages.map((m, i)=> (
            <div key={i} className={`my-2 ${m.role==='user'?'text-right':''}`}>
              <div className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 ${m.role==='user'?'bg-blue-600 text-white': m.role==='system' ? 'bg-amber-50 text-amber-900' : 'bg-muted'}`}>{m.content}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border rounded-2xl px-3 py-2" placeholder="Ask anything…" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') send(); }} />
          <button onClick={send} disabled={streaming} className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50">{streaming?'Streaming…':'Send'}</button>
        </div>
      </div>
      <div className="grid gap-3">
        <Whiteboard ref={wbRef as any} />
        <ConfidenceMeter />
        <div className="text-xs text-muted-foreground">Tips: Use Speedrun for 10-min drills • Switch language any time • Press Enter to send.</div>
      </div>
    </div>
  );
}
