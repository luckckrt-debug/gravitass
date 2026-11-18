import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { Message } from '@/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = db.getMessages(params.id);
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, attachments } = await req.json();

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message content or attachment is required' }, { status: 400 });
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: params.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatarUrl,
      content: content || '',
      attachments: attachments || [],
      isRead: false,
      createdAt: new Date().toISOString()
    };

    db.addMessage(newMsg);

    // Find recipient to notify
    const conv = db.getConversationsForUser(user.id).find(c => c.id === params.id);
    if (conv) {
      const recipient = conv.participants.find(p => p.id !== user.id);
      if (recipient) {
        db.addNotification({
          id: `notif-${Date.now()}`,
          userId: recipient.id,
          title: `New message from ${user.name}`,
          message: content.length > 80 ? `${content.slice(0, 80)}...` : content,
          type: 'message',
          link: '/messages',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
