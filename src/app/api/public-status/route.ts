import { NextResponse } from 'next/server';
import { getPublicStatus } from '@/lib/public-status';

export async function GET() {
  return NextResponse.json(getPublicStatus());
}
