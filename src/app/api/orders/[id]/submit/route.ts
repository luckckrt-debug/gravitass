import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { freelancerId, milestoneId, description, files } = body;

    if (!description || !description.trim()) {
      return NextResponse.json({ success: false, error: 'Work submission description/notes are required' }, { status: 400 });
    }

    const result = db.submitWork(params.id, freelancerId || 'user-freelancer-1', {
      milestoneId,
      description: description.trim(),
      files: Array.isArray(files) ? files : []
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      submission: result.submission,
      message: `Version ${result.submission?.version} deliverables submitted successfully for client review.`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting work deliverable:', error);
    return NextResponse.json({ success: false, error: error.message || 'Submission failed' }, { status: 500 });
  }
}
