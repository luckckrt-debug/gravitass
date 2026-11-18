import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'global';
    const category = searchParams.get('category');

    let freelancers = [...db.getFreelancers()];

    if (category && category !== 'all') {
      freelancers = freelancers.filter(f => f.mainCategory.toLowerCase() === category.toLowerCase());
    }

    if (filter === 'top_rated') {
      freelancers = freelancers.filter(f => f.badges.includes('top_rated') || f.rating >= 4.9);
      freelancers.sort((a, b) => b.rating - a.rating || b.performanceScore.overallScore - a.performanceScore.overallScore);
    } else if (filter === 'rising_talent') {
      freelancers = freelancers.filter(f => f.badges.includes('rising_talent') || f.completedProjectsCount <= 5);
      freelancers.sort((a, b) => b.performanceScore.overallScore - a.performanceScore.overallScore);
    } else if (filter === 'most_hired') {
      freelancers.sort((a, b) => b.completedProjectsCount - a.completedProjectsCount);
    } else if (filter === 'best_completion') {
      freelancers.sort((a, b) => b.performanceScore.projectCompletionRate - a.performanceScore.projectCompletionRate);
    } else {
      // Global ranking: highest overall performance score
      freelancers.sort((a, b) => b.performanceScore.overallScore - a.performanceScore.overallScore);
    }

    // Attach rank numbers
    const rankedFreelancers = freelancers.map((f, idx) => ({
      ...f,
      rank: idx + 1
    }));

    return NextResponse.json({ leaderboard: rankedFreelancers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
