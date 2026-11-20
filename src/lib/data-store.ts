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
  FreelancerEarningsSummary,
  FinancialJournalEntry,
  JournalEntryLine,
  FinancialAccountType,
  EscrowAccount,
  MilestoneEscrow,
  EscrowStatus,
  CommissionRule,
  TaxRule,
  TaxTransactionRecord,
  InvoiceRecord,
  InvoiceItem,
  FreelancerPayoutSettings,
  DisputeRecord,
  DisputeResolutionAction,
  FreelancerSearchFilters,
  FreelancerSearchResult,
  SearchSuggestionsResult
} from '@/types';
import { slugify } from '@/lib/utils';
import {
  toMinorUnits,
  fromMinorUnits,
  safeAdd,
  safeSubtract,
  validateDoubleEntry,
  calculateCommissionFee,
  calculateApplicableTaxes,
  generateNextInvoiceNumber,
  generateInvoiceHtml
} from './finance-engine';
import { PayoutGatewayService } from './payout-gateway';

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
  journalEntries: FinancialJournalEntry[];
  escrowAccounts: EscrowAccount[];
  commissionRules: CommissionRule[];
  taxRules: TaxRule[];
  taxTransactions: TaxTransactionRecord[];
  invoices: InvoiceRecord[];
  payoutSettings: FreelancerPayoutSettings[];
  disputeRecords: DisputeRecord[];
}

export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'development': 'programming-tech',
  'programming': 'programming-tech',
  'tech': 'programming-tech',
  'design': 'graphics-design',
  'graphics': 'graphics-design',
  'marketing': 'digital-marketing',
  'video': 'video-animation',
  'animation': 'video-animation',
  'writing': 'writing-translation',
  'translation': 'writing-translation',
  'audio': 'music-audio',
  'music': 'music-audio',
  'ai-automation': 'ai-services',
  'ai': 'ai-services',
  'data': 'data-analytics',
  'analytics': 'data-analytics',
  'engineering': 'engineering-architecture',
  'architecture': 'engineering-architecture',
  'lifestyle': 'lifestyle-consulting',
  'consulting': 'lifestyle-consulting',
  'other': 'lifestyle-consulting'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'trending',
    name: 'Trending',
    slug: 'trending',
    description: 'Fastest-growing services and viral freelancer capabilities dominating the ecosystem.',
    icon: 'Zap',
    isTrending: true,
    isFeatured: true,
    order: 1,
    subcategories: [
      'AI Agents', 'Next.js Development', 'Full Stack Development', 'UI/UX Design',
      '3D Animation', 'Video Editing', 'Search Engine Optimization', 'Logo Design',
      'Python Development', 'Cybersecurity', 'Generative AI', 'Performance Marketing'
    ],
    projectCount: 65,
    freelancerCount: 210,
    isActive: true
  },
  {
    id: 'graphics-design',
    name: 'Graphics & Design',
    slug: 'graphics-design',
    description: 'High-impact visual identity, spatial UI/UX, 3D assets and world-class branding.',
    icon: 'Palette',
    isFeatured: true,
    order: 2,
    subcategories: [
      'Logo Design', 'Brand Identity', 'Business Cards', 'UI/UX Design',
      'Website Design', 'App Design', 'Social Media Design', 'Banner Design',
      'Packaging Design', 'Illustration', '3D Design', 'Presentation Design', 'Print Design'
    ],
    projectCount: 48,
    freelancerCount: 164,
    isActive: true
  },
  {
    id: 'programming-tech',
    name: 'Programming & Tech',
    slug: 'programming-tech',
    description: 'Custom software engineering, cloud infrastructures, full-stack web and mobile apps.',
    icon: 'Code2',
    isFeatured: true,
    order: 3,
    subcategories: [
      'Website Development', 'Frontend Development', 'Backend Development', 'Full Stack Development',
      'React Development', 'Next.js Development', 'WordPress Development', 'Shopify Development',
      'E-commerce Development', 'Mobile App Development', 'Android Development', 'iOS Development',
      'Python Development', 'Java Development', 'Software Development', 'API Integration',
      'Database Development', 'Cybersecurity', 'Cloud & DevOps'
    ],
    projectCount: 82,
    freelancerCount: 295,
    isActive: true
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Data-backed customer acquisition, omni-channel campaigns and viral growth funnels.',
    icon: 'TrendingUp',
    isFeatured: true,
    order: 4,
    subcategories: [
      'Search Engine Optimization', 'Social Media Marketing', 'Google Ads', 'Meta Ads',
      'YouTube Marketing', 'Email Marketing', 'Content Marketing', 'Influencer Marketing',
      'Lead Generation', 'Performance Marketing', 'Marketing Strategy'
    ],
    projectCount: 36,
    freelancerCount: 118,
    isActive: true
  },
  {
    id: 'video-animation',
    name: 'Video & Animation',
    slug: 'video-animation',
    description: 'Cinematic visual storytelling, 3D motion graphics, viral short-form and product videos.',
    icon: 'Video',
    isFeatured: true,
    order: 5,
    subcategories: [
      'Video Editing', 'YouTube Video Editing', 'Reels and Shorts Editing', '2D Animation',
      '3D Animation', 'Motion Graphics', 'Explainer Videos', 'Logo Animation',
      'Product Videos', 'Visual Effects'
    ],
    projectCount: 42,
    freelancerCount: 135,
    isActive: true
  },
  {
    id: 'writing-translation',
    name: 'Writing & Translation',
    slug: 'writing-translation',
    description: 'Authoritative technical documentation, high-conversion copy and multi-lingual translation.',
    icon: 'FileText',
    order: 6,
    subcategories: [
      'Content Writing', 'Blog Writing', 'Copywriting', 'Technical Writing',
      'Website Content', 'Script Writing', 'Resume Writing', 'Translation',
      'Proofreading', 'Academic Writing'
    ],
    projectCount: 28,
    freelancerCount: 92,
    isActive: true
  },
  {
    id: 'music-audio',
    name: 'Music & Audio',
    slug: 'music-audio',
    description: 'Studio-grade voiceover production, custom sound design, jingles and audio mastering.',
    icon: 'Headphones',
    order: 7,
    subcategories: [
      'Voice Over', 'Podcast Editing', 'Audio Editing', 'Music Production',
      'Sound Design', 'Mixing & Mastering', 'Jingles', 'Background Music'
    ],
    projectCount: 22,
    freelancerCount: 68,
    isActive: true
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: 'Strategic advisory, executive financial models, market intelligence and ops management.',
    icon: 'Briefcase',
    order: 8,
    subcategories: [
      'Virtual Assistant', 'Data Entry', 'Business Plans', 'Market Research',
      'Project Management', 'Financial Analysis', 'Business Consulting',
      'Customer Support', 'Administrative Support'
    ],
    projectCount: 31,
    freelancerCount: 84,
    isActive: true
  },
  {
    id: 'ai-services',
    name: 'AI Services',
    slug: 'ai-services',
    description: 'Autonomous AI agents, enterprise LLM fine-tuning, computer vision and workflow automation.',
    icon: 'Cpu',
    isTrending: true,
    isFeatured: true,
    order: 9,
    subcategories: [
      'AI Development', 'AI Agents', 'AI Automation', 'Machine Learning',
      'Generative AI', 'ChatGPT Integration', 'LLM Integration', 'Computer Vision',
      'Natural Language Processing', 'Data Science', 'AI Chatbots'
    ],
    projectCount: 74,
    freelancerCount: 182,
    isActive: true
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    slug: 'data-analytics',
    description: 'Enterprise BI dashboards, predictive modeling, data pipelines and clean data engineering.',
    icon: 'BarChart3',
    order: 10,
    subcategories: [
      'Data Analysis', 'Data Visualization', 'Excel', 'Power BI',
      'Tableau', 'SQL', 'Data Engineering', 'Data Cleaning'
    ],
    projectCount: 34,
    freelancerCount: 96,
    isActive: true
  },
  {
    id: 'engineering-architecture',
    name: 'Engineering & Architecture',
    slug: 'engineering-architecture',
    description: 'Precision CAD modeling, industrial prototyping, interior concepts and architectural blueprints.',
    icon: 'Compass',
    order: 11,
    subcategories: [
      'CAD Design', '3D Modeling', 'Product Design', 'Architecture',
      'Interior Design', 'Mechanical Design', 'Electrical Design'
    ],
    projectCount: 26,
    freelancerCount: 72,
    isActive: true
  },
  {
    id: 'photography',
    name: 'Photography',
    slug: 'photography',
    description: 'Commercial product photography, luxury portraiture, photo retouching and color grade.',
    icon: 'Camera',
    order: 12,
    subcategories: [
      'Product Photography', 'Portrait Photography', 'Event Photography',
      'Photo Editing', 'Image Retouching', 'Commercial Photography'
    ],
    projectCount: 18,
    freelancerCount: 54,
    isActive: true
  },
  {
    id: 'lifestyle-consulting',
    name: 'Lifestyle & Consulting',
    slug: 'lifestyle-consulting',
    description: 'Executive leadership coaching, personal branding, fitness strategy and expert tutoring.',
    icon: 'Sparkles',
    order: 13,
    subcategories: [
      'Career Consulting', 'Business Coaching', 'Fitness Coaching',
      'Personal Development', 'Education & Tutoring', 'Professional Consulting'
    ],
    projectCount: 20,
    freelancerCount: 46,
    isActive: true
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
    verificationStatus: 'verified',
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
    verificationStatus: 'verified',
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
    verificationStatus: 'verified',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'user-freelancer-4',
    email: 'devon@gravitass.com',
    name: 'Devon Carter',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: false,
    activeRole: 'freelancer',
    isVerified: false,
    verificationStatus: 'pending',
    createdAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'user-freelancer-5',
    email: 'kavita@gravitass.com',
    name: 'Kavita Rao',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: false,
    activeRole: 'freelancer',
    isVerified: false,
    verificationStatus: 'pending',
    createdAt: '2026-02-12T11:20:00.000Z'
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
    verificationStatus: 'verified',
    createdAt: '2026-01-05T12:00:00.000Z'
  },
  {
    id: 'user-client-2',
    email: 'nexus@global.com',
    name: 'Nexus Ventures',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    role: 'client',
    isFreelancer: false,
    isClient: true,
    activeRole: 'client',
    isVerified: true,
    verificationStatus: 'verified',
    createdAt: '2026-01-20T09:00:00.000Z'
  },
  {
    id: 'user-freelancer-suspended',
    email: 'suspended.actor@gravitass.com',
    name: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    role: 'freelancer',
    isFreelancer: true,
    isClient: false,
    activeRole: 'freelancer',
    isVerified: false,
    isSuspended: true,
    suspensionReason: 'Multiple client complaints regarding deliverables plagiarism & off-platform solicitation.',
    verificationStatus: 'rejected',
    verificationRejectionReason: 'ID verification documents mismatched with profile tax details.',
    reportedCount: 3,
    complaints: [
      {
        id: 'comp-101',
        reporterId: 'user-client-1',
        reporterName: 'Aetheria Labs',
        reportedUserId: 'user-freelancer-suspended',
        reason: 'Attempted to bypass escrow payment via external crypto address',
        details: 'Sent telegram handle in milestone delivery chat asking for direct USDT payment.',
        createdAt: '2026-02-14T10:00:00.000Z',
        status: 'reviewed'
      }
    ],
    createdAt: '2026-01-25T16:00:00.000Z'
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
    verificationStatus: 'verified',
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
  autoPayoutFrequency: 'weekly',
  gstPercentage: 18,
  tdsPercentage: 1,
  sacCode: '998311',
  legalBusinessName: 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
  legalAddress: 'Level 14, Astralis Cyber Park, Sector 62, Noida, Uttar Pradesh, India - 201301',
  platformGstin: '07AAACG9928K1Z5',
  platformPan: 'AAACG9928K',
  escrowReviewPeriodDays: 14,
  updatedAt: new Date().toISOString()
};

