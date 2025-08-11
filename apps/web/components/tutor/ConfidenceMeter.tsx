'use client';
import { useState } from 'react';
export default function ConfidenceMeter(){
  const [v,setV] = useState(0.6);
  return (
    <div className="border rounded-2xl p-3 grid gap-2">
      <div className="text-sm">Confidence</div>
      <input type="range" min={0} max={1} step={0.05} value={v} onChange={(e)=>setV(parseFloat(e.target.value))} />
      <div className="text-xs text-muted-foreground">I’m feeling {(v*100).toFixed(0)}% confident.</div>
    </div>
  );
}
