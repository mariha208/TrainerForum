// types/organization.ts — TypeScript Interfaces for B2B Organization Dashboard

export type UserRole = 'TRAINER' | 'ORGANIZATION' | 'ADMIN';

export type DeliveryMode = 'Virtual' | 'Onsite' | 'Hybrid';

export type RFPStatus = 'OPEN' | 'UNDER_REVIEW' | 'COMPLETED';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Trainer {
  id: string;
  name: string;
  headline: string;
  location: string;
  avatar: string;
  badges: string[];
  skills: string[];
  dailyRate: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  deliveryMode: DeliveryMode;
  bio: string;
  isShortlisted?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  activePlan: string;
  contactName: string;
  contactEmail: string;
  totalSpent: number;
  activeRFPsCount: number;
  totalTrainersHired: number;
  totalHoursDelivered: number;
  averageGivenRating: number;
}

export interface BidProposal {
  id: string;
  rfpId: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  trainerHeadline: string;
  rating: number;
  reviewCount: number;
  proposedDailyRate: number;
  proposedDays: number;
  coverLetter: string;
  status: ProposalStatus;
  submittedDate: string;
}

export interface RequirementRFP {
  id: string;
  title: string;
  category: string;
  targetAudience: string;
  deliveryFormat: DeliveryMode;
  location: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  applicantsCount: number;
  status: RFPStatus;
  description: string;
  proposals: BidProposal[];
}

export interface RatingParameters {
  subjectExpertise: number;     // 1-5
  audienceEngagement: number;   // 1-5
  materialQuality: number;      // 1-5
  punctualityProfessionalism: number; // 1-5
}

export interface SessionReview {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  deliveredDate: string;
  durationHours: number;
  parameters: RatingParameters;
  feedbackText: string;
  overallRating: number;
  isPublished: boolean;
}
