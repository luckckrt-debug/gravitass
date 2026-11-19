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
  availableBalance?: number;
  payoutDetails?: PayoutDetails;
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

export type LedgerStatus = 
  | 'pending_approval' 
  | 'pending_payment' 
  | 'available' 
  | 'withdrawal_processing' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'disputed';

export type WithdrawalStatus = 
  | 'requested' 
  | 'under_review' 
  | 'approved' 
  | 'processing' 
  | 'paid' 
  | 'rejected' 
  | 'failed' 
  | 'reversed';

export type PayoutMethod = 'bank_transfer' | 'upi' | 'stripe' | 'paypal';

export interface PayoutDetails {
  accountHolderName?: string;
  accountNumber?: string;
  maskedAccount?: string;
  ifsc?: string;
  bankName?: string;
  upiId?: string;
  maskedUpi?: string;
  isVerified?: boolean;
}

export interface LedgerTransaction {
  id: string; // e.g. LED-1708291200000
  freelancerId: string;
  freelancerName: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  contractId: string;
  milestoneId?: string;
  milestoneTitle?: string;
  grossAmount: number;
  commissionPercentage: number;
  platformFee: number;
  netAmount: number;
  status: LedgerStatus;
  transactionReference: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  notes?: string;
  withdrawalId?: string;
}

export interface WithdrawalRequest {
  id: string; // e.g. WTH-1708291200000
  freelancerId: string;
  freelancerName: string;
  amount: number;
  fee: number;
  finalAmount: number;
  method: PayoutMethod;
  payoutDetails: PayoutDetails;
  status: WithdrawalStatus;
  estimatedProcessingTime: string;
  paymentReference?: string;
  failureReason?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
}

export interface PlatformSettings {
  commissionPercentage: number;
  minWithdrawalAmount: number;
  withdrawalFeePercentage: number;
  fixedWithdrawalFee: number;
  payoutGatewayMode: 'simulated_live' | 'razorpayx' | 'cashfree';
  autoPayoutFrequency?: 'daily' | 'weekly' | 'monthly' | 'manual';
  gstPercentage?: number;
  tdsPercentage?: number;
  sacCode?: string;
  legalBusinessName?: string;
  legalAddress?: string;
  platformGstin?: string;
  platformPan?: string;
  escrowReviewPeriodDays?: number;
  updatedAt?: string;
}

