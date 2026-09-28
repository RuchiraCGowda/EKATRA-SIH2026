-- ====================================================================
-- EKATRA PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Digital Bridge for Informal E-Waste Collectors & Authorized Recyclers
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('collector', 'recycler', 'admin');
CREATE TYPE authorization_status AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'suspended', 'expired');
CREATE TYPE lot_status AS ENUM (
    'collected', 
    'valued', 
    'matched', 
    'offer_received', 
    'recycler_selected', 
    'handover_scheduled', 
    'handover_completed', 
    'payment_completed', 
    'disposed_recycled', 
    'cancelled'
);
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'in_escrow', 'completed', 'failed', 'refunded');
CREATE TYPE complaint_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high');

-- 3. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    role user_role NOT NULL DEFAULT 'collector',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'mr', -- mr: Marathi, hi: Hindi, en: English
    city TEXT DEFAULT 'Mumbai',
    state TEXT DEFAULT 'Maharashtra',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collector specific minimal profile (Respecting privacy and informal nature)
CREATE TABLE IF NOT EXISTS public.collector_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    collector_code TEXT UNIQUE NOT NULL, -- e.g. "EK-COL-1042"
    operating_hub TEXT NOT NULL DEFAULT 'Dharavi Sector 4, Mumbai',
    latitude DOUBLE PRECISION DEFAULT 19.0435,
    longitude DOUBLE PRECISION DEFAULT 72.8567,
    trust_score NUMERIC(3, 2) DEFAULT 4.8,
    total_collections_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recycler specific profile
CREATE TABLE IF NOT EXISTS public.recycler_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    facility_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 19.0825,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 72.8943,
    service_radius_km INTEGER NOT NULL DEFAULT 35,
    pickup_available BOOLEAN NOT NULL DEFAULT TRUE,
    capacity_per_month_mt NUMERIC(10,2) NOT NULL DEFAULT 150.0,
    authorization_status authorization_status NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recycler Authorizations & Regulatory Licenses
CREATE TABLE IF NOT EXISTS public.recycler_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recycler_id UUID NOT NULL REFERENCES public.recycler_profiles(id) ON DELETE CASCADE,
    spcb_license_number TEXT NOT NULL, -- State Pollution Control Board
    cpcb_registration_no TEXT NOT NULL, -- Central Pollution Control Board
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    document_url TEXT,
    verification_status authorization_status NOT NULL DEFAULT 'verified',
    verified_by UUID REFERENCES public.profiles(id),
    verification_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MATERIALS & CATEGORIES
CREATE TABLE IF NOT EXISTS public.material_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. "PCB", "BATTERY", "CRT"
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    image_url TEXT,
    hazard_level TEXT DEFAULT 'medium',
    handling_instruction_en TEXT,
    handling_instruction_hi TEXT,
    handling_instruction_mr TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.material_categories(id) ON DELETE RESTRICT,
    code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    base_unit TEXT NOT NULL DEFAULT 'kg',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRICE RECORDS (Traceable, Provenance-backed)
CREATE TABLE IF NOT EXISTS public.price_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.material_categories(id) ON DELETE RESTRICT,
    sub_category_name TEXT,
    region TEXT NOT NULL DEFAULT 'Maharashtra / Mumbai MMR',
    buying_price_per_kg NUMERIC(10, 2) NOT NULL,
    market_min_price NUMERIC(10, 2) NOT NULL,
    market_max_price NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_source TEXT NOT NULL DEFAULT 'CPCB / SPCB Authorized Aggregator Index',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LOTS (Digital Lot Creation for Informal Collectors)
CREATE TABLE IF NOT EXISTS public.lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_code TEXT UNIQUE NOT NULL, -- e.g. "LOT-2026-0923-001"
    collector_id UUID NOT NULL REFERENCES public.collector_profiles(id),
    category_id UUID NOT NULL REFERENCES public.material_categories(id),
    approx_weight_kg NUMERIC(10, 2) NOT NULL,
    estimated_value_inr NUMERIC(10, 2) NOT NULL,
    agreed_rate_per_kg NUMERIC(10, 2),
    final_sale_value_inr NUMERIC(10, 2),
    description TEXT,
    primary_image_url TEXT,
    location_name TEXT NOT NULL DEFAULT 'Dharavi, Mumbai',
    latitude DOUBLE PRECISION NOT NULL DEFAULT 19.0435,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 72.8567,
    status lot_status NOT NULL DEFAULT 'collected',
    selected_recycler_id UUID REFERENCES public.recycler_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lot Status Audit History (Immutable Traceability)
CREATE TABLE IF NOT EXISTS public.lot_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
    previous_status lot_status,
    new_status lot_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    change_reason TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RECYCLER OFFERS & BIDDING
