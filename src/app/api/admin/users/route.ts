import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, isVerified, role } = await req.json();

    const targetUser = db.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: any = {};
    if (typeof isVerified === 'boolean') updates.isVerified = isVerified;
    if (role) updates.role = role;

    const updated = db.updateUser(userId, updates);

    // Also update badge in freelancer profile if verified
    const profile = db.getFreelancerById(userId);
    if (profile && isVerified && !profile.badges.includes('verified')) {
      profile.badges.push('verified');
      db.saveFreelancerProfile(profile);
    }

    return NextResponse.json({ user: updated, message: 'User updated by admin' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
