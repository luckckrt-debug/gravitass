import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { PortfolioItem } from '@/types';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = db.getFreelancerById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
    }

    if (profile.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, imageUrl, videoUrl, externalUrl, githubUrl, category, tools } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      freelancerId: profile.id,
      title,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      videoUrl,
      externalUrl,
      githubUrl,
      category: category || profile.mainCategory,
      tools: Array.isArray(tools) ? tools : [],
      createdAt: new Date().toISOString()
    };

    const currentPortfolio = profile.portfolio || [];
    currentPortfolio.unshift(newItem);

    const updated = db.saveFreelancerProfile({
      ...profile,
      portfolio: currentPortfolio,
      profileCompletionPercentage: Math.min(100, (profile.profileCompletionPercentage || 70) + 10)
    });

    return NextResponse.json({ portfolio: updated.portfolio, item: newItem, message: 'Portfolio item added successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) {
      return NextResponse.json({ error: 'itemId query param required' }, { status: 400 });
    }

    const profile = db.getFreelancerById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
    }

    if (profile.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filtered = (profile.portfolio || []).filter(p => p.id !== itemId);
    const updated = db.saveFreelancerProfile({
      ...profile,
      portfolio: filtered
    });

    return NextResponse.json({ portfolio: updated.portfolio, message: 'Portfolio item deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