export const INITIAL_COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'COMM-2026-v1',
    version: 'v2026.1',
    defaultPercentage: 10,
    categoryRates: {
      'programming-tech': 8,
      'graphics-design': 10,
      'ai-services': 7,
      'digital-marketing': 12,
      'video-animation': 10,
      'writing-translation': 11,
      'music-audio': 9,
      'business': 10,
      'data-analytics': 8,
      'engineering-architecture': 7,
      'photography': 10,
      'lifestyle-consulting': 12,
      'trending': 10
    },
    freelancerRates: {
      'user-freelancer-1': 6
    },
    promotionalPercentage: 5,
    promotionalStartDate: '2026-01-01T00:00:00.000Z',
    promotionalEndDate: '2026-12-31T23:59:59.000Z',
    promotionalCode: 'GRAVITASS2026',
    minFee: 50,
    maxFee: 25000,
    effectiveDate: '2026-01-01T00:00:00.000Z',
    description: 'Tiered production platform commission framework with category concessions & elite overrides',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'COMM-2025-ARCHIVED',
    version: 'v2025.4',
    defaultPercentage: 12,
    categoryRates: {
      'programming-tech': 10,
      'graphics-design': 12
    },
    freelancerRates: {},
    minFee: 100,
    maxFee: 20000,
    effectiveDate: '2025-06-01T00:00:00.000Z',
    description: 'Legacy Flat 12% Platform Rate (Archived for Historical Contracts)',
    isActive: false,
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-12-31T23:59:59.000Z'
  }
];

