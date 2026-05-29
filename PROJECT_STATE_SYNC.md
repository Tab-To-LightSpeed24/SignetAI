# PROJECT STATE SYNCHRONISATION REPORT (SIGNET AI / CLAUSEGUARD)

This document provides a highly technical, comprehensive synchronization of the actual codebase implementation of the **Signet AI** (also specified under product designs as **ClauseGuard**) application. It is compiled to align business strategies with live technical components, backend infrastructure, and data workflows, excluding all hypothetical features.

---

## 1. EXECUTIVE SUMMARY & MVP STATUS

### 1.1 High-Level Functional Capabilities
Signet AI is a high-fidelity, AI-powered contract risk intelligence application designed specifically for Indian SMEs (with tailored flows targeting Hosur/Chennai automotive component suppliers, Tiruppur garment exporters, and regional electronics manufacturers). The core platform automates:
* **Contract Ingestion & Storage**: Private cloud storage of business agreements in PDF, DOCX, and TXT formats.
* **Two-Pass AI Risk Extraction**: Prompt-directed semantic scanning that auto-detects contract types, isolates the top 5–7 most critical liability exposures, translates complex legalese into plain English, and dynamically generates aggressive Tier-1 counter-clause adjustments.
* **Auto-OEM Directives**: Industry-specific context mapping that automatically targets supplier-side exposures (e.g., line-stoppage indemnities, die/tooling IP retention, and unilateral forecasts) for manufacturing supply agreements.
* **Milestone Extraction & Reminders**: Extraction of binding deadlines (Auto-renewal windows and Contract Expiration dates) to an interactive calendar with email alerts.
* **Legal Advocate Referral Bridge**: Secure callback lead-routing of SME users facing high-risk flags to pre-screened commercial advocates.
* **Subscription Management**: Complete Razorpay order checkout portal with cryptographic webhook upgrades.

### 1.2 MVP State Matrix

