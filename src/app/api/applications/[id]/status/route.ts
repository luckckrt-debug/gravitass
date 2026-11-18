import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { Contract } from '@/types';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, milestoneTitle, milestoneAmount } = await req.json();

    const apps = db.getApplications();
    const app = apps.find(a => a.id === params.id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const project = db.getProjectById(app.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Associated project not found' }, { status: 404 });
    }

    if (project.clientId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only the project owner can manage applications' }, { status: 403 });
    }

    const updatedApp = db.updateApplicationStatus(params.id, status);

    // If client is HIRING (status = 'accepted'):
    let newContract: Contract | undefined;
    if (status === 'accepted') {
      const contractId = `contract-${Date.now()}`;
      newContract = {
        id: contractId,
        projectId: project.id,
        projectTitle: project.title,
        clientId: user.id,
        clientName: user.name,
        freelancerId: app.freelancerId,
        freelancerName: app.freelancerName,
        freelancerAvatar: app.freelancerAvatar,
        totalAmount: app.proposedPrice,
        paidAmount: 0,
        status: 'active',
        startDate: new Date().toISOString(),
        completionDeadline: new Date(Date.now() + (app.deliveryDays || 14) * 86400000).toISOString(),
        milestones: [
          {
            id: `ms-${Date.now()}-1`,
            contractId,
            title: milestoneTitle || 'Initial Milestone & Discovery',
            description: 'Core kickoff, specification and architectural alignment',
            amount: milestoneAmount || Math.round(app.proposedPrice * 0.5),
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
            status: 'in_progress'
          },
          {
            id: `ms-${Date.now()}-2`,
            contractId,
            title: 'Final Delivery & Acceptance',
            description: 'Final asset handover, documentation and testing',
            amount: app.proposedPrice - (milestoneAmount || Math.round(app.proposedPrice * 0.5)),
            dueDate: new Date(Date.now() + (app.deliveryDays || 14) * 86400000).toISOString(),
            status: 'pending'
          }
        ],
        tasks: [
          {
            id: `tsk-${Date.now()}-1`,
            contractId,
            title: 'Review project specifications and confirm requirements',
            isCompleted: false,
            assignedTo: app.freelancerId
          },
          {
            id: `tsk-${Date.now()}-2`,
            contractId,
            title: 'Deliver initial working preview / prototype',
            isCompleted: false,
            assignedTo: app.freelancerId
          }
        ],
        createdAt: new Date().toISOString()
      };

      db.addContract(newContract);
      db.updateProject(project.id, { status: 'in_progress' });

      // Notify freelancer of hire
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: app.freelancerId,
        title: 'You were Hired!',
        message: `${user.name} accepted your proposal for "${project.title}". Your workspace is now live!`,
        type: 'hire',
        link: `/workspace/${contractId}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Automatically initialize or link conversation
      const convId = `conv-${project.id}-${app.freelancerId}`;
      db.createConversation({
        id: convId,
        projectId: project.id,
        projectTitle: project.title,
        participants: [
          { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: 'client' },
          { id: app.freelancerId, name: app.freelancerName, avatarUrl: app.freelancerAvatar, role: 'freelancer' }
        ],
        lastMessage: 'Contract created. Welcome to the Gravitass workspace!',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1
      });

      db.addMessage({
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatarUrl,
        content: `Congratulations! I have accepted your proposal for "${project.title}". Looking forward to building extraordinary things together.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else if (status === 'shortlisted') {
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: app.freelancerId,
        title: 'Proposal Shortlisted!',
        message: `${user.name} has shortlisted your proposal for "${project.title}".`,
        type: 'shortlist',
        link: '/dashboard/freelancer',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      application: updatedApp,
      contract: newContract,
      message: `Status updated to ${status}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
