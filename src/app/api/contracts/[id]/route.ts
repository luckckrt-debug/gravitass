import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contract = db.getContractById(params.id);
    if (!contract) {
      return NextResponse.json({ error: 'Workspace contract not found' }, { status: 404 });
    }

    if (contract.clientId !== user.id && contract.freelancerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied to this workspace' }, { status: 403 });
    }

    const project = db.getProjectById(contract.projectId);
    return NextResponse.json({ contract, project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contract = db.getContractById(params.id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const updates = await req.json();
    const updated = db.updateContract(params.id, updates);

    // If client requested revision:
    if (updates.status === 'revision_requested') {
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: contract.freelancerId,
        title: 'Revision Requested',
        message: `${user.name} requested revisions on "${contract.projectTitle}". Note: ${updates.revisionNotes || ''}`,
        type: 'revision',
        link: `/workspace/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // If completed:
    if (updates.status === 'completed') {
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: contract.freelancerId,
        title: 'Project Completed & Accepted!',
        message: `${user.name} has accepted final delivery and completed "${contract.projectTitle}".`,
        type: 'payment',
        link: `/workspace/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Update project status to completed
      db.updateProject(contract.projectId, { status: 'completed' });
    }

    return NextResponse.json({ contract: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
