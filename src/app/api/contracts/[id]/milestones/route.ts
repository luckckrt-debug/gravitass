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

      // Execute atomic project earning credit with configurable platform commission
      const creditRes = db.creditProjectEarning({
        contractId: contract.id,
        milestoneId: ms.id,
        approverUserId: user.id
      });

      if (!creditRes.success) {
        return NextResponse.json({ error: creditRes.error }, { status: 400 });
      }

      const updatedContract = db.getContractById(contract.id);
      return NextResponse.json({ 
        contract: updatedContract, 
        ledger: creditRes.ledger,
        message: 'Milestone approved and earnings automatically credited to freelancer ledger!' 
      });
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