| Module | Sub-Component / Feature | Live Implementation Status | Technical Details |
|---|---|---|---|
| **Authentication** | Email & Password Pipeline | **100% Fully Functional** | Direct integration with Supabase Auth engine (`signInWithPassword`, `signUp`). |
| | Google OAuth Integration | **100% Fully Functional** | Redirects to `/auth/callback` to process session exchanges server-side. |
| | Route Security (Server) | **100% Fully Functional** | Next.js Edge Middleware (`src/middleware.ts`) blocks `/app/*` and redirects to `/login`. |
| | Session Guard (Client) | **100% Fully Functional** | Client-side fetch interceptor (`src/lib/auth-interceptor.ts`) monitors `/api/*` requests, double-checking the local Supabase session to prevent false-positive routing loops. |
| **Ingestion Pipeline** | Upload Handler | **100% Fully Functional** | Saves files up to 10MB to Supabase Storage, hashes buffers (SHA-256), and registers a database log in the `contracts` table. |
| | Pass 1: Quick-Scan Classifier | **100% Fully Functional** | Employs `pdf-parse`, `mammoth`, and `gemini-2.5-flash` to identify contract types (`nda`, `lease`, `vendor`, `service`, `oem_supply`, `global`, `invalid`) and target perspective. |
| | Pass 1: Local RegExp Fallback | **100% Fully Functional** | High-accuracy local text classifier (`classifyContractByContent`) activates automatically upon upstream Gemini API failure to prevent pipeline interruption. |
| | Pass 2: Deep-Scan Risk Engine | **100% Fully Functional** | Semantically parses contract text via `gemini-2.5-flash` against User Playbooks and Bespoke constraints, mapping structured JSON schemas. |
| | AI Capacity Resilience | **100% Fully Functional** | Calls wrapped in `retryWithBackoff` (3 retries, delay 1000ms scaling by 2.5x). Gracefully fails over to a persistent `pending_capacity` database status and warning UI on rate limits (503/429). |
| | GIGO Trapdoor | **100% Fully Functional** | Standard folders, manuals, and brochures classified as `invalid` immediately abort deep scanning, marking state as `error` with an `invalid_document` code. |
| | Redline Generator | **100% Fully Functional** | Automatically drafts replacement legal text in `negotiationLanguage` for clauses scoring $\ge 7$ in risk. |
| **Database & Storage** | PostgreSQL Schema | **100% Fully Functional** | Drizzle ORM managing 10 tables (`profiles`, `contracts`, `clauses`, `user_playbook`, `contract_dates`, `reminders`, `razorpay_events`, `contact_submissions`, `partner_applications`, `newsletter_subscriptions`). |
| | Cascade Integrity | **100% Fully Functional** | Foreign key cascades (`onDelete: 'cascade'`) ensure deletion of a contract deletes all associated clauses, milestones, and reminders. |
| **Client Workspace** | Dashboard Ledger | **100% Fully Functional** | Grid-metrics cards and active logs table sliced cleanly to the trailing 3 records. Interactive kebab options for direct viewing and cascading deletes. |
| | Dual-Pane Interactive Viewer | **100% Fully Functional** | Dynamic Zoom-controlled PDF iframe viewer on the right and risk breakdowns on the left. High-contrast off-screen PDF printing layouts configured. |
| | Legal Partner Referral Hub | **100% Fully Functional** | Full advocate catalog in Tamil Nadu (`/app/referrals`) with filters, a glassmorphic connection modal, and POST lead-routing to `/api/contact`. |
| | Renewal Calendar & Cron Alerts | **100% Fully Functional** | Custom calendar widget mapping extracted dates. Cron endpoint (`/api/cron/send-reminders`) queries upcoming dates, emails alerts via the **Resend API**, and updates flags. |
| | Playbook Editor | **100% Fully Functional** | Allows creating, updating, and saving custom rules linked to `/api/analyze`. |
| | Settings Profile Form | **100% Fully Functional** | Forms reading/writing user details directly to Drizzle profile tables. |
| **Payments** | Order Checkout Gateway | **100% Fully Functional** | Server order creation (`/api/billing/create-order`) via **Razorpay SDK** (amounts handled in Paise under INR). |
| | Webhook Plan Processor | **100% Fully Functional** | HMAC-SHA256 signature-verified webhook (`/api/webhooks/razorpay`) that processes `order.paid` events and resets usage counts. |
| **Placeholders** | FeaturePlaceholder component | **Template Layer Only** | An unused pulse-animating skeleton coming-soon UI element (`FeaturePlaceholder.tsx`) exists, but is currently unmounted since all navigation links are fully coded. |

---

## 2. TECH STACK & INFRASTRUCTURE

### 2.1 Frontend Framework & Styling
* **Next.js 14 (App Router)**: Utilizing React Server Components (RSC) for page assemblies and client-side modules (`'use client'`) for interactive components. Renders layout hierarchies under `src/app/app/layout.tsx` (protected workspace wrapper) and `src/app/(public)/layout.tsx` (marketing layout).
* **Tailwind CSS & Vanilla CSS**: Global theme declarations (Primary Navy `#0D1B2A`, Accent Teal `#1D9E75`, Amber `#BA7517`, Red `#E24B4A`) structured inside `src/app/globals.css`. Styled-JSX/Inline elements leverage hardware-accelerated transitions.

### 2.2 Backend Server & Runtime Environment
* **Next.js Edge API Routes (`/api/*`)**: Running inside Vercel's Edge/Serverless runtime.
* **Serverless Configuration**: The risk analysis endpoint uses:
  ```typescript
  export const maxDuration = 60 // 60 seconds serverless timeout limit
  ```
  to handle large contract uploads before triggering Vercel gateway timeouts.

### 2.3 Database, Storage, & Authentication
* **Supabase PostgreSQL**: Relational database infrastructure.
* **Drizzle ORM**: Type-safe schema compiler and relational query builder (`src/db/schema.ts` and `src/db/index.ts`).
* **Supabase Auth**: Authenticated email sessions and OAuth handlers.
* **Supabase Storage**: Dedicated bucket (`'contracts'`) securing user-uploaded documents.
* **Authorized Proxy Redirect (`/api/pdf/[id]`)**: Serves raw PDF files securely by downloading the asset on the server and passing it to the browser with authenticated headers, keeping Supabase Storage URLs private.

