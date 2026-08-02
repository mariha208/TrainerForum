'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Star,
  Settings,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  Heart,
  ChevronRight,
  Send,
  Building2,
  Award,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  Trainer,
  Organization,
  RequirementRFP,
  BidProposal,
  SessionReview,
  DeliveryMode
} from '@/types/organization';

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ORGANIZATION: Organization = {
  id: 'org-101',
  name: 'Acme Global Technologies',
  logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
  activePlan: 'Enterprise Plan',
  contactName: 'Sarah Jenkins',
  contactEmail: 's.jenkins@acmeglobal.com',
  totalSpent: 42500,
  activeRFPsCount: 4,
  totalTrainersHired: 18,
  totalHoursDelivered: 340,
  averageGivenRating: 4.9
};

const MOCK_TRAINERS: Trainer[] = [
  {
    id: 'tr-1',
    name: 'Dr. Aris Thorne',
    headline: 'Principal AI & Machine Learning Architect',
    location: 'Bangalore, India • Virtual',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert', 'Top Rated'],
    skills: ['AI/ML', 'Generative AI', 'Python', 'LLM Deployment', 'PyTorch'],
    dailyRate: 1500,
    hourlyRate: 200,
    rating: 4.98,
    reviewCount: 46,
    deliveryMode: 'Hybrid',
    bio: 'Ex-Google Research Lead with 12+ years delivering enterprise AI transformation workshops for Fortune 500 tech teams.'
  },
  {
    id: 'tr-2',
    name: 'Elena Rostova',
    headline: 'Executive Leadership & Behavioral Coach',
    location: 'London, UK • Onsite',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert', 'Elite Featured'],
    skills: ['Executive Leadership', 'Conflict Resolution', 'EQ', 'Change Management'],
    dailyRate: 1800,
    hourlyRate: 250,
    rating: 4.95,
    reviewCount: 38,
    deliveryMode: 'Onsite',
    bio: 'ICF Master Certified Coach specializing in high-performance leadership alignment and C-suite team dynamics.'
  },
  {
    id: 'tr-3',
    name: 'Marcus Vance',
    headline: 'Senior Cloud Security & DevOps Consultant',
    location: 'Austin, TX • Virtual',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert'],
    skills: ['AWS Security', 'Kubernetes', 'DevSecOps', 'Zero Trust', 'Terraform'],
    dailyRate: 1350,
    hourlyRate: 180,
    rating: 4.91,
    reviewCount: 29,
    deliveryMode: 'Virtual',
    bio: 'AWS Certified Security Specialist training engineering teams on zero-trust architectures and cloud compliance.'
  },
  {
    id: 'tr-4',
    name: 'Priya Sundaram',
    headline: 'Agile Transformation & Product Management Specialist',
    location: 'Singapore • Hybrid',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    badges: ['Top Rated'],
    skills: ['SAFe Agile', 'Product Strategy', 'Scrum Master', 'Design Thinking'],
    dailyRate: 1200,
    hourlyRate: 160,
    rating: 4.88,
    reviewCount: 52,
    deliveryMode: 'Hybrid',
    bio: 'Certified SAFe Program Consultant who has guided 30+ enterprise agile transformations across APAC.'
  }
];

const MOCK_PROPOSALS: BidProposal[] = [
  {
    id: 'prop-1',
    rfpId: 'rfp-101',
    trainerId: 'tr-1',
    trainerName: 'Dr. Aris Thorne',
    trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    trainerHeadline: 'Principal AI & Machine Learning Architect',
    rating: 4.98,
    reviewCount: 46,
    proposedDailyRate: 1450,
    proposedDays: 3,
    coverLetter: 'We can deliver a customized 3-day Generative AI workshop tailored to your senior engineering stack with hands-on lab environments.',
    status: 'PENDING',
    submittedDate: '2 hours ago'
  },
  {
    id: 'prop-2',
    rfpId: 'rfp-101',
    trainerId: 'tr-3',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    trainerHeadline: 'Senior Cloud Security & DevOps Consultant',
    rating: 4.91,
    reviewCount: 29,
    proposedDailyRate: 1300,
    proposedDays: 3,
    coverLetter: 'Our hands-on syllabus covers secure LLM deployment, prompt injection defense, and enterprise data privacy compliance.',
    status: 'PENDING',
    submittedDate: '5 hours ago'
  }
];

