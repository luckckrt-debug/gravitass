import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { Review } from '@/types';

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

    const { rating, comment, categories } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and feedback review comment are required' }, { status: 400 });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      contractId: contract.id,
      projectId: contract.projectId,
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserAvatar: user.avatarUrl,
      toUserId: contract.freelancerId,
      rating: Number(rating),
      comment,
      categories: categories || {
        quality: Number(rating),
        communication: Number(rating),
        timeliness: Number(rating),
        expertise: Number(rating)
      },
      createdAt: new Date().toISOString()
    };

    db.addReview(newReview);

    // Update contract status to completed if not already
    contract.status = 'completed';
    db.updateContract(contract.id, contract);

    // Notify freelancer
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: contract.freelancerId,
      title: 'New Client Review Received!',
      message: `${user.name} gave you a ${rating}-star review for "${contract.projectTitle}".`,
      type: 'review',
      link: `/freelancers/${contract.freelancerId}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ review: newReview, message: 'Review recorded and performance score updated!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
