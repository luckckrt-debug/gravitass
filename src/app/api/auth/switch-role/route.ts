import { NextResponse } from 'next/server';
import { getCurrentUser, createSessionToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';
import { db } from '@/lib/data-store';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activeRole } = await req.json();
    if (activeRole !== 'freelancer' && activeRole !== 'client' && activeRole !== 'admin') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Enable role flags if user activates them
    const updates: any = { activeRole };
    if (activeRole === 'client') updates.isClient = true;
    if (activeRole === 'freelancer') updates.isFreelancer = true;

    const updatedUser = db.updateUser(user.id, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Ensure client profile exists if switching to client
    if (activeRole === 'client' && !db.getClientById(user.id)) {
      db.saveClientProfile({
        id: `client-${Date.now()}`,
        userId: user.id,
        companyName: user.name,
        totalSpent: 0,
        projectsPostedCount: 0,
        hiredFreelancersCount: 0,
        createdAt: new Date().toISOString()
      });
    }

    // Ensure freelancer profile exists if switching to freelancer
    if (activeRole === 'freelancer' && !db.getFreelancerById(user.id)) {
      db.saveFreelancerProfile({
        id: `profile-${Date.now()}`,
        userId: user.id,
        fullName: user.name,
        avatarUrl: user.avatarUrl || '',
        headline: 'Professional Freelancer',
        bio: 'Delivering exceptional solutions on Gravitass.',
        mainCategory: 'development',
        subcategory: 'Full Stack Development',
        skills: ['Full Stack', 'Web Development'],
        experienceLevel: 'intermediate',
        yearsOfExperience: 2,
        hourlyRate: 75,
        minBudget: 500,
        availability: 'full_time',
        languages: ['English'],
        location: 'Remote',
        badges: ['verified'],
        rating: 5.0,
        reviewCount: 0,
        completedProjectsCount: 0,
        totalEarnings: 0,
        profileCompletionPercentage: 70,
        performanceScore: {
          clientReviewQuality: 90,
          projectCompletionRate: 90,
          onTimeDelivery: 90,
          qualityPerformance: 90,
          communication: 90,
          repeatClients: 70,
          profilePortfolioQuality: 75,
          overallScore: 86.5
        },
        portfolio: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const token = await createSessionToken(updatedUser);
    const response = NextResponse.json({ user: updatedUser });
    response.cookies.set(AUTH_COOKIE_CONFIG.name, token, AUTH_COOKIE_CONFIG.options);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
