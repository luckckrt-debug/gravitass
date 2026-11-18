# GRAVITASS — The Future of Freelance Work

GRAVITASS is a premium, futuristic, full-stack freelance marketplace where clients can discover, compare, hire, and manage elite freelancers, while freelancers can create professional profiles, showcase verified portfolios, apply for jobs, manage projects in real-time workspaces, and build their reputation via a transparent 0-100 merit ranking system.

---

## 🌟 Vision & Key Highlights

- **Aesthetic**: Deep space dark mode (`#050505`, `#0B0B0F`, `#121218`), electric violet accents (`#8B5CF6`), cyber cyan glow (`#06B6D4`), subtle glassmorphism, responsive across desktop, tablet, and mobile.
- **Upwork Depth + Fiverr Simplicity**: Advanced technical job briefs and proposal bidding paired with direct one-click hiring and instant communication.
- **Transparent 0–100 Performance Score**: Multi-factor merit formula factoring client review quality (25%), project completion rate (20%), on-time delivery (15%), quality performance (15%), communication (10%), repeat clients (10%), and portfolio quality (5%).
- **Merit Badges**: `Verified Pro`, `Rising Talent`, `Top Rated`, `Elite Talent`.
- **Protected Milestone Workspaces**: Post-hire collaboration hub with milestone escrow, task checklists, live deliverable submission, revision requests, and client rating & review.
- **Dual-Role Switcher**: Users can seamlessly toggle between Freelancer and Client modes with one click.
- **Dual Persistence Architecture**: Powered by a Supabase PostgreSQL schema with RLS policies, combined with a built-in server-side persistent JSON store (`data/gravitass-data.json`) that works out of the box with zero external setup required.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js `v18+` or `v20+` (tested on Node v26)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Pre-Seeded Evaluation Accounts

The platform includes demo accounts for instant evaluation:

| Role | Email | Password | Features |
|---|---|---|---|
| **Freelancer** (Elena Vance) | `freelancer@gravitass.com` | `password123` | AI & Full Stack Architect, Score 97.4, Active workspace, Portfolio, Earnings |
| **Freelancer** (Marcus Thorne) | `marcus@gravitass.com` | `password123` | Cybersecurity & Rust engineer, Score 95.1 |
| **Freelancer** (Seraphina Lin) | `seraphina@gravitass.com` | `password123` | UI/UX & WebGL 3D Creative Director, Rising Talent |
| **Client** (Aetheria Labs) | `client@gravitass.com` | `password123` | Hirer dashboard, Active LLM project, Applicant review & hiring |
| **Admin** (Gravitass Ops) | `admin@gravitass.com` | `password123` | Root admin console, user verification, disputes, telemetry |

*(Quick demo buttons are also available directly on the `/auth/login` page for one-click authentication).*

---

## 🗄️ Database Architecture & Supabase Integration

The PostgreSQL schema and Row Level Security policies are located in:
- `supabase/schema.sql`
- `supabase/migrations/001_initial_schema.sql`

### Tables Included:
1. `users` — Authentication credentials, dual roles (`is_client`, `is_freelancer`), active role, verification status.
2. `freelancer_profiles` — Headline, bio, skills, category, hourly rate, budget min, availability, badges, rating, completion %.
3. `client_profiles` — Company name, website, industry, total spend, hire count.
4. `categories` & `subcategories` — 10 major departments (Development, Video, Design, Writing, Marketing, AI & Automation, Business, Audio, Photography, Other) with 50+ subcategories.
5. `skills` & `freelancer_skills` — Searchable skills taxonomy.
6. `portfolios` — Project samples supporting images, videos, external URLs, GitHub repositories, tools.
7. `projects` — Job briefs, budget types (fixed/hourly), deadline, experience tiers, proposal counts.
8. `project_applications` — Freelancer bids, technical pitch, cover letter, proposed pricing, delivery duration, portfolio links, status transitions (`submitted`, `under_review`, `shortlisted`, `accepted`, `rejected`, `withdrawn`).
9. `shortlisted_freelancers` — Candidate tracking.
10. `contracts` — Post-hire workspace agreements, total amount, paid amount, status, submission notes.
11. `project_milestones` — Escrow stages (`pending`, `in_progress`, `submitted`, `approved`) with instant funds release.
12. `project_tasks` — Kanban task checklist with completion toggles.
13. `reviews` — Star ratings (1-5) and multi-category scores (quality, communication, timeliness, expertise).
14. `performance_scores` — Transparent 0-100 score calculations.
15. `conversations`, `conversation_members`, `messages` — Realtime-ready chat terminal.
16. `notifications` — Centralized user alerts.
17. `transactions` & `withdrawal_requests` — Escrow ledger, balances, and payout gateway.
18. `disputes` — Escrow protection and admin dispute resolution.
19. `saved_freelancers` & `saved_projects` — Bookmarking.

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, Custom futuristic cyber grids, Neon glows & Glassmorphism
- **Icons**: Lucide React
- **Authentication**: JWT session tokens via HTTP-only secure cookies + `bcryptjs` password hashing
- **Database**: Supabase PostgreSQL + Local persistent JSON engine (`data/gravitass-data.json`)
- **State Management**: React Context (`AuthContext`)

---

## 🛡️ Security Best Practices

- Secure password hashing using salt rounds (no plain-text storage).
- HTTP-only, SameSite cookies for session management.
- Server-side role authorization on protected routes and APIs.
- Candidate eligibility enforcement: Freelancers must have at least one verified portfolio item before applying to projects.
- Duplicate proposal prevention for the same project.
- Row-level isolation ensuring only authorized parties access workspace deliverables and messages.
