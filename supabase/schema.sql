-- Users (managed by Supabase Auth, extended here)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    company_name TEXT,
    plan TEXT DEFAULT 'free', -- 'free' | 'starter' | 'growth' | 'pro'
    contracts_used_this_cycle INT DEFAULT 0,
    cycle_reset_date DATE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- filename or user-given name
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_hash TEXT, -- SHA-256 for duplicate detection
    status TEXT DEFAULT 'pending', -- 'pending' | 'analyzing' | 'done' | 'error'
    overall_risk INT, -- 1-10 aggregate score
    risk_label TEXT, -- 'low' | 'medium' | 'high'
    summary TEXT, -- AI-generated executive summary
    contract_type TEXT, -- 'vendor' | 'nda' | 'employment' | 'saas'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ
);

-- Individual clauses detected in a contract
CREATE TABLE clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    clause_type TEXT NOT NULL,
    original_text TEXT NOT NULL,
    plain_english TEXT,
    risk_score INT,
    risk_label TEXT,
    negotiation_tip TEXT,
    flagged_by_user BOOLEAN DEFAULT FALSE,
    section_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key dates extracted from contracts
CREATE TABLE contract_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    date_type TEXT, -- 'start' | 'end' | 'auto_renewal' | 'notice_deadline'
    date_value DATE,
    description TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE
);

-- Renewal reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    contract_date_id UUID REFERENCES contract_dates(id),
    remind_days_before INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe webhook event log (idempotency)
CREATE TABLE stripe_events (
    id TEXT PRIMARY KEY,
    type TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_profiles" ON profiles USING (id = auth.uid());
CREATE POLICY "user_owns_contracts" ON contracts USING (user_id = auth.uid());
CREATE POLICY "user_owns_clauses" ON clauses USING (contract_id IN (SELECT id FROM contracts WHERE user_id = auth.uid()));
CREATE POLICY "user_owns_contract_dates" ON contract_dates USING (contract_id IN (SELECT id FROM contracts WHERE user_id = auth.uid()));
CREATE POLICY "user_owns_reminders" ON reminders USING (user_id = auth.uid());
create policy "Users can update own reminders" 
on reminders for update 
using ( auth.uid() = user_id );

-------------------------------------------------------------------------
-- STORAGE BUCKET & POLICIES
-------------------------------------------------------------------------

-- Create the private 'contracts' bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('contracts', 'contracts', false) 
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage objects
alter table storage.objects enable row level security;

-- Allow authenticated users to upload files to the 'contracts' bucket
create policy "Allow authenticated uploads" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'contracts' );

-- Allow authenticated users to download files from the 'contracts' bucket
create policy "Allow authenticated reads" 
on storage.objects for select 
to authenticated 
using ( bucket_id = 'contracts' );