CREATE TABLE IF NOT EXISTS public.recycler_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
    recycler_id UUID NOT NULL REFERENCES public.recycler_profiles(id) ON DELETE CASCADE,
    offered_rate_per_kg NUMERIC(10, 2) NOT NULL,
    total_offered_amount NUMERIC(10, 2) NOT NULL,
    pickup_offered BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_pickup_hours INTEGER NOT NULL DEFAULT 4,
    notes TEXT,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDERS & HANDOVERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL, -- e.g. "ORD-8942"
    lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE RESTRICT,
    collector_id UUID NOT NULL REFERENCES public.collector_profiles(id),
    recycler_id UUID NOT NULL REFERENCES public.recycler_profiles(id),
    offer_id UUID NOT NULL REFERENCES public.recycler_offers(id),
    order_status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
    scheduled_pickup_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_code TEXT UNIQUE NOT NULL, -- e.g. "HND-7721"
    lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    collector_id UUID NOT NULL REFERENCES public.collector_profiles(id),
    recycler_id UUID NOT NULL REFERENCES public.recycler_profiles(id),
    verified_weight_kg NUMERIC(10, 2) NOT NULL,
    final_amount_inr NUMERIC(10, 2) NOT NULL,
    handover_photo_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name TEXT NOT NULL,
    collector_otp_verified BOOLEAN NOT NULL DEFAULT TRUE,
    handover_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    digital_signature_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAYMENTS & EARNINGS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code TEXT UNIQUE NOT NULL, -- e.g. "TXN-902341"
    lot_id UUID NOT NULL REFERENCES public.lots(id),
    handover_id UUID NOT NULL REFERENCES public.handovers(id),
    collector_id UUID NOT NULL REFERENCES public.collector_profiles(id),
    recycler_id UUID NOT NULL REFERENCES public.recycler_profiles(id),
    amount_inr NUMERIC(10, 2) NOT NULL,
    payment_mode payment_mode NOT NULL DEFAULT 'cash',
    payment_status payment_status NOT NULL DEFAULT 'completed',
    payment_reference TEXT, -- UPI reference or Cash receipt voucher
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPLAINTS & GRIEVANCES
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_code TEXT UNIQUE NOT NULL, -- e.g. "CMP-3021"
    raised_by UUID NOT NULL REFERENCES public.profiles(id),
    against_user UUID REFERENCES public.profiles(id),
    lot_id UUID REFERENCES public.lots(id),
    category TEXT NOT NULL, -- e.g. "Payment Delay", "Weight Discrepancy", "Unsafe Handling"
    description TEXT NOT NULL,
    status complaint_status NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PERSISTENT NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    title_mr TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_hi TEXT NOT NULL,
    message_mr TEXT NOT NULL,
    entity_type TEXT, -- 'lot', 'offer', 'handover', 'payment', 'price'
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SAFETY GUIDES (Pictorial & Multilingual)
CREATE TABLE IF NOT EXISTS public.safety_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_code TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    title_mr TEXT NOT NULL,
    short_warning_en TEXT NOT NULL,
    short_warning_hi TEXT NOT NULL,
    short_warning_mr TEXT NOT NULL,
    dos_en TEXT[] NOT NULL,
    dos_hi TEXT[] NOT NULL,
    dos_mr TEXT[] NOT NULL,
    donts_en TEXT[] NOT NULL,
    donts_hi TEXT[] NOT NULL,
    donts_mr TEXT[] NOT NULL,
    icon_name TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'high',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS & ANOMALIES
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.anomaly_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.lots(id),
    rule_triggered TEXT NOT NULL,
    severity anomaly_severity NOT NULL DEFAULT 'medium',
    details TEXT NOT NULL,
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by UUID REFERENCES public.profiles(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. FIELD RESEARCH & UNIT ECONOMICS DATASETS
CREATE TABLE IF NOT EXISTS public.field_research_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    informal_collector_pseudonym TEXT NOT NULL,
    hub_area TEXT NOT NULL,
    years_in_scrap_collection INTEGER NOT NULL,
    typical_daily_weight_kg NUMERIC(10,2) NOT NULL,
    middleman_rate_per_kg NUMERIC(10,2) NOT NULL,
    ekatra_platform_rate_per_kg NUMERIC(10,2) NOT NULL,
    health_issues_reported TEXT,
    notes TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public can read material categories and verified price records
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public material categories view" ON public.material_categories FOR SELECT USING (true);

ALTER TABLE public.price_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public price records view" ON public.price_records FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lots_collector ON public.lots(collector_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.lots(status);
CREATE INDEX IF NOT EXISTS idx_offers_lot ON public.recycler_offers(lot_id);
CREATE INDEX IF NOT EXISTS idx_handovers_lot ON public.handovers(lot_id);
CREATE INDEX IF NOT EXISTS idx_payments_collector ON public.payments(collector_id);
CREATE INDEX IF NOT EXISTS idx_price_records_cat ON public.price_records(category_id);
