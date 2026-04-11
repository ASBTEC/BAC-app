export type EventCategory = 'bioBAC' | 'businessBAC' | 'expoBAC' | 'viveBAC';

export type ActivityType = 'stand' | 'talk' | 'activity' | 'outdoor_activity' | 'round_table';

export type ExhibitorType = 'speaker' | 'business';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface Event {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  activity_type: ActivityType;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  local_location: string;
  location?: string;  // Google Maps URL
  exhibitor_ids?: string[];
}

export interface Exhibitor {
  id: string;
  exhibitor_type: ExhibitorType;
  name: string;
  photo?: string;
  description?: string;
  sponsor_tier?: SponsorTier;
}

export type TemporalStatus = 'now' | 'upcoming' | 'past' | 'future';

export type NotificationLeadTime = 5 | 10 | 15 | 30;

export interface NotificationSettings {
  enabled: boolean;
  leadTime: NotificationLeadTime;
}