const MOCK_RFPS: RequirementRFP[] = [
  {
    id: 'rfp-101',
    title: '3-Day Enterprise Generative AI & LLM Implementation Workshop',
    category: 'AI & Machine Learning',
    targetAudience: 'Senior Software Engineers & Tech Leads (40 Participants)',
    deliveryFormat: 'Hybrid',
    location: 'Bangalore HQ & Virtual',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    budgetMin: 4000,
    budgetMax: 5500,
    applicantsCount: 6,
    status: 'OPEN',
    description: 'Looking for a seasoned AI Architect to conduct a 3-day deep dive into fine-tuning LLMs, RAG architecture, and production deployment safety.',
    proposals: MOCK_PROPOSALS
  },
  {
    id: 'rfp-102',
    title: 'Executive Leadership & EQ Retreat for VP & Director Level Leaders',
    category: 'Leadership Development',
    targetAudience: 'VPs and Senior Directors (15 Participants)',
    deliveryFormat: 'Onsite',
    location: 'London Retreat Center',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    budgetMin: 5000,
    budgetMax: 7000,
    applicantsCount: 4,
    status: 'UNDER_REVIEW',
    description: 'Immersive 3-day offsite training focused on strategic decision-making under pressure, emotional intelligence, and organizational alignment.',
    proposals: []
  }
];

const MOCK_REVIEWS: SessionReview[] = [
  {
    id: 'rev-1',
    sessionId: 'sess-301',
    sessionTitle: 'Cloud Native DevSecOps Masterclass',
    trainerId: 'tr-3',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    deliveredDate: '2026-07-25',
    durationHours: 16,
    parameters: {
      subjectExpertise: 5,
      audienceEngagement: 5,
      materialQuality: 4,
      punctualityProfessionalism: 5
    },
    feedbackText: 'Marcus did an outstanding job bringing real-world breach scenarios into the workshop. Our DevOps team gained immediate actionable frameworks.',
    overallRating: 4.75,
    isPublished: true
  },
  {
    id: 'rev-2',
    sessionId: 'sess-302',
    sessionTitle: 'Strategic Change Management Workshop',
    trainerId: 'tr-2',
    trainerName: 'Elena Rostova',
    trainerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    deliveredDate: '2026-07-28',
    durationHours: 8,
    parameters: {
      subjectExpertise: 5,
      audienceEngagement: 5,
      materialQuality: 5,
      punctualityProfessionalism: 5
    },
    feedbackText: '',
    overallRating: 5.0,
    isPublished: false
  }
];

