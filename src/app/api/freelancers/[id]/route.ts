import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const profile = db.getFreelancerById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
    }

    const reviews = db.getReviewsForUser(profile.userId);
    return NextResponse.json({ profile, reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const updates = await req.json();

    // Recalculate profile completion percentage
    const checkFields = [
      Boolean(updates.headline || profile.headline),
      Boolean(updates.bio || profile.bio),
      Boolean((updates.skills || profile.skills)?.length > 0),
      Boolean(updates.hourlyRate || profile.hourlyRate),
      Boolean((updates.languages || profile.languages)?.length > 0),
      Boolean(updates.location || profile.location),
      Boolean((updates.portfolio || profile.portfolio)?.length > 0),
      Boolean(updates.resumeUrl || profile.resumeUrl),
      Boolean(updates.avatarUrl || profile.avatarUrl)
    ];
    const completedCount = checkFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedCount / checkFields.length) * 100);

    const updatedProfile = db.saveFreelancerProfile({
      ...profile,
      ...updates,
      profileCompletionPercentage,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ profile: updatedProfile, message: 'Profile updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
