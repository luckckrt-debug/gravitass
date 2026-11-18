import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = db.getUsers();
    const freelancers = db.getFreelancers();
    const projects = db.getProjects();
    const contracts = db.getContracts();
    const disputes = db.getDisputes();

    const totalGMV = contracts.reduce((acc, c) => acc + (c.paidAmount || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in_progress').length;

    return NextResponse.json({
      analytics: {
        totalUsers: users.length,
        totalFreelancers: freelancers.length,
        totalProjects: projects.length,
        activeProjects,
        totalContracts: contracts.length,
        totalGMV,
        disputesCount: disputes.length
      },
      users,
      projects,
      contracts,
      disputes
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
