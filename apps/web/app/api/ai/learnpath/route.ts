import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest){
  const body = await req.json(); // { course_id, delta }
  return NextResponse.json({ ok:true, data: { course_id: body.course_id, state: body.delta } });
}
