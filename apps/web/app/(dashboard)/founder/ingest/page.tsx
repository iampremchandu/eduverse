'use client';
import { useState } from 'react';
export default function IngestPage(){
  const [file, setFile] = useState<File|null>(null);
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState('');
  const upload = async () => {
    if (!file || !institution) return;
    setStatus('Uploading…');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('institution', institution);
    const res = await fetch('/api/admin/ingest', { method:'POST', body: fd });
    const j = await res.json();
    setStatus(res.ok ? `Done: ${j.inserted} chunks` : `Error: ${j.error}`);
  };
  return (<div className="p-6 max-w-xl grid gap-4">
    <h1 className="text-xl font-semibold">Ingest Document</h1>
    <input type="text" placeholder="institution UUID" className="border rounded px-2 py-1" value={institution} onChange={(e)=>setInstitution(e.target.value)} />
    <input type="file" accept=".pdf,.txt" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
    <button onClick={upload} className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50" disabled={!file || !institution}>Upload</button>
    <div className="text-sm text-muted-foreground">{status}</div>
  </div>);
}
