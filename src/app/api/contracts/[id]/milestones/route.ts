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

    const { action, milestoneId, title, description, amount, dueDate } = await req.json();

    if (action === 'create') {
      const newMs = {
        id: `ms-${Date.now()}`,
        contractId: contract.id,
        title: title || 'New Milestone',
        description: description || '',
        amount: Number(amount) || 500,
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'pending' as const
      };
      contract.milestones.push(newMs);
      contract.totalAmount = contract.milestones.reduce((acc, m) => acc + m.amount, 0);
      db.updateContract(contract.id, contract);
      return NextResponse.json({ milestone: newMs, contract });
    }

    if (action === 'approve') {
      if (contract.clientId !== user.id && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only the client can approve and release milestone funds' }, { status: 403 });
      }

      const ms = contract.milestones.find(m => m.id === milestoneId);
      if (!ms) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
      }

      ms.status = 'approved';
      contract.paidAmount = (contract.paidAmount || 0) + ms.amount;
      db.updateContract(contract.id, contract);

      // Add transaction for freelancer
      db.addTransaction({
        id: `tx-${Date.now()}`,
        userId: contract.freelancerId,
        type: 'payment_release',
        amount: ms.amount,
        status: 'completed',
        description: `Milestone Approved: "${ms.title}" on ${contract.projectTitle}`,
        referenceId: contract.id,
        createdAt: new Date().toISOString()
      });

      // Update freelancer total earnings
      const freelancerProfile = db.getFreelancerById(contract.freelancerId);
      if (freelancerProfile) {
        freelancerProfile.totalEarnings = (freelancerProfile.totalEarnings || 0) + ms.amount;
        db.saveFreelancerProfile(freelancerProfile);
      }

      // Add transaction for client
      db.addTransaction({
        id: `tx-c-${Date.now()}`,
        userId: contract.clientId,
        type: 'milestone_escrow',
        amount: -ms.amount,
        status: 'completed',
        description: `Released Milestone Payment: "${ms.title}"`,
        referenceId: contract.id,
        createdAt: new Date().toISOString()
      });

      // Notify freelancer
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: contract.freelancerId,
        title: 'Milestone Funds Released!',
        message: `${user.name} approved "${ms.title}". $${ms.amount.toLocaleString()} has been released to your balance.`,
        type: 'payment',
        link: `/workspace/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ contract, message: 'Milestone approved and funds released!' });
    }

    if (action === 'submit_work') {
      const ms = contract.milestones.find(m => m.id === milestoneId);
      if (ms) {
        ms.status = 'submitted';
        db.updateContract(contract.id, contract);
      }
      return NextResponse.json({ contract });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
