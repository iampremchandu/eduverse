import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest){
  const { topic = 'Quadratics', difficulty = 2 } = await req.json();
  const items = [
    { type:'mcq', q: 'Factorise x^2+7x+12', options:['(x+3)(x+4)','(x+2)(x+5)','(x+1)(x+12)'], a:0 },
    { type:'short', q: 'Roots of x^2+5x+6=0?', a: 'x=-2,-3' },
    { type:'mcq', q: 'Discriminant of x^2+4x+1?', options:['12','8','16'], a:1 }
  ];
  return NextResponse.json({ topic, difficulty, items });
}
