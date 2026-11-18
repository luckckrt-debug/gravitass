import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');
    const badge = searchParams.get('badge');
    const minScore = searchParams.get('minScore');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const sortBy = searchParams.get('sortBy') || 'score';

    let freelancers = db.getFreelancers();

    if (category && category !== 'all') {
      freelancers = freelancers.filter(f => f.mainCategory.toLowerCase() === category.toLowerCase());
    }

    if (badge && badge !== 'all') {
      freelancers = freelancers.filter(f => f.badges.includes(badge as any));
    }

    if (minScore) {
      freelancers = freelancers.filter(f => f.performanceScore.overallScore >= Number(minScore));
    }

    if (minRate) {
      freelancers = freelancers.filter(f => f.hourlyRate >= Number(minRate));
    }

    if (maxRate) {
      freelancers = freelancers.filter(f => f.hourlyRate <= Number(maxRate));
    }

    if (search) {
      freelancers = freelancers.filter(f =>
        f.fullName.toLowerCase().includes(search) ||
        f.headline.toLowerCase().includes(search) ||
        f.bio.toLowerCase().includes(search) ||
        f.skills.some(s => s.toLowerCase().includes(search))
      );
    }

    // Sorting
    if (sortBy === 'score') {
      freelancers.sort((a, b) => b.performanceScore.overallScore - a.performanceScore.overallScore);
    } else if (sortBy === 'rating') {
      freelancers.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'completed') {
      freelancers.sort((a, b) => b.completedProjectsCount - a.completedProjectsCount);
    } else if (sortBy === 'rate_low') {
      freelancers.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'rate_high') {
      freelancers.sort((a, b) => b.hourlyRate - a.hourlyRate);
    }

    return NextResponse.json({ freelancers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
