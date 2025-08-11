import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest){
  const ctype = req.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    const { question } = await req.json();
    return NextResponse.json({
      parsed: question,
      steps: [
        'Identify form of equation',
        'Apply suitable method (factorisation/completing square/quadratic formula)',
        'Verify by substitution'
      ],
      hint: 'Try to express the quadratic as (x+a)(x+b)=0',
      answer: null,
      citations: []
    });
  }
  return NextResponse.json({ error:'Unsupported content-type' }, { status:415 });
}
