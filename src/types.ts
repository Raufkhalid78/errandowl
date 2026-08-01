export type UserRole = "client" | "tasker" | "admin";

export interface Profile {
  id: string;
  auth_id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  status?: "active" | "suspended" | "banned";
  created_at: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  client_id: string;
  tasker_id?: string;
  service_name: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  completed_at?: string;
  address?: string;
  lat?: number;
  lng?: number;
  total_amount?: number;
  estimated_hours?: number;
  recurrence_pattern?: "none" | "weekly" | "biweekly" | "monthly";
  created_at: string;
  updated_at?: string;
  client_name?: string; // from joined queries
  tasker_name?: string; // from joined queries
  profiles?: Partial<Profile>; // joined relation
}

export interface JobBid {
  id: string;
  booking_id: string;
  tasker_id: string;
  amount: number;
  cover_letter: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  profiles?: Partial<Profile>; // joined relation
}

export interface Review {
  id: string;
  tasker_id: string;
  client_id: string;
  booking_id: string;
  rating: number;
  text: string;
  rating_punctuality?: number;
  rating_quality?: number;
  rating_communication?: number;
  tasker_reply?: string;
  created_at: string;
  profiles?: Partial<Profile>; // joined relation
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export interface PricingSettings {
  mode: "platform_fixed" | "tasker_bidding";
  platform_fee_percent?: number;
  base_hourly_rate?: number;
}
