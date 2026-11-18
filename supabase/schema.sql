-- ============================================================================
-- GRAVITASS FREELANCE MARKETPLACE - COMPREHENSIVE SUPABASE POSTGRESQL SCHEMA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'freelancer' CHECK (role IN ('freelancer', 'client', 'admin')),
    is_client BOOLEAN DEFAULT false,
    is_freelancer BOOLEAN DEFAULT false,
    active_role TEXT NOT NULL DEFAULT 'freelancer' CHECK (active_role IN ('freelancer', 'client', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FREELANCER PROFILES
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    headline TEXT NOT NULL,
    bio TEXT NOT NULL,
    main_category TEXT NOT NULL REFERENCES categories(id),
    subcategory TEXT,
    experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
    years_of_experience INTEGER DEFAULT 1,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    min_budget NUMERIC(10, 2) DEFAULT 200.00,
    availability TEXT CHECK (availability IN ('full_time', 'part_time', 'contract', 'not_available')),
    languages TEXT[] DEFAULT ARRAY['English'],
    location TEXT DEFAULT 'Remote',
    resume_url TEXT,
    certifications TEXT[],
    education TEXT[],
    social_links JSONB DEFAULT '{}'::jsonb,
    badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    completed_projects_count INTEGER DEFAULT 0,
    total_earnings NUMERIC(12, 2) DEFAULT 0.00,
    profile_completion_percentage INTEGER DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FREELANCER SKILLS JUNCTION
CREATE TABLE IF NOT EXISTS freelancer_skills (
    freelancer_id UUID REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (freelancer_id, skill_id)
);

-- 6. CLIENT PROFILES
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT,
    company_website TEXT,
    industry TEXT,
    bio TEXT,
    location TEXT,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    projects_posted_count INTEGER DEFAULT 0,
    hired_freelancers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    external_url TEXT,
    github_url TEXT,
    category TEXT,
    tools TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PERFORMANCE SCORES (0-100 Score with weighted factors)
CREATE TABLE IF NOT EXISTS performance_scores (
    freelancer_id UUID PRIMARY KEY REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    client_review_quality NUMERIC(5, 2) DEFAULT 90.00, -- 25%
    project_completion_rate NUMERIC(5, 2) DEFAULT 100.00, -- 20%
    on_time_delivery NUMERIC(5, 2) DEFAULT 95.00, -- 15%
    quality_performance NUMERIC(5, 2) DEFAULT 92.00, -- 15%
    communication NUMERIC(5, 2) DEFAULT 90.00, -- 10%
    repeat_clients NUMERIC(5, 2) DEFAULT 80.00, -- 10%
    profile_portfolio_quality NUMERIC(5, 2) DEFAULT 85.00, -- 5%
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES categories(id),
    subcategory TEXT,
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    budget_type TEXT CHECK (budget_type IN ('fixed', 'hourly')),
    budget_min NUMERIC(10, 2) NOT NULL,
    budget_max NUMERIC(10, 2) NOT NULL,
    deadline TIMESTAMPTZ,
    experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
    freelancers_needed INTEGER DEFAULT 1,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'closed')),
    proposals_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PROJECT APPLICATIONS (PROPOSALS)
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    cover_letter TEXT,
    proposed_price NUMERIC(10, 2) NOT NULL,
    delivery_days INTEGER NOT NULL,
    portfolio_links TEXT[] DEFAULT ARRAY[]::TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_freelancer_app UNIQUE(project_id, freelancer_id)
);

-- 11. SHORTLISTED FREELANCERS
CREATE TABLE IF NOT EXISTS shortlisted_freelancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_client_freelancer_shortlist UNIQUE(client_id, freelancer_id, project_id)
);

-- 12. CONTRACTS (HIRED WORKSPACES)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'submitted', 'under_review', 'revision_requested', 'completed', 'cancelled', 'disputed')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    completion_deadline TIMESTAMPTZ,
    latest_submission JSONB,
    revision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PROJECT MILESTONES
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved')),
    submission_notes TEXT,
    submission_attachment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PROJECT TASKS
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    comment TEXT NOT NULL,
    categories JSONB DEFAULT '{"quality": 5, "communication": 5, "timeliness": 5, "expertise": 5}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CONVERSATIONS & MESSAGING
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TRANSACTIONS & WITHDRAWALS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'milestone_escrow', 'payment_release', 'withdrawal', 'refund')),
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'crypto', 'paypal', 'stripe')),
    account_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. DISPUTES
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    initiated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. SAVED FREELANCERS & SAVED PROJECTS
CREATE TABLE IF NOT EXISTS saved_freelancers (
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(client_id, freelancer_id)
);

CREATE TABLE IF NOT EXISTS saved_projects (
    freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(freelancer_id, project_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read for projects and profiles
CREATE POLICY "Public profiles can be viewed by anyone" ON freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Public projects can be viewed by anyone" ON projects FOR SELECT USING (status != 'closed');
CREATE POLICY "Portfolios viewable by anyone" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Categories viewable by anyone" ON categories FOR SELECT USING (true);

-- Authenticated user restrictions
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Freelancers update own profile" ON freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