export interface FreelancerEarningsSummary {
  lifetimeEarnings: number;
  availableBalance: number;
  pendingApprovalEarnings: number;
  processingWithdrawals: number;
  totalWithdrawn: number;
  failedPayments: number;
  escrowLockedEarnings?: number;
  tdsWithheldTotal?: number;
  nextScheduledPayoutDate?: string;
  currency: string;
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

// ==========================================
// CENTRAL FINANCIAL ENGINE & JOURNAL TYPES
// ==========================================

export type FinancialAccountType = 
  | 'asset:escrow_vault'
  | 'asset:gateway_clearing'
  | 'liability:freelancer_payable'
  | 'liability:tax_payable_gst'
  | 'liability:tax_payable_tds'
  | 'revenue:platform_commission'
  | 'expense:gateway_fee'
  | 'equity:platform_reserve';

export interface JournalEntryLine {
  accountId: FinancialAccountType;
  accountName: string;
  type: 'debit' | 'credit';
  amount: number; // Stored in major currency unit, calculated safely with minor unit accuracy
  currency: string;
}

export interface FinancialJournalEntry {
  id: string; // e.g. JRN-1708291200000
  timestamp: string;
  referenceType: 'project_funding' | 'milestone_release' | 'freelancer_payout' | 'dispute_resolution' | 'refund' | 'tax_settlement';
  referenceId: string;
  contractId?: string;
  projectId?: string;
  userId?: string;
  lines: JournalEntryLine[];
  description: string;
  idempotencyKey?: string;
  immutable: boolean;
  createdAt: string;
}

// ==========================================
// ESCROW & PAYMENT PROTECTION TYPES
// ==========================================

export type EscrowStatus = 
  | 'payment_required'
  | 'payment_initiated'
  | 'payment_confirmed'
  | 'funds_secured'
  | 'work_in_progress'
  | 'work_submitted'
  | 'client_review'
  | 'release_eligible'
  | 'payment_released'
  | 'disputed'
  | 'refund_processing'
  | 'refunded'
  | 'cancelled';

export interface MilestoneEscrow {
  milestoneId: string;
  title: string;
  amount: number;
  status: EscrowStatus;
  fundedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  autoReleaseDate?: string;
  releaseTxId?: string;
}

export interface EscrowAccount {
  id: string; // e.g. ESC-1708291200000
  contractId: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  totalGrossAmount: number;
  fundedAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  currency: string;
  status: EscrowStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  milestones: MilestoneEscrow[];
  isDisputed: boolean;
  disputeId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// COMMISSION ENGINE TYPES
// ==========================================

export interface CommissionRule {
  id: string; // e.g. COMM-2026-v1
  version: string;
  defaultPercentage: number;
  categoryRates: Record<string, number>;
  freelancerRates: Record<string, number>;
  minFee: number;
  maxFee: number;
  effectiveDate: string;
  description: string;
  isActive: boolean;
  updatedAt: string;
}

// ==========================================
// TAX MANAGEMENT & REPORTING TYPES (GST / TDS)
// ==========================================

export type TaxType = 'gst_on_commission' | 'tds_194o' | 'none';

export interface TaxRule {
  id: string;
  name: string;
  type: TaxType;
  ratePercentage: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  igstPercentage?: number;
  appliesTo: 'platform_fee' | 'gross_project_amount';
  panRequired: boolean;
  thresholdAmount?: number;
  sacCode?: string;
  legalSection?: string; // e.g. "Section 194-O Income Tax Act 1961"
  isEnabled: boolean;
  effectiveDate: string;
}

export interface TaxTransactionRecord {
  id: string; // e.g. TAX-1708291200000
  transactionId: string;
  referenceId: string;
  contractId?: string;
  freelancerId?: string;
  freelancerName?: string;
  clientId?: string;
  taxRuleId: string;
  taxType: TaxType;
  taxableAmount: number;
  ratePercentage: number;
  taxAmount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tdsAmount?: number;
  financialYear: string;
  month: string;
  createdAt: string;
}

// ==========================================
// AUTOMATIC INVOICE GENERATION TYPES
// ==========================================

export type InvoiceType = 
  | 'client_tax_invoice' 
  | 'platform_commission_invoice' 
  | 'freelancer_payout_statement' 
  | 'refund_credit_note';

export type InvoiceStatus = 'issued' | 'paid' | 'cancelled' | 'refunded';

export interface InvoiceItem {
  id: string;
  description: string;
  sacHsnCode?: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface LegalPartyDetails {
  name: string;
  legalAddress: string;
  gstin?: string;
  pan?: string;
  email: string;
  stateCode?: string;
}

export interface InvoiceRecord {
  id: string; // e.g. INV-2026-0001 or CRN-2026-0001
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  contractId?: string;
  projectId?: string;
  projectTitle?: string;
  milestoneId?: string;
  supplier: LegalPartyDetails;
  customer: LegalPartyDetails;
  items: InvoiceItem[];
  currency: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentReference?: string;
  originalInvoiceId?: string; // If this is a credit note
  notes?: string;
  createdAt: string;
}

// ==========================================
// FREELANCER PAYOUT SETTINGS & SCHEDULES
// ==========================================

export interface FreelancerPayoutSettings {
  freelancerId: string;
  preferredMethod: PayoutMethod;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  minimumThreshold: number;
  autoPayoutEnabled: boolean;
  payoutDetails: PayoutDetails;
  panNumber?: string;
  gstin?: string;
  notificationEmail?: string;
  updatedAt: string;
}

// ==========================================
// DISPUTE & REFUND TYPES
// ==========================================

export type DisputeResolutionAction = 
  | 'full_release_freelancer' 
  | 'full_refund_client' 
  | 'partial_split' 
  | 'dismissed';

export interface DisputeRecord {
  id: string; // e.g. DSP-1708291200000
  contractId: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  escrowId: string;
  disputedAmount: number;
  reason: string;
  evidence: string[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: DisputeResolutionAction;
  resolutionNotes?: string;
  refundedAmountToClient?: number;
  releasedAmountToFreelancer?: number;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

