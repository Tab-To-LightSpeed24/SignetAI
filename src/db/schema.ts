import { pgTable, uuid, text, integer, boolean, timestamp, date, pgSchema } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  companyName: text('company_name'),
  plan: text('plan').default('free'),
  contractsUsedThisCycle: integer('contracts_used_this_cycle').default(0),
  cycleResetDate: date('cycle_reset_date'),
  razorpayCustomerId: text('razorpay_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  filePath: text('file_path').notNull(),
  fileHash: text('file_hash'),
  status: text('status').default('pending'),
  overallRisk: integer('overall_risk'),
  riskLabel: text('risk_label'),
  summary: text('summary'),
  contractType: text('contract_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  analyzedAt: timestamp('analyzed_at', { withTimezone: true }),
});

export const clauses = pgTable('clauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }),
  clauseType: text('clause_type').notNull(),
  originalText: text('original_text').notNull(),
  plainEnglish: text('plain_english'),
  riskScore: integer('risk_score'),
  riskLabel: text('risk_label'),
  negotiationTip: text('negotiation_tip'),
  negotiationLanguage: text('negotiation_language'),
  flaggedByUser: boolean('flagged_by_user').default(false),
  isPlaybookViolation: boolean('is_playbook_violation').default(false),
  sectionNumber: text('section_number'),
  pageNumber: integer('page_number'),
  personalNote: text('personal_note'),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userPlaybook = pgTable('user_playbook', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => authUsers.id, { onDelete: 'cascade' }),
  ruleText: text('rule_text').notNull(),
  contractType: text('contract_type').notNull().default('global'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const contractDates = pgTable('contract_dates', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }),
  dateType: text('date_type'),
  dateValue: date('date_value'),
  description: text('description'),
  reminderSent: boolean('reminder_sent').default(false),
});

export const reminders = pgTable('reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id),
  contractDateId: uuid('contract_date_id').references(() => contractDates.id),
  remindDaysBefore: integer('remind_days_before').default(30),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const razorpayEvents = pgTable('razorpay_events', {
  id: text('id').primaryKey(),
  type: text('type'),
  processed: boolean('processed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  role: text('role'),
  subject: text('subject'),
  message: text('message').notNull(),
  newsletter: boolean('newsletter').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const partnerApplications = pgTable('partner_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  firmName: text('firm_name').notNull(),
  barNumber: text('bar_number').notNull(),
  city: text('city').notNull(),
  practice: text('practice'),
  industries: text('industries'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});