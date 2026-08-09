import { NextResponse } from 'next/server';
import { logoutUser } from '@/features/auth/server';

export async function POST() {
  await logoutUser();
  return NextResponse.json({ data: { ok: true } });
}
