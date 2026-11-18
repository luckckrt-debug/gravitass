import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contract = db.getContractById(params.id);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.freelancerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only the hired freelancer can submit work' }, { status: 403 });
    }

    const { notes, files } = await req.json();

    const submission = {
      notes: notes || 'Work delivered as requested.',
      files: files || [],
      submittedAt: new Date().toISOString()
    };

    contract.latestSubmission = submission;
    contract.status = 'under_review';
    db.updateContract(contract.id, contract);

    // Notify client
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: contract.clientId,
      title: 'Work Delivered for Review',
      message: `${user.name} submitted deliverables for "${contract.projectTitle}". Please inspect and approve or request revisions.`,
      type: 'submission',
      link: `/workspace/${contract.id}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ contract, message: 'Work submitted for review successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
