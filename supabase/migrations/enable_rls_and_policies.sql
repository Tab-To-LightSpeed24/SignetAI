-- Enable Row Level Security
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clauses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_playbook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_dates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partner_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "razorpay_events" ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
-- Users can only SELECT and UPDATE their own profile
CREATE POLICY "Profiles are viewable by owner" ON "profiles"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner" ON "profiles"
  FOR UPDATE USING (auth.uid() = id);

-- 2. Contracts
-- Users can SELECT, INSERT, UPDATE, DELETE where user_id = auth.uid()
CREATE POLICY "Contracts CRUD by owner" ON "contracts"
  FOR ALL USING (auth.uid() = user_id);

-- 3. User Playbook
-- Users can CRUD where user_id = auth.uid()
CREATE POLICY "User Playbook CRUD by owner" ON "user_playbook"
  FOR ALL USING (auth.uid() = user_id);

-- 4. Clauses
-- Users can CRUD if the parent contract belongs to them
CREATE POLICY "Clauses CRUD by owner" ON "clauses"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "contracts" 
      WHERE "contracts"."id" = "clauses"."contract_id" 
      AND "contracts"."user_id" = auth.uid()
    )
  );

-- 5. Contract Dates
-- Users can CRUD if the parent contract belongs to them
CREATE POLICY "Contract Dates CRUD by owner" ON "contract_dates"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "contracts" 
      WHERE "contracts"."id" = "contract_dates"."contract_id" 
      AND "contracts"."user_id" = auth.uid()
    )
  );

-- 6. Reminders
-- Users can CRUD where user_id = auth.uid()
CREATE POLICY "Reminders CRUD by owner" ON "reminders"
  FOR ALL USING (auth.uid() = user_id);

-- 7. Admin / System Tables
-- Allow inserts for forms, but block all SELECT access except for Service Role
CREATE POLICY "Contact submissions insert only" ON "contact_submissions"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Partner applications insert only" ON "partner_applications"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletter subscriptions insert only" ON "newsletter_subscriptions"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Razorpay events insert only" ON "razorpay_events"
  FOR INSERT WITH CHECK (true);
