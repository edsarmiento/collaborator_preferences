// Types for the application

export interface Event {
  id: string;
  name: string;
  location?: string;
  date?: string;
  music: string[];
  activities: string[];
  category: string;
  city: string;
  country: string;
  description: string;
  endDate: string;
  highlights: string[];
  isHighlight: boolean;
  maxParticipants?: number;
  originalPrice?: number;
  finalPrice?: number;
  startDate: string;
  state?: string;
  matchScore?: number;
  matchReasons?: string[];
}

export interface Collaborator {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation: string;
    languages: string[];
    personalityTraits: string[];
    goals: string[];
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
  };
  restrictions: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
  };
  history: {
    recentEventsAttended: string[];
    eventFeedback: Record<string, string>;
  };
  idealOutcomes: string[];
  calendarAvailability: Record<string, string>;
  deliverables: Array<{
    title: string;
    date: string;
    note: string;
  }>;
} 