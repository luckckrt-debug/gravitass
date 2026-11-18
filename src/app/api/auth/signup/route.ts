import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { createSessionToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';
import { User, FreelancerProfile, ClientProfile } from '@/types';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const targetRole = role === 'client' ? 'client' : 'freelancer';
    const userId = `user-${Date.now()}`;

    const newUser: User = {
      id: userId,
      email,
      name,
      avatarUrl: `https://avatar.vercel.sh/${encodeURIComponent(name)}.png`,
      role: targetRole,
      isFreelancer: targetRole === 'freelancer',
      isClient: targetRole === 'client',
      activeRole: targetRole,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    if (targetRole === 'freelancer') {
      const defaultFreelancer: FreelancerProfile = {
        id: `profile-${Date.now()}`,
        userId,
        fullName: name,
        avatarUrl: newUser.avatarUrl || '',
        headline: 'Professional Freelancer',
        bio: 'Welcome to my Gravitass profile. I specialize in delivering high-quality client outcomes.',
        mainCategory: 'development',
        subcategory: 'Full Stack Development',
        skills: ['JavaScript', 'Web Development'],
        experienceLevel: 'intermediate',
        yearsOfExperience: 2,
        hourlyRate: 65,
        minBudget: 300,
        availability: 'full_time',
        languages: ['English'],
        location: 'Remote',
        badges: ['rising_talent'],
        rating: 5.0,
        reviewCount: 0,
        completedProjectsCount: 0,
        totalEarnings: 0,
        profileCompletionPercentage: 50,
        performanceScore: {
          clientReviewQuality: 85,
          projectCompletionRate: 90,
          onTimeDelivery: 90,
          qualityPerformance: 85,
          communication: 90,
          repeatClients: 70,
          profilePortfolioQuality: 60,
          overallScore: 82.5
        },
        portfolio: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.saveFreelancerProfile(defaultFreelancer);
    } else {
      const defaultClient: ClientProfile = {
        id: `client-${Date.now()}`,
        userId,
        companyName: name,
        industry: 'Technology',
        bio: 'Innovative hirer on Gravitass',
        location: 'Remote',
        totalSpent: 0,
        projectsPostedCount: 0,
        hiredFreelancersCount: 0,
        createdAt: new Date().toISOString()
      };
      db.saveClientProfile(defaultClient);
    }

    const token = await createSessionToken(newUser);
    const response = NextResponse.json({ user: newUser, message: 'Account created successfully' });
    response.cookies.set(AUTH_COOKIE_CONFIG.name, token, AUTH_COOKIE_CONFIG.options);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup error' }, { status: 500 });
  }
}
