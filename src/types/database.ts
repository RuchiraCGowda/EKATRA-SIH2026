export type UserRole = 'collector' | 'recycler' | 'admin';
export type AppLanguage = 'mr' | 'hi' | 'en' | 'gu' | 'ta' | 'te' | 'kn';

export type LotStatus =
  | 'collected'
  | 'valued'
  | 'matched'
  | 'offer_received'
  | 'recycler_selected'
  | 'handover_scheduled'
  | 'handover_completed'
  | 'payment_completed'
  | 'disposed_recycled'
  | 'cancelled';

export type AuthorizationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'expired';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'in_escrow' | 'completed' | 'failed';
export type ComplaintStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  auth_user_id?: string;
  role: UserRole;
  full_name: string;
  phone_number?: string;
  preferred_language: AppLanguage;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectorProfile {
  id: string;
  profile_id: string;
  collector_code: string;
  operating_hub: string;
  latitude: number;
  longitude: number;
  trust_score: number;
  total_collections_count: number;
  created_at: string;
  // joined from profiles
  profile?: Profile;
}

export interface RecyclerProfile {
  id: string;
  profile_id: string;
  company_name: string;
  facility_address: string;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  pickup_available: boolean;
  capacity_per_month_mt: number;
  authorization_status: AuthorizationStatus;
  spcb_license_number?: string;
  cpcb_registration_no?: string;
  created_at: string;
  updated_at: string;
  // joined from profiles
  profile?: Profile;
}

export interface RecyclerAuthorization {
  id: string;
  recycler_id: string;
  spcb_license_number: string;
  cpcb_registration_no: string;
  valid_from: string;
  valid_until: string;
  document_url?: string;
  verification_status: AuthorizationStatus;
  verified_by?: string;
  verification_notes?: string;
  created_at: string;
}

export interface MaterialCategory {
  id: string;
  code: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  name_gu: string;
  name_ta: string;
  name_te: string;
  name_kn: string;
  icon_name: string;
  image_url?: string;
  hazard_level: 'low' | 'medium' | 'high';
  handling_instruction_en: string;
  handling_instruction_hi: string;
  handling_instruction_mr: string;
  handling_instruction_gu?: string;
  handling_instruction_ta?: string;
  handling_instruction_te?: string;
  handling_instruction_kn?: string;
  is_active: boolean;
  benchmark_price_per_kg: number;
  created_at: string;
}

export interface PriceRecord {
  id: string;
  category_id: string;
  sub_category_name: string;
  sub_category_name_mr?: string;
  sub_category_name_hi?: string;
  sub_category_name_gu?: string;
  sub_category_name_ta?: string;
  sub_category_name_te?: string;
  sub_category_name_kn?: string;
  region: string;
  buying_price_per_kg: number;
  market_min_price: number;
  market_max_price: number;
  unit: string;
  price_source: string;
  is_verified: boolean;
  verified_at: string;
  effective_date: string;
  created_at: string;
  // Joined
  category?: MaterialCategory;
}

export interface Lot {
  id: string;
  lot_code: string;
  collector_id: string;
  category_id: string;
  approx_weight_kg: number;
  estimated_value_inr: number;
  agreed_rate_per_kg?: number;
  final_sale_value_inr?: number;
  description?: string;
  primary_image_url?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: LotStatus;
  selected_recycler_id?: string;
  handover_otp?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  category?: MaterialCategory;
  collector?: CollectorProfile;
  selected_recycler?: RecyclerProfile;
  offers?: RecyclerOffer[];
  handover?: Handover;
  payment?: Payment;
}

export interface LotStatusHistory {
  id: string;
  lot_id: string;
  previous_status?: LotStatus;
  new_status: LotStatus;
  changed_by?: string;
  change_reason?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface RecyclerOffer {
  id: string;
  lot_id: string;
  recycler_id: string;
  offered_rate_per_kg: number;
  total_offered_amount: number;
  pickup_offered: boolean;
  estimated_pickup_hours: number;
  notes?: string;
  is_accepted: boolean;
  created_at: string;
  recycler?: RecyclerProfile;
}

export interface Order {
  id: string;
  order_code: string;
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  offer_id: string;
  order_status: 'active' | 'completed' | 'cancelled';
  scheduled_pickup_time?: string;
  created_at: string;
  updated_at: string;
  lot?: Lot;
  recycler?: RecyclerProfile;
  collector?: CollectorProfile;
}

export interface Handover {
  id: string;
  handover_code: string;
  lot_id: string;
  order_id?: string;
  collector_id: string;
  recycler_id: string;
  verified_weight_kg: number;
  final_amount_inr: number;
  handover_photo_url?: string;
  latitude: number;
  longitude: number;
  location_name: string;
  collector_otp_verified: boolean;
  handover_timestamp: string;
  digital_signature_hash?: string;
  created_at: string;
  recycler?: RecyclerProfile;
  lot?: Lot;
}

export interface Payment {
  id: string;
  transaction_code: string;
  lot_id: string;
  handover_id: string;
  collector_id: string;
  recycler_id: string;
  amount_inr: number;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  payment_reference?: string;
  completed_at: string;
  created_at: string;
  lot?: Lot;
  handover?: Handover;
  recycler?: RecyclerProfile;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  raised_by: string;
  against_user?: string;
  lot_id?: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  raised_by_profile?: Profile;
}

export interface NotificationItem {
  id: string;
  profile_id: string;
  target_role?: UserRole;
  title_en: string;
  title_hi: string;
  title_mr: string;
  title_gu?: string;
  title_ta?: string;
  title_te?: string;
  title_kn?: string;
  message_en: string;
  message_hi: string;
  message_mr: string;
  message_gu?: string;
  message_ta?: string;
  message_te?: string;
  message_kn?: string;
  entity_type?: 'lot' | 'offer' | 'handover' | 'payment' | 'price' | 'system';
  entity_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface SafetyGuide {
  id: string;
  hazard_code: string;
  title_en: string;
  title_hi: string;
  title_mr: string;
  short_warning_en: string;
  short_warning_hi: string;
  short_warning_mr: string;
  dos_en: string[];
  dos_hi: string[];
  dos_mr: string[];
  donts_en: string[];
  donts_hi: string[];
  donts_mr: string[];
  icon_name: string;
  severity: 'high' | 'critical' | 'medium';
}

export interface AnomalyRecord {
  id: string;
  lot_id: string;
  rule_triggered: string;
  severity: AnomalySeverity;
  details: string;
  is_reviewed: boolean;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  lot?: Lot;
}

export interface FieldResearchRecord {
  id: string;
  informal_collector_pseudonym: string;
  hub_area: string;
  years_in_scrap_collection: number;
  typical_daily_weight_kg: number;
  middleman_rate_per_kg: number;
  ekatra_platform_rate_per_kg: number;
  health_issues_reported: string;
  notes: string;
  recorded_at: string;
}

export interface OfflineQueueItem {
  id: string;
  operation: 'create_lot' | 'accept_offer' | 'confirm_handover' | 'record_payment' | 'file_complaint';
  payload: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  retryCount: number;
  error?: string;
}