export const INITIAL_TAX_RULES: TaxRule[] = [
  {
    id: 'TAX-GST-COMM-18',
    name: 'GST on Platform Service Commission (18%)',
    type: 'gst_on_commission',
    ratePercentage: 18,
    cgstPercentage: 9,
    sgstPercentage: 9,
    igstPercentage: 18,
    appliesTo: 'platform_fee',
    panRequired: false,
    sacCode: '998311',
    legalSection: 'CGST Act 2017 - SAC 998311 Information Technology Software & Marketplace Intermediation Services',
    isEnabled: true,
    effectiveDate: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'TAX-TDS-194O-1',
    name: 'Section 194-O TDS on E-Commerce Marketplace Participant Payments',
    type: 'tds_194o',
    ratePercentage: 1,
    appliesTo: 'gross_project_amount',
    panRequired: true,
    thresholdAmount: 0,
    legalSection: 'Section 194-O of Income Tax Act 1961 (TDS on E-commerce operator payments)',
    isEnabled: true,
    effectiveDate: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_ESCROW_ACCOUNTS: EscrowAccount[] = [
  {
    id: 'ESC-DEMO-001',
    contractId: 'contract-demo-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    clientId: 'user-client-1',
    clientName: 'Aetheria Labs',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    totalGrossAmount: 5800,
    fundedAmount: 5800,
    releasedAmount: 2000,
    refundedAmount: 0,
    currency: 'USD',
    status: 'funds_secured',
    gatewayOrderId: 'order_sec_88419024',
    gatewayPaymentId: 'pay_sec_99410382',
    isDisputed: false,
    milestones: [
      {
        milestoneId: 'ms-demo-1',
        title: 'Architecture Specification & Vector Pipeline',
        amount: 2000,
        status: 'payment_released',
        fundedAt: '2026-02-13T09:00:00.000Z',
        approvedAt: '2026-02-14T12:00:00.000Z',
        releasedAt: '2026-02-14T12:00:00.000Z',
        releaseTxId: 'LED-DEMO-001'
      },
      {
        milestoneId: 'ms-demo-2',
        title: 'Agent Workflow Runtime & Evaluators',
        amount: 2000,
        status: 'client_review',
        fundedAt: '2026-02-13T09:00:00.000Z',
        submittedAt: '2026-02-17T14:00:00.000Z',
        autoReleaseDate: '2026-03-03T14:00:00.000Z'
      },
      {
        milestoneId: 'ms-demo-3',
        title: 'Production Deployment & Load Testing',
        amount: 1800,
        status: 'funds_secured',
        fundedAt: '2026-02-13T09:00:00.000Z'
      }
    ],
    createdAt: '2026-02-13T09:00:00.000Z',
    updatedAt: '2026-02-17T14:00:00.000Z'
  }
];

export const INITIAL_JOURNAL_ENTRIES: FinancialJournalEntry[] = [
  {
    id: 'JRN-DEMO-001',
    timestamp: '2026-02-13T09:00:00.000Z',
    referenceType: 'project_funding',
    referenceId: 'ESC-DEMO-001',
    contractId: 'contract-demo-1',
    projectId: 'proj-1',
    userId: 'user-client-1',
    lines: [
      { accountId: 'asset:gateway_clearing', accountName: 'Gateway Clearing Account', type: 'debit', amount: 5800, currency: 'USD' },
      { accountId: 'asset:escrow_vault', accountName: 'Escrow Vault Trust Account', type: 'credit', amount: 5800, currency: 'USD' }
    ],
    description: 'Client full contract escrow deposit funded for Autonomous Multi-Model LLM Orchestration Platform',
    immutable: true,
    createdAt: '2026-02-13T09:00:00.000Z'
  },
  {
    id: 'JRN-DEMO-002',
    timestamp: '2026-02-14T12:00:00.000Z',
    referenceType: 'milestone_release',
    referenceId: 'ms-demo-1',
    contractId: 'contract-demo-1',
    projectId: 'proj-1',
    userId: 'user-freelancer-1',
    lines: [
      { accountId: 'asset:escrow_vault', accountName: 'Escrow Vault Trust Account', type: 'debit', amount: 2000, currency: 'USD' },
      { accountId: 'liability:freelancer_payable', accountName: 'Freelancer Payable Account', type: 'credit', amount: 1780, currency: 'USD' },
      { accountId: 'revenue:platform_commission', accountName: 'Platform Commission Revenue', type: 'credit', amount: 200, currency: 'USD' },
      { accountId: 'liability:tax_payable_tds', accountName: 'TDS Payable u/s 194-O', type: 'credit', amount: 20, currency: 'USD' }
    ],
    description: 'Milestone 1 approved and released: Architecture Specification & Vector Pipeline',
    immutable: true,
    createdAt: '2026-02-14T12:00:00.000Z'
  }
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'INV-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    type: 'client_tax_invoice',
    status: 'paid',
    issueDate: '2026-02-13T09:00:00.000Z',
    contractId: 'contract-demo-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    milestoneId: 'all',
    supplier: {
      name: 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
      legalAddress: 'Level 14, Astralis Cyber Park, Sector 62, Noida, Uttar Pradesh, India - 201301',
      gstin: '07AAACG9928K1Z5',
      pan: 'AAACG9928K',
      email: 'finance@gravitass.work'
    },
    customer: {
      name: 'Aetheria Labs',
      legalAddress: 'Cyber Hub Building 10, DLF Phase 2, Gurugram, Haryana, India',
      gstin: '06AAACA1122B1Z3',
      email: 'client@gravitass.com'
    },
    items: [
      {
        id: 'itm-1',
        description: 'Escrow Funding: Autonomous Multi-Model LLM Orchestration Platform (3 Milestones)',
        sacHsnCode: '998311',
        quantity: 1,
        unitPrice: 5800,
        taxableAmount: 5800,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 5800
      }
    ],
    currency: 'USD',
    subtotal: 5800,
    taxTotal: 0,
    grandTotal: 5800,
    paymentReference: 'pay_sec_99410382',
    notes: 'Escrow funds secured in segregated trustee account. Governed by GRAVITASS Milestone Rules.',
    createdAt: '2026-02-13T09:00:00.000Z'
  },
  {
    id: 'INV-2026-0002',
    invoiceNumber: 'INV-2026-0002',
    type: 'platform_commission_invoice',
    status: 'paid',
    issueDate: '2026-02-14T12:00:00.000Z',
    contractId: 'contract-demo-1',
    projectId: 'proj-1',
    projectTitle: 'Autonomous Multi-Model LLM Orchestration Platform',
    milestoneId: 'ms-demo-1',
    supplier: {
      name: 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
      legalAddress: 'Level 14, Astralis Cyber Park, Sector 62, Noida, Uttar Pradesh, India - 201301',
      gstin: '07AAACG9928K1Z5',
      pan: 'AAACG9928K',
      email: 'finance@gravitass.work'
    },
    customer: {
      name: 'Elena Vance',
      legalAddress: 'Freelancer Cyber Tower, Bangalore, Karnataka, India',
      email: 'freelancer@gravitass.com'
    },
    items: [
      {
        id: 'itm-comm-1',
        description: 'Platform Intermediation Service Fee (10% of Milestone 1 Gross $2,000)',
        sacHsnCode: '998311',
        quantity: 1,
        unitPrice: 200,
        taxableAmount: 200,
        taxRate: 18,
        taxAmount: 36,
        totalAmount: 236
      }
    ],
    currency: 'USD',
    subtotal: 200,
    taxTotal: 36,
    grandTotal: 236,
    paymentReference: 'REF-GRAV-LLM941',
    notes: 'GST collected under Reverse Charge / Market Intermediation rules.',
    createdAt: '2026-02-14T12:00:00.000Z'
  }
];

export const INITIAL_PAYOUT_SETTINGS: FreelancerPayoutSettings[] = [
  {
    freelancerId: 'user-freelancer-1',
    preferredMethod: 'upi',
    frequency: 'weekly',
    minimumThreshold: 500,
    autoPayoutEnabled: true,
    payoutDetails: {
      accountHolderName: 'Elena Vance',
      upiId: 'elena.vance@oksbi',
      maskedUpi: 'ele***@oksbi',
      isVerified: true
    },
    panNumber: 'ABCDE1234F',
    notificationEmail: 'freelancer@gravitass.com',
    updatedAt: '2026-02-15T10:00:00.000Z'
  }
];

export const INITIAL_TAX_TRANSACTIONS: TaxTransactionRecord[] = [
  {
    id: 'TAX-DEMO-001',
    transactionId: 'LED-DEMO-001',
    referenceId: 'ms-demo-1',
    contractId: 'contract-demo-1',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    clientId: 'user-client-1',
    taxRuleId: 'TAX-TDS-194O-1',
    taxType: 'tds_194o',
    taxableAmount: 2000,
    ratePercentage: 1,
    taxAmount: 20,
    tdsAmount: 20,
    financialYear: '2025-2026',
    month: '2026-02',
    createdAt: '2026-02-14T12:00:00.000Z'
  },
  {
    id: 'TAX-DEMO-002',
    transactionId: 'INV-2026-0002',
    referenceId: 'ms-demo-1',
    contractId: 'contract-demo-1',
    freelancerId: 'user-freelancer-1',
    freelancerName: 'Elena Vance',
    clientId: 'user-client-1',
    taxRuleId: 'TAX-GST-COMM-18',
    taxType: 'gst_on_commission',
    taxableAmount: 200,
    ratePercentage: 18,
    taxAmount: 36,
    cgst: 18,
    sgst: 18,
    financialYear: '2025-2026',
    month: '2026-02',
    createdAt: '2026-02-14T12:00:00.000Z'
  }
];

export const INITIAL_DISPUTE_RECORDS: DisputeRecord[] = [];

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
    netAmount: 1780, // Net after 10% fee ($200) and 1% TDS ($20)
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
    netAmount: 3115,
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
    netAmount: 2225,
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

          // Merge categories ensuring all 13 core categories exist with their full subcategory taxonomies
          const mergedCategories: Category[] = INITIAL_CATEGORIES.map(c => ({ ...c }));
          if (Array.isArray(parsed.categories)) {
            for (const cat of parsed.categories) {
              const idx = mergedCategories.findIndex(c => c.id === cat.id || c.slug === cat.slug);
              if (idx >= 0) {
                mergedCategories[idx] = {
                  ...mergedCategories[idx],
                  ...cat,
                  // Keep the richest subcategory list
                  subcategories: Array.from(new Set([
                    ...(mergedCategories[idx].subcategories || []),
                    ...(cat.subcategories || [])
                  ]))
                };
              } else {
                mergedCategories.push(cat);
              }
            }
          }

          return {
            ...this.getDefaultState(),
            ...parsed,
            categories: mergedCategories,
            ledgerTransactions: parsed.ledgerTransactions && parsed.ledgerTransactions.length > 0
              ? parsed.ledgerTransactions
              : INITIAL_LEDGER_TRANSACTIONS,
            withdrawals: parsed.withdrawals && parsed.withdrawals.length > 0
              ? parsed.withdrawals
              : INITIAL_WITHDRAWALS,
            journalEntries: parsed.journalEntries && parsed.journalEntries.length > 0
              ? parsed.journalEntries
              : INITIAL_JOURNAL_ENTRIES,
            escrowAccounts: parsed.escrowAccounts && parsed.escrowAccounts.length > 0
              ? parsed.escrowAccounts
              : INITIAL_ESCROW_ACCOUNTS,
            commissionRules: parsed.commissionRules && parsed.commissionRules.length > 0
              ? parsed.commissionRules
              : INITIAL_COMMISSION_RULES,
            taxRules: parsed.taxRules && parsed.taxRules.length > 0
              ? parsed.taxRules
              : INITIAL_TAX_RULES,
            taxTransactions: parsed.taxTransactions && parsed.taxTransactions.length > 0
              ? parsed.taxTransactions
              : INITIAL_TAX_TRANSACTIONS,
            invoices: parsed.invoices && parsed.invoices.length > 0
              ? parsed.invoices
              : INITIAL_INVOICES,
            payoutSettings: parsed.payoutSettings && parsed.payoutSettings.length > 0
              ? parsed.payoutSettings
              : INITIAL_PAYOUT_SETTINGS,
            disputeRecords: parsed.disputeRecords && parsed.disputeRecords.length > 0
              ? parsed.disputeRecords
              : INITIAL_DISPUTE_RECORDS,
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
      platformSettings: DEFAULT_PLATFORM_SETTINGS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      escrowAccounts: INITIAL_ESCROW_ACCOUNTS,
      commissionRules: INITIAL_COMMISSION_RULES,
      taxRules: INITIAL_TAX_RULES,
      taxTransactions: INITIAL_TAX_TRANSACTIONS,
      invoices: INITIAL_INVOICES,
      payoutSettings: INITIAL_PAYOUT_SETTINGS,
      disputeRecords: INITIAL_DISPUTE_RECORDS
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

  // --- CATEGORIES & DISCOVERY ---
  public getCategories(options?: { featured?: boolean; trending?: boolean; includeInactive?: boolean }): Category[] {
    let cats = [...this.state.categories];
    if (!options?.includeInactive) {
      cats = cats.filter(c => c.isActive !== false);
    }
    if (options?.featured) {
      cats = cats.filter(c => c.isFeatured === true);
    }
    if (options?.trending) {
      cats = cats.filter(c => c.isTrending === true);
    }
    return cats.sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  public getCategoryById(id: string): Category | undefined {
    const direct = this.state.categories.find(c => c.id === id || c.slug === id);
    if (direct) return direct;
    const alias = CATEGORY_SLUG_ALIASES[id.toLowerCase()];
    if (alias) {
      return this.state.categories.find(c => c.slug === alias || c.id === alias);
    }
    return undefined;
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    const normalized = slug.toLowerCase().trim();
    const direct = this.state.categories.find(c => c.slug.toLowerCase() === normalized);
    if (direct) return direct;
    const alias = CATEGORY_SLUG_ALIASES[normalized];
    if (alias) {
      return this.state.categories.find(c => c.slug.toLowerCase() === alias);
    }
    return undefined;
  }

  public addCategory(cat: Category): Category {
    this.state.categories.push(cat);
    this.saveState();
    return cat;
  }

  public createCategory(data: Partial<Category>): Category {
    const name = data.name || 'New Category';
    const slug = data.slug || slugify(name);
    const newCategory: Category = {
      id: data.id || slug,
      name,
      slug,
      description: data.description || `Specialized ${name} services and verified industry experts on GRAVITASS.`,
      icon: data.icon || 'Sparkles',
      subcategories: data.subcategories && data.subcategories.length > 0 ? data.subcategories : ['General Consulting'],
      projectCount: data.projectCount || 0,
      freelancerCount: data.freelancerCount || 0,
      isFeatured: data.isFeatured ?? false,
      isTrending: data.isTrending ?? false,
      order: data.order ?? (this.state.categories.length + 1),
      isActive: data.isActive ?? true
    };
    this.state.categories.push(newCategory);
    this.saveState();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.state.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    this.state.categories[idx] = {
      ...this.state.categories[idx],
      ...updates
    };
    this.saveState();
    return this.state.categories[idx];
  }

  public deleteCategory(id: string): { success: boolean; message: string; deactivated?: boolean } {
    const category = this.getCategoryById(id);
    if (!category) {
      return { success: false, message: 'Category not found' };
    }

    // Safety check: verify if category has active projects or freelancers
    const activeProjects = (this.state.projects || []).filter(
      p => p.category === category.id || p.category === category.slug
    );
    const activeFreelancers = (this.state.freelancerProfiles || []).filter(
      f => f.mainCategory === category.id || f.mainCategory === category.slug
    );

    if (activeProjects.length > 0 || activeFreelancers.length > 0) {
      // Safe deactivation instead of hard deletion to maintain relational integrity
      category.isActive = false;
      this.updateCategory(category.id, { isActive: false });
      return {
        success: true,
        deactivated: true,
        message: `Category deactivated rather than permanently deleted because ${activeFreelancers.length} talent profiles and ${activeProjects.length} projects depend on it.`
      };
    }

    this.state.categories = this.state.categories.filter(c => c.id !== category.id && c.slug !== category.slug);
    this.saveState();
    return { success: true, message: `Category '${category.name}' removed successfully.` };
  }

  public searchFreelancers(filters: FreelancerSearchFilters = {}): FreelancerSearchResult {
    const profiles = [...(this.state.freelancerProfiles || [])];
    const categoryObj = filters.category ? this.getCategoryBySlug(filters.category) : undefined;
    const categorySlug = categoryObj ? categoryObj.slug : filters.category ? (CATEGORY_SLUG_ALIASES[filters.category.toLowerCase()] || filters.category.toLowerCase()) : undefined;

    let filtered = profiles.filter(profile => {
      // 1. Category Filter
      if (categorySlug) {
        const profileCat = (profile.mainCategory || '').toLowerCase();
        const mappedCat = CATEGORY_SLUG_ALIASES[profileCat] || profileCat;
        if (mappedCat !== categorySlug && profileCat !== categorySlug) {
          // Check if category is trending (all top freelancers qualify)
          if (categorySlug !== 'trending') {
            return false;
          }
        }
      }

      // 2. Subcategory Filter
      if (filters.subcategory) {
        const subFilter = filters.subcategory.toLowerCase().trim();
        const subSlug = slugify(subFilter);
        const matchesSubcategory =
          slugify(profile.subcategory || '').includes(subSlug) ||
          (profile.subcategory || '').toLowerCase().includes(subFilter) ||
          (profile.serviceTags || []).some(t => slugify(t).includes(subSlug) || t.toLowerCase().includes(subFilter)) ||
          (profile.skills || []).some(s => slugify(s).includes(subSlug) || s.toLowerCase().includes(subFilter));
        if (!matchesSubcategory) return false;
      }

      // 3. Query Text Search
      if (filters.query) {
        const q = filters.query.toLowerCase().trim();
        const matchesQuery =
          (profile.fullName || '').toLowerCase().includes(q) ||
          (profile.headline || '').toLowerCase().includes(q) ||
          (profile.bio || '').toLowerCase().includes(q) ||
          (profile.subcategory || '').toLowerCase().includes(q) ||
          (profile.skills || []).some(s => s.toLowerCase().includes(q)) ||
          (profile.serviceTags || []).some(t => t.toLowerCase().includes(q)) ||
          (profile.location || '').toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 4. Skills Filter
      if (filters.skill) {
        const sk = filters.skill.toLowerCase().trim();
        if (!(profile.skills || []).some(s => s.toLowerCase().includes(sk))) {
          return false;
        }
      }
      if (filters.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some(reqSkill =>
          (profile.skills || []).some(s => s.toLowerCase() === reqSkill.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // 5. Price in INR Filter
      const startingPrice = profile.startingPriceINR || (profile.minBudget ? profile.minBudget * 83 : 1500);
      if (filters.minPriceINR !== undefined && startingPrice < filters.minPriceINR) {
        return false;
      }
      if (filters.maxPriceINR !== undefined && startingPrice > filters.maxPriceINR) {
        return false;
      }

      // 6. Rating Filter
      if (filters.minRating !== undefined && (profile.rating || 0) < filters.minRating) {
        return false;
      }

      // 7. Delivery Days Filter
      if (filters.deliveryDays !== undefined) {
        const days = profile.deliveryDays || 3;
        if (days > filters.deliveryDays) return false;
      }

      // 8. Availability Filter
      if (filters.availability && filters.availability !== 'all') {
        if (profile.availability !== filters.availability) return false;
      }

      // 9. Verified Only Filter
      if (filters.verifiedOnly) {
        if (!(profile.badges || []).includes('verified')) return false;
      }

      // 10. Experience Level Filter
      if (filters.experienceLevel && filters.experienceLevel !== 'all') {
        if (profile.experienceLevel !== filters.experienceLevel) return false;
      }

      return true;
    });

    // Sorting
    const sortBy = filters.sortBy || 'recommended';
    filtered.sort((a, b) => {
      const priceA = a.startingPriceINR || (a.minBudget ? a.minBudget * 83 : 1500);
      const priceB = b.startingPriceINR || (b.minBudget ? b.minBudget * 83 : 1500);

      switch (sortBy) {
        case 'top_rated':
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'experience':
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
        case 'recent':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'recommended':
        default: {
          const scoreA = a.performanceScore?.overallScore || a.rating * 20;
          const scoreB = b.performanceScore?.overallScore || b.rating * 20;
          return scoreB - scoreA;
        }
      }
    });

    // Pagination
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 12);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      freelancers: paginated,
      total,
      page,
      limit,
      totalPages,
      category: categoryObj,
      matchedSubcategory: filters.subcategory
    };
  }

  public getSearchSuggestions(query: string = ''): SearchSuggestionsResult {
    const q = query.toLowerCase().trim();
    const categories = this.getCategories();
    const popularSearches = [
      'AI Agents', 'Full Stack Development', 'Next.js Development', 'Logo Design',
      'Video Editing', 'Search Engine Optimization', '3D Animation', 'Cybersecurity'
    ];

    if (!q) {
      return {
        query: '',
        categories: categories.slice(0, 6).map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          url: `/freelancers/${c.slug}`
        })),
        subcategories: [
          { name: 'AI Agents', slug: 'ai-agents', categoryName: 'AI Services', categorySlug: 'ai-services', url: '/freelancers/ai-services/ai-agents' },
          { name: 'Next.js Development', slug: 'next-js-development', categoryName: 'Programming & Tech', categorySlug: 'programming-tech', url: '/freelancers/programming-tech/next-js-development' },
          { name: 'UI/UX Design', slug: 'ui-ux-design', categoryName: 'Graphics & Design', categorySlug: 'graphics-design', url: '/freelancers/graphics-design/ui-ux-design' },
          { name: '3D Animation', slug: '3d-animation', categoryName: 'Video & Animation', categorySlug: 'video-animation', url: '/freelancers/video-animation/3d-animation' }
        ],
        freelancers: [],
        skills: [
          { skill: 'Next.js', url: '/freelancers/programming-tech?skill=Next.js' },
          { skill: 'Python', url: '/freelancers/programming-tech?skill=Python' },
          { skill: 'Figma', url: '/freelancers/graphics-design?skill=Figma' },
          { skill: 'PyTorch', url: '/freelancers/ai-services?skill=PyTorch' }
        ],
        popularSearches
      };
    }

    // Matching categories
    const matchedCategories = categories
      .filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        url: `/freelancers/${c.slug}`
      }));

    // Matching subcategories across all categories
    const matchedSubcategories: { name: string; slug: string; categoryName: string; categorySlug: string; url: string }[] = [];
    for (const cat of categories) {
      for (const sub of cat.subcategories || []) {
        if (sub.toLowerCase().includes(q) || slugify(sub).includes(slugify(q))) {
          matchedSubcategories.push({
            name: sub,
            slug: slugify(sub),
            categoryName: cat.name,
            categorySlug: cat.slug,
            url: `/freelancers/${cat.slug}/${slugify(sub)}`
          });
        }
        if (matchedSubcategories.length >= 8) break;
      }
      if (matchedSubcategories.length >= 8) break;
    }

    // Matching skills
    const allSkills = new Set<string>();
    for (const p of this.state.freelancerProfiles || []) {
      for (const s of p.skills || []) {
        if (s.toLowerCase().includes(q)) {
          allSkills.add(s);
        }
      }
    }
    const matchedSkills = Array.from(allSkills).slice(0, 5).map(skill => ({
      skill,
      url: `/freelancers?query=${encodeURIComponent(skill)}`
    }));

    // Matching freelancers
    const matchedFreelancers = (this.state.freelancerProfiles || [])
      .filter(f =>
        f.fullName.toLowerCase().includes(q) ||
        f.headline.toLowerCase().includes(q) ||
        (f.skills || []).some(s => s.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map(f => ({
        id: f.id,
        name: f.fullName,
        headline: f.headline,
        avatarUrl: f.avatarUrl,
        rating: f.rating,
        startingPriceINR: f.startingPriceINR || (f.minBudget ? f.minBudget * 83 : 1500),
        url: `/freelancers?id=${f.id}`
      }));

    return {
      query: q,
      categories: matchedCategories,
      subcategories: matchedSubcategories,
      freelancers: matchedFreelancers,
      skills: matchedSkills,
      popularSearches: popularSearches.filter(p => p.toLowerCase().includes(q)).slice(0, 3)
    };
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
    const escrows = (this.state.escrowAccounts || []).filter(e => e.freelancerId === freelancerId && !e.isDisputed);
    const taxes = (this.state.taxTransactions || []).filter(t => t.freelancerId === freelancerId && t.taxType === 'tds_194o');
    const settings = this.getPayoutSettings(freelancerId);

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

    // 6. Escrow-Locked Project Funds (Secured by clients, pending work release)
    const escrowLockedEarnings = escrows.reduce((sum, e) => {
      const unreleased = Math.max(0, (e.fundedAmount || 0) - (e.releasedAmount || 0) - (e.refundedAmount || 0));
      return sum + unreleased;
    }, 0);

    // 7. Cumulative TDS Withheld (Section 194-O)
    const tdsWithheldTotal = taxes.reduce((sum, t) => sum + (t.tdsAmount || t.taxAmount || 0), 0);

    // 8. Available Balance = Lifetime Net - Total Withdrawn - Processing Withdrawals
    const availableBalance = Math.max(0, Number((lifetimeEarnings - totalWithdrawn - processingWithdrawals).toFixed(2)));

    // Next scheduled payout projection
    let nextScheduledPayoutDate = 'Manual Dispatches Only';
    if (settings.autoPayoutEnabled) {
      const now = new Date();
      if (settings.frequency === 'daily') {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        nextScheduledPayoutDate = tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (settings.frequency === 'weekly') {
        // Next Friday
        const day = now.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        const nextFri = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
        nextScheduledPayoutDate = `Every Friday (${nextFri.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      } else if (settings.frequency === 'monthly') {
        // 1st of next month
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        nextScheduledPayoutDate = `1st of Month (${nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      }
    }

    return {
      lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
      availableBalance,
      pendingApprovalEarnings: Number(pendingApprovalEarnings.toFixed(2)),
      processingWithdrawals: Number(processingWithdrawals.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      failedPayments: Number(failedPayments.toFixed(2)),
      escrowLockedEarnings: Number(escrowLockedEarnings.toFixed(2)),
      tdsWithheldTotal: Number(tdsWithheldTotal.toFixed(2)),
      nextScheduledPayoutDate,
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

    // Dynamic Platform Commission from Active Commission Rule & Project Category
    const project = this.getProjectById(contract.projectId);
    const activeRule = (this.state.commissionRules || []).find(r => r.isActive) || INITIAL_COMMISSION_RULES[0];
    const commCalc = calculateCommissionFee({
      grossAmount,
      category: project?.category,
      freelancerId: contract.freelancerId,
      rule: activeRule
    });

    const commissionPercentage = commCalc.effectivePercentage;
    const platformFee = commCalc.commissionFee;
    const netAmount = commCalc.freelancerNetBeforeTax;

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
      commissionRuleId: commCalc.ruleId,
      commissionRuleVersion: commCalc.ruleVersion,
      appliedRate: commCalc.effectivePercentage,
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
      const ifsc = params.payoutDetails.ifsc || (params.payoutDetails as any).ifscCode || (params.payoutDetails as any).bankAccount?.ifscCode;
      const accountNumber = params.payoutDetails.accountNumber || (params.payoutDetails as any).bankAccount?.accountNumber;
      if (!accountNumber || !ifsc) {
        return { success: false, error: 'Bank account number and IFSC code are required for bank payout.' };
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(ifsc.trim())) {
        return { success: false, error: 'Invalid Indian Financial System Code (IFSC). Format: 4 letters, 0, 6 characters (e.g. HDFC0001234).' };
      }
    } else if (params.method === 'upi') {
      const upi = params.payoutDetails.upiId || (params.payoutDetails as any).vpa || (params.payoutDetails as any).upi?.vpa;
      if (!upi || !/^[\w.-]+@[\w.-]+$/.test(upi.trim())) {
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

      // Record Double-Entry Journal for Freelancer Payout:
      // Debit: Freelancer Payable (liability settled)
      // Credit: Gateway Clearing (asset disbursed) + Processing Fee (if any)
      const pLines: JournalEntryLine[] = [
        {
          accountId: 'liability:freelancer_payable',
          accountName: 'Freelancer Payable Account',
          type: 'debit',
          amount: withdrawal.amount,
          currency: 'USD'
        },
        {
          accountId: 'asset:gateway_clearing',
          accountName: 'Payment Gateway Clearing Account',
          type: 'credit',
          amount: withdrawal.finalAmount,
          currency: 'USD'
        }
      ];
      if (withdrawal.fee > 0) {
        pLines.push({
          accountId: 'revenue:platform_commission',
          accountName: 'Withdrawal Processing Fee',
          type: 'credit',
          amount: withdrawal.fee,
          currency: 'USD'
        });
      }

      this.recordJournalEntry({
        referenceType: 'freelancer_payout',
        referenceId: withdrawal.id,
        userId: withdrawal.freelancerId,
        description: `Freelancer Payout Disbursed to ${withdrawal.freelancerName} ($${withdrawal.finalAmount}) via ${withdrawal.method.toUpperCase()} (Ref: ${withdrawal.paymentReference || 'UTR-BANK-SETTLED'})`,
        lines: pLines
      });

      // Generate Payout Statement Invoice
      const settings = this.getPlatformSettings();
      const pInvNumber = generateNextInvoiceNumber(this.state.invoices || [], 'PAY');
      const pInvoice: InvoiceRecord = {
        id: pInvNumber,
        invoiceNumber: pInvNumber,
        type: 'freelancer_payout_statement',
        status: 'paid',
        issueDate: new Date().toISOString(),
        supplier: {
          name: settings.legalBusinessName || 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
          legalAddress: settings.legalAddress || 'Level 14, Astralis Cyber Park, Sector 62, Noida, India',
          gstin: settings.platformGstin,
          pan: settings.platformPan,
          email: 'finance@gravitass.work'
        },
        customer: {
          name: withdrawal.freelancerName,
          legalAddress: 'Verified Sovereign Specialist',
          email: 'freelancer@gravitass.com'
        },
        items: [
          {
            id: `item-${Date.now()}`,
            description: `Freelancer Earnings Payout via ${withdrawal.method.toUpperCase()} (${withdrawal.paymentReference || 'UTR-SETTLED'})`,
            quantity: 1,
            unitPrice: withdrawal.amount,
            taxableAmount: withdrawal.amount,
            taxRate: 0,
            taxAmount: 0,
            totalAmount: withdrawal.amount
          }
        ],
        currency: 'USD',
        subtotal: withdrawal.amount,
        taxTotal: 0,
        grandTotal: withdrawal.amount,
        paymentReference: withdrawal.paymentReference,
        notes: `Settled via Indian Banking/UPI network to ${withdrawal.payoutDetails.maskedAccount || withdrawal.payoutDetails.maskedUpi || 'verified destination'}.`,
        createdAt: new Date().toISOString()
      };
      if (!this.state.invoices) this.state.invoices = [];
      this.state.invoices.unshift(pInvoice);

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

  // ==========================================
  // MODULE 1 — CENTRAL JOURNAL & DOUBLE ENTRY
  // ==========================================

  public recordJournalEntry(params: Omit<FinancialJournalEntry, 'id' | 'timestamp' | 'immutable' | 'createdAt'>): FinancialJournalEntry {
    const validation = validateDoubleEntry(params.lines);
    if (!validation.isValid) {
      throw new Error(`Double-entry balance mismatch! Debits ($${validation.debitTotal}) do not equal Credits ($${validation.creditTotal}). Diff: $${validation.difference}`);
    }

    const entry: FinancialJournalEntry = {
      id: `JRN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      contractId: params.contractId,
      projectId: params.projectId,
      userId: params.userId,
      lines: params.lines,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      immutable: true,
      createdAt: new Date().toISOString()
    };

    if (!this.state.journalEntries) this.state.journalEntries = [];
    this.state.journalEntries.unshift(entry);
    this.saveState();
    return entry;
  }

  public getJournalEntries(filters?: { accountId?: FinancialAccountType; referenceType?: string; contractId?: string }): FinancialJournalEntry[] {
    let entries = this.state.journalEntries || [];
    if (filters?.accountId) {
      entries = entries.filter(e => e.lines.some(l => l.accountId === filters.accountId));
    }
    if (filters?.referenceType) {
      entries = entries.filter(e => e.referenceType === filters.referenceType);
    }
    if (filters?.contractId) {
      entries = entries.filter(e => e.contractId === filters.contractId);
    }
    return entries;
  }

  // ==========================================
  // MODULE 2 — ESCROW & PAYMENT PROTECTION
  // ==========================================

  public getEscrowAccounts(): EscrowAccount[] {
    return this.state.escrowAccounts || [];
  }

  public getEscrowByContractId(contractId: string): EscrowAccount | undefined {
    return (this.state.escrowAccounts || []).find(e => e.contractId === contractId);
  }

  public fundProjectEscrow(params: {
    contractId: string;
    amount: number;
    paymentReference: string;
    milestoneId?: string;
  }): { success: boolean; escrow?: EscrowAccount; invoice?: InvoiceRecord; error?: string } {
    const contract = this.getContractById(params.contractId);
    if (!contract) return { success: false, error: 'Contract not found' };

    let escrow = this.getEscrowByContractId(params.contractId);
    const now = new Date().toISOString();

    if (!escrow) {
      escrow = {
        id: `ESC-${Date.now()}`,
        contractId: contract.id,
        projectId: contract.projectId,
        projectTitle: contract.projectTitle,
        clientId: contract.clientId,
        clientName: contract.clientName,
        freelancerId: contract.freelancerId,
        freelancerName: contract.freelancerName,
        totalGrossAmount: contract.totalAmount,
        fundedAmount: 0,
        releasedAmount: 0,
        refundedAmount: 0,
        currency: 'USD',
        status: 'payment_confirmed',
        gatewayOrderId: `ord_${Date.now().toString(36)}`,
        gatewayPaymentId: params.paymentReference,
        isDisputed: false,
        milestones: contract.milestones.map(m => ({
          milestoneId: m.id,
          title: m.title,
          amount: m.amount,
          status: 'funds_secured',
          fundedAt: now
        })),
        createdAt: now,
        updatedAt: now
      };
      if (!this.state.escrowAccounts) this.state.escrowAccounts = [];
      this.state.escrowAccounts.unshift(escrow);
    }

    // Update escrow amounts
    escrow.fundedAmount = safeAdd(escrow.fundedAmount, params.amount);
    escrow.status = 'funds_secured';
    escrow.updatedAt = now;

    // Record Double-Entry Journal:
    // Debit Gateway Clearing (asset), Credit Escrow Vault (asset trust)
    this.recordJournalEntry({
      referenceType: 'project_funding',
      referenceId: escrow.id,
      contractId: contract.id,
      projectId: contract.projectId,
      userId: contract.clientId,
      description: `Client Escrow Deposit for "${contract.projectTitle}" (Ref: ${params.paymentReference})`,
      lines: [
        {
          accountId: 'asset:gateway_clearing',
          accountName: 'Payment Gateway Clearing Account',
          type: 'debit',
          amount: params.amount,
          currency: 'USD'
        },
        {
          accountId: 'asset:escrow_vault',
          accountName: 'GRAVITASS Escrow Vault Trust',
          type: 'credit',
          amount: params.amount,
          currency: 'USD'
        }
      ]
    });

    // Generate Client Tax Invoice
    const settings = this.getPlatformSettings();
    const invoiceNumber = generateNextInvoiceNumber(this.state.invoices || [], 'INV');
    const invoice: InvoiceRecord = {
      id: invoiceNumber,
      invoiceNumber,
      type: 'client_tax_invoice',
      status: 'paid',
      issueDate: now,
      contractId: contract.id,
      projectId: contract.projectId,
      projectTitle: contract.projectTitle,
      milestoneId: params.milestoneId || 'all',
      supplier: {
        name: settings.legalBusinessName || 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
        legalAddress: settings.legalAddress || 'Level 14, Astralis Cyber Park, Sector 62, Noida, India',
        gstin: settings.platformGstin,
        pan: settings.platformPan,
        email: 'finance@gravitass.work'
      },
      customer: {
        name: contract.clientName,
        legalAddress: 'Verified Enterprise Client',
        email: 'client@gravitass.com'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: `Escrow Fund Deposit: ${contract.projectTitle}`,
          sacHsnCode: settings.sacCode || '998311',
          quantity: 1,
          unitPrice: params.amount,
          taxableAmount: params.amount,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: params.amount
        }
      ],
      currency: 'USD',
      subtotal: params.amount,
      taxTotal: 0,
      grandTotal: params.amount,
      paymentReference: params.paymentReference,
      notes: 'Funds held in segregated escrow reserve pending milestone completion and verification.',
      createdAt: now
    };

    if (!this.state.invoices) this.state.invoices = [];
    this.state.invoices.unshift(invoice);

    // Audit transaction
    this.addTransaction({
      id: `tx-fnd-${Date.now()}`,
      userId: contract.clientId,
      type: 'deposit',
      amount: params.amount,
      status: 'completed',
      description: `Escrow Funded ($${params.amount}) for "${contract.projectTitle}"`,
      referenceId: escrow.id,
      createdAt: now
    });

    this.saveState();
    return { success: true, escrow, invoice };
  }

  public releaseMilestoneEscrow(params: {
    contractId: string;
    milestoneId: string;
    approvedBy: string;
  }): { success: boolean; escrow?: EscrowAccount; ledger?: LedgerTransaction; invoice?: InvoiceRecord; error?: string } {
    const contract = this.getContractById(params.contractId);
    if (!contract) return { success: false, error: 'Contract not found' };

    let escrow = this.getEscrowByContractId(params.contractId);
    if (!escrow) {
      // Auto-initialize if not existing
      const autoFund = this.fundProjectEscrow({
        contractId: contract.id,
        amount: contract.totalAmount,
        paymentReference: `AUTO-INIT-${Date.now().toString(36).toUpperCase()}`
      });
      escrow = autoFund.escrow!;
    }

    if (escrow.isDisputed) {
      return { success: false, error: 'Escrow is currently locked due to an active legal/contract dispute.' };
    }

    const ms = contract.milestones.find(m => m.id === params.milestoneId);
    const msAmount = ms ? ms.amount : (contract.totalAmount - (contract.paidAmount || 0));

    if (msAmount <= 0) {
      return { success: false, error: 'No payable amount for this milestone.' };
    }

    // 1. Commission Calculation from Active Rules
    const project = this.getProjectById(contract.projectId);
    const activeRule = (this.state.commissionRules || []).find(r => r.isActive) || INITIAL_COMMISSION_RULES[0];
    const commissionCalc = calculateCommissionFee({
      grossAmount: msAmount,
      category: project?.category,
      freelancerId: contract.freelancerId,
      rule: activeRule
    });

    // 2. Tax Calculation (GST on Platform Commission + Section 194-O TDS on Participant Gross)
    const freelancerProfile = this.getFreelancerById(contract.freelancerId);
    const taxCalc = calculateApplicableTaxes({
      grossAmount: msAmount,
      platformFee: commissionCalc.commissionFee,
      freelancerLifetimeEarnings: freelancerProfile?.totalEarnings || 0,
      taxRules: this.state.taxRules || INITIAL_TAX_RULES
    });

    const netAmount = taxCalc.netFreelancerPayable;
    const now = new Date().toISOString();

    // 3. Double-Entry Journal Entry
    // Debit Escrow Vault (gross) -> Credit Freelancer Payable (net) + Platform Commission + TDS + GST
    const journalLines: JournalEntryLine[] = [
      {
        accountId: 'asset:escrow_vault',
        accountName: 'Escrow Vault Trust',
        type: 'debit',
        amount: msAmount,
        currency: 'USD'
      },
      {
        accountId: 'liability:freelancer_payable',
        accountName: 'Freelancer Payable Account',
        type: 'credit',
        amount: netAmount,
        currency: 'USD'
      },
      {
        accountId: 'revenue:platform_commission',
        accountName: 'Platform Service Revenue',
        type: 'credit',
        amount: commissionCalc.commissionFee,
        currency: 'USD'
      }
    ];

    if (taxCalc.tdsAmount > 0) {
      journalLines.push({
        accountId: 'liability:tax_payable_tds',
        accountName: 'TDS Payable u/s 194-O',
        type: 'credit',
        amount: taxCalc.tdsAmount,
        currency: 'USD'
      });
    }

    if (taxCalc.gstOnCommission > 0) {
      journalLines.push({
        accountId: 'liability:tax_payable_gst',
        accountName: 'GST Output Tax Payable',
        type: 'credit',
        amount: taxCalc.gstOnCommission,
        currency: 'USD'
      });
    }

    // Verify balance
    const validation = validateDoubleEntry(journalLines);
    if (!validation.isValid) {
      // Adjust minor cents rounding into platform commission to maintain absolute double-entry balance
      const roundingAdj = validation.difference;
      const commLine = journalLines.find(l => l.accountId === 'revenue:platform_commission');
      if (commLine) {
        commLine.amount = validation.debitTotal > validation.creditTotal
          ? safeAdd(commLine.amount, roundingAdj)
          : safeSubtract(commLine.amount, roundingAdj);
      }
    }

    this.recordJournalEntry({
      referenceType: 'milestone_release',
      referenceId: ms?.id || contract.id,
      contractId: contract.id,
      projectId: contract.projectId,
      userId: contract.freelancerId,
      description: `Milestone Release for "${ms?.title || contract.projectTitle}" (Gross: $${msAmount}, Net: $${netAmount})`,
      lines: journalLines
    });

    // 4. Tax Transaction Record
    if (taxCalc.tdsAmount > 0) {
      const taxRecord: TaxTransactionRecord = {
        id: `TAX-${Date.now()}-TDS`,
        transactionId: `TX-REL-${Date.now()}`,
        referenceId: ms?.id || contract.id,
        contractId: contract.id,
        freelancerId: contract.freelancerId,
        freelancerName: contract.freelancerName,
        clientId: contract.clientId,
        taxRuleId: taxCalc.appliedTdsRule?.id || 'TAX-TDS-194O-1',
        taxType: 'tds_194o',
        taxableAmount: msAmount,
        ratePercentage: taxCalc.appliedTdsRule?.ratePercentage || 1,
        taxAmount: taxCalc.tdsAmount,
        tdsAmount: taxCalc.tdsAmount,
        financialYear: '2025-2026',
        month: now.slice(0, 7),
        createdAt: now
      };
      if (!this.state.taxTransactions) this.state.taxTransactions = [];
      this.state.taxTransactions.unshift(taxRecord);
    }

    // 5. Generate Platform Service Fee Invoice
    const settings = this.getPlatformSettings();
    const invoiceNumber = generateNextInvoiceNumber(this.state.invoices || [], 'INV');
    const invoice: InvoiceRecord = {
      id: invoiceNumber,
      invoiceNumber,
      type: 'platform_commission_invoice',
      status: 'paid',
      issueDate: now,
      contractId: contract.id,
      projectId: contract.projectId,
      projectTitle: contract.projectTitle,
      milestoneId: ms?.id,
      supplier: {
        name: settings.legalBusinessName || 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
        legalAddress: settings.legalAddress || 'Level 14, Astralis Cyber Park, Sector 62, Noida, India',
        gstin: settings.platformGstin,
        pan: settings.platformPan,
        email: 'finance@gravitass.work'
      },
      customer: {
        name: contract.freelancerName,
        legalAddress: 'Verified Sovereign Specialist',
        email: 'freelancer@gravitass.com'
      },
      items: [
        {
          id: `item-comm-${Date.now()}`,
          description: `Platform Commission Fee (${commissionCalc.effectivePercentage}% on Milestone Gross $${msAmount})`,
          sacHsnCode: settings.sacCode || '998311',
          quantity: 1,
          unitPrice: commissionCalc.commissionFee,
          taxableAmount: commissionCalc.commissionFee,
          taxRate: taxCalc.appliedGstRule?.ratePercentage || 18,
          taxAmount: taxCalc.gstOnCommission,
          totalAmount: safeAdd(commissionCalc.commissionFee, taxCalc.gstOnCommission)
        }
      ],
      currency: 'USD',
      subtotal: commissionCalc.commissionFee,
      taxTotal: taxCalc.gstOnCommission,
      grandTotal: safeAdd(commissionCalc.commissionFee, taxCalc.gstOnCommission),
      paymentReference: `REF-GRAV-${Date.now().toString(36).toUpperCase()}`,
      notes: `Section 194-O TDS withheld: $${taxCalc.tdsAmount}. Tax compliance auto-filed.`,
      createdAt: now
    };
    if (!this.state.invoices) this.state.invoices = [];
    this.state.invoices.unshift(invoice);

    // 6. Update Ledger & Freelancer Profile
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
      milestoneTitle: ms?.title || 'Contract Milestone',
      grossAmount: msAmount,
      commissionPercentage: commissionCalc.effectivePercentage,
      platformFee: commissionCalc.commissionFee,
      netAmount,
      status: 'available',
      transactionReference: invoice.paymentReference || `REF-GRAV-${Date.now().toString(36).toUpperCase()}`,
      createdAt: now,
      updatedAt: now
    };
    if (!this.state.ledgerTransactions) this.state.ledgerTransactions = [];
    this.state.ledgerTransactions.unshift(ledgerEntry);

    // Update Escrow allocation
    escrow.releasedAmount = safeAdd(escrow.releasedAmount, msAmount);
    if (ms) {
      ms.status = 'approved';
      const escMs = escrow.milestones.find(m =>
        m.milestoneId === ms.id ||
        m.milestoneId === params.milestoneId ||
        m.milestoneId === `ms-demo-${ms.id.replace('ms-', '')}` ||
        m.title.toLowerCase().includes(ms.title.slice(0, 10).toLowerCase())
      );
      if (escMs) {
        escMs.status = 'payment_released';
        escMs.releasedAt = now;
        escMs.releaseTxId = ledgerEntry.id;
      }
    }
    if (escrow.releasedAmount >= escrow.fundedAmount) {
      escrow.status = 'payment_released';
    }
    escrow.updatedAt = now;

    // Update Contract
    contract.paidAmount = safeAdd(contract.paidAmount || 0, msAmount);
    this.updateContract(contract.id, contract);

    // Update profile
    if (freelancerProfile) {
      freelancerProfile.totalEarnings = safeAdd(freelancerProfile.totalEarnings || 0, netAmount);
      this.saveFreelancerProfile(freelancerProfile);
    }

    // Notify
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: contract.freelancerId,
      title: 'Milestone Released to Available Balance!',
      message: `$${netAmount.toLocaleString()} credited for "${ms?.title || contract.projectTitle}". (Gross: $${msAmount}, Platform Fee: $${commissionCalc.commissionFee}, TDS: $${taxCalc.tdsAmount}).`,
      type: 'payment',
      link: '/dashboard/freelancer',
      isRead: false,
      createdAt: now
    });

    this.saveState();
    return { success: true, escrow, ledger: ledgerEntry, invoice };
  }

  public refundEscrow(params: {
    contractId: string;
    amount: number;
    reason: string;
    approvedBy: string;
  }): { success: boolean; refundCreditNote?: InvoiceRecord; error?: string } {
    const escrow = this.getEscrowByContractId(params.contractId);
    if (!escrow) return { success: false, error: 'Escrow account not found' };

    const unreleased = Math.max(0, escrow.fundedAmount - escrow.releasedAmount - escrow.refundedAmount);
    if (params.amount > unreleased) {
      return { success: false, error: `Refund amount ($${params.amount}) exceeds unreleased escrow funds ($${unreleased}).` };
    }

    const now = new Date().toISOString();
    escrow.refundedAmount = safeAdd(escrow.refundedAmount, params.amount);
    if (escrow.refundedAmount + escrow.releasedAmount >= escrow.fundedAmount) {
      escrow.status = 'refunded';
    } else {
      escrow.status = 'refund_processing';
    }
    escrow.updatedAt = now;

    // Double-Entry Journal:
    // Debit Escrow Vault (reducing asset trust), Credit Gateway Clearing (dispatched to client)
    this.recordJournalEntry({
      referenceType: 'refund',
      referenceId: escrow.id,
      contractId: escrow.contractId,
      projectId: escrow.projectId,
      userId: escrow.clientId,
      description: `Escrow Refund to Client: "${escrow.projectTitle}" (${params.reason})`,
      lines: [
        {
          accountId: 'asset:escrow_vault',
          accountName: 'Escrow Vault Trust',
          type: 'debit',
          amount: params.amount,
          currency: 'USD'
        },
        {
          accountId: 'asset:gateway_clearing',
          accountName: 'Payment Gateway Clearing Account',
          type: 'credit',
          amount: params.amount,
          currency: 'USD'
        }
      ]
    });

    // Generate Refund Credit Note
    const settings = this.getPlatformSettings();
    const creditNoteNum = generateNextInvoiceNumber(this.state.invoices || [], 'CRN');
    const creditNote: InvoiceRecord = {
      id: creditNoteNum,
      invoiceNumber: creditNoteNum,
      type: 'refund_credit_note',
      status: 'refunded',
      issueDate: now,
      contractId: escrow.contractId,
      projectId: escrow.projectId,
      projectTitle: escrow.projectTitle,
      supplier: {
        name: settings.legalBusinessName || 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
        legalAddress: settings.legalAddress || 'Level 14, Astralis Cyber Park, Sector 62, Noida, India',
        gstin: settings.platformGstin,
        pan: settings.platformPan,
        email: 'finance@gravitass.work'
      },
      customer: {
        name: escrow.clientName,
        email: 'client@gravitass.com',
        legalAddress: 'Verified Enterprise Client'
      },
      items: [
        {
          id: `crn-item-${Date.now()}`,
          description: `Escrow Refund Reversal: ${escrow.projectTitle} (${params.reason})`,
          quantity: 1,
          unitPrice: params.amount,
          taxableAmount: params.amount,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: params.amount
        }
      ],
      currency: 'USD',
      subtotal: params.amount,
      taxTotal: 0,
      grandTotal: params.amount,
      notes: `Refund memorandum executed under dispute/cancellation protocol. Reason: ${params.reason}`,
      createdAt: now
    };

    if (!this.state.invoices) this.state.invoices = [];
    this.state.invoices.unshift(creditNote);

    this.saveState();
    return { success: true, refundCreditNote: creditNote };
  }

  // ==========================================
  // MODULE 3 — COMMISSION ENGINE CONFIGURATION
  // ==========================================

  public getCommissionRules(): CommissionRule[] {
    if (!this.state.commissionRules || this.state.commissionRules.length === 0) {
      this.state.commissionRules = [...INITIAL_COMMISSION_RULES];
    } else {
      // Ensure all 13 standard category rates and promotional fields exist
      const active = this.state.commissionRules.find(r => r.isActive) || this.state.commissionRules[0];
      if (active) {
        active.categoryRates = {
          ...INITIAL_COMMISSION_RULES[0].categoryRates,
          ...active.categoryRates,
          'programming-tech': active.categoryRates['programming-tech'] ?? active.categoryRates['development'] ?? 8,
          'graphics-design': active.categoryRates['graphics-design'] ?? active.categoryRates['design'] ?? 10,
          'ai-services': active.categoryRates['ai-services'] ?? active.categoryRates['ai'] ?? 7
        };
        if (active.promotionalPercentage === undefined) {
          active.promotionalPercentage = INITIAL_COMMISSION_RULES[0].promotionalPercentage;
          active.promotionalCode = INITIAL_COMMISSION_RULES[0].promotionalCode;
        }
      }
    }
    return this.state.commissionRules;
  }

  public getActiveCommissionRule(): CommissionRule {
    const rules = this.getCommissionRules();
    return rules.find(r => r.isActive) || rules[0] || INITIAL_COMMISSION_RULES[0];
  }

  public createCommissionRule(rule: Partial<CommissionRule>): CommissionRule {
    if (!this.state.commissionRules) this.state.commissionRules = [...INITIAL_COMMISSION_RULES];

    // If newly created rule is active, deactivate other rules
    if (rule.isActive) {
      this.state.commissionRules.forEach(r => { r.isActive = false; });
    }

    const newRule: CommissionRule = {
      id: rule.id || `COMM-${Date.now().toString(36).toUpperCase()}`,
      version: rule.version || `v${new Date().getFullYear()}.${this.state.commissionRules.length + 1}`,
      defaultPercentage: rule.defaultPercentage ?? 10,
      categoryRates: rule.categoryRates || {},
      freelancerRates: rule.freelancerRates || {},
      promotionalPercentage: rule.promotionalPercentage,
      promotionalStartDate: rule.promotionalStartDate,
      promotionalEndDate: rule.promotionalEndDate,
      promotionalCode: rule.promotionalCode,
      minFee: rule.minFee ?? 50,
      maxFee: rule.maxFee ?? 25000,
      effectiveDate: rule.effectiveDate || new Date().toISOString(),
      description: rule.description || 'Configured platform commission rule',
      isActive: rule.isActive ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.commissionRules.unshift(newRule);
    this.saveState();
    return newRule;
  }

  public updateCommissionRuleById(id: string, updates: Partial<CommissionRule>): CommissionRule {
    if (!this.state.commissionRules) this.state.commissionRules = [...INITIAL_COMMISSION_RULES];
    const rule = this.state.commissionRules.find(r => r.id === id);
    if (!rule) {
      throw new Error(`Commission rule ${id} not found`);
    }

    if (updates.isActive) {
      this.state.commissionRules.forEach(r => { r.isActive = false; });
    }

    Object.assign(rule, updates, { updatedAt: new Date().toISOString() });

    // Synchronize default percentage with settings if this is the active rule
    if (updates.defaultPercentage !== undefined && rule.isActive) {
      this.updatePlatformSettings({ commissionPercentage: updates.defaultPercentage });
    }

    this.saveState();
    return rule;
  }

  public setActiveCommissionRule(id: string): CommissionRule {
    if (!this.state.commissionRules) this.state.commissionRules = [...INITIAL_COMMISSION_RULES];
    const target = this.state.commissionRules.find(r => r.id === id);
    if (!target) throw new Error('Rule not found');
    this.state.commissionRules.forEach(r => { r.isActive = (r.id === id); });
    target.updatedAt = new Date().toISOString();
    this.updatePlatformSettings({ commissionPercentage: target.defaultPercentage });
    this.saveState();
    return target;
  }

  public deleteCommissionRule(id: string): boolean {
    if (!this.state.commissionRules) return false;
    const rule = this.state.commissionRules.find(r => r.id === id);
    if (!rule || rule.isActive) return false;
    this.state.commissionRules = this.state.commissionRules.filter(r => r.id !== id);
    this.saveState();
    return true;
  }

  public updateCommissionRule(rule: Partial<CommissionRule>): CommissionRule {
    const active = this.getActiveCommissionRule();
    return this.updateCommissionRuleById(active.id, rule);
  }

  // ==========================================
  // SUPER ADMIN COMMAND CENTER ANALYTICS ENGINE
  // ==========================================

  public getSuperAdminAnalytics() {
    const users = this.state.users || [];
    const freelancers = users.filter(u => u.isFreelancer || u.role === 'freelancer');
    const clients = users.filter(u => u.isClient || u.role === 'client');
    const verifiedFreelancers = freelancers.filter(u => u.isVerified || u.verificationStatus === 'verified');

    const projects = this.state.projects || [];
    const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in_progress');
    const completedProjects = projects.filter(p => p.status === 'completed');
    const pendingProjects = projects.filter(p => p.status === 'open');

    const contracts = this.state.contracts || [];
    const escrows = this.state.escrowAccounts || [];
    const ledger = this.state.ledgerTransactions || [];
    const withdrawals = this.state.withdrawals || [];
    const disputes = this.state.disputes || [];
    const activeRule = this.getActiveCommissionRule();

    // 1. Total Project Payment Volume (Gross Merchandise Volume)
    // Real volume of funds deposited into escrow or contracted
    const escrowVolume = escrows.reduce((sum: number, e: EscrowAccount) => sum + (e.fundedAmount || 0), 0);
    const contractVolume = contracts.reduce((sum: number, c: Contract) => sum + (c.paidAmount || c.totalAmount || 0), 0);
    const totalProjectVolume = Math.max(escrowVolume, contractVolume);

    // 2. Real Recognized Platform Commission Revenue
    // Commission is recognized ONLY when milestone deliverables are released & credited
    const totalCommissionRevenue = ledger
      .filter(l => l.status === 'available' || l.status === 'paid')
      .reduce((sum, l) => sum + (l.platformFee || 0), 0);

    // 3. Pending Commission locked in unreleased escrows
    const pendingCommission = escrows
      .filter((e: EscrowAccount) => e.status !== 'payment_released' && e.status !== 'refunded' && e.status !== 'cancelled')
      .reduce((sum: number, e: EscrowAccount) => {
        const unreleased = Math.max(0, (e.fundedAmount || 0) - (e.releasedAmount || 0));
        return sum + Number(((unreleased * activeRule.defaultPercentage) / 100).toFixed(2));
      }, 0);

    // 4. Total Refunds to clients
    const totalRefunds = escrows.reduce((sum: number, e: EscrowAccount) => sum + (e.refundedAmount || 0), 0);

    // 5. Withdrawals Breakdown
    const pendingWthList = withdrawals.filter(w => w.status === 'requested' || w.status === 'under_review' || w.status === 'processing');
    const completedWthList = withdrawals.filter(w => w.status === 'paid');
    const pendingWithdrawalsCount = pendingWthList.length;
    const pendingWithdrawalsAmount = pendingWthList.reduce((sum, w) => sum + (w.amount || 0), 0);
    const successfulPayoutsCount = completedWthList.length;
    const successfulPayoutsAmount = completedWthList.reduce((sum, w) => sum + (w.finalAmount || w.amount || 0), 0);

    // 6. Disputes Breakdown
    const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'investigating');
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'closed');

    // 7. Monthly Revenue Breakdown (Past 12 Months from real database records)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = monthNames.map((month, idx) => {
      const monthTransactions = ledger.filter(l => {
        const d = new Date(l.createdAt);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      });

      const monthGmv = monthTransactions.reduce((sum, l) => sum + (l.grossAmount || 0), 0);
      const monthCommission = monthTransactions.reduce((sum, l) => sum + (l.platformFee || 0), 0);
      const monthNetFreelancers = monthTransactions.reduce((sum, l) => sum + (l.netAmount || 0), 0);

      return {
        month,
        grossVolume: monthGmv,
        commissionRevenue: monthCommission,
        freelancerEarnings: monthNetFreelancers,
        transactionCount: monthTransactions.length
      };
    });

    return {
      totalUsers: users.length,
      totalFreelancers: freelancers.length,
      totalClients: clients.length,
      verifiedFreelancers: verifiedFreelancers.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      pendingProjects: pendingProjects.length,
      totalProjectVolume,
      totalCommissionRevenue,
      pendingCommission,
      totalRefunds,
      pendingWithdrawals: {
        count: pendingWithdrawalsCount,
        amount: pendingWithdrawalsAmount
      },
      successfulPayouts: {
        count: successfulPayoutsCount,
        amount: successfulPayoutsAmount
      },
      disputes: {
        total: disputes.length,
        open: openDisputes.length,
        resolved: resolvedDisputes.length
      },
      monthlyRevenue,
      activeCommissionRule: activeRule
    };
  }

  // ==========================================
  // SUPER ADMIN USER MANAGEMENT SUITE
  // ==========================================

  public getUsersForAdmin(tab: string = 'all', search: string = ''): User[] {
    let list = this.state.users || [];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }

    switch (tab) {
      case 'freelancers':
        return list.filter(u => u.role === 'freelancer' || u.isFreelancer);
      case 'clients':
        return list.filter(u => u.role === 'client' || u.isClient);
      case 'verified':
        return list.filter(u => u.isVerified || u.verificationStatus === 'verified');
      case 'pending':
        return list.filter(u => u.verificationStatus === 'pending' || (!u.isVerified && !u.isSuspended));
      case 'suspended':
        return list.filter(u => u.isSuspended);
      case 'all':
      default:
        return list;
    }
  }

  public getUserAuditDetails(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return null;

    // Sanitize user: exclude passwords or private tokens
    const sanitizedUser: any = { ...user };
    delete sanitizedUser.password;
    delete sanitizedUser.token;

    const freelancerProfile = this.getFreelancerById(userId);
    const clientProfile = this.getClientById(userId);
    const portfolio = freelancerProfile?.portfolio || [];

    const userContracts = (this.state.contracts || []).filter(c =>
      c.clientId === userId || c.freelancerId === userId
    );
    const contractProjectIds = new Set(userContracts.map(c => c.projectId));

    const userProjects = (this.state.projects || []).filter(p =>
      p.clientId === userId || contractProjectIds.has(p.id)
    );

    const userLedger = (this.state.ledgerTransactions || []).filter(l =>
      l.clientId === userId || l.freelancerId === userId
    );

    const userWithdrawals = (this.state.withdrawals || []).filter(w =>
      w.freelancerId === userId
    );

    const complaints = user.complaints || [];

    return {
      user: sanitizedUser,
      freelancerProfile,
      clientProfile,
      portfolio,
      projects: userProjects,
      contracts: userContracts,
      ledger: userLedger,
      withdrawals: userWithdrawals,
      complaints
    };
  }

  public suspendUser(userId: string, reason: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.isSuspended = true;
    user.suspensionReason = reason;
    this.saveState();
    return user;
  }

  public reactivateUser(userId: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.isSuspended = false;
    user.suspensionReason = undefined;
    this.saveState();
    return user;
  }

  public verifyUserAccount(userId: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.isVerified = true;
    user.verificationStatus = 'verified';
    user.verificationRejectionReason = undefined;

    const freelancer = this.getFreelancerById(userId);
    if (freelancer && !freelancer.badges.includes('verified')) {
      freelancer.badges.push('verified');
      this.saveFreelancerProfile(freelancer);
    }

    this.saveState();
    return user;
  }

  public rejectUserVerification(userId: string, reason: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.isVerified = false;
    user.verificationStatus = 'rejected';
    user.verificationRejectionReason = reason;
    this.saveState();
    return user;
  }

  public dismissComplaint(userId: string, complaintId: string): boolean {
    const user = this.getUserById(userId);
    if (!user || !user.complaints) return false;
    const complaint = user.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = 'dismissed';
      this.saveState();
      return true;
    }
    return false;
  }

  // ==========================================
  // MODULE 6 — INVOICE RETRIEVAL & GENERATION
  // ==========================================

  public getInvoices(filters?: { userId?: string; contractId?: string; type?: string }): InvoiceRecord[] {
    let list = this.state.invoices || INITIAL_INVOICES;
    if (filters?.contractId) {
      list = list.filter(inv => inv.contractId === filters.contractId);
    }
    if (filters?.type) {
      list = list.filter(inv => inv.type === filters.type);
    }
    return list;
  }

  public getInvoiceById(id: string): InvoiceRecord | undefined {
    return (this.state.invoices || INITIAL_INVOICES).find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  public createInvoice(invoice: InvoiceRecord): InvoiceRecord {
    if (!this.state.invoices) this.state.invoices = [];
    this.state.invoices.unshift(invoice);
    this.saveState();
    return invoice;
  }

  // ==========================================
  // MODULE 7 — TAX MANAGEMENT & REPORTS
  // ==========================================

  public getTaxRules(): TaxRule[] {
    return this.state.taxRules || INITIAL_TAX_RULES;
  }

  public updateTaxRule(rule: Partial<TaxRule>): TaxRule {
    if (!this.state.taxRules) this.state.taxRules = [...INITIAL_TAX_RULES];
    const existing = this.state.taxRules.find(r => r.id === rule.id);
    if (existing) {
      Object.assign(existing, rule);
      this.saveState();
      return existing;
    }
    const newRule: TaxRule = {
      id: rule.id || `TAX-RULE-${Date.now()}`,
      name: rule.name || 'New Tax Rule',
      type: rule.type || 'gst_on_commission',
      ratePercentage: rule.ratePercentage || 18,
      appliesTo: rule.appliesTo || 'platform_fee',
      panRequired: rule.panRequired || false,
      isEnabled: rule.isEnabled !== undefined ? rule.isEnabled : true,
      effectiveDate: new Date().toISOString(),
      ...rule
    };
    this.state.taxRules.push(newRule);
    this.saveState();
    return newRule;
  }

  public getTaxTransactions(filters?: { financialYear?: string; month?: string; freelancerId?: string }): TaxTransactionRecord[] {
    let list = this.state.taxTransactions || INITIAL_TAX_TRANSACTIONS;
    if (filters?.financialYear) {
      list = list.filter(t => t.financialYear === filters.financialYear);
    }
    if (filters?.month) {
      list = list.filter(t => t.month === filters.month);
    }
    if (filters?.freelancerId) {
      list = list.filter(t => t.freelancerId === filters.freelancerId);
    }
    return list;
  }

  public getTaxReportSummary(financialYear: string = '2025-2026') {
    const records = this.getTaxTransactions({ financialYear });
    const gstRecords = records.filter(r => r.taxType === 'gst_on_commission');
    const tdsRecords = records.filter(r => r.taxType === 'tds_194o');

    const totalPlatformGstCollected = gstRecords.reduce((sum, r) => sum + (r.taxAmount || 0), 0);
    const totalTdsWithheld = tdsRecords.reduce((sum, r) => sum + (r.tdsAmount || r.taxAmount || 0), 0);
    const taxableCommissionTurnover = gstRecords.reduce((sum, r) => sum + (r.taxableAmount || 0), 0);
    const grossMarketplaceTurnover = tdsRecords.reduce((sum, r) => sum + (r.taxableAmount || 0), 0);

    return {
      financialYear,
      totalPlatformGstCollected: Number(totalPlatformGstCollected.toFixed(2)),
      cgstTotal: Number((totalPlatformGstCollected / 2).toFixed(2)),
      sgstTotal: Number((totalPlatformGstCollected / 2).toFixed(2)),
      totalTdsWithheld: Number(totalTdsWithheld.toFixed(2)),
      taxableCommissionTurnover: Number(taxableCommissionTurnover.toFixed(2)),
      grossMarketplaceTurnover: Number(grossMarketplaceTurnover.toFixed(2)),
      transactionCount: records.length,
      statutoryFilingStatus: 'AUDIT_READY'
    };
  }

  // ==========================================
  // MODULE 4 & 5 — PAYOUT SETTINGS & AUTOMATED CRON
  // ==========================================

  public getPayoutSettings(freelancerId: string): FreelancerPayoutSettings {
    const existing = (this.state.payoutSettings || []).find(p => p.freelancerId === freelancerId);
    if (existing) return existing;

    const defaultSetting: FreelancerPayoutSettings = {
      freelancerId,
      preferredMethod: 'upi',
      frequency: 'weekly',
      minimumThreshold: 500,
      autoPayoutEnabled: true,
      payoutDetails: {
        accountHolderName: 'Elena Vance',
        upiId: 'elena.vance@oksbi',
        maskedUpi: 'ele***@oksbi',
        isVerified: true
      },
      panNumber: 'ABCDE1234F',
      updatedAt: new Date().toISOString()
    };
    if (!this.state.payoutSettings) this.state.payoutSettings = [];
    this.state.payoutSettings.push(defaultSetting);
    this.saveState();
    return defaultSetting;
  }

  public updatePayoutSettings(freelancerId: string, settings: Partial<FreelancerPayoutSettings>): FreelancerPayoutSettings {
    if (!this.state.payoutSettings) this.state.payoutSettings = [...INITIAL_PAYOUT_SETTINGS];
    let record = this.state.payoutSettings.find(p => p.freelancerId === freelancerId);
    if (record) {
      Object.assign(record, settings, { updatedAt: new Date().toISOString() });
    } else {
      record = {
        freelancerId,
        preferredMethod: settings.preferredMethod || 'upi',
        frequency: settings.frequency || 'weekly',
        minimumThreshold: settings.minimumThreshold || 500,
        autoPayoutEnabled: settings.autoPayoutEnabled !== undefined ? settings.autoPayoutEnabled : true,
        payoutDetails: settings.payoutDetails || {},
        panNumber: settings.panNumber,
        updatedAt: new Date().toISOString(),
        ...settings
      };
      this.state.payoutSettings.push(record);
    }
    this.saveState();
    return record;
  }

  public async runAutomatedPayoutSchedule(frequency?: 'daily' | 'weekly' | 'monthly'): Promise<{
    processed: number;
    successCount: number;
    errors: string[];
    payouts: WithdrawalRequest[];
  }> {
    const settingsList = this.state.payoutSettings || [];
    const targetSettings = settingsList.filter(s => s.autoPayoutEnabled && (!frequency || s.frequency === frequency));

    let processed = 0;
    let successCount = 0;
    const errors: string[] = [];
    const payouts: WithdrawalRequest[] = [];

    for (const setting of targetSettings) {
      const summary = this.getFreelancerEarningsSummary(setting.freelancerId);
      if (summary.availableBalance >= setting.minimumThreshold && summary.availableBalance > 0) {
        processed++;
        const withdrawalResult = this.requestWithdrawal({
          freelancerId: setting.freelancerId,
          amount: summary.availableBalance,
          method: setting.preferredMethod,
          payoutDetails: setting.payoutDetails,
          idempotencyKey: `AUTO-POUT-${setting.freelancerId}-${Date.now().toString().slice(0, 8)}`
        });

        if (withdrawalResult.success && withdrawalResult.withdrawal) {
          // Execute gateway payout dispatch
          const gwResult = await PayoutGatewayService.executePayout(withdrawalResult.withdrawal);
          if (gwResult.success) {
            this.processWithdrawalStatus({
              withdrawalId: withdrawalResult.withdrawal.id,
              status: 'paid',
              paymentReference: gwResult.paymentReference
            });
            successCount++;
            payouts.push(withdrawalResult.withdrawal);
          } else {
            this.processWithdrawalStatus({
              withdrawalId: withdrawalResult.withdrawal.id,
              status: 'failed',
              failureReason: gwResult.failureReason
            });
            errors.push(`Gateway failed for ${setting.freelancerId}: ${gwResult.failureReason}`);
          }
        } else {
          errors.push(`Withdrawal reserve failed for ${setting.freelancerId}: ${withdrawalResult.error}`);
        }
      }
    }

    return { processed, successCount, errors, payouts };
  }

  // ==========================================
  // MODULE 10 — DISPUTES & LEGAL HOLDS
  // ==========================================

  public getDisputeRecords(): DisputeRecord[] {
    return this.state.disputeRecords || [];
  }

  public openEscrowDispute(params: {
    contractId: string;
    initiatorId: string;
    initiatorRole: 'client' | 'freelancer';
    reason: string;
    description: string;
  }): { success: boolean; dispute?: DisputeRecord; error?: string } {
    const contract = this.getContractById(params.contractId);
    if (!contract) return { success: false, error: 'Contract not found' };

    const escrow = this.getEscrowByContractId(params.contractId);
    if (!escrow) return { success: false, error: 'Escrow account not found for this contract' };

    const unreleased = Math.max(0, escrow.fundedAmount - escrow.releasedAmount - escrow.refundedAmount);
    if (unreleased <= 0) {
      return { success: false, error: 'No unreleased funds remain in escrow to dispute.' };
    }

    const now = new Date().toISOString();
    const dispute: DisputeRecord = {
      id: `DSP-${Date.now()}`,
      contractId: contract.id,
      projectId: contract.projectId,
      projectTitle: contract.projectTitle,
      clientId: contract.clientId,
      clientName: contract.clientName,
      freelancerId: contract.freelancerId,
      freelancerName: contract.freelancerName,
      escrowId: escrow.id,
      disputedAmount: unreleased,
      reason: params.reason,
      evidence: [params.description],
      status: 'open',
      createdAt: now
    };

    if (!this.state.disputeRecords) this.state.disputeRecords = [];
    this.state.disputeRecords.unshift(dispute);

    // Freeze escrow
    escrow.isDisputed = true;
    escrow.disputeId = dispute.id;
    escrow.status = 'disputed';
    escrow.updatedAt = now;

    // Freeze contract
    contract.status = 'disputed';
    this.updateContract(contract.id, contract);

    // Notify parties
    this.addNotification({
      id: `notif-${Date.now()}-c`,
      userId: contract.clientId,
      title: 'Dispute Registered — Escrow Vault Locked',
      message: `A dispute has been logged for "${contract.projectTitle}". Unreleased funds ($${unreleased.toLocaleString()}) are locked pending administrative arbitration.`,
      type: 'payment',
      link: '/dashboard/client',
      isRead: false,
      createdAt: now
    });

    this.addNotification({
      id: `notif-${Date.now()}-f`,
      userId: contract.freelancerId,
      title: 'Dispute Registered on Contract',
      message: `A formal dispute has been opened for "${contract.projectTitle}". Our arbitration team will review milestones and evidence.`,
      type: 'payment',
      link: '/dashboard/freelancer',
      isRead: false,
      createdAt: now
    });

    this.saveState();
    return { success: true, dispute };
  }

  public resolveEscrowDispute(params: {
    disputeId: string;
    resolution: DisputeResolutionAction;
    notes?: string;
    splitPercentageFreelancer?: number;
    adminId: string;
  }): { success: boolean; dispute?: DisputeRecord; error?: string } {
    const dispute = (this.state.disputeRecords || []).find(d => d.id === params.disputeId);
    if (!dispute) return { success: false, error: 'Dispute record not found' };
    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return { success: false, error: 'Dispute has already been resolved.' };
    }

    const escrow = this.getEscrowByContractId(dispute.contractId);
    if (!escrow) return { success: false, error: 'Associated escrow vault not found' };

    const totalDisputed = dispute.disputedAmount;
    const now = new Date().toISOString();

    let releasedAmount = 0;
    let refundedAmount = 0;

    if (params.resolution === 'full_release_freelancer') {
      releasedAmount = totalDisputed;
      this.releaseMilestoneEscrow({
        contractId: dispute.contractId,
        milestoneId: escrow.milestones[0]?.milestoneId || 'arbitrated',
        approvedBy: params.adminId
      });
    } else if (params.resolution === 'full_refund_client') {
      refundedAmount = totalDisputed;
      this.refundEscrow({
        contractId: dispute.contractId,
        amount: totalDisputed,
        reason: `Dispute Arbitration Decision: Full Refund to Client (${params.notes || 'Default'})`,
        approvedBy: params.adminId
      });
    } else if (params.resolution === 'partial_split') {
      const freelancerShare = (params.splitPercentageFreelancer || 50) / 100;
      releasedAmount = fromMinorUnits(Math.round(toMinorUnits(totalDisputed) * freelancerShare));
      refundedAmount = safeSubtract(totalDisputed, releasedAmount);

      if (releasedAmount > 0) {
        this.releaseMilestoneEscrow({
          contractId: dispute.contractId,
          milestoneId: escrow.milestones[0]?.milestoneId || 'arbitrated-split',
          approvedBy: params.adminId
        });
      }
      if (refundedAmount > 0) {
        this.refundEscrow({
          contractId: dispute.contractId,
          amount: refundedAmount,
          reason: `Dispute Arbitration Split (${params.splitPercentageFreelancer || 50}% Freelancer / ${100 - (params.splitPercentageFreelancer || 50)}% Client)`,
          approvedBy: params.adminId
        });
      }
    }

    dispute.status = 'resolved';
    dispute.resolution = params.resolution;
    dispute.resolutionNotes = params.notes;
    dispute.releasedAmountToFreelancer = releasedAmount;
    dispute.refundedAmountToClient = refundedAmount;
    dispute.resolvedBy = params.adminId;
    dispute.resolvedAt = now;

    // Unlock escrow
    escrow.isDisputed = false;
    escrow.updatedAt = now;

    const contract = this.getContractById(dispute.contractId);
    if (contract) {
      contract.status = 'completed';
      this.updateContract(contract.id, contract);
    }

    this.saveState();
    return { success: true, dispute };
  }

  // Backward-compatible Dispute aliases
  public getDisputes(): Dispute[] {
    return this.state.disputes || [];
  }

  public addDispute(d: Dispute): Dispute {
    if (!this.state.disputes) this.state.disputes = [];
    this.state.disputes.unshift(d);
    this.saveState();
    return d;
  }

  public updateDisputeStatus(id: string, status: Dispute['status'], resolution?: string): Dispute | undefined {
    const d = (this.state.disputes || []).find(item => item.id === id);
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