export default function OrganizationDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'rfps' | 'reviews' | 'settings'>('overview');
  
  // State for Marketplace Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(4.0);
  const [trainersList, setTrainersList] = useState<Trainer[]>(MOCK_TRAINERS);

  // State for Modals
  const [isPostRFPModalOpen, setIsPostRFPModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<SessionReview | null>(null);
  const [ratingParams, setRatingParams] = useState({
    subjectExpertise: 5,
    audienceEngagement: 5,
    materialQuality: 5,
    punctualityProfessionalism: 5
  });
  const [feedbackInput, setFeedbackInput] = useState('');

  // Shortlist handler
  const toggleShortlist = (id: string) => {
    setTrainersList(prev =>
      prev.map(t => (t.id === id ? { ...t, isShortlisted: !t.isShortlisted } : t))
    );
  };

  // Filter Trainers
  const filteredTrainers = trainersList.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trainer.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trainer.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || trainer.skills.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesMode = selectedDeliveryMode === 'All' || trainer.deliveryMode === selectedDeliveryMode;
    const matchesPrice = trainer.dailyRate <= maxPrice;
    const matchesRating = trainer.rating >= minRating;
    return matchesSearch && matchesCategory && matchesMode && matchesPrice && matchesRating;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ── INNER WORKSPACE CONTAINER ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ── TOP INNER ACTIONS BAR ──────────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={MOCK_ORGANIZATION.logo}
              alt={MOCK_ORGANIZATION.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-600/30 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                  Organization Portal
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-0.5 rounded-md">
                  {MOCK_ORGANIZATION.activePlan}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{MOCK_ORGANIZATION.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">Welcome back, {MOCK_ORGANIZATION.contactName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search trainers, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Post RFP CTA */}
            <button
              onClick={() => setIsPostRFPModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post Requirement (RFP)</span>
            </button>
          </div>
        </div>

        {/* ── INNER DASHBOARD LAYOUT (SIDEBAR + MAIN CONTENT) ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INNER NAVIGATION SIDEBAR */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1 sticky top-6">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'marketplace', label: 'Find & Hire Trainers', icon: Users },
                { id: 'rfps', label: 'Active RFPs & Bids', icon: FileText, badge: MOCK_ORGANIZATION.activeRFPsCount },
                { id: 'reviews', label: 'Reviews & Ratings', icon: Star, badge: 1 },
                { id: 'settings', label: 'Organization Settings', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN INNER CONTENT AREA */}
          <main className="lg:col-span-9 space-y-8">

            {/* ═════════════════════════════════════════════════════════════════════
                VIEW A: OVERVIEW TAB
            ═════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* 4 KEY KPI SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active RFPs</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{MOCK_ORGANIZATION.activeRFPsCount}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hired Trainers</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{MOCK_ORGANIZATION.totalTrainersHired}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hours Delivered</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{MOCK_ORGANIZATION.totalHoursDelivered}h</h3>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Star className="w-6 h-6 fill-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Given Rating</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{MOCK_ORGANIZATION.averageGivenRating} / 5</h3>
                    </div>
                  </div>
                </div>

                {/* TOP RECOMMENDED TRAINERS GRID */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Top Recommended Trainers</h2>
                      <p className="text-xs text-slate-500">Handpicked experts matching your AI & Engineering focus</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('marketplace')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View All Marketplace <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {MOCK_TRAINERS.slice(0, 3).map(trainer => (
                      <div key={trainer.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition">
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <img src={trainer.avatar} alt={trainer.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">{trainer.name}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{trainer.headline}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{trainer.rating}</span>
                                <span className="text-slate-400">({trainer.reviewCount})</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {trainer.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                          <span className="text-xs font-extrabold text-slate-900">${trainer.dailyRate} <span className="font-normal text-slate-500">/day</span></span>
                          <button
                            onClick={() => setActiveTab('marketplace')}
                            className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECENT BIDS & PROPOSALS LIST */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Bids & Proposals</h2>
                  <div className="divide-y divide-slate-100">
                    {MOCK_PROPOSALS.map(proposal => (
                      <div key={proposal.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img src={proposal.trainerAvatar} alt={proposal.trainerName} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{proposal.trainerName}</h4>
                            <p className="text-xs text-slate-500">{proposal.trainerHeadline}</p>
                            <p className="text-xs text-slate-600 mt-1 italic font-serif">"{proposal.coverLetter}"</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className="text-right">
                            <span className="block text-sm font-extrabold text-slate-900">${proposal.proposedDailyRate}/day</span>
                            <span className="text-xs text-slate-400">{proposal.submittedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                              Accept
                            </button>
                            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                VIEW B: FIND & HIRE TRAINERS (TALENT MARKETPLACE)
            ═════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6 animate-fadeIn">
                {/* ADVANCED FILTER BAR */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                      <span>Filter Talent Marketplace</span>
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">Showing {filteredTrainers.length} Expert Trainers</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Domain / Skill Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Domain / Skill</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Domains</option>
                        <option value="AI">AI & Machine Learning</option>
                        <option value="Leadership">Leadership & EQ</option>
                        <option value="Security">Cloud & Cybersecurity</option>
                        <option value="Agile">Agile & Product</option>
                      </select>
                    </div>

                    {/* Delivery Mode Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Mode</label>
                      <select
                        value={selectedDeliveryMode}
                        onChange={(e) => setSelectedDeliveryMode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Formats</option>
                        <option value="Virtual">Virtual Only</option>
                        <option value="Onsite">Onsite Only</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    {/* Max Daily Rate Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 uppercase mb-1">
                        <span>Max Daily Rate</span>
                        <span className="text-blue-600">${maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="3000"
                        step="100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Min Rating Filter */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Rating</label>
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value={4.0}>4.0+ Stars</option>
                        <option value={4.5}>4.5+ Stars</option>
                        <option value={4.8}>4.8+ Stars</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TRAINER CARD GRID VIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTrainers.map(trainer => (
                    <div key={trainer.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            <img src={trainer.avatar} alt={trainer.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{trainer.name}</h3>
                              <p className="text-xs text-slate-500 font-medium">{trainer.headline}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {trainer.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Heart Shortlist Button */}
                          <button
                            onClick={() => toggleShortlist(trainer.id)}
                            className={`p-2 rounded-xl border transition ${
                              trainer.isShortlisted
                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${trainer.isShortlisted ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {trainer.badges.map(badge => (
                            <span key={badge} className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                              <ShieldCheck className="w-3 h-3" />
                              {badge}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{trainer.bio}</p>

                        {/* Core Skill Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {trainer.skills.map(skill => (
                            <span key={skill} className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{trainer.rating}</span>
                            <span className="text-xs font-normal text-slate-400">({trainer.reviewCount} reviews)</span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">${trainer.dailyRate} / day</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsPostRFPModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition"
                          >
                            Send Direct RFP
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                VIEW C: ACTIVE RFPS & BIDS MANAGEMENT
            ═════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'rfps' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Corporate RFPs & Bids</h2>
                  <button
                    onClick={() => setIsPostRFPModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post New RFP
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_RFPS.map(rfp => (
                    <div key={rfp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              rfp.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {rfp.status}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{rfp.category}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{rfp.title}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Applicants:</span>
                          <span className="bg-blue-50 text-blue-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-blue-200">
                            {rfp.applicantsCount} Trainers Applied
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{rfp.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                        <div>
                          <span className="block text-slate-400 font-medium">Audience</span>
                          <span className="font-bold text-slate-800">{rfp.targetAudience}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Format</span>
                          <span className="font-bold text-slate-800">{rfp.deliveryFormat} ({rfp.location})</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Dates</span>
                          <span className="font-bold text-slate-800">{rfp.startDate}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Budget Range</span>
                          <span className="font-bold text-emerald-600">${rfp.budgetMin} - ${rfp.budgetMax}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                VIEW D: REVIEWS & RATINGS MODULE
            ═════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Post-Session Reviews & Quality Evaluations</h2>
                  <p className="text-xs text-slate-500 mb-6">Rate completed sessions across 4 key parameters to maintain platform quality standards.</p>

                  <div className="space-y-4">
                    {MOCK_REVIEWS.map(rev => (
                      <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={rev.trainerAvatar} alt={rev.trainerName} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{rev.sessionTitle}</h4>
                            <p className="text-xs text-slate-500">Trainer: {rev.trainerName} • Delivered on {rev.deliveredDate}</p>
                          </div>
                        </div>

                        <div>
                          {rev.isPublished ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verified Review Published ({rev.overallRating}★)</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSessionForReview(rev);
                                setIsRatingModalOpen(true);
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition"
                            >
                              Rate & Evaluate Session ⭐
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                VIEW E: ORGANIZATION SETTINGS & BILLING
            ═════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">Organization Settings & Billing</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                      <input type="text" defaultValue={MOCK_ORGANIZATION.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">L&D Contact Email</label>
                      <input type="email" defaultValue={MOCK_ORGANIZATION.contactEmail} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Active Plan: {MOCK_ORGANIZATION.activePlan}</h4>
                      <p className="text-xs text-slate-500">Unlimited RFP postings & direct trainer contracting</p>
                    </div>
                    <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl">Manage Subscription</button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── MODAL 1: POST RFP MODAL ──────────────────────────────────────────────── */}
      {isPostRFPModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setIsPostRFPModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900">+ Post Training Requirement (RFP)</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement Title</label>
                <input type="text" placeholder="e.g. 2-Day Executive AI & Cybersecurity Workshop" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Category</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <option>AI & Machine Learning</option>
                    <option>Executive Leadership</option>
                    <option>Cloud & Security</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Format</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <option>Virtual</option>
                    <option>Onsite</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description & Objectives</label>
                <textarea rows={3} placeholder="Describe audience size, target outcomes, and specific topics..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setIsPostRFPModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={() => setIsPostRFPModalOpen(false)} className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-500">Publish RFP</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INTERACTIVE 4-PARAMETER RATING MODAL ───────────────────────── */}
      {isRatingModalOpen && selectedSessionForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button onClick={() => setIsRatingModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Evaluate Session & Rate Trainer</h2>
              <p className="text-xs text-slate-500">{selectedSessionForReview.sessionTitle} • {selectedSessionForReview.trainerName}</p>
            </div>

            {/* 4 CORE EVALUATION PARAMETERS */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              {[
                { key: 'subjectExpertise', label: '1. Subject Matter Expertise' },
                { key: 'audienceEngagement', label: '2. Audience Engagement & Pedagogy' },
                { key: 'materialQuality', label: '3. Training Material Quality' },
                { key: 'punctualityProfessionalism', label: '4. Punctuality & Professionalism' }
              ].map(param => (
                <div key={param.key} className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{param.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingParams(prev => ({ ...prev, [param.key]: star }))}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-4 h-4 ${star <= (ratingParams as any)[param.key] ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Written Feedback & Testimonial</label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Share specific feedback regarding session delivery and trainer impact..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setIsRatingModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  alert('Thank you! Verified Review successfully published.');
                  setIsRatingModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500"
              >
                Publish Verified Review ⭐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
