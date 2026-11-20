import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const tab = searchParams.get('tab') || 'all';
    const search = searchParams.get('search') || '';

    // If specific userId is requested, return full audit dossier
    if (userId) {
      const auditDetails = db.getUserAuditDetails(userId);
      if (!auditDetails) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ auditDetails });
    }

    // Filtered list of users
    const filteredUsers = db.getUsersForAdmin(tab, search);

    // Compute tab counters for easy badge rendering
    const allUsers = db.getUsers();
    const counts = {
      all: allUsers.length,
      freelancers: allUsers.filter(u => u.role === 'freelancer' || u.isFreelancer).length,
      clients: allUsers.filter(u => u.role === 'client' || u.isClient).length,
      verified: allUsers.filter(u => u.isVerified || u.verificationStatus === 'verified').length,
      pending: allUsers.filter(u => u.verificationStatus === 'pending' || (!u.isVerified && !u.isSuspended)).length,
      suspended: allUsers.filter(u => u.isSuspended).length
    };

    return NextResponse.json({
      users: filteredUsers,
      counts
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, reason, role, isVerified, complaintId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const targetUser = db.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedUser = targetUser;
    let message = 'User updated';

    switch (action) {
      case 'verify':
        updatedUser = db.verifyUserAccount(userId);
        message = `User "${updatedUser.name}" verified successfully.`;
        break;

      case 'reject_verification':
        updatedUser = db.rejectUserVerification(userId, reason || 'Verification documents could not be verified.');
        message = `Verification for "${updatedUser.name}" rejected.`;
        break;

      case 'suspend':
        updatedUser = db.suspendUser(userId, reason || 'Account suspended by platform compliance team.');
        message = `Account "${updatedUser.name}" suspended.`;
        break;

      case 'reactivate':
        updatedUser = db.reactivateUser(userId);
        message = `Account "${updatedUser.name}" reactivated.`;
        break;

      case 'change_role':
        if (!['freelancer', 'client', 'admin'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updatedUser = db.updateUser(userId, { role }) || targetUser;
        message = `User "${updatedUser.name}" role updated to ${role}.`;
        break;

      case 'dismiss_complaint':
        if (complaintId) {
          db.dismissComplaint(userId, complaintId);
          message = 'Complaint dismissed.';
        }
        break;

      default:
        // Legacy fallback
        const updates: any = {};
        if (typeof isVerified === 'boolean') updates.isVerified = isVerified;
        if (role) updates.role = role;
        updatedUser = db.updateUser(userId, updates) || targetUser;
        break;
    }

    return NextResponse.json({ user: updatedUser, message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Backward compatibility for existing POST calls
export async function POST(req: Request) {
  return PATCH(req);
}
