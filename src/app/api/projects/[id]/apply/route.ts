import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { ProjectApplication } from '@/types';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to apply' }, { status: 401 });
    }

    const project = db.getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.clientId === user.id) {
      return NextResponse.json({ error: 'You cannot apply to your own project' }, { status: 400 });
    }

    // Check portfolio requirement: "Require at least one portfolio sample before a freelancer becomes eligible for normal job applications."
    const profile = db.getFreelancerById(user.id);
    if (!profile || !profile.portfolio || profile.portfolio.length === 0) {
      return NextResponse.json({
        error: 'Eligibility Requirement: You must have at least one verified portfolio sample before applying to projects. Please add a portfolio sample to your profile first.'
      }, { status: 403 });
    }

    // Check duplicate applications: "Prevent duplicate applications for the same project."
    const existingApps = db.getApplicationsByProject(project.id);
    const hasApplied = existingApps.some(a => a.freelancerId === user.id && a.status !== 'withdrawn');
    if (hasApplied) {
      return NextResponse.json({ error: 'You have already submitted an active proposal for this project.' }, { status: 409 });
    }

    const { proposal, coverLetter, proposedPrice, deliveryDays, portfolioLinks, attachments } = await req.json();

    if (!proposal || !proposedPrice || !deliveryDays) {
      return NextResponse.json({ error: 'Proposal, price, and delivery duration are required' }, { status: 400 });
    }

    const newApp: ProjectApplication = {
      id: `app-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      projectBudget: `${project.budgetMin} - ${project.budgetMax}`,
      freelancerId: user.id,
      freelancerName: profile.fullName || user.name,
      freelancerAvatar: profile.avatarUrl || user.avatarUrl || '',
      freelancerHeadline: profile.headline,
      freelancerRating: profile.rating,
      freelancerScore: profile.performanceScore.overallScore,
      freelancerBadges: profile.badges,
      proposal,
      coverLetter: coverLetter || '',
      proposedPrice: Number(proposedPrice),
      deliveryDays: Number(deliveryDays),
      portfolioLinks: portfolioLinks || [],
      attachments: attachments || [],
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addApplication(newApp);

    // Notify the client
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: project.clientId,
      title: 'New Proposal Received',
      message: `${user.name} submitted a proposal for "${project.title}".`,
      type: 'application',
      link: `/dashboard/client`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ application: newApp, message: 'Proposal submitted successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