### 2.4 AI Engine & Models
* **Google Gemini 2.5 Flash (`gemini-2.5-flash`)**: Powered by the official `@google/genai` SDK.
* **Schema Enforcement**: Restricts Gemini's outputs through explicit JSON structure constraints during calls to guarantee clean parsing.

### 2.5 External Integrations
* **Razorpay SDK**: Handles subscription purchasing.
* **Nodemailer**: Manages lead notifications and application alerts via corporate SMTP relays.
* **Resend API**: Dispatches automated email reminders for contract deadlines.
* **mammoth**: Extract raw text from uploaded `.docx` documents.
* **pdf-parse**: Extracts raw inline text streams from PDF buffers.

---

## 3. SYSTEM ARCHITECTURE

```mermaid
flowchart TD
    subgraph Client Panel (Browser)
        Dashboard["Dashboard Uploader (/app/dashboard)"]
        Viewer["Interactive Report Viewer (/app/contracts/:id)"]
        Referral["Legal Referral Hub (/app/referrals)"]
        ClientAuth["Auth Interceptor (Fetch Guard)"]
    end

    subgraph Server (Vercel Serverless / Edge)
        EdgeGuard["Edge Middleware Guard (middleware.ts)"]
        UploadAPI["Upload API (/api/upload)"]
        QuickScanAPI["Quick-Scan API (/api/quick-scan)"]
        AnalyzeAPI["Analyze API (/api/analyze)"]
        WebhookAPI["Razorpay Webhook (/api/webhooks/razorpay)"]
        CronReminders["Cron Reminders (/api/cron/send-reminders)"]
    end

    subgraph Private Services & Databases
        SupaAuth["Supabase Auth Engine"]
        SupaStore["Supabase Storage ('contracts' Bucket)"]
        PG["PostgreSQL Database (Drizzle ORM)"]
        Gemini["Google Gemini 2.5 API"]
        Resend["Resend Email API"]
        SMTP["SMTP Transporter (Nodemailer)"]
    end

    %% Routing / Auth
    ClientAuth --> SupaAuth
    EdgeGuard --> ClientAuth
    Dashboard --> EdgeGuard

    %% Core Data flow
    Dashboard -->|1. Upload File| UploadAPI
    UploadAPI -->|2. Save PDF| SupaStore
    UploadAPI -->|3. Register Contract| PG
    Dashboard -->|4. Trigger Quick-Scan| QuickScanAPI
    QuickScanAPI -->|5. Local/AI Classify| Gemini
    QuickScanAPI -->|6. Save Type| PG
    Dashboard -->|7. Deep Analysis| AnalyzeAPI
    AnalyzeAPI -->|8. Build Playbook Prompt| Gemini
    AnalyzeAPI -->|9. Populate Clauses & Dates| PG
    
    %% Viewer
    Viewer -->|Fetch PDF stream| PG
    Viewer -->|Load clauses| PG

    %% Outgoing Webhooks / Alerts
    CronReminders -->|Read Dates| PG
    CronReminders -->|Email Reminders| Resend
    Referral -->|Connect Request| SMTP
    WebhookAPI -->|Upgrade Plan| PG
```

### 3.1 Frontend Architecture & Layout Mechanics
* **Dynamic Hover Sidebar Expansion**: A 64px invisible trigger zone occupies the left edge of the viewport. Entering it invokes an `onMouseEnter` animation that dynamically expands the Sidebar panel to 240px (`transition: width 300ms ease-in-out`). To prevent visual overlapping, the adjacent main grid content container changes padding (`padding-left: 240px` or `64px` respectively).
* **Polished Clean Header**: The workspace navigation bar has been stripped of general search fields and unlinked bells. All options are nested inside a clean User Initial dropdown menu with active profile paths and log-out commands.

