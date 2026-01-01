import type { FormQuestion, FormSettings, FormType } from './formBuilder';

// Application status types
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type ApplicationCardStatus = 'open' | 'closed' | 'approved' | 'pending' | 'rejected' | 'locked' | 'revision_requested';

// AI decision type
export type AIDecision = 'approved' | 'rejected' | 'interview';

// AI evaluation structure
export interface AIEvaluation {
  player_profile?: {
    experience_level?: string;
    roleplay_style?: string;
    character_depth?: number;
  };
  mentality_analysis?: {
    maturity_score?: number;
    conflict_handling?: string;
    team_player?: boolean;
  };
  strengths?: string[];
  weaknesses?: string[];
  recommendation_notes?: string;
  [key: string]: unknown;
}

// Base application interface
export interface Application {
  id: number;
  user_id: string;
  type: string;
  content: Record<string, string>;
  status: ApplicationStatus | string;
  created_at: string;
  admin_note?: string | null;
  revision_requested_fields?: string[] | null;
  revision_notes?: Record<string, string> | null;
  content_history?: Array<{ timestamp: string; content: Record<string, string> }>;
  // AI evaluation fields
  ai_evaluation?: AIEvaluation | null;
  ai_decision?: AIDecision | null;
  ai_confidence_score?: number | null;
  ai_evaluated_at?: string | null;
}

// Extended application with profile info
export interface ApplicationWithProfile extends Application {
  profile?: {
    username: string | null;
    discord_id: string | null;
    steam_id: string | null;
    avatar_url?: string | null;
  };
}

// Form template interface
export interface FormTemplate {
  id: string;
  title: string;
  description: string | null;
  cover_image_url?: string | null;
  is_active: boolean;
  questions: FormQuestion[];
  settings: FormSettings;
  created_at: string;
  updated_at?: string;
}

// User application (simplified for listing)
export interface UserApplication {
  id: number;
  type: string;
  status: string;
  created_at: string;
  admin_note: string | null;
  revision_requested_fields: string[] | null;
  revision_notes: Record<string, string> | null;
}

// Profile interface
export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  steam_id: string | null;
  is_whitelist_approved: boolean;
  created_at: string;
}

// Admin user with 2FA status
export interface AdminUserInfo {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  steam_id: string | null;
  twoFAStatus: 'not_added' | 'pending' | 'ready' | 'blocked';
}

// Filter types
export type ApplicationFilterType = 'all' | 'whitelist' | 'other';
export type FormFilterType = 'all' | 'whitelist' | 'other';
export type UpdateFilterType = 'all' | 'update' | 'news';
export type UpdateStatusFilterType = 'all' | 'published' | 'draft';
