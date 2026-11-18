import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { Project } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const level = searchParams.get('level');
    const status = searchParams.get('status') || 'open';

    let projects = db.getProjects();

    if (status !== 'all') {
      projects = projects.filter(p => p.status === status);
    }

    if (category && category !== 'all') {
      projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (level && level !== 'all') {
      projects = projects.filter(p => p.experienceLevel === level);
    }

    if (minBudget) {
      projects = projects.filter(p => p.budgetMax >= Number(minBudget));
    }

    if (maxBudget) {
      projects = projects.filter(p => p.budgetMin <= Number(maxBudget));
    }

    if (search) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.requiredSkills.some(s => s.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      subcategory,
      description,
      requiredSkills,
      budgetType,
      budgetMin,
      budgetMax,
      deadline,
      experienceLevel,
      freelancersNeeded,
      attachments
    } = body;

    if (!title || !category || !description) {
      return NextResponse.json({ error: 'Title, category, and description are required' }, { status: 400 });
    }

    const projectId = `proj-${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProject: Project = {
      id: projectId,
      clientId: user.id,
      clientName: user.name,
      clientAvatar: user.avatarUrl,
      title,
      slug,
      category,
      subcategory: subcategory || 'General',
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      budgetType: budgetType || 'fixed',
      budgetMin: Number(budgetMin) || 100,
      budgetMax: Number(budgetMax) || 1000,
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      experienceLevel: experienceLevel || 'intermediate',
      freelancersNeeded: Number(freelancersNeeded) || 1,
      attachments: attachments || [],
      status: 'open',
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addProject(newProject);

    // Notify client profile stats
    const client = db.getClientById(user.id);
    if (client) {
      client.projectsPostedCount = (client.projectsPostedCount || 0) + 1;
      db.saveClientProfile(client);
    }

    return NextResponse.json({ project: newProject, message: 'Project published successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
