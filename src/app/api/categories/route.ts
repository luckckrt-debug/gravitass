import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET() {
  try {
    const categories = db.getCategories();
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
