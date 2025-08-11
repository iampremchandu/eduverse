'use client';
export default function ModeSwitch({ mode, onChange }:{ mode:'socratic'|'teach'|'speedrun'; onChange:(m:any)=>void }){
  const modes: any[] = [['socratic','Socratic'],['teach','Teach'],['speedrun','Speedrun']];
  return (
    <div className="inline-flex gap-1 p-1 border rounded-2xl bg-white/50">
      {modes.map(([val,label])=> (
        <button key={val as string} onClick={()=>onChange(val)} className={`px-3 py-1 rounded-xl text-sm ${mode===val?'bg-blue-600 text-white':'hover:bg-neutral-100'}`}>{label as string}</button>
      ))}
    </div>
  );
}
