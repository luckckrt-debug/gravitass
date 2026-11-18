import fs from 'fs';
import path from 'path';
import {
  User,
  FreelancerProfile,
  ClientProfile,
  Category,
  Project,
  ProjectApplication,
  Contract,
  Review,
  Message,
  Conversation,
  Notification,
  Transaction,
  WithdrawalRequest,
  Dispute,
  PortfolioItem,
  LedgerTransaction,
  LedgerStatus,
  WithdrawalStatus,
  PayoutMethod,
  PayoutDetails,
  PlatformSettings,
  FreelancerEarningsSummary
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gravitass-data.json');

export interface DatabaseState {
  users: User[];
  freelancerProfiles: FreelancerProfile[];
  clientProfiles: ClientProfile[];
  categories: Category[];
  projects: Project[];
  applications: ProjectApplication[];
  contracts: Contract[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  disputes: Dispute[];
  ledgerTransactions: LedgerTransaction[];
  platformSettings: PlatformSettings;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'development',
    name: 'Development & Tech',
    slug: 'development',
    description: 'Full-stack engineers, AI researchers, smart contract builders & mobile architects.',
    icon: 'Code2',
    subcategories: [
      'Web Development', 'Frontend Development', 'Backend Development', 'Full Stack Development',
      'Mobile Apps', 'Android Development', 'iOS Development', 'Flutter', 'React Native',
      'WordPress & Shopify', 'Software Engineering', 'AI & Machine Learning',
      'Chatbot Development', 'API Development', 'Cybersecurity', 'Databases', 'Game Development'
    ],
    projectCount: 42,
    freelancerCount: 156
  },
  {
    id: 'ai-automation',
    name: 'AI & Automation',
    slug: 'ai-automation',
    description: 'Autonomous agents, LLM pipelines, workflow orchestrations and computer vision.',
    icon: 'Cpu',
    subcategories: [
      'AI Agents', 'AI Workflow Automation', 'Chatbot Integrations', 'Image Generation',
      'Video Generation', 'Data Automation', 'No-code Automation', 'Fine-tuning & RAG'
    ],
    projectCount: 38,
    freelancerCount: 94
  },
  {
    id: 'design',
    name: 'Design & Creative',
    slug: 'design',
    description: 'Futuristic UI/UX, brand identities, 3D assets, design systems & motion.',
    icon: 'Palette',
    subcategories: [
      'Graphic Design', 'Logos & Branding', 'UI/UX Design', 'Web Design',
      'App Design', 'Thumbnails', 'Posters & Media', 'Presentations', '3D Design & Modeling'
    ],
    projectCount: 29,
    freelancerCount: 120
  },
  {
    id: 'video',
    name: 'Video & Animation',
    slug: 'video',
    description: 'Cinematic video editors, 3D motion designers, VFX artists, and viral reel editors.',
    icon: 'Video',
    subcategories: [
      'Video Editing', 'YouTube Editing', 'Shorts & Reels', 'Cinematic Editing',
      'Motion Graphics', 'Animation', 'VFX', 'Color Grading'
    ],
    projectCount: 24,
    freelancerCount: 88
  },
  {
    id: 'writing',
    name: 'Writing & Translation',
    slug: 'writing',
    description: 'High-conversion technical writing, brand storytelling, SEO copy & translation.',
    icon: 'FileText',
    subcategories: [
      'Content Writing', 'Copywriting', 'SEO Articles', 'Technical Writing',
      'Whitepapers & Research', 'Scripts & Storyboards', 'Translation'
    ],
    projectCount: 19,
    freelancerCount: 75
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    slug: 'marketing',
    description: 'Growth hackers, paid media strategists, viral creators and performance marketing.',
    icon: 'TrendingUp',
    subcategories: [
      'Social Media Management', 'SEO & Organic Growth', 'Paid Ads (Meta/Google)',
      'Email Marketing', 'Influencer Marketing', 'Marketing Strategy', 'Funnel Optimization'
    ],
    projectCount: 21,
    freelancerCount: 64
  },
  {
    id: 'business',
    name: 'Business & Operations',
    slug: 'business',
    description: 'Fractional executives, financial models, market intelligence & ops management.',
    icon: 'Briefcase',
    subcategories: [
      'Virtual Assistants', 'Data Entry & Scraping', 'Business Consulting',
      'Market Research', 'Project Management', 'Customer Support Operations'
    ],
    projectCount: 16,
    freelancerCount: 52
  },
  {
    id: 'audio',
    name: 'Audio & Music',
    slug: 'audio',
    description: 'Voiceover talent, sound designers, composers and mastering engineers.',
    icon: 'Headphones',
    subcategories: [
      'Voice-Over', 'Podcast Audio Editing', 'Sound Design & SFX',
      'Music Production', 'Audio Mixing & Mastering'
    ],
    projectCount: 14,
    freelancerCount: 45
  },
  {
    id: 'photography',
    name: 'Photography & Editing',
    slug: 'photography',
    description: 'High-end product photography, AI retouching, and visual assets.',
    icon: 'Camera',
    subcategories: [
      'Product Photography', 'Photo Retouching & AI Editing', 'Event Photography',
      'Color Correction'
    ],
    projectCount: 11,
    freelancerCount: 38
  },
  {
    id: 'other',
    name: 'Specialized & Other',
    slug: 'other',
    description: 'CAD engineering, architecture, technical tutoring and bespoke solutions.',
    icon: 'Layers',
    subcategories: [
      'CAD & Mechanical Design', 'Architecture & BIM', 'Interior Design',
      'Technical Tutoring', 'Hardware Prototyping'
    ],
    projectCount: 15,
    freelancerCount: 32
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-freelancer-1',
    email: 'freelancer@gravitass.com',
    name: 'Elena Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: true,
    activeRole: 'freelancer',
    isVerified: true,
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'user-freelancer-2',
    email: 'marcus@gravitass.com',
    name: 'Marcus Thorne',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: false,
    activeRole: 'freelancer',
    isVerified: true,
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'user-freelancer-3',
    email: 'seraphina@gravitass.com',
    name: 'Seraphina Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: false,
    activeRole: 'freelancer',
    isVerified: true,
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'user-client-1',
    email: 'client@gravitass.com',
    name: 'Aetheria Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    role: 'client',
    isFreelancer: false,
    isClient: true,
    activeRole: 'client',
    isVerified: true,
    createdAt: '2026-01-05T12:00:00.000Z'
  },
  {
    id: 'user-admin-1',
    email: 'admin@gravitass.com',
    name: 'Gravitass Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    role: 'admin',
    isFreelancer: true,
    isClient: true,
    activeRole: 'admin',
    isVerified: true,
    createdAt: '2025-12-01T00:00:00.000Z'
  }
];

export const INITIAL_FREELANCERS: FreelancerProfile[] = [
  {
    id: 'profile-freelancer-1',
    userId: 'user-freelancer-1',
    fullName: 'Elena Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    headline: 'Senior Full Stack & AI Systems Architect',
    bio: 'Pioneering next-generation reactive interfaces, LLM agents, and high-throughput distributed systems. 8+ years scaling production infrastructure from zero to millions of daily events.',
    mainCategory: 'development',
    subcategory: 'AI & Machine Learning',
    skills: ['Next.js', 'TypeScript', 'Python', 'PyTorch', 'LangChain', 'FastAPI', 'Supabase', 'Tailwind CSS', 'Docker'],
    experienceLevel: 'expert',
    yearsOfExperience: 8,
    hourlyRate: 110,
    minBudget: 1500,
    availability: 'full_time',
    languages: ['English (Native)', 'German (Conversational)'],
    location: 'Berlin / Remote',
    badges: ['verified', 'elite_talent', 'top_rated'],
    rating: 4.98,
    reviewCount: 38,
    completedProjectsCount: 42,
    totalEarnings: 84250,
    profileCompletionPercentage: 100,
    performanceScore: {
      clientReviewQuality: 98,
      projectCompletionRate: 99,
      onTimeDelivery: 96,
      qualityPerformance: 97,
      communication: 95,
      repeatClients: 92,
      profilePortfolioQuality: 100,
      overallScore: 97.4
    },
    portfolio: [
      {
        id: 'port-1',
        freelancerId: 'profile-freelancer-1',
        title: 'Synthetix: Autonomous Knowledge Agent Swarm',
        description: 'Multi-agent orchestration platform integrating real-time vector embeddings and adaptive tool execution.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        externalUrl: 'https://synthetix-demo.ai',
        githubUrl: 'https://github.com/gravitass/synthetix',
        category: 'AI & Automation',
        tools: ['Next.js', 'Python', 'FastAPI', 'Qdrant', 'Tailwind'],
        createdAt: '2026-01-20T10:00:00.000Z'
      },
      {
        id: 'port-2',
        freelancerId: 'profile-freelancer-1',
        title: 'OmniDesk: Decentralized Workspace & Asset Protocol',
        description: 'Next-gen collaborative workspace with sub-50ms sync, end-to-end cryptographic verifications and glassmorphic UI.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        externalUrl: 'https://omnidesk.tech',
        category: 'Development & Tech',
        tools: ['TypeScript', 'React', 'WebSockets', 'Rust'],
        createdAt: '2026-02-05T12:00:00.000Z'
      }
    ],
    socialLinks: {
      github: 'https://github.com/elenavance',
      linkedin: 'https://linkedin.com/in/elenavance',
      website: 'https://elenavance.dev'
    },
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-02-15T15:00:00.000Z'
  },
  {
    id: 'profile-freelancer-2',
    userId: 'user-freelancer-2',
    fullName: 'Marcus Thorne',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    headline: 'Cybersecurity Specialist & High-Load Backend Engineer',
    bio: 'Zero-trust architecture designer, smart contract auditor, and Go/Rust microservice engineer. Specializes in impenetrable API gateways, financial security protocols, and SOC2 compliance.',
    mainCategory: 'development',
    subcategory: 'Cybersecurity',
    skills: ['Go', 'Rust', 'Penetration Testing', 'Cryptography', 'Kubernetes', 'PostgreSQL', 'Zero-Trust'],
    experienceLevel: 'expert',
    yearsOfExperience: 10,
    hourlyRate: 135,
    minBudget: 2500,
    availability: 'contract',
    languages: ['English (Fluent)', 'Japanese (Basic)'],
    location: 'San Francisco, CA',
    badges: ['verified', 'top_rated'],
    rating: 4.95,
    reviewCount: 29,
    completedProjectsCount: 31,
    totalEarnings: 96400,
    profileCompletionPercentage: 95,
    performanceScore: {
      clientReviewQuality: 96,
      projectCompletionRate: 98,
      onTimeDelivery: 94,
      qualityPerformance: 98,
      communication: 91,
      repeatClients: 89,
      profilePortfolioQuality: 92,
      overallScore: 95.1
    },
    portfolio: [
      {
        id: 'port-3',
        freelancerId: 'profile-freelancer-2',
        title: 'Vanguard: Real-time Threat Intelligence Mesh',
        description: 'Automated intrusion detection and anomaly telemetry engine handling 120,000 req/sec with sub-millisecond edge evaluation.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        externalUrl: 'https://vanguard-sec.io',
        category: 'Cybersecurity',
        tools: ['Go', 'eBPF', 'Kafka', 'Redis', 'Grafana'],
        createdAt: '2026-01-25T14:00:00.000Z'
      }
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-12T11:00:00.000Z'
  },
  {
    id: 'profile-freelancer-3',
    userId: 'user-freelancer-3',
    fullName: 'Seraphina Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    headline: 'Futuristic UI/UX & WebGL 3D Creative Director',
    bio: 'Crafting award-winning digital experiences, spatial UI, and interactive 3D web systems. Winner of 5x Awwwards Site of the Day and FWA of the Day.',
    mainCategory: 'design',
    subcategory: 'UI/UX Design',
    skills: ['Figma', 'Three.js', 'Spline 3D', 'Design Systems', 'Tailwind CSS', 'Blender', 'Prototyping'],
    experienceLevel: 'intermediate',
    yearsOfExperience: 4,
    hourlyRate: 85,
    minBudget: 1000,
    availability: 'part_time',
    languages: ['English', 'Mandarin'],
    location: 'Singapore',
    badges: ['verified', 'rising_talent'],
    rating: 4.92,
    reviewCount: 14,
    completedProjectsCount: 15,
    totalEarnings: 28500,
    profileCompletionPercentage: 90,
    performanceScore: {
      clientReviewQuality: 95,
      projectCompletionRate: 94,
      onTimeDelivery: 92,
      qualityPerformance: 96,
      communication: 94,
      repeatClients: 85,
      profilePortfolioQuality: 98,
      overallScore: 93.6
    },
    portfolio: [
      {
        id: 'port-4',
        freelancerId: 'profile-freelancer-3',
        title: 'Hyperion: 3D Holographic Crypto Banking Dashboard',
        description: 'Interactive WebGL spatial interface designed in Spline and Figma with dynamic glass refraction shaders.',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        externalUrl: 'https://hyperion-ui.design',
        category: 'Design & Creative',
        tools: ['Figma', 'Spline', 'Three.js', 'GSAP'],
        createdAt: '2026-02-01T10:00:00.000Z'
      }
    ],
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-14T10:00:00.000Z'
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'profile-client-1',
    userId: 'user-client-1',
    companyName: 'Aetheria Labs',
    companyWebsite: 'https://aetherialabs.ai',
    industry: 'Artificial Intelligence & Robotics',
    bio: 'Building foundational agent frameworks and enterprise automation systems.',
    location: 'Austin, Texas',
    totalSpent: 48500,
    projectsPostedCount: 9,
    hiredFreelancersCount: 7,
    createdAt: '2026-01-05T12:00:00.000Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    clientCompany: 'Aetheria Labs',
    title: 'Autonomous Multi-Model LLM Orchestration Platform',
    slug: 'autonomous-multi-model-llm-orchestration-platform',
    category: 'ai-automation',
    subcategory: 'AI Agents',
    description: 'We are seeking an elite AI Architect to construct an enterprise orchestration layer that connects Claude 3.5 Sonnet, GPT-4o, and Gemini 2.0 with streaming telemetry, tool fallback logic, and sub-100ms vector retrieval cache.',
    requiredSkills: ['Python', 'FastAPI', 'LangChain', 'Next.js', 'Redis', 'Docker'],
    budgetType: 'fixed',
    budgetMin: 4000,
    budgetMax: 7500,
    deadline: '2026-04-15T00:00:00.000Z',
    experienceLevel: 'expert',
    freelancersNeeded: 1,
    status: 'open',
    proposalsCount: 3,
    attachments: [
      { name: 'architecture_spec_v2.pdf', url: '#', size: '2.4 MB' }
    ],
    createdAt: '2026-02-10T14:30:00.000Z',
    updatedAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'proj-2',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    clientCompany: 'Aetheria Labs',
    title: 'Futuristic WebGL 3D Product Interactive Showcase',
    slug: 'futuristic-webgl-3d-product-interactive-showcase',
    category: 'design',
    subcategory: '3D Design & Modeling',
    description: 'Need a stunning 3D interactive hero canvas for our hardware release. Must feature dynamic particle illumination, camera orbit smoothly controlled by mouse or touch, and 60 FPS mobile performance.',
    requiredSkills: ['Three.js', 'WebGL', 'Figma', 'GSAP', 'Tailwind CSS'],
    budgetType: 'fixed',
    budgetMin: 2500,
    budgetMax: 4500,
    deadline: '2026-03-30T00:00:00.000Z',
    experienceLevel: 'intermediate',
    freelancersNeeded: 1,
    status: 'open',
    proposalsCount: 5,
    createdAt: '2026-02-12T09:15:00.000Z',
    updatedAt: '2026-02-12T09:15:00.000Z'
  },
  {
    id: 'proj-3',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    clientCompany: 'Aetheria Labs',
    title: 'High-Throughput Financial Ledger API & Zero-Knowledge Verifier',
    slug: 'high-throughput-financial-ledger-api',
    category: 'development',
    subcategory: 'Cybersecurity',
    description: 'Looking for a senior security/backend specialist to audit our existing Rust transaction pipeline and build cryptographic audit proofs for cross-border institutional settlements.',
    requiredSkills: ['Rust', 'PostgreSQL', 'Cryptography', 'API Development', 'Docker'],
    budgetType: 'hourly',
    budgetMin: 90,
    budgetMax: 140,
    deadline: '2026-05-01T00:00:00.000Z',
    experienceLevel: 'expert',
    freelancersNeeded: 1,
    status: 'open',
    proposalsCount: 2,
    createdAt: '2026-02-14T11:00:00.000Z',
    updatedAt: '2026-02-14T11:00:00.000Z'
  }
];

export const INITIAL_APPLICATIONS: ProjectApplication[] = [
  {
    id: 'app-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    projectBudget: '$4,000 - $7,500',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    freelancerHeadline: 'Senior Full Stack & AI Systems Architect',
    freelancerRating: 4.98,
    freelancerScore: 97.4,
    freelancerBadges: ['verified', 'elite_talent', 'top_rated'],
    proposal: 'I have designed similar multi-LLM orchestrators with dynamic streaming fallback. I will deliver a clean FastAPI service connected to LangGraph, paired with a real-time reactive Next.js dashboard.',
    coverLetter: 'Dear Aetheria Labs Team,\n\nI reviewed your architecture requirements. In my recent Synthetix project, I handled 45 concurrent agent streams with zero latency degradation using connection pooling and async Redis caching.\n\nI can start immediately and deliver the initial working prototype within 10 business days.',
    proposedPrice: 5800,
    deliveryDays: 21,
    portfolioLinks: ['https://synthetix-demo.ai', 'https://omnidesk.tech'],
    status: 'shortlisted',
    createdAt: '2026-02-11T16:00:00.000Z',
    updatedAt: '2026-02-12T10:00:00.000Z'
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'contract-demo-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    totalAmount: 5800,
    paidAmount: 2000,
    status: 'active',
    startDate: '2026-02-13T09:00:00.000Z',
    completionDeadline: '2026-03-15T00:00:00.000Z',
    milestones: [
      {
        id: 'ms-1',
        contractId: 'contract-demo-1',
        title: 'Phase 1: Architecture Specification & Core Routing Engine',
        description: 'Design schema, setup FastAPI endpoints and model connector interfaces.',
        amount: 2000,
        dueDate: '2026-02-25T00:00:00.000Z',
        status: 'approved'
      },
      {
        id: 'ms-2',
        contractId: 'contract-demo-1',
        title: 'Phase 2: Streaming Telemetry & Vector Cache Integration',
        description: 'Sub-100ms cache with Redis and streaming response generator.',
        amount: 2000,
        dueDate: '2026-03-05T00:00:00.000Z',
        status: 'in_progress'
      },
      {
        id: 'ms-3',
        contractId: 'contract-demo-1',
        title: 'Phase 3: Next.js Frontend Dashboard & Production Deployment',
        description: 'Complete UI monitoring workspace, benchmark tests and container setup.',
        amount: 1800,
        dueDate: '2026-03-15T00:00:00.000Z',
        status: 'pending'
      }
    ],
    tasks: [
      { id: 't-1', contractId: 'contract-demo-1', title: 'Setup GitHub repository & CI pipeline', isCompleted: true, assignedTo: 'user-freelancer-1' },
      { id: 't-2', contractId: 'contract-demo-1', title: 'Configure multi-provider LLM token bucket limiter', isCompleted: true, assignedTo: 'user-freelancer-1' },
      { id: 't-3', contractId: 'contract-demo-1', title: 'Implement SSE streaming parser for Next.js', isCompleted: false, assignedTo: 'user-freelancer-1' },
      { id: 't-4', contractId: 'contract-demo-1', title: 'Conduct latency benchmark across 500 test queries', isCompleted: false, assignedTo: 'user-freelancer-1' }
    ],
    createdAt: '2026-02-13T09:00:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    contractId: 'contract-prev-1',
    projectId: 'proj-1',
    fromUserId: 'user-client-1',
    fromUserName: 'Aetheria Labs',
    fromUserAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    toUserId: 'user-freelancer-1',
    rating: 5.0,
    comment: 'Elena delivered extraordinary results. Her architectural understanding of agentic systems and speed of execution is top-tier. Exceeded all our benchmarks.',
    categories: { quality: 5, communication: 5, timeliness: 5, expertise: 5 },
    createdAt: '2026-01-28T16:00:00.000Z'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    participants: [
      { id: 'user-freelancer-1', name: 'Elena Vance', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', role: 'freelancer' },
      { id: 'user-client-1', name: 'Aetheria Labs', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80', role: 'client' }
    ],
    lastMessage: 'The Redis streaming vector pipeline is ready for test payload verification.',
    lastMessageAt: '2026-02-16T18:30:00.000Z',
    unreadCount: 1
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-client-1',
    senderName: 'Aetheria Labs',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    content: 'Hi Elena, we reviewed your proposal for the LLM Orchestrator. Are you available for a quick technical alignment?',
    isRead: true,
    createdAt: '2026-02-12T11:00:00.000Z'
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-freelancer-1',
    senderName: 'Elena Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    content: 'Absolutely! I reviewed the spec doc and have already prepared the baseline fallback flowchart.',
    isRead: true,
    createdAt: '2026-02-12T11:15:00.000Z'
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-freelancer-1',
    senderName: 'Elena Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    content: 'The Redis streaming vector pipeline is ready for test payload verification.',
    isRead: false,
    createdAt: '2026-02-16T18:30:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-freelancer-1',
    title: 'Proposal Shortlisted!',
    message: 'Aetheria Labs shortlisted your proposal for "Autonomous Multi-Model LLM Orchestration Platform".',
    type: 'shortlist',
    link: '/dashboard/freelancer',
    isRead: false,
    createdAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'notif-2',
    userId: 'user-freelancer-1',
    title: 'Milestone 1 Approved',
    message: '$2,000 has been released to your available balance for Phase 1 completion.',
    type: 'payment',
    link: '/dashboard/freelancer',
    isRead: false,
    createdAt: '2026-02-14T12:00:00.000Z'
  },
  {
    id: 'notif-3',
    userId: 'user-client-1',
    title: 'New Proposal Received',
    message: 'Elena Vance submitted a proposal for "Autonomous Multi-Model LLM Orchestration Platform".',
    type: 'application',
    link: '/dashboard/client',
    isRead: true,
    createdAt: '2026-02-11T16:00:00.000Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-freelancer-1',
    type: 'payment_release',
    amount: 2000,
    status: 'completed',
    description: 'Milestone 1 Release: Architecture Specification',
    referenceId: 'contract-demo-1',
    createdAt: '2026-02-14T12:00:00.000Z'
  },
  {
    id: 'tx-2',
    userId: 'user-client-1',
    type: 'milestone_escrow',
    amount: -2000,
    status: 'completed',
    description: 'Escrow payment released for Phase 1',
    referenceId: 'contract-demo-1',
    createdAt: '2026-02-14T12:00:00.000Z'
  }
];

// Persistent state class
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  commissionPercentage: 10,
  minWithdrawalAmount: 20,
  withdrawalFeePercentage: 0,
  fixedWithdrawalFee: 0,
  payoutGatewayMode: 'simulated_live',
  updatedAt: new Date().toISOString()
};

export const INITIAL_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'LED-DEMO-001',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    contractId: 'contract-demo-1',
    milestoneId: 'ms-demo-1',
    milestoneTitle: 'Architecture Specification & Vector Pipeline',
    grossAmount: 2000,
    commissionPercentage: 10,
    platformFee: 200,
    netAmount: 1800,
    status: 'available',
    transactionReference: 'REF-GRAV-LLM941',
    createdAt: '2026-02-14T12:00:00.000Z',
    updatedAt: '2026-02-14T12:00:00.000Z'
  },
  {
    id: 'LED-DEMO-002',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    projectId: 'proj-2',
    projectTitle: 'Real-time Streaming Vector Ingestion Engine',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    contractId: 'contract-demo-1',
    milestoneId: 'ms-demo-2',
    milestoneTitle: 'Cluster Ingestion Benchmarks & SDK Release',
    grossAmount: 3500,
    commissionPercentage: 10,
    platformFee: 350,
    netAmount: 3150,
    status: 'available',
    transactionReference: 'REF-GRAV-VEC882',
    createdAt: '2026-02-15T16:00:00.000Z',
    updatedAt: '2026-02-15T16:00:00.000Z'
  },
  {
    id: 'LED-DEMO-003',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    contractId: 'contract-demo-1',
    milestoneId: 'ms-demo-3',
    milestoneTitle: 'Production Deployment & Load Testing',
    grossAmount: 2500,
    commissionPercentage: 10,
    platformFee: 250,
    netAmount: 2250,
    status: 'pending_approval',
    transactionReference: 'REF-GRAV-DEP319',
    createdAt: '2026-02-17T09:30:00.000Z',
    updatedAt: '2026-02-17T09:30:00.000Z'
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WTH-DEMO-001',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    amount: 1500,
    fee: 0,
    finalAmount: 1500,
    method: 'bank_transfer',
    payoutDetails: {
      accountHolderName: 'Elena Vance',
      bankName: 'HDFC Bank',
      ifsc: 'HDFC0001234',
      maskedAccount: '•••• •••• 8912',
      isVerified: true
    },
    status: 'paid',
    estimatedProcessingTime: '24–48 Business Hours',
    paymentReference: 'UTR-HDFC-9948210381',
    createdAt: '2026-02-16T10:00:00.000Z',
    processedAt: '2026-02-16T14:30:00.000Z'
  }
];

class DataStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      if (typeof window === 'undefined') {
        if (fs.existsSync(DATA_FILE)) {
          const raw = fs.readFileSync(DATA_FILE, 'utf-8');
          const parsed = JSON.parse(raw);
          return {
            ...this.getDefaultState(),
            ...parsed,
            ledgerTransactions: parsed.ledgerTransactions && parsed.ledgerTransactions.length > 0 
              ? parsed.ledgerTransactions 
              : INITIAL_LEDGER_TRANSACTIONS,
            withdrawals: parsed.withdrawals && parsed.withdrawals.length > 0
              ? parsed.withdrawals
              : INITIAL_WITHDRAWALS,
            platformSettings: {
              ...DEFAULT_PLATFORM_SETTINGS,
              ...(parsed.platformSettings || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Failed to read database file, initializing defaults:', e);
    }
    return this.getDefaultState();
  }

  private getDefaultState(): DatabaseState {
    return {
      users: INITIAL_USERS,
      freelancerProfiles: INITIAL_FREELANCERS,
      clientProfiles: INITIAL_CLIENTS,
      categories: INITIAL_CATEGORIES,
      projects: INITIAL_PROJECTS,
      applications: INITIAL_APPLICATIONS,
      contracts: INITIAL_CONTRACTS,
      reviews: INITIAL_REVIEWS,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      notifications: INITIAL_NOTIFICATIONS,
      transactions: INITIAL_TRANSACTIONS,
      withdrawals: INITIAL_WITHDRAWALS,
      disputes: [],
      ledgerTransactions: INITIAL_LEDGER_TRANSACTIONS,
      platformSettings: DEFAULT_PLATFORM_SETTINGS
    };
  }

  private saveState(): void {
    try {
      if (typeof window === 'undefined') {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.state.users.push(user);
    this.saveState();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.saveState();
    return this.state.users[idx];
  }

  // --- FREELANCER PROFILES ---
  public getFreelancers(): FreelancerProfile[] {
    return this.state.freelancerProfiles;
  }

  public getFreelancerById(id: string): FreelancerProfile | undefined {
    return this.state.freelancerProfiles.find(f => f.id === id || f.userId === id);
  }

  public saveFreelancerProfile(profile: FreelancerProfile): FreelancerProfile {
    const idx = this.state.freelancerProfiles.findIndex(f => f.userId === profile.userId || f.id === profile.id);
    if (idx >= 0) {
      this.state.freelancerProfiles[idx] = { ...this.state.freelancerProfiles[idx], ...profile, updatedAt: new Date().toISOString() };
    } else {
      this.state.freelancerProfiles.push(profile);
    }
    this.saveState();
    return profile;
  }

  // --- CLIENT PROFILES ---
  public getClientById(id: string): ClientProfile | undefined {
    return this.state.clientProfiles.find(c => c.id === id || c.userId === id);
  }

  public saveClientProfile(profile: ClientProfile): ClientProfile {
    const idx = this.state.clientProfiles.findIndex(c => c.userId === profile.userId || c.id === profile.id);
    if (idx >= 0) {
      this.state.clientProfiles[idx] = { ...this.state.clientProfiles[idx], ...profile };
    } else {
      this.state.clientProfiles.push(profile);
    }
    this.saveState();
    return profile;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.state.categories;
  }

  public addCategory(cat: Category): Category {
    this.state.categories.push(cat);
    this.saveState();
    return cat;
  }

  // --- PROJECTS ---
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.state.projects.find(p => p.id === id);
  }

  public addProject(project: Project): Project {
    this.state.projects.unshift(project);
    this.saveState();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.state.projects.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveState();
    return this.state.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const initialLen = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => p.id !== id);
    if (this.state.projects.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- APPLICATIONS ---
  public getApplications(): ProjectApplication[] {
    return this.state.applications;
  }

  public getApplicationsByProject(projectId: string): ProjectApplication[] {
    return this.state.applications.filter(a => a.projectId === projectId);
  }

  public getApplicationsByFreelancer(freelancerId: string): ProjectApplication[] {
    return this.state.applications.filter(a => a.freelancerId === freelancerId);
  }

  public addApplication(app: ProjectApplication): ProjectApplication {
    this.state.applications.unshift(app);
    // increment project proposals count
    const proj = this.state.projects.find(p => p.id === app.projectId);
    if (proj) {
      proj.proposalsCount = (proj.proposalsCount || 0) + 1;
    }
    this.saveState();
    return app;
  }

  public updateApplicationStatus(id: string, status: ProjectApplication['status']): ProjectApplication | undefined {
    const app = this.state.applications.find(a => a.id === id);
    if (!app) return undefined;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    this.saveState();
    return app;
  }

  // --- CONTRACTS & WORKSPACE ---
  public getContracts(): Contract[] {
    return this.state.contracts;
  }

  public getContractById(id: string): Contract | undefined {
    return this.state.contracts.find(c => c.id === id);
  }

  public addContract(contract: Contract): Contract {
    this.state.contracts.unshift(contract);
    this.saveState();
    return contract;
  }

  public updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
    const idx = this.state.contracts.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.state.contracts[idx] = { ...this.state.contracts[idx], ...updates };
    this.saveState();
    return this.state.contracts[idx];
  }

  // --- REVIEWS ---
  public getReviews(): Review[] {
    return this.state.reviews;
  }

  public getReviewsForUser(userId: string): Review[] {
    return this.state.reviews.filter(r => r.toUserId === userId);
  }

  public addReview(review: Review): Review {
    this.state.reviews.unshift(review);
    // update freelancer rating & performance score
    const freelancer = this.state.freelancerProfiles.find(f => f.userId === review.toUserId);
    if (freelancer) {
      const userReviews = this.getReviewsForUser(review.toUserId);
      const totalRating = userReviews.reduce((acc, curr) => acc + curr.rating, 0);
      freelancer.rating = Number((totalRating / userReviews.length).toFixed(2));
      freelancer.reviewCount = userReviews.length;
      // recalculate performance score
      this.recalculatePerformanceScore(freelancer);
    }
    this.saveState();
    return review;
  }

  private recalculatePerformanceScore(f: FreelancerProfile): void {
    // Transparent performance score formula:
    // Review quality: 25%
    // Project completion: 20%
    // On-time delivery: 15%
    // Quality performance: 15%
    // Communication: 10%
    // Repeat clients: 10%
    // Profile & portfolio: 5%
    const revQuality = Math.min(100, (f.rating / 5) * 100);
    const completionRate = f.completedProjectsCount > 0 ? 98 : 80;
    const onTime = 95;
    const quality = revQuality;
    const comms = 92;
    const repeats = Math.min(100, f.completedProjectsCount * 8);
    const portScore = (f.portfolio && f.portfolio.length >= 2) ? 100 : 70;

    const weighted = (
      revQuality * 0.25 +
      completionRate * 0.20 +
      onTime * 0.15 +
      quality * 0.15 +
      comms * 0.10 +
      repeats * 0.10 +
      portScore * 0.05
    );

    f.performanceScore = {
      clientReviewQuality: Number(revQuality.toFixed(1)),
      projectCompletionRate: Number(completionRate.toFixed(1)),
      onTimeDelivery: Number(onTime.toFixed(1)),
      qualityPerformance: Number(quality.toFixed(1)),
      communication: Number(comms.toFixed(1)),
      repeatClients: Number(repeats.toFixed(1)),
      profilePortfolioQuality: Number(portScore.toFixed(1)),
      overallScore: Number(weighted.toFixed(1))
    };

    // Assign badges based on score & completed projects
    const badges: FreelancerProfile['badges'] = ['verified'];
    if (f.performanceScore.overallScore >= 95 && f.completedProjectsCount >= 10) {
      badges.push('elite_talent');
      badges.push('top_rated');
    } else if (f.performanceScore.overallScore >= 90) {
      badges.push('top_rated');
    } else if (f.completedProjectsCount <= 3 && f.rating >= 4.8) {
      badges.push('rising_talent');
    }
    f.badges = Array.from(new Set(badges));
  }

  // --- MESSAGES & CONVERSATIONS ---
  public getConversationsForUser(userId: string): Conversation[] {
    return this.state.conversations.filter(c => 
      c.participants.some(p => p.id === userId)
    );
  }

  public getMessages(conversationId: string): Message[] {
    return this.state.messages.filter(m => m.conversationId === conversationId);
  }

  public addMessage(msg: Message): Message {
    this.state.messages.push(msg);
    const conv = this.state.conversations.find(c => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessage = msg.content;
      conv.lastMessageAt = msg.createdAt;
      conv.unreadCount = (conv.unreadCount || 0) + 1;
    }
    this.saveState();
    return msg;
  }

  public createConversation(conv: Conversation): Conversation {
    this.state.conversations.unshift(conv);
    this.saveState();
    return conv;
  }

  // --- NOTIFICATIONS ---
  public getNotificationsForUser(userId: string): Notification[] {
    return this.state.notifications.filter(n => n.userId === userId);
  }

  public addNotification(notif: Notification): Notification {
    this.state.notifications.unshift(notif);
    this.saveState();
    return notif;
  }

  public markNotificationsRead(userId: string): void {
    this.state.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.saveState();
  }

  // --- TRANSACTIONS ---
  public getTransactionsForUser(userId: string): Transaction[] {
    return this.state.transactions.filter(t => t.userId === userId);
  }

  public addTransaction(tx: Transaction): Transaction {
    this.state.transactions.unshift(tx);
    this.saveState();
    return tx;
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return this.state.withdrawals;
  }

  public addWithdrawal(w: WithdrawalRequest): WithdrawalRequest {
    this.state.withdrawals.unshift(w);
    this.saveState();
    return w;
  }

  public updateWithdrawalStatus(id: string, status: WithdrawalRequest['status']): WithdrawalRequest | undefined {
    const w = this.state.withdrawals.find(item => item.id === id);
    if (!w) return undefined;
    w.status = status;
    this.saveState();
    return w;
  }

  // --- PLATFORM SETTINGS (CONFIGURABLE COMMISSION & LIMITS) ---
  public getPlatformSettings(): PlatformSettings {
    if (!this.state.platformSettings) {
      this.state.platformSettings = { ...DEFAULT_PLATFORM_SETTINGS };
      this.saveState();
    }
    return this.state.platformSettings;
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>): PlatformSettings {
    this.state.platformSettings = {
      ...this.getPlatformSettings(),
      ...settings,
      updatedAt: new Date().toISOString()
    };
    this.saveState();
    return this.state.platformSettings;
  }

  // --- EARNINGS LEDGER TRANSACTIONS ---
  public getLedgerTransactions(): LedgerTransaction[] {
    return this.state.ledgerTransactions || [];
  }

  public getLedgerForFreelancer(
    freelancerId: string, 
    filters?: { status?: string; search?: string; startDate?: string; endDate?: string }
  ): LedgerTransaction[] {
    let list = (this.state.ledgerTransactions || []).filter(l => l.freelancerId === freelancerId);

    if (filters?.status && filters.status !== 'all') {
      list = list.filter(l => l.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(l => 
        l.projectTitle.toLowerCase().includes(q) ||
        l.clientName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.transactionReference.toLowerCase().includes(q)
      );
    }

    if (filters?.startDate) {
      list = list.filter(l => new Date(l.createdAt) >= new Date(filters.startDate!));
    }

    if (filters?.endDate) {
      list = list.filter(l => new Date(l.createdAt) <= new Date(filters.endDate!));
    }

    return list;
  }

  // --- DYNAMIC BALANCE & SUMMARY DERIVATION ---
  public getFreelancerEarningsSummary(freelancerId: string): FreelancerEarningsSummary {
    const ledger = (this.state.ledgerTransactions || []).filter(l => l.freelancerId === freelancerId);
    const withdrawals = (this.state.withdrawals || []).filter(w => w.freelancerId === freelancerId);

    // 1. Lifetime Earnings: Sum of net earnings from all eligible projects (positive ledger amounts)
    const lifetimeEarnings = ledger
      .filter(l => (l.status === 'available' || l.status === 'withdrawal_processing' || l.status === 'paid') && l.netAmount > 0)
      .reduce((sum, l) => sum + l.netAmount, 0);

    // 2. Pending Approval: In review / pending client sign-off
    const pendingApprovalEarnings = ledger
      .filter(l => (l.status === 'pending_approval' || l.status === 'pending_payment') && l.netAmount > 0)
      .reduce((sum, l) => sum + l.netAmount, 0);

    // 3. Processing Withdrawals: Amount reserved in requested/under_review/processing/approved state
    const processingWithdrawals = withdrawals
      .filter(w => w.status === 'requested' || w.status === 'under_review' || w.status === 'approved' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0);

    // 4. Total Withdrawn: Successfully paid out
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + w.amount, 0);

    // 5. Failed / Rejected Payments
    const failedPayments = withdrawals
      .filter(w => w.status === 'failed' || w.status === 'rejected')
      .reduce((sum, w) => sum + w.amount, 0);

    // 6. Available Balance = Lifetime Net - Total Withdrawn - Processing Withdrawals
    const availableBalance = Math.max(0, Number((lifetimeEarnings - totalWithdrawn - processingWithdrawals).toFixed(2)));

    return {
      lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
      availableBalance,
      pendingApprovalEarnings: Number(pendingApprovalEarnings.toFixed(2)),
      processingWithdrawals: Number(processingWithdrawals.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      failedPayments: Number(failedPayments.toFixed(2)),
      currency: 'USD'
    };
  }

  // --- AUTOMATIC PROJECT EARNING CREDIT ---
  public creditProjectEarning(params: {
    contractId: string;
    milestoneId?: string;
    approverUserId: string;
  }): { success: boolean; ledger?: LedgerTransaction; error?: string } {
    const contract = this.getContractById(params.contractId);
    if (!contract) return { success: false, error: 'Contract not found' };

    // Prevent unauthorized credit modifications
    if (contract.clientId !== params.approverUserId && params.approverUserId !== 'user-admin') {
      return { success: false, error: 'Unauthorized approver' };
    }

    const ms = params.milestoneId 
      ? contract.milestones.find(m => m.id === params.milestoneId) 
      : undefined;

    const grossAmount = ms ? ms.amount : (contract.totalAmount - (contract.paidAmount || 0));
    if (grossAmount <= 0) {
      return { success: false, error: 'No payable amount on this milestone' };
    }

    // Idempotency: Prevent duplicate credits for the same milestone/contract
    const existing = (this.state.ledgerTransactions || []).find(l => 
      l.contractId === contract.id && 
      (ms ? l.milestoneId === ms.id : true) &&
      l.status !== 'failed' && l.status !== 'refunded'
    );
    if (existing) {
      return { success: false, error: 'Project milestone earning has already been credited to ledger', ledger: existing };
    }

    // Dynamic Platform Commission from Settings
    const settings = this.getPlatformSettings();
    const commissionPercentage = settings.commissionPercentage || 10;
    const platformFee = Number(((grossAmount * commissionPercentage) / 100).toFixed(2));
    const netAmount = Number((grossAmount - platformFee).toFixed(2));

    const ledgerEntry: LedgerTransaction = {
      id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      freelancerId: contract.freelancerId,
      freelancerName: contract.freelancerName,
      projectId: contract.projectId,
      projectTitle: contract.projectTitle,
      clientId: contract.clientId,
      clientName: contract.clientName,
      contractId: contract.id,
      milestoneId: ms?.id,
      milestoneTitle: ms?.title || 'Contract Deliverable',
      grossAmount,
      commissionPercentage,
      platformFee,
      netAmount,
      status: 'available',
      transactionReference: `REF-GRAV-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.state.ledgerTransactions) this.state.ledgerTransactions = [];
    this.state.ledgerTransactions.unshift(ledgerEntry);

    // Update milestone status if applicable
    if (ms) {
      ms.status = 'approved';
    }
    contract.paidAmount = (contract.paidAmount || 0) + grossAmount;
    this.updateContract(contract.id, contract);

    // Update profile total earnings
    const freelancer = this.getFreelancerById(contract.freelancerId);
    if (freelancer) {
      freelancer.totalEarnings = (freelancer.totalEarnings || 0) + netAmount;
      this.saveFreelancerProfile(freelancer);
    }

    // Record audit trail transaction
    this.addTransaction({
      id: `tx-${Date.now()}`,
      userId: contract.freelancerId,
      type: 'payment_release',
      amount: netAmount,
      status: 'completed',
      description: `Project Earning: "${contract.projectTitle}" (Gross $${grossAmount} - ${commissionPercentage}% Fee $${platformFee})`,
      referenceId: ledgerEntry.id,
      createdAt: new Date().toISOString()
    });

    // Notify freelancer
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: contract.freelancerId,
      title: 'Project Earnings Credited!',
      message: `$${netAmount.toLocaleString()} has been credited to your available balance for "${contract.projectTitle}". (Gross: $${grossAmount}, Platform Fee: $${platformFee}).`,
      type: 'payment',
      link: `/dashboard/freelancer`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.saveState();
    return { success: true, ledger: ledgerEntry };
  }

  // --- WITHDRAWAL WORKFLOW (ATOMIC & IDEMPOTENT) ---
  public getWithdrawalsForFreelancer(freelancerId: string): WithdrawalRequest[] {
    return (this.state.withdrawals || []).filter(w => w.freelancerId === freelancerId);
  }

  public requestWithdrawal(params: {
    freelancerId: string;
    amount: number;
    method: PayoutMethod;
    payoutDetails: PayoutDetails;
    idempotencyKey?: string;
  }): { success: boolean; withdrawal?: WithdrawalRequest; error?: string } {
    const summary = this.getFreelancerEarningsSummary(params.freelancerId);
    const settings = this.getPlatformSettings();

    if (params.amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than zero.' };
    }

    if (params.amount < settings.minWithdrawalAmount) {
      return { success: false, error: `Minimum withdrawal amount is $${settings.minWithdrawalAmount}.` };
    }

    if (params.amount > summary.availableBalance) {
      return { 
        success: false, 
        error: `Insufficient available balance. You requested $${params.amount}, but your verified available balance is $${summary.availableBalance}.` 
      };
    }

    // Idempotency: Prevent simultaneous duplicate withdrawal requests
    if (params.idempotencyKey) {
      const existing = (this.state.withdrawals || []).find(w => w.idempotencyKey === params.idempotencyKey);
      if (existing) {
        return { success: true, withdrawal: existing };
      }
    }

    // Validate payout destination format
    if (params.method === 'bank_transfer') {
      if (!params.payoutDetails.accountNumber || !params.payoutDetails.ifsc) {
        return { success: false, error: 'Bank account number and IFSC code are required for bank payout.' };
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(params.payoutDetails.ifsc.trim())) {
        return { success: false, error: 'Invalid Indian Financial System Code (IFSC). Format: 4 letters, 0, 6 characters (e.g. HDFC0001234).' };
      }
    } else if (params.method === 'upi') {
      if (!params.payoutDetails.upiId || !/^[\w.-]+@[\w.-]+$/.test(params.payoutDetails.upiId.trim())) {
        return { success: false, error: 'Invalid Virtual Payment Address (UPI ID). Example: freelancer@okhdfcbank or name@upi.' };
      }
    }

    const feePercent = settings.withdrawalFeePercentage || 0;
    const fixedFee = settings.fixedWithdrawalFee || 0;
    const fee = Number(((params.amount * feePercent) / 100 + fixedFee).toFixed(2));
    const finalAmount = Number((params.amount - fee).toFixed(2));

    // Mask destination for secure audit
    const maskedDetails: PayoutDetails = {
      ...params.payoutDetails,
      maskedAccount: params.payoutDetails.accountNumber 
        ? `•••• •••• ${params.payoutDetails.accountNumber.slice(-4)}` 
        : undefined,
      maskedUpi: params.payoutDetails.upiId 
        ? `${params.payoutDetails.upiId.slice(0, 3)}***@${params.payoutDetails.upiId.split('@')[1] || 'upi'}` 
        : undefined,
      isVerified: true
    };

    const freelancer = this.getFreelancerById(params.freelancerId);
    const withdrawal: WithdrawalRequest = {
      id: `WTH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      freelancerId: params.freelancerId,
      freelancerName: freelancer?.fullName || 'Freelancer',
      amount: params.amount,
      fee,
      finalAmount,
      method: params.method,
      payoutDetails: maskedDetails,
      status: 'requested',
      estimatedProcessingTime: params.method === 'upi' ? 'Instant–15 Minutes' : '24–48 Business Hours',
      idempotencyKey: params.idempotencyKey || `idem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.state.withdrawals) this.state.withdrawals = [];
    this.state.withdrawals.unshift(withdrawal);

    // Atomically reserve amount from available balance via negative ledger entry
    const ledgerReserve: LedgerTransaction = {
      id: `LED-${Date.now()}-WTH`,
      freelancerId: params.freelancerId,
      freelancerName: freelancer?.fullName || 'Freelancer',
      projectId: 'PAYOUT',
      projectTitle: `Withdrawal via ${params.method === 'upi' ? 'UPI' : 'Bank Transfer'} (${maskedDetails.maskedAccount || maskedDetails.maskedUpi})`,
      clientId: 'GRAVITASS-TREASURY',
      clientName: 'GRAVITASS Escrow & Payout',
      contractId: withdrawal.id,
      grossAmount: -params.amount,
      commissionPercentage: 0,
      platformFee: fee,
      netAmount: -params.amount,
      status: 'withdrawal_processing',
      transactionReference: `WTH-REF-${Date.now().toString(36).toUpperCase()}`,
      withdrawalId: withdrawal.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.ledgerTransactions.unshift(ledgerReserve);

    // Add transaction audit trail
    this.addTransaction({
      id: `tx-w-${Date.now()}`,
      userId: params.freelancerId,
      type: 'withdrawal',
      amount: -params.amount,
      status: 'pending',
      description: `Withdrawal request of $${params.amount} to ${maskedDetails.maskedAccount || maskedDetails.maskedUpi}`,
      referenceId: withdrawal.id,
      createdAt: new Date().toISOString()
    });

    // Notify freelancer
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: params.freelancerId,
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal of $${params.amount.toLocaleString()} has been queued for review and payout. Estimated time: ${withdrawal.estimatedProcessingTime}.`,
      type: 'payment',
      link: `/dashboard/freelancer`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.saveState();
    return { success: true, withdrawal };
  }

  // --- WITHDRAWAL LIFECYCLE MANAGEMENT (ADMIN & GATEWAY) ---
  public processWithdrawalStatus(params: {
    withdrawalId: string;
    status: WithdrawalStatus;
    paymentReference?: string;
    failureReason?: string;
  }): { success: boolean; withdrawal?: WithdrawalRequest; error?: string } {
    const withdrawal = (this.state.withdrawals || []).find(w => w.id === params.withdrawalId);
    if (!withdrawal) return { success: false, error: 'Withdrawal request not found' };

    const prevStatus = withdrawal.status;
    if (prevStatus === 'paid') {
      return { success: false, error: 'Withdrawal is already marked as paid and completed' };
    }

    withdrawal.status = params.status;
    withdrawal.updatedAt = new Date().toISOString();

    if (params.paymentReference) {
      withdrawal.paymentReference = params.paymentReference;
    }
    if (params.failureReason) {
      withdrawal.failureReason = params.failureReason;
    }

    const ledgerEntry = (this.state.ledgerTransactions || []).find(l => l.withdrawalId === withdrawal.id);

    if (params.status === 'paid') {
      withdrawal.processedAt = new Date().toISOString();
      if (ledgerEntry) {
        ledgerEntry.status = 'paid';
        ledgerEntry.paidAt = new Date().toISOString();
        ledgerEntry.updatedAt = new Date().toISOString();
      }
      const tx = (this.state.transactions || []).find(t => t.referenceId === withdrawal.id);
      if (tx) tx.status = 'completed';

      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: withdrawal.freelancerId,
        title: 'Withdrawal Paid Successfully!',
        message: `Your payout of $${withdrawal.finalAmount.toLocaleString()} has been transferred. Reference/UTR: ${withdrawal.paymentReference || 'UTR-BANK-SETTLED'}.`,
        type: 'payment',
        link: `/dashboard/freelancer`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

    } else if (params.status === 'rejected' || params.status === 'failed' || params.status === 'reversed') {
      // RESTORE RESERVED BALANCE EXACTLY ONCE
      if (ledgerEntry) {
        ledgerEntry.status = 'failed';
        ledgerEntry.notes = params.failureReason || `Payout ${params.status}: funds restored to available balance.`;
        ledgerEntry.updatedAt = new Date().toISOString();
      }
      const tx = (this.state.transactions || []).find(t => t.referenceId === withdrawal.id);
      if (tx) tx.status = 'failed';

      // Record refund transaction
      this.addTransaction({
        id: `tx-rst-${Date.now()}`,
        userId: withdrawal.freelancerId,
        type: 'refund',
        amount: withdrawal.amount,
        status: 'completed',
        description: `Balance restored ($${withdrawal.amount}) due to payout ${params.status}: ${params.failureReason || 'Verification rejection'}`,
        referenceId: withdrawal.id,
        createdAt: new Date().toISOString()
      });

      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: withdrawal.freelancerId,
        title: `Withdrawal ${params.status === 'rejected' ? 'Rejected' : 'Failed'} — Balance Restored`,
        message: `Your withdrawal of $${withdrawal.amount.toLocaleString()} was ${params.status}. Reason: ${params.failureReason || 'Account mismatch'}. Funds have been restored to your available balance.`,
        type: 'payment',
        link: `/dashboard/freelancer`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.saveState();
    return { success: true, withdrawal };
  }

  // --- DISPUTES ---
  public getDisputes(): Dispute[] {
    return this.state.disputes;
  }

  public addDispute(d: Dispute): Dispute {
    this.state.disputes.unshift(d);
    this.saveState();
    return d;
  }

  public updateDisputeStatus(id: string, status: Dispute['status'], resolution?: string): Dispute | undefined {
    const d = this.state.disputes.find(item => item.id === id);
    if (!d) return undefined;
    d.status = status;
    if (resolution) d.resolution = resolution;
    this.saveState();
    return d;
  }
}

// Global singleton instance
const globalForDataStore = global as unknown as { dataStoreInstance?: DataStore };

export const db = globalForDataStore.dataStoreInstance || new DataStore();
if (process.env.NODE_ENV !== 'production') globalForDataStore.dataStoreInstance = db;
