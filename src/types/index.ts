export type UserRole = 'freelancer' | 'client' | 'admin';

export type BadgeType = 'verified' | 'rising_talent' | 'top_rated' | 'elite_talent';

export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

export type ApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'shortlisted' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn';

export type ContractStatus = 
  | 'pending' 
  | 'active' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_requested' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isClient: boolean;
  isFreelancer: boolean;
  activeRole: 'freelancer' | 'client' | 'admin';
  createdAt: string;
  isVerified?: boolean;
}

export interface PortfolioItem {
  id: string;
  freelancerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  externalUrl?: string;
  githubUrl?: string;
  category: string;
  tools: string[];
  createdAt: string;
}

export interface PerformanceBreakdown {
  clientReviewQuality: number; // 25%
  projectCompletionRate: number; // 20%
  onTimeDelivery: number; // 15%
  qualityPerformance: number; // 15%
  communication: number; // 10%
  repeatClients: number; // 10%
  profilePortfolioQuality: number; // 5%
  overallScore: number; // 0 - 100
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  mainCategory: string;
  subcategory: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  hourlyRate: number;
  minBudget: number;
  availability: 'full_time' | 'part_time' | 'contract' | 'not_available';
  languages: string[];
  location: string;
  resumeUrl?: string;
  certifications?: string[];
  education?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  portfolio: PortfolioItem[];
  badges: BadgeType[];
  rating: number; // e.g. 4.95
  reviewCount: number;
  completedProjectsCount: number;
  totalEarnings: number;
  performanceScore: PerformanceBreakdown;
  profileCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  companyWebsite?: string;
  industry?: string;
  bio?: string;
  location?: string;
  totalSpent: number;
  projectsPostedCount: number;
  hiredFreelancersCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: string[];
  projectCount: number;
  freelancerCount: number;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientCompany?: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  requiredSkills: string[];
  budgetType: 'fixed' | 'hourly';
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  experienceLevel: ExperienceLevel;
  freelancersNeeded: number;
  attachments?: { name: string; url: string; size: string }[];
  status: ProjectStatus;
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  projectBudget: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerHeadline: string;
  freelancerRating: number;
  freelancerScore: number;
  freelancerBadges: BadgeType[];
  proposal: string;
  coverLetter: string;
  proposedPrice: number;
  deliveryDays: number;
  portfolioLinks: string[];
  attachments?: { name: string; url: string }[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  submissionNotes?: string;
  submissionAttachment?: string;
}

export interface ContractTask {
  id: string;
  contractId: string;
  title: string;
  isCompleted: boolean;
  assignedTo: string;
  dueDate?: string;
}

export interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  totalAmount: number;
  paidAmount: number;
  status: ContractStatus;
  startDate: string;
  completionDeadline: string;
  milestones: ContractMilestone[];
  tasks: ContractTask[];
  latestSubmission?: {
    notes: string;
    files: { name: string; url: string }[];
    submittedAt: string;
  };
  revisionNotes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  contractId: string;
  projectId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    quality: number;
    communication: number;
    timeliness: number;
    expertise: number;
  };
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: { name: string; url: string; type: string }[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId?: string;
  projectTitle?: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  }[];
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'project' 
    | 'application' 
    | 'shortlist' 
    | 'hire' 
    | 'message' 
    | 'milestone' 
    | 'submission' 
    | 'revision' 
    | 'payment' 
    | 'review' 
    | 'verification';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'milestone_escrow' | 'payment_release' | 'withdrawal' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  freelancerId: string;
  amount: number;
  method: 'bank_transfer' | 'crypto' | 'paypal' | 'stripe';
  accountDetails: string;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  projectTitle: string;
  initiatedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: string;
}
