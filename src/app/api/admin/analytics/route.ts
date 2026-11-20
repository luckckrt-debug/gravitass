import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const superAnalytics = db.getSuperAdminAnalytics();
    const users = db.getUsers();
    const projects = db.getProjects();
    const contracts = db.getContracts();
    const disputes = db.getDisputes();

    return NextResponse.json({
      analytics: superAnalytics,
      users,
      projects,
      contracts,
      disputes
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
