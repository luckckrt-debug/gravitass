import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { Conversation } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = db.getConversationsForUser(user.id);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, projectId, projectTitle, initialMessage } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    const recipient = db.getUserById(recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    // Check if conversation already exists between these 2 users
    const userConvs = db.getConversationsForUser(user.id);
    const existing = userConvs.find(c => c.participants.some(p => p.id === recipientId));

    if (existing) {
      if (initialMessage) {
        db.addMessage({
          id: `msg-${Date.now()}`,
          conversationId: existing.id,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatarUrl,
          content: initialMessage,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
      return NextResponse.json({ conversation: existing });
    }

    const convId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: convId,
      projectId,
      projectTitle,
      participants: [
        { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.activeRole },
        { id: recipient.id, name: recipient.name, avatarUrl: recipient.avatarUrl, role: recipient.role }
      ],
      lastMessage: initialMessage || 'Conversation initiated',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 1
    };

    db.createConversation(newConv);

    if (initialMessage) {
      db.addMessage({
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatarUrl,
        content: initialMessage,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ conversation: newConv });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
