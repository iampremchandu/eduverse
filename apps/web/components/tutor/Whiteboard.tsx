'use client';
import React, { forwardRef, useEffect, useRef } from 'react';
interface DrawArgs { shape: 'line'|'rect'|'text'|'path'|'point'; data: any }
const Whiteboard = forwardRef(function Whiteboard(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const c = canvasRef.current; if(!c) return; const dpr = window.devicePixelRatio||1;
    c.width = c.clientWidth*dpr; c.height = c.clientHeight*dpr;
    const ctx=c.getContext('2d')!; ctx.scale(dpr,dpr); ctx.lineWidth=2; ctx.font='14px ui-sans-serif';
  },[]);
  // @ts-ignore
  React.useImperativeHandle(ref, ()=>({ draw: (args: DrawArgs)=>{
    const c = canvasRef.current; if(!c) return; const ctx=c.getContext('2d')!;
    const { shape, data } = args;
    if (shape==='line') { const { x1,y1,x2,y2 } = data; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
    if (shape==='rect') { const { x,y,w,h } = data; ctx.strokeRect(x,y,w,h); }
    if (shape==='text') { const { x,y,text } = data; ctx.fillText(text, x, y); }
    if (shape==='point') { const { x,y } = data; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); }
    if (shape==='path') { const { points } = data; ctx.beginPath(); points.forEach((p:any,i:number)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke(); }
  }}));
  return (<div className="border rounded-2xl p-2"><div className="text-sm mb-2">Whiteboard</div><canvas ref={canvasRef} className="w-full h-[240px] rounded-xl bg-white dark:bg-neutral-900" /></div>);
}); export default Whiteboard;
