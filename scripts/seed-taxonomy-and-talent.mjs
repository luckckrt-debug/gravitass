/**
 * Seed Taxonomy & Multi-Category Talent Profiles for GRAVITASS
 * Updates data/gravitass-data.json with:
 * - 13 Complete Service Categories and exact Subcategories
 * - Enriched Freelancers across each Category with INR (₹) rates, portfolio previews, ratings, and delivery times
 */

import fs from 'node:fs';
import path from 'node:path';

const DATA_FILE = path.join(process.cwd(), 'data', 'gravitass-data.json');

const categories = [
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

const newTalentProfiles = [
  {
    id: 'profile-freelancer-4',
    userId: 'user-freelancer-4',
    fullName: 'Aarav Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    headline: 'Senior Growth Strategist & Paid Ads Acquisition Lead',
    bio: 'Ex-Unicorn performance marketing director. Specialized in high-scale Google Ads, Meta Ads, and full-funnel SEO that delivered over ₹40Cr in verified client revenue.',
    mainCategory: 'digital-marketing',
    subcategory: 'Search Engine Optimization',
    skills: ['Search Engine Optimization', 'Google Ads', 'Meta Ads', 'Performance Marketing', 'Lead Generation', 'Analytics'],
    serviceTags: ['Search Engine Optimization', 'Google Ads', 'Meta Ads', 'Marketing Strategy'],
    experienceLevel: 'expert',
    yearsOfExperience: 7,
    hourlyRate: 40,
    hourlyRateINR: 3200,
    startingPriceINR: 7500,
    deliveryDays: 2,
    minBudget: 500,
    availability: 'full_time',
    languages: ['English', 'Hindi'],
    location: 'Bangalore, India',
    badges: ['verified', 'top_rated'],
    rating: 4.96,
    reviewCount: 31,
    completedProjectsCount: 35,
    totalEarnings: 31200,
    profileCompletionPercentage: 95,
    performanceScore: {
      clientReviewQuality: 98,
      projectCompletionRate: 97,
      onTimeDelivery: 96,
      qualityPerformance: 98,
      communication: 95,
      repeatClients: 90,
      profilePortfolioQuality: 92,
      overallScore: 95.8
    },
    portfolio: [
      {
        id: 'port-4-1',
        freelancerId: 'profile-freelancer-4',
        title: 'ScaleZero: 340% ROAS Google Ads Overhaul',
        description: 'Complete restructuring of programmatic search and performance max campaigns with dynamic negative keyword clusters.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        category: 'Digital Marketing',
        tools: ['Google Ads', 'Meta Business Suite', 'GA4', 'SEMrush'],
        createdAt: '2026-01-10T10:00:00.000Z'
      }
    ],
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-5',
    userId: 'user-freelancer-5',
    fullName: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    headline: 'Cinematic Video Editor & 3D Motion Graphics Artist',
    bio: 'Story-driven cinematic video editor for viral tech product launches, YouTube documentaries, and high-energy social media reels. Expert in DaVinci Resolve and Blender.',
    mainCategory: 'video-animation',
    subcategory: 'Video Editing',
    skills: ['Video Editing', 'YouTube Video Editing', 'Motion Graphics', 'Reels and Shorts Editing', 'Visual Effects', 'Color Grading'],
    serviceTags: ['Video Editing', 'YouTube Video Editing', 'Reels and Shorts Editing', 'Motion Graphics'],
    experienceLevel: 'intermediate',
    yearsOfExperience: 5,
    hourlyRate: 35,
    hourlyRateINR: 2800,
    startingPriceINR: 6500,
    deliveryDays: 2,
    minBudget: 300,
    availability: 'full_time',
    languages: ['English', 'Gujarati', 'Hindi'],
    location: 'Mumbai, India',
    badges: ['verified', 'elite_talent'],
    rating: 4.97,
    reviewCount: 44,
    completedProjectsCount: 48,
    totalEarnings: 38400,
    profileCompletionPercentage: 92,
    performanceScore: {
      clientReviewQuality: 99,
      projectCompletionRate: 98,
      onTimeDelivery: 97,
      qualityPerformance: 98,
      communication: 96,
      repeatClients: 94,
      profilePortfolioQuality: 95,
      overallScore: 97.2
    },
    portfolio: [
      {
        id: 'port-5-1',
        freelancerId: 'profile-freelancer-5',
        title: 'Nexus X: Hardware Launch Teaser (4K DaVinci Edit)',
        description: 'Multi-cam dynamic pace editing with bespoke sound effects and custom 3D typography animation.',
        imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
        category: 'Video & Animation',
        tools: ['DaVinci Resolve', 'After Effects', 'Blender', 'Audition'],
        createdAt: '2026-01-18T12:00:00.000Z'
      }
    ],
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-02-14T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-6',
    userId: 'user-freelancer-6',
    fullName: 'Ananya Sen',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    headline: 'High-Conversion B2B Copywriter & Technical Content Strategist',
    bio: 'Crafting persuasive landing page copy, technical whitepapers, and viral editorial content for high-growth tech companies. Featured on TechCrunch and Forbes.',
    mainCategory: 'writing-translation',
    subcategory: 'Content Writing',
    skills: ['Content Writing', 'Copywriting', 'Website Content', 'Technical Writing', 'Blog Writing', 'SEO Articles'],
    serviceTags: ['Content Writing', 'Copywriting', 'Technical Writing', 'Website Content'],
    experienceLevel: 'intermediate',
    yearsOfExperience: 4,
    hourlyRate: 30,
    hourlyRateINR: 2400,
    startingPriceINR: 4500,
    deliveryDays: 1,
    minBudget: 200,
    availability: 'full_time',
    languages: ['English', 'Bengali'],
    location: 'Kolkata, India',
    badges: ['verified', 'rising_talent'],
    rating: 4.93,
    reviewCount: 22,
    completedProjectsCount: 26,
    totalEarnings: 19800,
    profileCompletionPercentage: 90,
    performanceScore: {
      clientReviewQuality: 96,
      projectCompletionRate: 95,
      onTimeDelivery: 99,
      qualityPerformance: 94,
      communication: 98,
      repeatClients: 88,
      profilePortfolioQuality: 90,
      overallScore: 94.6
    },
    portfolio: [
      {
        id: 'port-6-1',
        freelancerId: 'profile-freelancer-6',
        title: 'FinMatrix: Enterprise Landing Page Copy Re-architecture',
        description: 'Increased organic conversion rate by 68% with clear technical value propositions and customer journey optimization.',
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
        category: 'Writing & Translation',
        tools: ['Notion', 'Figma', 'Grammarly Business', 'Clearscope'],
        createdAt: '2026-01-22T08:00:00.000Z'
      }
    ],
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-02-16T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-7',
    userId: 'user-freelancer-7',
    fullName: 'Kabir Bose',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    headline: 'Sound Designer, Film Composer & Audio Mastering Engineer',
    bio: 'Producer and audio engineer with 9+ years creating immersive soundscapes, pristine podcast mastering, and commercial jingles. Works with Dolby Atmos and analog hardware.',
    mainCategory: 'music-audio',
    subcategory: 'Sound Design',
    skills: ['Sound Design', 'Audio Editing', 'Music Production', 'Mixing & Mastering', 'Podcast Editing', 'Voice Over'],
    serviceTags: ['Sound Design', 'Audio Editing', 'Music Production', 'Mixing & Mastering'],
    experienceLevel: 'expert',
    yearsOfExperience: 9,
    hourlyRate: 45,
    hourlyRateINR: 3600,
    startingPriceINR: 6000,
    deliveryDays: 2,
    minBudget: 350,
    availability: 'part_time',
    languages: ['English', 'Hindi'],
    location: 'Pune, India',
    badges: ['verified', 'top_rated'],
    rating: 4.99,
    reviewCount: 39,
    completedProjectsCount: 41,
    totalEarnings: 34500,
    profileCompletionPercentage: 94,
    performanceScore: {
      clientReviewQuality: 100,
      projectCompletionRate: 97,
      onTimeDelivery: 96,
      qualityPerformance: 99,
      communication: 95,
      repeatClients: 93,
      profilePortfolioQuality: 96,
      overallScore: 97.4
    },
    portfolio: [
      {
        id: 'port-7-1',
        freelancerId: 'profile-freelancer-7',
        title: 'Solaris Sci-Fi Game: Dynamic Interactive Audio Engine',
        description: 'Over 140 custom synthesized sound effects, foley recordings, and adaptive background musical compositions.',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
        category: 'Music & Audio',
        tools: ['Ableton Live', 'Pro Tools', 'FabFilter', 'iZotope Ozone'],
        createdAt: '2026-01-26T14:00:00.000Z'
      }
    ],
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-8',
    userId: 'user-freelancer-8',
    fullName: 'Dr. Meera Nambiar',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    headline: 'Fractional COO, Business Architect & Financial Modeling Specialist',
    bio: 'Former McKinsey strategist helping Series A–C tech ventures design scalable unit economics, pitch decks, and operational roadmaps. Certified Financial Modeler.',
    mainCategory: 'business',
    subcategory: 'Business Consulting',
    skills: ['Business Consulting', 'Business Plans', 'Financial Analysis', 'Project Management', 'Market Research', 'Operational Strategy'],
    serviceTags: ['Business Consulting', 'Business Plans', 'Financial Analysis', 'Project Management'],
    experienceLevel: 'expert',
    yearsOfExperience: 12,
    hourlyRate: 120,
    hourlyRateINR: 9600,
    startingPriceINR: 28000,
    deliveryDays: 5,
    minBudget: 1500,
    availability: 'contract',
    languages: ['English', 'Malayalam'],
    location: 'Hyderabad, India',
    badges: ['verified', 'elite_talent'],
    rating: 5.0,
    reviewCount: 26,
    completedProjectsCount: 29,
    totalEarnings: 78000,
    profileCompletionPercentage: 100,
    performanceScore: {
      clientReviewQuality: 100,
      projectCompletionRate: 100,
      onTimeDelivery: 98,
      qualityPerformance: 100,
      communication: 99,
      repeatClients: 96,
      profilePortfolioQuality: 98,
      overallScore: 99.1
    },
    portfolio: [
      {
        id: 'port-8-1',
        freelancerId: 'profile-freelancer-8',
        title: 'Fintech Series A Financial Model & 5-Year Projections',
        description: 'Institutional-grade dynamic Excel cash flow and cohort retention model used to secure $8.5M funding round.',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        category: 'Business',
        tools: ['Excel', 'Power BI', 'Monte Carlo Simulation', 'Keynote'],
        createdAt: '2026-01-29T10:00:00.000Z'
      }
    ],
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-9',
    userId: 'user-freelancer-9',
    fullName: 'Devansh Mehta',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    headline: 'Senior Data Architect & Power BI Executive Dashboard Designer',
    bio: 'Transforming complex data lakes into intuitive, real-time executive decision cockpits. Expert in SQL optimization, Snowflake, Power BI DAX, and automated ETL pipelines.',
    mainCategory: 'data-analytics',
    subcategory: 'Data Analysis',
    skills: ['Data Analysis', 'Data Visualization', 'Power BI', 'SQL', 'Tableau', 'Data Engineering', 'Python'],
    serviceTags: ['Data Analysis', 'Data Visualization', 'Power BI', 'SQL', 'Tableau'],
    experienceLevel: 'expert',
    yearsOfExperience: 8,
    hourlyRate: 55,
    hourlyRateINR: 4400,
    startingPriceINR: 12000,
    deliveryDays: 3,
    minBudget: 600,
    availability: 'full_time',
    languages: ['English', 'Hindi'],
    location: 'Chennai, India',
    badges: ['verified', 'top_rated'],
    rating: 4.95,
    reviewCount: 35,
    completedProjectsCount: 39,
    totalEarnings: 46200,
    profileCompletionPercentage: 96,
    performanceScore: {
      clientReviewQuality: 98,
      projectCompletionRate: 98,
      onTimeDelivery: 96,
      qualityPerformance: 97,
      communication: 94,
      repeatClients: 91,
      profilePortfolioQuality: 94,
      overallScore: 96.2
    },
    portfolio: [
      {
        id: 'port-9-1',
        freelancerId: 'profile-freelancer-9',
        title: 'OmniChain: Real-Time Logistics BI Cockpit',
        description: 'Unified 14 data sources into interactive Power BI report with automated incremental refreshes and anomaly tracking.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        category: 'Data & Analytics',
        tools: ['Power BI', 'SQL', 'Snowflake', 'Python', 'DAX'],
        createdAt: '2026-02-01T12:00:00.000Z'
      }
    ],
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-02-17T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-10',
    userId: 'user-freelancer-10',
    fullName: 'Rohan Deshmukh',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    headline: 'Mechanical CAD Designer & Precision 3D Prototyping Engineer',
    bio: 'Specialist in parametric CAD design, DFM (Design for Manufacturing), sheet metal fabrication, and enclosure design for IoT consumer electronics.',
    mainCategory: 'engineering-architecture',
    subcategory: 'CAD Design',
    skills: ['CAD Design', '3D Modeling', 'Product Design', 'Mechanical Design', 'Interior Design', 'SolidWorks'],
    serviceTags: ['CAD Design', '3D Modeling', 'Product Design', 'Mechanical Design'],
    experienceLevel: 'expert',
    yearsOfExperience: 6,
    hourlyRate: 45,
    hourlyRateINR: 3600,
    startingPriceINR: 9500,
    deliveryDays: 4,
    minBudget: 400,
    availability: 'full_time',
    languages: ['English', 'Marathi'],
    location: 'Pune, India',
    badges: ['verified', 'elite_talent'],
    rating: 4.96,
    reviewCount: 28,
    completedProjectsCount: 30,
    totalEarnings: 29800,
    profileCompletionPercentage: 92,
    performanceScore: {
      clientReviewQuality: 98,
      projectCompletionRate: 96,
      onTimeDelivery: 95,
      qualityPerformance: 98,
      communication: 93,
      repeatClients: 89,
      profilePortfolioQuality: 96,
      overallScore: 95.4
    },
    portfolio: [
      {
        id: 'port-10-1',
        freelancerId: 'profile-freelancer-10',
        title: 'Aura Ring Sensor Enclosure (IP68 Injection Mold CAD)',
        description: 'Complete production-ready STEP assembly with snap-fit tolerance analysis and thermal dissipation fins.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        category: 'Engineering & Architecture',
        tools: ['SolidWorks', 'Fusion 360', 'KeyShot', 'AutoCAD'],
        createdAt: '2026-02-04T10:00:00.000Z'
      }
    ],
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-11',
    userId: 'user-freelancer-11',
    fullName: 'Ishaan Kapoor',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    headline: 'Commercial Luxury Product & High-End E-Commerce Photographer',
    bio: 'Creating magazine-grade studio photography, hero banner assets, and high-detail AI retouching for international luxury, cosmetics, and tech brands.',
    mainCategory: 'photography',
    subcategory: 'Product Photography',
    skills: ['Product Photography', 'Commercial Photography', 'Photo Editing', 'Image Retouching', 'Color Correction', 'Studio Lighting'],
    serviceTags: ['Product Photography', 'Commercial Photography', 'Photo Editing', 'Image Retouching'],
    experienceLevel: 'expert',
    yearsOfExperience: 8,
    hourlyRate: 50,
    hourlyRateINR: 4000,
    startingPriceINR: 11000,
    deliveryDays: 3,
    minBudget: 450,
    availability: 'contract',
    languages: ['English', 'Hindi', 'Punjabi'],
    location: 'Delhi NCR, India',
    badges: ['verified', 'top_rated'],
    rating: 4.98,
    reviewCount: 37,
    completedProjectsCount: 40,
    totalEarnings: 39800,
    profileCompletionPercentage: 95,
    performanceScore: {
      clientReviewQuality: 99,
      projectCompletionRate: 98,
      onTimeDelivery: 97,
      qualityPerformance: 99,
      communication: 96,
      repeatClients: 95,
      profilePortfolioQuality: 99,
      overallScore: 97.8
    },
    portfolio: [
      {
        id: 'port-11-1',
        freelancerId: 'profile-freelancer-11',
        title: 'Chronos Swiss Watch Global Campaign Photography',
        description: 'Micro-detail macro studio captures with multi-point specular lighting and frequency separation retouching.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        category: 'Photography',
        tools: ['Hasselblad H6D', 'Capture One Pro', 'Photoshop', 'Profoto Lighting'],
        createdAt: '2026-02-08T15:00:00.000Z'
      }
    ],
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-02-16T10:00:00.000Z'
  },
  {
    id: 'profile-freelancer-12',
    userId: 'user-freelancer-12',
    fullName: 'Vikram Rathore',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    headline: 'Executive Career Transition Coach & Leadership Consultant',
    bio: 'Certified executive coach guiding VP and Director-level leaders through high-impact career pivots, negotiation strategy, and high-performance leadership habits.',
    mainCategory: 'lifestyle-consulting',
    subcategory: 'Career Consulting',
    skills: ['Career Consulting', 'Business Coaching', 'Personal Development', 'Professional Consulting', 'Executive Strategy'],
    serviceTags: ['Career Consulting', 'Business Coaching', 'Personal Development', 'Professional Consulting'],
    experienceLevel: 'expert',
    yearsOfExperience: 14,
    hourlyRate: 75,
    hourlyRateINR: 6000,
    startingPriceINR: 9000,
    deliveryDays: 1,
    minBudget: 500,
    availability: 'part_time',
    languages: ['English', 'Hindi'],
    location: 'Gurgaon, India',
    badges: ['verified', 'elite_talent'],
    rating: 5.0,
    reviewCount: 30,
    completedProjectsCount: 32,
    totalEarnings: 42500,
    profileCompletionPercentage: 98,
    performanceScore: {
      clientReviewQuality: 100,
      projectCompletionRate: 100,
      onTimeDelivery: 99,
      qualityPerformance: 100,
      communication: 100,
      repeatClients: 95,
      profilePortfolioQuality: 96,
      overallScore: 98.6
    },
    portfolio: [
      {
        id: 'port-12-1',
        freelancerId: 'profile-freelancer-12',
        title: 'Executive Career Playbook & Board Placement Program',
        description: 'Structured 6-week career transition advisory resulting in multiple Fortune 500 C-suite placements.',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        category: 'Lifestyle & Consulting',
        tools: ['Executive Coaching Frameworks', 'Leadership Diagnostic 360', 'Interview Advisory'],
        createdAt: '2026-02-11T11:00:00.000Z'
      }
    ],
    createdAt: '2026-01-25T10:00:00.000Z',
    updatedAt: '2026-02-18T10:00:00.000Z'
  }
];

function seed() {
  console.log('Seeding taxonomy and marketplace freelancers into data/gravitass-data.json...');
  let raw = {};
  if (fs.existsSync(DATA_FILE)) {
    raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  // 1. Update categories
  raw.categories = categories;

  // 2. Ensure existing freelancers have INR pricing and serviceTags
  if (raw.freelancerProfiles) {
    raw.freelancerProfiles.forEach(f => {
      if (!f.hourlyRateINR) f.hourlyRateINR = Math.round(f.hourlyRate * 83);
      if (!f.startingPriceINR) f.startingPriceINR = Math.round(f.minBudget * 83);
      if (!f.deliveryDays) f.deliveryDays = 3;
      if (!f.serviceTags || f.serviceTags.length === 0) {
        f.serviceTags = [f.subcategory, ...f.skills.slice(0, 3)].filter(Boolean);
      }
    });

    // 3. Merge new talent profiles without duplicates
    newTalentProfiles.forEach(newP => {
      const idx = raw.freelancerProfiles.findIndex(f => f.id === newP.id || f.userId === newP.userId);
      if (idx >= 0) {
        raw.freelancerProfiles[idx] = { ...raw.freelancerProfiles[idx], ...newP };
      } else {
        raw.freelancerProfiles.push(newP);
      }

      // Add corresponding user account if missing
      if (raw.users && !raw.users.some(u => u.id === newP.userId)) {
        raw.users.push({
          id: newP.userId,
          email: `${newP.fullName.toLowerCase().replace(/[\s.]+/g, '')}@gravitass.com`,
          name: newP.fullName,
          avatarUrl: newP.avatarUrl,
          role: 'freelancer',
          isFreelancer: true,
          isClient: false,
          activeRole: 'freelancer',
          isVerified: true,
          createdAt: newP.createdAt
        });
      }
    });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(raw, null, 2), 'utf-8');
  console.log(`Successfully seeded ${categories.length} categories and ${raw.freelancerProfiles.length} freelancer profiles with INR pricing!`);
}

seed();
