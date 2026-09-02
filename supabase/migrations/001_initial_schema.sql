-- ============================================================================
-- INITIAL SCHEMA - All tables
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================================================
-- 2. LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Основная информация
    name TEXT,
    age INTEGER,
    university TEXT,
    education_course TEXT,
    specialty TEXT,

    -- Текущая ситуация
    current_activity TEXT,
    current_job TEXT,
    monthly_income NUMERIC,
    income_currency TEXT,

    -- Цели и мотивация
    main_goal TEXT,
    main_obstacle TEXT,
    why_now TEXT,

    -- Предыдущий опыт
    purchased_courses TEXT,
    liked_and_missing TEXT,

    -- Готовность к покупке
    ready_to_start TEXT,
    payment_decision_maker TEXT,
    development_budget TEXT,

    -- Ожидаемый результат
    success_result TEXT,

    -- Дополнительная информация
    consultant_notes TEXT,

    -- Контакт
    phone TEXT,

    -- CRM
    meeting_status TEXT NOT NULL DEFAULT 'not_scheduled',
    meeting_start TIMESTAMPTZ,
    meeting_end TIMESTAMPTZ,

    -- Ответственный сотрудник
    assigned_to UUID REFERENCES public.profiles(id),

    -- Источник
    source TEXT NOT NULL DEFAULT 'tally',
    tally_form_id TEXT,
    tally_response_id TEXT UNIQUE,

    -- Оригинальный ответ Tally
    raw_tally_data JSONB,

    -- Системные поля
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_meeting_status CHECK (
        meeting_status IN ('not_scheduled', 'scheduled', 'completed')
    )
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_meeting_status ON public.leads(meeting_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tally_response_id ON public.leads(tally_response_id);

CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();

-- ============================================================================
-- 3. NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON public.notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_notes_employee_id ON public.notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_notes_updated_at();

-- ============================================================================
-- 4. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    google_event_id TEXT,
    google_calendar_id TEXT,
    google_meet_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON public.appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_appointments_updated_at();

-- ============================================================================
-- 5. GOOGLE_CONNECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.google_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    google_email TEXT,
    google_calendar_id TEXT,
    encrypted_refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_google_connections_employee_id ON public.google_connections(employee_id);

CREATE OR REPLACE FUNCTION update_google_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_google_connections_updated_at
    BEFORE UPDATE ON public.google_connections
    FOR EACH ROW EXECUTE FUNCTION update_google_connections_updated_at();

-- ============================================================================
-- 6. WEBHOOK_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    payload JSONB,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