### 3.2 Database Schema Overview
* **`profiles`**: Primary user records. Manages full name, company name, `plan` tier (`free`, `starter`, `growth`, `unlimited`), monthly consumption index (`contracts_used_this_cycle`), and `cycle_reset_date`.
* **`contracts`**: Stores document assets. Links `userId` to profiles, tracks filename, Supabase bucket path (`file_path`), SHA-256 code (`file_hash`), processing status (`'pending'`, `'analyzing'`, `'pending_capacity'`, `'done'`, `'error'`), risk score (1–10), label (`'low'`, `'medium'`, `'high'`), and type.
* **`clauses`**: Semantic rows extracted. Houses `clauseType`, `originalText`, plain-English rewrites (`plain_english`), risk rating (`risk_score`), risk labels, suggested replacement text (`negotiation_language`), page references (`page_number`), and playbook flags (`is_playbook_violation`).
* **`user_playbook`**: Non-negotiable criteria (`rule_text` and `contract_type`) created by users.
* **`contract_dates`**: Tracks milestones (`date_type`, `date_value`, `description`, `reminder_sent`) extracted from contract files.
* **`reminders`**: Connects profiles to `contract_dates` to schedule custom warning triggers.
* **`razorpay_events`**: Relational ledger validating processed payment events.

---

## 4. CORE FEATURES IMPLEMENTED

* **Multi-Stage Document Ingestion (up to 10MB)**: Encrypts, hashes, and uploads PDF/DOCX/TXT files into secure, user-isolated Supabase storage buckets.
* **Two-Pass Hybrid Scrutiny Pipeline**:
  1. *Pass 1 (Pre-Flight Quick-Scan)*: Automatically isolates contract format and context metrics, determining recommended legal perspective in milliseconds.
  2. *Pass 2 (Deep-Scan Evaluation)*: Synthesizes user Playbook configurations and Bespoke constraints, feeding custom guidelines to Gemini for a targeted compliance review.
* **Aggressive Tier-1 Automotive OEM Safeguard**: Specifically target supplier-side exposures in Hosur/Coimbatore manufacturing agreements. Directs Gemini to scan and flag:
  1. *Line-Stoppage Indemnity* (holding suppliers liable for OEM assembly-line downtime).
  2. *Tooling & Die IP Ownership* (claiming ownership of supplier molds before full payment).
  3. *Unilateral Rolling Forecasts* (uncommitted manufacturing minimums).
  Suggests aggressive, industry-tested counter-clauses in response.
* **Playbook Violations Engine**: Automatically tags clauses as `isPlaybookViolation` if they infringe on user-defined non-negotiables.
* **Automatic Legal Translation & AI Redlines**: Rewrites complex clauses in plain English and automatically generates complete, drop-in replacement contract language for items scoring $\ge 7$ in risk.
* **GIGO (Garbage-In, Garbage-Out) Filter**: Detects general brochures, manuals, or government circulars, immediately aborting deep AI processing to save user quotas.
* **Capacitive Overload Protection**: Detects upstream API bottlenecks or rate limits (503/429), automatically rerouting the contract status to `pending_capacity` and generating a warning card without losing user data.
* **Automated Renewal Calendar & Email Alerts**: Extracts dates to an interactive calendar widget. A server cron job queries approaching targets and triggers automated warnings to the user via **Resend**.
* **Verified Advocates Network Directory**: A detailed search grid with geographical and expertise filters allowing Hosur, Chennai, and Coimbatore SMEs to connect with verified lawyers, routing briefs directly through a secure SMTP form submission.
* **Razorpay Subscription Control**: Allows on-demand package upgrades. Automatically registers successful webhooks via cryptographic signature verification and updates account limitations.

---

## 5. WEBSITE NAVIGATION & USER FLOW MAPPING

### 5.1 Public Marketing Map (Unauthenticated)
* **Root Homepage (`/`)**: Main marketing page displaying value propositions, interactive visual mockups of a risk report, a 3-step walk-through, sector-specific vertical highlights, and a pricing snapshot.
* **Pricing Hub (`/pricing`)**: 4-column feature matrix (Free, Starter, Growth, Pro tiers) with a billing toggle and FAQ accordion.
* **How It Works (`/how-it-works`)**: Technical details of what the system scans, along with a prominent legal disclaimer.
* **Industry Verticals (`/verticals/*`)**: Specialized landing pages for Auto Component Suppliers, Garment Exporters, and Electronics SMEs.
* **Legal Partners Landing (`/partners/lawyers`)**: Explains lawyer collaboration and holds the application form for advocates.
* **Lead Inboxes (`/contact`, `/about`, `/resources`)**: Corporate landing elements, blogs with category filters, and contact forms.
* **Sign In Gateway (`/login`)**: The shared page to log in or register.

### 5.2 Protected Core Workspace Map (Authenticated)
* **Dashboard Gateway (`/app/dashboard`)**: The main user interface. Renders usage charts, a drag-and-drop file uploader, pre-flight configuration selectors, and a list of the user's three most recent audits (with options to view or delete).
* **Unified Library Directory (`/app/contracts`)**: Searchable archive of all analyzed agreements.
* **Interactive Evaluation Workspace (`/app/contracts/[id]`)**: Dual-pane workspace. Left pane: displays overall risk score, summary, and lists flagged risk clauses. Right pane: zoomable PDF viewer displaying the contract file.
* **Playbook Rule Manager (`/app/settings`)**: Interface to save customized non-negotiables for future reviews.
* **Renewal Calendar (`/app/calendar`)**: Displays contract expiration dates and auto-renewal notice deadlines.
* **Advocates Match Network (`/app/referrals`)**: Interface to search, filter, and connect with legal advocates, with a modal that submits connection requests to `/api/contact`.
* **Profile & Billing Hub (`/app/settings/profile`, `/app/settings/billing`)**: Metadata updates and Razorpay upgrade modules showing real-time monthly usage.

### 5.3 Authentication Boundaries
* **Protected Routes (`/app/*`)**: Edge middleware validates Supabase cookie sessions on every fetch request. Unauthenticated attempts are hard-redirected to `/login?redirected=1`.
* **Public Routes**: Open to public routing. Already-authenticated users accessing `/login` are automatically forwarded to `/app/dashboard`.

---

## 6. TECHNICAL PIVOTS & KNOWN LIMITATIONS

### 6.1 Critical Architectural Pivots
* **From DOM Text Mining to Direct Multimodal Ingestion**: Previously, PDF scanning relied strictly on server-side DOM text parsing (`pdf-parse`). For scanned agreements or files with bad text rendering, this caused extraction failures. The ingestion pipeline now features a fallback: if extracted text length is too low, the system converts the file buffer directly to a Base64 string and uploads it to Gemini using the `application/pdf` MIME type. This allows Gemini to scan and analyze the document layout directly, avoiding brittle OCR steps.
* **From Greedy Global Middleware to Client API Session Interception**: Traditional Next.js Edge middleware often triggers token re-hydration loops in SPA states. The app addresses this with a hybrid approach: Edge middleware secures route entrypoints, while a client-side fetch interceptor (`src/lib/auth-interceptor.ts`) watches `/api/*` requests. If a `401/403` occurs, the interceptor verifies the session with Supabase in the background before routing the user to `/login`.
* **Local Regex Heuristic Compilers**: If the Gemini API is completely unavailable, the pipeline triggers `classifyContractByContent`, a fallback regex compiler. This matches legal keywords (like `nda`, `lease`, `vendor`, `oem`) to identify document formats and recommended perspectives, keeping the user interface active during API downtimes.

### 6.2 Existing Technical Limitations (Business Impact)
* **Vercel Serverless Function Timeout**: The `/api/analyze` route is limited to a `maxDuration = 60` seconds execution limit by Vercel serverless functions. Extremely large contracts (100+ pages) or highly detailed scanned images may hit this timeout under heavy load. A future update is planned to transition the deep-scan step to an asynchronous background worker queue.
* **External Cron Scheduling Dependency**: Reminder emails (`/api/cron/send-reminders`) and monthly quota resets are fully coded but require external cron schedulers (like Vercel Cron or GitHub Actions) to run daily, as standard Next.js servers do not have persistent internal scheduler loops.
* **Nodemailer SMTP Fallback**: Lead submissions and partner applications route emails via SMTP using Nodemailer. If SMTP environment credentials (`SMTP_HOST`, etc.) are not configured, the system logs submissions in the database as a fallback. For reliable business operations, these environment variables must be configured.
