# ClauseGuard — Complete Website & Product UI Specification
**Version:** 2.0 — Full Build  
**Last updated:** May 2026  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Stripe, Claude API

---

## PART 1 — DESIGN SYSTEM

### 1.1 Color Palette

```
Primary Navy    : #0D1B2A   (headings, hero backgrounds, dark surfaces)
Ink Dark        : #1A2A3A   (secondary dark)
Off-White       : #F5F0E8   (warm background, contrast sections)
Pure White      : #FFFFFF   (card backgrounds, forms)
Accent Teal     : #1D9E75   (primary CTA, success states, links)
Teal Dark       : #0F6E56   (hover state of teal CTA)
Amber           : #BA7517   (medium risk, warnings)
Amber Light     : #FAEEDA   (medium risk backgrounds)
Red Alert       : #E24B4A   (high risk, errors)
Red Light       : #FCEBEB   (high risk backgrounds)
Green Safe      : #639922   (low risk)
Green Light     : #EAF3DE   (low risk backgrounds)
Border Default  : rgba(13,27,42,0.12)
Border Subtle   : rgba(13,27,42,0.06)
Text Primary    : #0D1B2A
Text Secondary  : #4A5568
Text Muted      : #718096
```

### 1.2 Typography

```
Display font    : DM Serif Display (Google Fonts) — headings H1–H3, hero
Body font       : Instrument Sans (Google Fonts) — body, UI, labels
Mono font       : JetBrains Mono — code, clause text excerpts

H1  : 52px / 56px line-height / DM Serif Display / weight 400 (italic variant for emphasis)
H2  : 36px / 42px / DM Serif Display / weight 400
H3  : 24px / 32px / DM Serif Display / weight 400
H4  : 18px / 26px / Instrument Sans / weight 500
Body: 16px / 26px / Instrument Sans / weight 400
Small: 14px / 22px / Instrument Sans / weight 400
Label: 12px / 16px / Instrument Sans / weight 500 / letter-spacing 0.05em / UPPERCASE
```

### 1.3 Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px, 96px, 128px
```

### 1.4 Border Radius
```
Button    : 6px
Card      : 12px
Modal     : 16px
Pill badge: 100px (full round)
Input     : 8px
```

### 1.5 Shadows
```
Card shadow : 0 1px 3px rgba(13,27,42,0.08), 0 4px 16px rgba(13,27,42,0.04)
Raised card : 0 4px 24px rgba(13,27,42,0.12)
CTA button  : 0 2px 8px rgba(29,158,117,0.35)  (teal glow on hover)
```

### 1.6 Core Component Styles

**Primary Button:**
- Background: #1D9E75 → hover #0F6E56
- Text: White, 14px, weight 500
- Padding: 12px 24px
- Border-radius: 6px
- Box-shadow on hover: 0 4px 16px rgba(29,158,117,0.4)
- Transition: all 200ms ease

**Secondary Button:**
- Background: White
- Border: 1px solid #0D1B2A20
- Text: #0D1B2A, 14px, weight 500
- Hover: background #F5F0E8

**Destructive Button:**
- Background: #E24B4A
- Text: White

**Ghost Button:**
- No background, no border
- Text: #4A5568
- Hover: background rgba(13,27,42,0.04)

**Input Fields:**
- Height: 42px
- Border: 1px solid rgba(13,27,42,0.2)
- Border-radius: 8px
- Focus ring: 2px solid #1D9E75 with 2px offset
- Background: White
- Placeholder: #718096

**Risk Badges:**
- High Risk  : bg #FCEBEB, text #A32D2D, dot #E24B4A
- Medium Risk: bg #FAEEDA, text #854F0B, dot #BA7517
- Low Risk   : bg #EAF3DE, text #3B6D11, dot #639922

---

## PART 2 — GLOBAL NAVIGATION

### 2.1 Top Navigation Bar (Public — not logged in)

**Layout:** Fixed, full-width, height 64px, white background, border-bottom: 1px solid rgba(13,27,42,0.08), backdrop-blur on scroll.

**Left side:**
- Logo: "ClauseGuard" in DM Serif Display, 22px, #0D1B2A
  - Small legal document icon (SVG, custom) to the left of text, 20×20px, teal colored
  - Clicking logo → navigates to `/`

**Center navigation links (desktop only — hidden on mobile):**
- "How It Works" → `/how-it-works`
- "Verticals" → dropdown (see below)
- "Pricing" → `/pricing`
- "For Lawyers" → `/partners/lawyers`
- "Resources" → `/resources`

**Verticals dropdown (hover reveals):**
- "Auto Component Suppliers" → `/verticals/auto-components`
- "Garment Exporters" → `/verticals/garment-exporters`
- "Electronics SMEs" → `/verticals/electronics`
- Divider
- "See all industries →" → `/how-it-works#industries`

**Right side:**
- "Log in" — ghost button → `/auth/login`
- "Start free — 3 contracts" — primary button → `/auth/signup`

**Mobile nav (hamburger, triggered at < 768px):**
- Hamburger icon (Lucide `Menu`) top-right
- Full-screen overlay slide-down, white background
- All links stacked vertically, 48px tap targets
- "Log in" and "Start free" buttons full-width at bottom of menu

---

### 2.2 App Navigation Bar (Logged in)

**Layout:** Fixed, full-width, height 60px, white background, border-bottom.

**Left:** ClauseGuard logo (same as above) — clicking → `/dashboard`

**Center:** Search bar (desktop only)
- Placeholder: "Search contracts, clauses, keywords…"
- Width: 380px
- On focus: expands to 480px with animation
- Keyboard shortcut: `Cmd+K` / `Ctrl+K`
- On type: opens command palette dropdown showing: matching contracts, recent searches, quick actions

**Right:**
- Notification bell icon (Lucide `Bell`) — badge counter for pending alerts
  - Click → dropdown of latest 5 notifications (renewal alerts, analysis complete)
- Avatar circle (user initials or profile photo, 32px)
  - Click → dropdown:
    - Name + email (non-clickable header)
    - Divider
    - "Dashboard" → `/dashboard`
    - "Settings" → `/settings`
    - "Billing & Plan" → `/settings/billing`
    - Divider
    - "Log out"

---

### 2.3 App Sidebar (Left sidebar, app pages only)

**Width:** 240px, always visible on desktop; collapsible to icon-only (48px) mode via toggle button; drawer on mobile.

**Top section:**
- Plan badge: "Free Plan (2/3 used)" or "Starter" etc. — small pill badge
- "Analyse New Contract" button — full-width, primary teal, Lucide `Plus` icon

**Navigation items (icon + label, 40px height each, 4px border-radius, hover bg #F5F0E8):**
- `LayoutDashboard` icon — Dashboard → `/dashboard`
- `FileText` icon — My Contracts → `/contracts`
- `Search` icon — Contract Search → `/repository`
- `BookOpen` icon — My Playbook → `/playbook`
- `CalendarClock` icon — Renewal Calendar → `/calendar`
- `Users` icon — Legal Partners → `/referrals`

**Divider**

- `Settings` icon — Settings → `/settings`
- `CreditCard` icon — Billing → `/settings/billing`

**Bottom (pinned):**
- Usage indicator: "Contracts this month: 2/15" with a subtle progress bar
- Link: "Upgrade plan →" in teal if approaching limit

---

## PART 3 — GLOBAL FOOTER (PUBLIC PAGES)

**Layout:** 4-column grid on desktop, stacked on mobile. Dark background (#0D1B2A), white text.

**Column 1 — Brand:**
- ClauseGuard logo (white variant)
- Tagline: "Know what you're signing — before it costs you."
- Social links: LinkedIn icon, Twitter/X icon (SVG, white, 20px each)

**Column 2 — Product:**
- Heading: "Product" (Label style)
- How It Works
- Pricing
- Auto Component Contracts
- Garment Export Contracts
- For Lawyers

**Column 3 — Company:**
- Heading: "Company"
- About Us
- Resources / Blog
- Contact Us
- Partner Program

**Column 4 — Legal:**
- Heading: "Legal"
- Privacy Policy
- Terms of Service
- Legal Disclaimer
- Cookie Policy

**Bottom bar (full width, border-top #FFFFFF15):**
- Left: "© 2026 ClauseGuard Technologies Pvt. Ltd. · Chennai, Tamil Nadu"
- Center: Disclaimer pill: "Not a law firm. Not legal advice." — small pill badge, amber background
- Right: "Made in Chennai 🇮🇳"

---

## PART 4 — PUBLIC / MARKETING PAGES

---

### PAGE 01 — HOMEPAGE (`/`)

**Meta title:** "ClauseGuard — AI Contract Risk Analyzer for Indian SMEs"  
**Meta description:** "Upload any vendor, buyer, or service contract and get a plain-English risk report in 60 seconds. Built for Tamil Nadu exporters, manufacturers, and growing businesses."

---

#### SECTION 1: HERO

**Layout:** Full-width, min-height 92vh, dark navy background (#0D1B2A) with subtle paper texture overlay (low-opacity noise SVG pattern). Two-column layout on desktop (text left, visual right).

**Left column (max-width 560px):**

- Small announcement badge at top:
  - Amber pill: "🚀 India-EU FTA 2026 — protect your new export contracts"
  - Clicking → `/resources/india-eu-fta-guide`

- H1 heading (DM Serif Display, 52px, white, line-height 1.1):
  - Line 1: "Sign every contract"
  - Line 2 (italic): "knowing exactly"  
  - Line 3: "what you're signing."

- Subheadline (Instrument Sans, 18px, rgba(255,255,255,0.7), line-height 1.6, max-width 480px):
  "Upload any vendor, buyer, or supplier agreement. ClauseGuard reads every clause in plain English and flags what could hurt your business — before you sign."

- Trust line (12px, rgba(255,255,255,0.45)):
  "Trusted by auto component suppliers, garment exporters, and IT businesses across Tamil Nadu. Not legal advice."

- CTA group (margin-top 32px):
  - PRIMARY: "Analyse your first contract free →" (teal button, 48px height, 18px font)
    - Clicking → `/auth/signup`
  - SECONDARY LINK (below, not a button): "See a sample analysis" (white underline link, 14px)
    - Clicking → opens a modal showing a pre-populated demo contract report (the Tiruppur export agreement example)

- Social proof row (margin-top 40px):
  - 5 star icons (teal)
  - "Trusted by 200+ Tamil Nadu businesses" (white, 14px)
  - Small avatar stack (5 overlapping placeholder avatars, circular, 32px each)

**Right column — Product visual:**
- A styled mockup of the contract report page (not a screenshot — a crafted HTML/SVG illustration showing):
  - A contract PDF thumbnail on the left
  - An arrow pointing right
  - A ClauseGuard risk report card showing:
    - Overall risk score "7.2 / 10 — High Risk" (red badge)
    - 3 flagged clause cards:
      - "🔴 Unlimited Indemnification (Section 11)"
      - "🔴 Auto-renewal — 90 days notice required (Section 14)"
      - "🟡 Governing law: London courts (Section 22)"
    - A "Counter-clause suggested ↓" label in teal
  - This illustration animates on load: the contract slides in from left, analysis cards cascade in with staggered 200ms delays

**Scroll indicator:** Small animated chevron-down icon at bottom-center of hero, white, bouncing animation. Clicking scrolls to Section 2.

---

#### SECTION 2: SOCIAL PROOF / LOGO STRIP

**Layout:** Full-width, off-white (#F5F0E8) background, 80px vertical padding.

**Heading (center):**
"Protecting businesses in Tamil Nadu's fastest-growing export sectors"  
(16px, Text Secondary, Instrument Sans)

**Logo/industry row:**
5 industry cards side by side (or scrolling ticker on mobile):
1. "Auto Component Suppliers · Hosur / Chennai" — car icon
2. "Garment Exporters · Tiruppur / Erode" — fabric/thread icon
3. "Electronics SMEs · Sriperumbudur" — circuit icon
4. "IT & Software Services · Chennai" — code icon
5. "Pharmaceutical Manufacturers · Coimbatore" — flask icon

Each card: white background, 12px border-radius, subtle shadow, icon (24px teal), industry name in 14px.

---

#### SECTION 3: THE PROBLEM

**Layout:** Full-width, white background, 96px vertical padding. Two-column (text left, stats right).

**Left column:**

- Label badge: "THE PROBLEM" (uppercase, teal, 12px)
- H2: "Every contract you sign unprotected is a liability waiting to happen."
- Body text (3 paragraphs, 16px, line-height 1.7):
  - "Most small business contracts are written by the other party's lawyers — designed to protect them, not you. Auto-renewal traps, unlimited indemnification clauses, one-sided termination rights. These aren't rare edge cases. They're in almost every standard vendor agreement."
  - "Getting a lawyer to review every contract costs ₹5,000–₹50,000 per document and takes days. Most SME owners skip it entirely and hope for the best."
  - "ClauseGuard is the middle path — a 60-second AI review that catches what you'd miss, in plain English, before you sign."

**Right column — 3 stat cards (stacked):**

Card 1 (red accent left border):
- Stat: "₹18 Lakhs"
- Label: "Average cost of an auto-renewal trap missed by a Tiruppur exporter"

Card 2 (amber accent):
- Stat: "1 in 3"
- Label: "Indian SME contracts contain a clause that limits your legal rights without you knowing"

Card 3 (teal accent):
- Stat: "60 sec"
- Label: "Average time for ClauseGuard to complete a full contract risk analysis"

---

#### SECTION 4: HOW IT WORKS

**Layout:** White background, 96px vertical padding, center-aligned.

**Label:** "HOW IT WORKS"
**H2:** "From contract to clarity in three steps."

**3-step visual (horizontal on desktop, vertical on mobile):**

Each step has: step number (large, 64px, DM Serif Display, very light teal), icon (48px, teal), heading, body.

Step 1 — Upload
- Icon: `Upload` (Lucide)
- Heading: "Upload your contract"
- Body: "PDF, DOCX, or DOC. Drag and drop or click to upload. Up to 50MB. Your file is encrypted and private."
- Visual footnote: "Supports: contracts from Stellantis, Apple, UK/EU buyers, SaaS vendors"

Step 2 — Analyse
- Icon: `ScanLine` (Lucide)
- Heading: "ClauseGuard reads every clause"
- Body: "Our AI reads the full document, identifies clause types, scores each one for risk, and generates plain-English explanations — in under 60 seconds."

Step 3 — Act
- Icon: `ShieldCheck` (Lucide)
- Heading: "Get your risk report + counter-clauses"
- Body: "A complete risk report with clause-by-clause breakdown, risk scores, and — for high-risk clauses — the exact replacement language to propose back to the other party."

**CTA below steps:**
"Start your free analysis — no credit card required →" (teal button)

---

#### SECTION 5: FEATURE SHOWCASE

**Layout:** Dark navy background (#0D1B2A), 96px vertical padding.

**Label:** "WHAT YOU GET" (white, uppercase)
**H2:** "Everything you need to negotiate with confidence." (white)

**Feature grid (2×3 on desktop, 1 column on mobile):**

Feature 1 — Risk Scoring
- Icon: `Gauge` (teal, 32px)
- Heading: "Clause-by-clause risk scores" (white)
- Body: "Every clause rated 1–10. High-risk clauses flagged in red with detailed reasoning — not just a label, but an explanation of exactly what could go wrong." (rgba(255,255,255,0.65))

Feature 2 — Plain English
- Icon: `MessageSquare`
- Heading: "Plain-English rewrites"
- Body: "Legal language translated into plain English every time. You should never have to Google what a contract clause means."

Feature 3 — Counter-clauses
- Icon: `Edit3`
- Heading: "AI redlining — counter-clause generator"
- Body: "For every high-risk clause, ClauseGuard generates the specific alternative language to propose back. Hand it to the other party or use it as your negotiation brief."

Feature 4 — Personal Playbook
- Icon: `BookMarked`
- Heading: "Your personal contract preferences"
- Body: "Define your non-negotiables once — 'I never accept mandatory arbitration,' 'I always require 90-day data export windows.' Every future contract is checked against your playbook automatically."

Feature 5 — Renewal Alerts
- Icon: `CalendarClock`
- Heading: "Auto-renewal reminders"
- Body: "ClauseGuard extracts every key date from your contracts and reminds you 30, 60, or 90 days in advance. Never miss a renewal window again."

Feature 6 — PDF Export
- Icon: `Download`
- Heading: "Exportable risk reports"
- Body: "Every analysis generates a branded PDF report you can share with your team, your bank, or your lawyer — pre-formatted and clearly laid out."

---

#### SECTION 6: TESTIMONIAL / USE CASE STORY

**Layout:** Off-white background (#F5F0E8), 96px vertical padding. Alternating left-right layout.

**Story 1 (text left, visual right):**

Label: "AUTO COMPONENT SUPPLIER · HOSUR, TAMIL NADU"
H3: "How a Hosur supplier avoided ₹25 lakhs in unexpected liability."
Body: "A Tier-2 auto component supplier received a supply agreement from a European OEM. Section 11 contained an unlimited indemnification clause — buried in 38 pages of legal text. ClauseGuard flagged it as 'Critical' in under 60 seconds and generated the counter-clause language. The supplier negotiated a capped liability amount before signing."
Quote (indented, italic, teal left border): "I had no idea what Section 11 meant. ClauseGuard explained it in 3 sentences and told me exactly what to ask for."
Attribution: "— Operations Manager, Auto Component Manufacturer, Hosur"

Right visual: A styled card showing the flagged clause and ClauseGuard's explanation (decorative, same style as hero).

**Story 2 (text right, visual left) — Garment exporter:**

Label: "GARMENT EXPORTER · TIRUPPUR, TAMIL NADU"
H3: "Caught a silent auto-renewal before it locked in an 8-month commitment."
Body: Similar narrative format. Shows a different example.

**CTA (center, below stories):**
"Read more case studies →" (secondary button) → `/resources#case-studies`

---

#### SECTION 7: VERTICAL CTA CARDS

**Layout:** White background, 64px vertical padding.

**Heading:** "Built for Tamil Nadu's export industries."

**3 cards (horizontal row, each clickable):**

Card 1 — Auto Components
- Badge: "Fastest growing" (amber)
- Icon: factory/gear icon (teal, 32px)
- Heading: "Auto Component Suppliers"
- Body: "Stellantis, Hyundai, Rolls-Royce supply agreements. OEM tooling contracts. IP assignment clauses."
- Link: "View auto component guide →" → `/verticals/auto-components`

Card 2 — Garment Exporters
- Badge: "India-EU FTA 2026" (green)
- Icon: fabric icon
- Heading: "Garment Exporters"
- Body: "UK/EU buyer agreements. Quality audit clauses. Auto-renewal traps in long-term supply deals."
- Link: "View garment exporter guide →" → `/verticals/garment-exporters`

Card 3 — IT & SaaS
- Icon: laptop code icon
- Heading: "IT Businesses & Startups"
- Body: "SaaS vendor agreements. Data ownership clauses. IP work-for-hire. Service level agreements."
- Link: "View IT guide →" → `/verticals/it-startups`

---

#### SECTION 8: PRICING PREVIEW

**Layout:** Dark navy background, 80px vertical padding.

**Label:** "PRICING"
**H2:** "Start free. Upgrade when you need to." (white)
**Subheading:** "3 free contract analyses every month. No credit card required." (rgba white)

**3 pricing cards (horizontal, center aligned):**

Free card (white bg, navy border):
- "Free" heading
- "₹0 / month"
- Features: 3 analyses/month, basic risk report, no export
- Button: "Start free →" → `/auth/signup`

Starter card (teal accent border — HIGHLIGHTED "Most popular"):
- "Starter" heading
- "₹1,999 / month"
- Features: 15 analyses/month, full risk report, PDF export, renewal alerts, counter-clauses
- Button: "Start 14-day trial →" → `/auth/signup?plan=starter`

Growth card (white bg):
- "Growth" heading  
- "₹4,999 / month"
- Features: 50 analyses/month, all starter features, personal playbook, priority analysis
- Button: "Get started →" → `/auth/signup?plan=growth`

Link below: "See full pricing comparison →" → `/pricing`

---

#### SECTION 9: LAWYER PARTNER STRIP

**Layout:** Amber/warm off-white background (#FAEEDA), 64px vertical padding. Horizontal layout.

**Left text:**
Label: "FOR LEGAL PROFESSIONALS"
H3: "Partner with ClauseGuard. Receive pre-qualified SME clients."
Body: "ClauseGuard connects SMEs with verified Tamil Nadu lawyers when their contracts require expert review. We send you prepared clients who already understand their problem."

**Right CTA:**
Button: "Apply as a legal partner →" → `/partners/lawyers`
Small text below: "Zero cost to join. You pay only on successful client connections."

---

#### SECTION 10: FINAL CTA

**Layout:** Dark navy, 80px vertical padding, center aligned.

**H2:** "Your next contract is waiting." (white, DM Serif Display)
**Body:** "Upload it. Understand it. Negotiate it." (white, 20px)

**CTA Button (large, 56px height, 20px font):**
"Analyse your first contract — it's free →" → `/auth/signup`

Small text: "3 free analyses per month · No credit card required · Cancel anytime"

---

### PAGE 02 — PRICING (`/pricing`)

**Meta title:** "Pricing — ClauseGuard"

#### Section 1: Pricing Header
- H1: "Simple pricing. Real protection."
- Subheading: "Start free. Upgrade only when you need more analyses."
- Toggle: "Monthly / Annual" (toggle switch) — Annual shows "Save 20%" label

#### Section 2: Pricing Table

**4 columns (Free, Starter, Growth, Pro):**

| Feature | Free | Starter ₹1,999 | Growth ₹4,999 | Pro ₹9,999 |
|---|---|---|---|---|
| Contracts/month | 3 | 15 | 50 | Unlimited |
| Clause-by-clause breakdown | ✓ | ✓ | ✓ | ✓ |
| Risk scoring (1–10) | ✓ | ✓ | ✓ | ✓ |
| Plain-English explanations | ✓ | ✓ | ✓ | ✓ |
| Counter-clause generator | — | ✓ | ✓ | ✓ |
| PDF export | — | ✓ | ✓ | ✓ |
| Renewal alerts | — | ✓ | ✓ | ✓ |
| Personal playbook | — | — | ✓ | ✓ |
| Contract repository | — | — | ✓ | ✓ |
| Conversational search | — | — | — | ✓ |
| Priority analysis (< 30 sec) | — | — | — | ✓ |
| API access | — | — | — | ✓ |

CTA button per column. Starter column highlighted with teal border.

#### Section 3: FAQ Accordion
- 6 common questions (pricing objections):
  - "What counts as one contract?"
  - "What happens when I hit my monthly limit?"
  - "Can I cancel anytime?"
  - "Is my contract data private?"
  - "Is this legal advice?"
  - "Do you offer invoicing for Indian businesses?"

#### Section 4: Enterprise/Team Note
- Gray card at bottom
- "Need more than 5 team members or custom volume? Contact us for a custom plan."
- Button: "Contact us →" → `/contact`

---

### PAGE 03 — HOW IT WORKS (`/how-it-works`)

**Detailed 5-section educational page:**

Section 1: Full 3-step walkthrough (expanded from homepage)

Section 2: "What ClauseGuard detects" — Interactive clause taxonomy
- 12 clause type cards, each expandable to show:
  - What the clause means
  - Why it's risky for Indian SMEs
  - Example from a real contract (anonymized)
  - What ClauseGuard outputs for this clause type

Section 3: "What ClauseGuard does NOT do" (trust-building section)
- Card: "We are not a law firm"
- Card: "We don't replace your lawyer"
- Card: "We don't file documents or represent you"
- Footer disclaimer: Prominent legal disclaimer box.

Section 4: Industries section (all verticals overview)

Section 5: Step-by-step animated demo (embedded Loom video or custom HTML animation)

---

### PAGE 04 — AUTO COMPONENTS VERTICAL (`/verticals/auto-components`)

**Target audience:** Hosur/Chennai/Coimbatore Tier-2 and Tier-3 auto component suppliers.

**Page structure:**

Section 1: Hero (dark navy, vertical-specific)
- H1: "Protect your OEM supply agreements before Stellantis and Hyundai lock you in."
- Subheading specific to the sector: "138 Tamil Nadu suppliers are signing complex OEM agreements this year. Here's what to watch for."
- CTA: "Analyse an OEM agreement free →"

Section 2: "The risks in OEM supply contracts" — 5 specific clause cards with real examples:
1. Unlimited indemnification (machinery defect scenario)
2. Unilateral quality audit termination
3. Volume commitment without demand guarantee
4. IP ownership of custom tooling/dies
5. Governing law: European jurisdiction

Section 3: "What changed in 2026" — India-EU FTA implications card

Section 4: Sample report preview (anonymized OEM agreement excerpt)

Section 5: Lawyer partner for this vertical (featured card: a verified Chennai automotive law specialist)

Section 6: CTA

---

### PAGE 05 — GARMENT EXPORTERS VERTICAL (`/verticals/garment-exporters`)

Same structure as auto-components page but tailored to:
- UK/EU buyer agreements
- Quality audit clauses from UK retail brands
- Auto-renewal traps in long-term supply deals
- India-NZ FTA and India-EU FTA implications for new buyer contracts
- Price revision clauses

---

### PAGE 06 — LAWYER PARTNER PROGRAM (`/partners/lawyers`)

**Target audience:** SME-serving lawyers in Tamil Nadu.

Section 1: Hero
- H1: "Receive better-prepared SME clients. Free to join."
- Subheading: "ClauseGuard refers SME clients to verified Tamil Nadu lawyers when contracts require expert legal review. You pay only when a connection leads to a consultation."

Section 2: How the partnership works — 3 step flow
1. Apply and get verified
2. ClauseGuard flags high-risk clauses → shows "Get expert review" to users
3. User connects with you → you receive a pre-briefed client who understands their problem

Section 3: What you receive
- Clients who already know their specific legal issue
- ClauseGuard risk report attached for every referral
- Your profile page on ClauseGuard platform
- ₹500–₹1,500 per successful consultation referral fee (paid monthly)

Section 4: "What ClauseGuard is and isn't"
- Prominently states: "ClauseGuard does not give legal advice. It identifies risk. Your expertise converts that awareness into legal strategy."

Section 5: Application form
Fields:
- Full name *
- Law firm name *
- Bar Council enrollment number *
- City / District *
- Areas of practice (checkboxes): Commercial, Contracts, Export/Import, Intellectual Property, Employment, Real Estate, Other
- Industries served (checkboxes): Auto components, Garments/Textiles, IT/Software, Pharma, Manufacturing, Other
- Phone number *
- Email address *
- Brief bio (textarea, 200 chars max)
- "I confirm I am a licensed advocate registered with the Bar Council of Tamil Nadu" (checkbox, required)
- Submit button: "Submit application →"

On submit: POST to `/api/partner-application` → email notification to admin + confirmation email to applicant via Resend.

---

### PAGE 07 — RESOURCES / BLOG (`/resources`)

Section 1: Featured post hero (full width, large card)

Section 2: Category filter tabs
- All | Contract Guides | Legal Explainers | Industry Updates | Case Studies

Section 3: 3-column article grid
- Each card: category tag, H3 title, 2-line excerpt, date, read time, "Read more →"

Section 4: Newsletter signup
- "Get contract intelligence for Tamil Nadu SMEs — monthly digest"
- Email input + "Subscribe" button
- On submit: POST to `/api/newsletter` → add to Resend audience list

---

### PAGE 08 — ABOUT (`/about`)

Section 1: Mission statement (dark navy, full-width hero)
- H1: "Built in Chennai. Built for Tamil Nadu's businesses."
- Body: Story of why ClauseGuard was built (founder story, the problem observed)

Section 2: The problem in numbers (3 stat cards)

Section 3: "Our principles"
- 3 cards: Plain English always | Never legal advice, always risk intelligence | Built for SMEs, not enterprises

Section 4: Contact + location
- Map embed (Mapbox or Google Maps) showing Chennai
- Contact info

---

### PAGE 09 — CONTACT (`/contact`)

**Two-column layout:**

Left column (form):
- H2: "Get in touch"
- Fields:
  - Name * (text input)
  - Email * (email input)
  - Company name (text input)
  - I am a: radio buttons — "Business owner / SME" | "Lawyer / Legal professional" | "Investor" | "Other"
  - Subject * (select dropdown):
    - General enquiry
    - Product question
    - Partnership (Law firm)
    - Press / Media
    - Other
  - Message * (textarea, min-height 120px)
  - "Subscribe to newsletter" (checkbox, pre-checked)
  - Submit: "Send message →" (primary teal button)
  
On submit: POST to `/api/contact` → creates record in Supabase `contact_submissions` table → sends notification email to team via Resend → sends auto-reply to user.

Right column (info):
- Email: hello@clauseguard.in
- "We respond within 1 business day"
- Office: Chennai, Tamil Nadu
- For lawyer partnerships: "Apply here →" (links to /partners/lawyers)

---

### PAGE 10 — LEGAL PAGES

**Privacy Policy (`/legal/privacy`):**
Standard structured doc covering: data collected, how used, Supabase storage, Anthropic API calls (no training), Stripe data, user rights, deletion process, contact for privacy queries.

**Terms of Service (`/legal/terms`):**
Standard SaaS ToS covering: service description, acceptable use, subscription terms, payment terms, disclaimers, limitation of liability.

**Legal Disclaimer (`/legal/disclaimer`):**
**This is the most important legal page.** Prominently placed disclaimer repeated multiple times:
"ClauseGuard is not a law firm. ClauseGuard does not provide legal advice. All analysis and reports generated by ClauseGuard are for informational purposes only and do not constitute legal counsel, legal opinion, or legal advice of any kind. Users should not rely on ClauseGuard analysis as a substitute for professional legal advice from a licensed advocate. For any contract involving significant financial obligations, intellectual property, employment, or other material rights, you should consult a licensed attorney. Use of ClauseGuard does not create an attorney-client relationship."

---

## PART 5 — AUTHENTICATION PAGES

### PAGE 11 — SIGN UP (`/auth/signup`)

**Layout:** Split screen. Left: product visual/brand panel (navy bg, teal text, animated mockup). Right: form panel (white).

**Left panel:**
- Logo (white)
- Headline: "Your first 3 analyses are completely free."
- 3 bullet points (teal check icons):
  - "Understand every clause before signing"
  - "Get counter-clause suggestions for risky terms"
  - "Never miss an auto-renewal deadline"
- Bottom: testimonial quote (small, italic)

**Right panel — Sign Up form:**

Heading: "Create your account" (H2, DM Serif Display)
Sub: "Already have an account? [Log in →]" (link to `/auth/login`)

Fields:
- Full name * (text input, placeholder "Your full name")
- Work email * (email input, placeholder "you@company.com")
  - Real-time validation: invalid email format shown inline
- Password * (password input with show/hide toggle, `Eye` / `EyeOff` icon)
  - Strength indicator bar (4 segments, fills and changes color as password strengthens)
  - Requirements hint (appears on focus): "8+ characters, one number, one uppercase"
- Company name (optional text input)
- I primarily need ClauseGuard for: (select dropdown)
  - Auto component supply contracts
  - Garment / textile export agreements
  - IT / SaaS vendor agreements
  - Other business contracts

Checkbox (required): "I agree to the [Terms of Service] and [Privacy Policy]"
Checkbox (optional, pre-checked): "Notify me about auto-renewal dates and contract insights"

Submit button: "Create account →" (full-width, 48px, teal)

Divider: "or"

Google OAuth button: "Continue with Google" (white, border, Google logo SVG, full-width)

On submit:
1. Client-side Zod validation
2. POST to Supabase auth (email/password signup)
3. If plan param in URL (e.g. `?plan=starter`), store in session for post-verification redirect to billing
4. Send verification email via Supabase Auth (Resend template)
5. Redirect to `/auth/verify-email`

**Email verification holding page (`/auth/verify-email`):**
- Centered, minimal
- Email icon (large, teal)
- H2: "Check your email"
- Body: "We've sent a verification link to [email]. Click it to activate your account."
- Link: "Didn't receive it? Resend →" (triggers resend via Supabase)
- Small: "Wrong email? [Go back →]"

---

### PAGE 12 — LOG IN (`/auth/login`)

Same split-screen layout as sign-up.

**Right panel — Login form:**

Heading: "Welcome back"
Sub: "Don't have an account? [Start for free →]"

Fields:
- Email * (email input)
- Password * (password input with show/hide toggle)
  
Link below password: "Forgot password? →" → `/auth/forgot-password`

Submit: "Log in →" (full-width, teal, 48px)

Divider: "or"

Google OAuth: "Continue with Google"

Error state (shown inline below form):
- Incorrect email/password: red bordered message box: "Incorrect email or password. Please try again."
- Account not verified: amber box: "Please verify your email first. [Resend verification →]"

On success: redirect to `/dashboard`

---

### PAGE 13 — FORGOT PASSWORD (`/auth/forgot-password`)

Minimal centered layout (no split screen).

- H2: "Reset your password"
- Body: "Enter your email address and we'll send you a reset link."
- Email field
- Submit: "Send reset link →" (teal)
- Back link: "← Back to login"

On submit: Supabase password reset email sent. Show success state: "Reset link sent! Check your email." (same page, form replaced by success message).

**Reset Password page (`/auth/reset-password`):**
- Linked from email, contains Supabase reset token in URL
- Fields: New password + Confirm password
- Button: "Set new password →"
- On success: redirect to `/auth/login` with success toast

---

## PART 6 — APP PAGES (AUTHENTICATED)

---

### PAGE 14 — DASHBOARD (`/dashboard`)

**Layout:** Sidebar (240px) + main content area.

**Main content — top section:**

Greeting header:
"Good morning, [First Name]." (H2, DM Serif Display, 28px)
Sub: "You have [N] contracts analyzed this month. [N] renewals coming up." (14px, text secondary)

**Stats row (4 metric cards, equal-width grid):**

Card 1 — Monthly usage
- Large number: "8 / 15" (current/limit)
- Label: "Contracts analysed this month"
- Progress bar (teal, filling to 53%)
- If > 80% used: amber warning "Running low — [Upgrade plan →]"

Card 2 — Risk summary
- Large number: "3" (large, red colored if > 0)
- Label: "High-risk contracts in your library"
- Sub: "Review recommended"

Card 3 — Upcoming renewals
- Large number: "2"
- Label: "Contracts renewing in 60 days"
- Sub: "Earliest: [Contract name] — [Date]"

Card 4 — Contracts saved
- Large number: "24"
- Label: "Total contracts in your library"

---

**Recent contracts section:**

Heading: "Recent contracts" (H4) + "View all →" link (right-aligned)

Table (sortable columns):
| Contract name | Type | Date uploaded | Overall risk | Status | Actions |
|---|---|---|---|---|---|
| Stellantis_SupplyAgreement_2026.pdf | OEM Supply | 14 May 2026 | 🔴 High (8.2) | Analysis complete | [View] [Export] [⋮] |
| NDA_TechVendor.docx | NDA | 12 May 2026 | 🟢 Low (2.1) | Analysis complete | [View] [Export] [⋮] |
| Franchise_Agreement_Draft.pdf | Franchise | 10 May 2026 | 🔴 High (7.8) | Analysis complete | [View] [Export] [⋮] |

Row hover: subtle background highlight, Actions column fully visible.
"View" → `/contracts/[id]`
"Export" → downloads PDF report immediately
"⋮" (kebab menu) → Edit name | Delete | Reanalyse

**Upload CTA card (always shown below table, if under limit):**
Dashed border card (1px dashed rgba(29,158,117,0.4)):
- `Upload` icon (large, teal, 32px)
- "Drop a contract here to analyse it"
- "or [click to browse files]" (link)
- Sub: "Supports PDF, DOCX, DOC, TXT · Max 50MB"
- On drag-over: border turns solid teal, light teal background, "Drop to analyse" text

---

**Upcoming renewals panel (right sidebar column on desktop):**

If any contracts have upcoming renewal dates:

Panel heading: "Renewal alerts" (H4) + `Bell` icon

Card per upcoming renewal:
- Contract name (truncated, link)
- "Renews [Date]"
- "[ ] days remaining" — color coded (red if < 30, amber if 30–60, green if > 60)
- "View contract →" link

If no renewals: empty state illustration + "No upcoming renewals. Good news! →"

---

**Playbook reminder (shown only if user hasn't set up playbook yet):**

Amber card at top of dashboard (dismissable):
"💡 Set up your Contract Playbook — define your non-negotiables and we'll check every contract against them automatically. [Set up now →]" → `/playbook`

---

### PAGE 15 — CONTRACT UPLOAD (`/contracts/new`)

**Layout:** Centered, max-width 700px, no sidebar content competing.

**Heading:** "Analyse a new contract" (H2)
**Sub:** "Your contract is private and encrypted. Analysis takes 30–90 seconds." (Text secondary)

**Upload zone (full-width, 200px height):**
- Dashed border (2px dashed rgba(29,158,117,0.5)), border-radius 12px
- Large upload icon (48px, teal)
- "Drag and drop your contract here"
- "or" (divider text)
- "Choose file" button (secondary)
- File types: "PDF, DOCX, DOC, TXT · Max 50MB"

**After file selected (before upload):**
- File name shown with document icon
- File size shown
- "Remove" link (×)
- "This file looks good. Ready to analyse." (green confirmation text if valid)
- Error state if invalid: "File type not supported" or "File too large"

**Contract name field:**
- Text input, pre-filled with filename (editable)
- Placeholder: "e.g. Stellantis Supply Agreement 2026"
- Helper: "This is just for your reference — name it something you'll recognize."

**Contract type select:**
- Label: "What type of contract is this?"
- Options: OEM / Supply Agreement | Vendor / SaaS Agreement | NDA | Franchise Agreement | Employment Agreement | Service Agreement | Lease / Rental | Other

**Analysis depth toggle (radio):**
- "Standard analysis" (default, 30–90 sec)
- "Priority analysis" (15–30 sec) — Pro plan only. If on lower plan: shows lock icon + "Available on Pro plan [Upgrade →]"

**Terms reminder (small text, amber):**
"⚠ ClauseGuard is not a law firm. This analysis is for informational purposes only. [Learn more →]"

**Submit button:**
"Analyse this contract →" (full-width, 48px, teal, `Loader` icon spins during upload)

---

**Upload progress state (same page, form replaced):**

Animated progress indicator:
1. "Uploading file…" (with upload progress bar, %)
2. "Reading document…" (spinner)
3. "Identifying clauses…" (spinner, teal)
4. "Scoring risks…" (spinner)
5. "Generating plain-English summary…" (spinner)
6. "Almost done…" (spinner)

Each step appears sequentially with a checkmark when complete.

Total time indicator: "This usually takes 30–60 seconds"

Cancel link (bottom): "Cancel and go back →"

On completion: auto-redirect to `/contracts/[id]` with a confetti or subtle success animation.

---

### PAGE 16 — CONTRACT ANALYSIS REPORT (`/contracts/[id]`)

**This is the core product page. Every detail matters.**

**Layout:** Full-width with left content (main report) and right sticky panel (action sidebar).

---

**Page header (sticky on scroll):**

Left: Contract name (editable inline — click to edit, shows input on click, saves on blur)
Right:
- "Export PDF" button (secondary, `Download` icon)
- "Share" button (secondary, `Share2` icon) — copies shareable link
- "⋮" kebab menu:
  - Rename contract
  - Re-analyse
  - Delete contract

---

**SECTION A: EXECUTIVE SUMMARY CARD**

Full-width card, border-left 4px solid (red/amber/green based on risk).

Top row:
- Contract type badge (pill): "OEM Supply Agreement"
- Risk badge (large, right): "🔴 HIGH RISK — 7.8 / 10"
  - Below badge: "3 critical clauses require attention"

Executive summary text:
- AI-generated 3–5 sentence plain English summary
- Shown in a serif quote-like style: "This contract contains several clauses that heavily favour the buyer..."
- "See full analysis ↓" anchor link

Key stats row (3 inline stats):
- Total clauses identified: 24
- High-risk clauses: 3
- Medium-risk clauses: 5
- Key dates found: 2

---

**SECTION B: KEY DATES ALERT PANEL**

(shown only if dates were extracted — amber background)

Heading: "⏰ Key dates found in this contract"

Each date card:
- Date type label (Auto-renewal / Contract end / Notice deadline)
- Date value (bold)
- Days until that date (colored)
- "Set reminder" toggle (toggles on = creates a reminder, saved to DB)
- If reminder set: shows "Reminder set for [30/60/90 days before]" with edit/remove option

---

**SECTION C: PLAYBOOK VIOLATIONS PANEL**

(shown only if user has a playbook and violations were found — amber/red banner)

Heading: "⚠ Your playbook was violated — [N] of your preferences were not met in this contract"

Each violation:
- Your preference: "I never accept mandatory arbitration"
- Violated by: "Section 18 — Dispute Resolution"
- Link: "See clause →" (scrolls to clause in Section D)

---

**SECTION D: CLAUSE-BY-CLAUSE BREAKDOWN**

Heading: "Clause breakdown" (H3)
Filter bar: "All" | "High Risk (3)" | "Medium Risk (5)" | "Low Risk (16)" | "Flagged by me"
Sort: "By risk (high first)" | "By section number"

**Each clause card:**

Card structure (expandable accordion):

Collapsed state:
- Left: Risk badge (🔴/🟡/🟢) + clause type label ("Indemnification Clause")
- Center: Section number ("Section 11.3") + first 80 chars of original text (truncated)
- Right: Risk score ("9.1 / 10"), chevron expand icon, flag icon (toggle to flag)

Expanded state (click to expand):

**Sub-section 1 — Original text:**
Heading: "Original contract language" (Label, 12px)
Text: Full original clause text in JetBrains Mono font, 14px, light gray background (#F8F7F4), border-left 3px solid (risk color)

**Sub-section 2 — Plain English:**
Heading: "What this means" (Label, 12px, teal)
Text: AI plain-English explanation, 15px, normal font. Reads like a trusted advisor explaining it.

**Sub-section 3 — Why it matters:**
Heading: "Why this is risky for you" (Label, 12px, amber if medium, red if high)
Text: Specific risk explanation in context of the user's business.

**Sub-section 4 — Counter-clause (only for risk score ≥ 6):**
Heading: "Suggested counter-clause" (Label, 12px, green)
Background: light green (#EAF3DE)
Text: The specific replacement language in formal contract style, JetBrains Mono
"Copy counter-clause" button (small, `Copy` icon) — copies text to clipboard, shows "Copied!" toast

**Sub-section 5 — User actions:**
- "Flag for my lawyer's review" (toggle checkbox) — saved to DB
- "Add a personal note" (text input, saves on blur, stored per-clause)
- "Resolved" (checkbox) — marks as reviewed, dims the card

---

**SECTION E: OVERALL RISK CHART**

Card heading: "Risk breakdown by clause type"

Horizontal bar chart (custom, no library needed — pure CSS):
- Y-axis: clause types (Indemnification, Limitation of Liability, Auto-renewal, etc.)
- X-axis: risk score 0–10
- Each bar colored by risk level
- Hover: tooltip showing clause name and score

---

**SECTION F: EXPERT REVIEW CTA (shown if overall risk ≥ 6)**

Card with amber border:
- Heading: "This contract has serious risks that require expert review"
- Body: "ClauseGuard has identified clauses that could result in significant liability. We recommend reviewing these with a qualified lawyer before signing."
- Lawyer cards (1–2 verified partner lawyers for relevant vertical):
  - Lawyer photo/initials circle
  - Name
  - Specialization: "Commercial & Export contracts — Tamil Nadu"
  - "Get in touch →" button (opens a modal)
  
**Lawyer contact modal:**
- "Connect with [Lawyer name]"
- Short description of the high-risk clauses to discuss (pre-filled from analysis)
- Your name (pre-filled)
- Your phone number (input)
- Preferred callback time (time picker)
- Message (pre-filled with: "I'd like to discuss the high-risk clauses identified in my contract analysis.")
- Submit: "Request callback →" — POST to `/api/lawyer-referral` → notifies lawyer partner + logs referral

---

**RIGHT STICKY PANEL (desktop only, 260px wide, sticky top):**

**Quick actions card:**
- "Export PDF report" (primary button) → downloads PDF
- "Copy shareable link" (secondary) → copies `/contracts/[id]/share?token=...`
- "Reanalyse" (ghost) → triggers re-analysis

**Risk gauge (circular):**
- Large circular gauge showing overall risk score (7.8)
- Color fill (red for high, amber for medium, green for low)
- Score number large in center

**Quick stats:**
- Clauses: 24 total
- High risk: 3
- Medium: 5
- Flagged: 0

**Renewal alert toggle:**
- If dates found: "Set renewal alert" toggle

---

### PAGE 17 — CONTRACT REPOSITORY (`/repository`)

**Purpose:** Search and query all analyzed contracts conversationally (Sirion-inspired).

**Layout:** Sidebar + main content.

**Top section:**

H2: "Contract Repository"
Sub: "Search across all your analyzed contracts, clauses, and risk findings."

**Conversational search bar (hero-size, prominent):**
- Large input (56px height, full-width, rounded)
- Placeholder: "Ask anything — e.g. 'Which contracts allow unilateral price changes?' or 'Show me all contracts renewing in July'"
- Search icon (`Search`, 20px, teal)
- Keyboard shortcut: `Cmd+K`
- "Ask" button (teal, right side of input)

**Suggested queries (shown below input before first search):**
- Pill chips (clickable, fills input):
  - "Which contracts renew in the next 90 days?"
  - "Show me all contracts with high-risk indemnification clauses"
  - "Which vendor contracts allow unilateral price changes?"
  - "Find all contracts governed by foreign law"

**Search results:**
Shown as cards below the search bar after AI processes the query.
Each card: contract name, matching clause excerpt highlighted, risk level badge, "View contract →" link.

AI answer summary: A 2-3 sentence plain-English answer above the cards.
Example: "3 of your contracts contain clauses allowing the other party to change prices without your consent. They are: Stellantis Supply Agreement (Section 4.2), AWS Vendor Agreement (Section 7), and Zoho CRM Terms (Section 12.1)."

**Below search — full contracts table:**

Same table structure as dashboard but showing all contracts, all time.
Filters: Risk level | Contract type | Date range | Status (analysed/pending) | Flagged

---

### PAGE 18 — PERSONAL PLAYBOOK (`/playbook`)

**Purpose:** User defines their contract preferences once; every future analysis checks against them.

**Layout:** Single column, max-width 760px, centered.

**Header:**
H2: "Your Contract Playbook"
Sub: "Define your non-negotiables. Every contract you analyse will be checked against these preferences automatically."

**If no preferences set yet — onboarding state:**

Empty state card:
- `BookOpen` icon (48px, teal)
- "You haven't set up your playbook yet."
- "Take 5 minutes to define your preferences and ClauseGuard will automatically flag violations in every future contract."
- "Start with our recommended defaults →" button (teal)
  - Pre-fills 5 sensible defaults based on their industry (selected during signup)

---

**Preferences list (when set up):**

Section heading: "Your preferences ([N] active)" + "Add new preference +" (link, right aligned)

Each preference card:
- Toggle (on/off) — left
- Preference text (editable inline): "I never accept mandatory arbitration clauses"
- Category badge: "Dispute Resolution" (auto-categorized)
- Last matched: "Violated in Stellantis Supply Agreement" (amber, link) — or "No violations yet" (green)
- `Edit` icon (pencil, click to edit inline)
- `Trash` icon (delete, with confirmation)

**Add new preference modal (triggered by "Add +" button):**
- "Describe your preference in plain English:"
- Large textarea placeholder: "e.g. 'I always require at least 90 days notice before contract termination' or 'I never accept limitation of liability below 12 months of contract value'"
- "Category" (auto-detected, shown after typing): read-only field shows what ClauseGuard categorized it as
- "Save preference" button

**Suggested preferences (shown in right panel or below form):**

Based on industry:
- For auto components: "I require IP ownership of all custom tooling and dies produced for this contract"
- For garments: "I require a minimum 60-day notice window before any quality audit can trigger termination"
- For IT: "I require at least 90 days to export my data if the contract is terminated for any reason"

Each shown as a card with "Add this →" button.

---

### PAGE 19 — RENEWAL CALENDAR (`/calendar`)

**Layout:** Sidebar + full calendar view.

**Calendar view:**

Monthly calendar grid (large, prominent). Each day cell shows:
- Contract name tags (up to 3, overflow "and N more")
- Color coded by urgency (red if < 30 days, amber if 30–60, green if 60+)

**Right sidebar panel:**

"Upcoming events" list (next 90 days, sorted by date):
Each item:
- Date (bold)
- Contract name (link → `/contracts/[id]`)
- Event type badge: "Auto-renewal" / "Contract end" / "Notice deadline"
- Days remaining (colored)
- Reminder status: "Reminder set ✓" or "Set reminder +"

**Set reminder flow:**
Click "Set reminder +" → inline expand:
- "Remind me [dropdown: 14 / 30 / 60 / 90] days before"
- "Via [email / WhatsApp (if enabled)]"
- "Save reminder" button → POST to `/api/reminders`

**Empty state (no upcoming events):**
Illustration + "No upcoming renewals or deadlines. All clear! ✓"

---

### PAGE 20 — LAWYER REFERRAL NETWORK (`/referrals`)

**Purpose:** Browse verified Tamil Nadu lawyers for expert contract review.

**Header:**
H2: "Expert Legal Review"
Sub: "When your contract needs more than risk intelligence — connect with verified Tamil Nadu lawyers who specialize in your industry's contract types."

**Filter row:**
- Location: All Tamil Nadu | Chennai | Coimbatore | Tiruppur | Hosur | Other
- Specialization: Commercial Contracts | Export/Import | IT/IP | Employment | Franchise | Lease

**Lawyer cards grid (2 columns desktop, 1 mobile):**

Each lawyer card:
- Initials avatar (or photo if provided), 48px circle
- Name + credentials
- Firm name
- Specializations (pill tags): "Commercial" "Export" "Auto Components"
- Cities served
- Languages: Tamil, English
- Bio snippet (2 lines)
- "Connect →" button (teal, triggers contact modal — same modal as in report page)
- Bar enrollment number (small, muted — trust signal)

**"Are you a Tamil Nadu lawyer?" banner at bottom:**
- "Join our partner network and receive pre-qualified SME clients. [Apply here →]"

---

### PAGE 21 — SETTINGS — PROFILE (`/settings`)

**Layout:** Settings sidebar (left, 200px) + main content.

**Settings sidebar links:**
- Profile (active)
- Billing & Plan → `/settings/billing`
- Notifications → `/settings/notifications`
- Security → `/settings/security`
- Data & Privacy → `/settings/data`

**Profile form:**
- Profile photo (circle, click to upload — opens file picker, crops to square, stored in Supabase Storage)
- Full name (text input)
- Email (text input, shows "Email verified ✓" or "Unverified — resend →")
- Company name (text input)
- Industry (select — same options as signup)
- City / State (text inputs)
- Save button: "Save changes →" (teal)

---

### PAGE 22 — SETTINGS — BILLING (`/settings/billing`)

**Current plan section:**

Card showing:
- Plan name + badge: "Starter Plan ✓"
- Usage this cycle: "8 of 15 contracts used" (progress bar)
- Cycle resets: "[Date]"
- Monthly price: "₹1,999 / month"
- "Manage subscription →" button (opens Stripe Customer Portal in new tab)
- "Cancel plan" link (ghost, small, below button)

**Upgrade section (if not on Pro):**

Comparison strip of remaining plans:
- For each higher tier: features unlock + price + "Upgrade to [plan] →" button
- Clicking upgrade → POST to `/api/billing/upgrade` → creates Stripe Checkout session → redirect to Stripe Checkout

**Payment history:**

Table:
| Date | Amount | Plan | Status | Invoice |
|---|---|---|---|---|
| 1 May 2026 | ₹1,999 | Starter | Paid | [Download PDF] |

"Download" → Stripe invoice PDF.

**Billing details:**
- "Update payment method →" (opens Stripe portal)
- "Add GST number" (text input, for Indian business invoicing)

---

### PAGE 23 — SETTINGS — NOTIFICATIONS (`/settings/notifications`)

**Email notifications toggles:**

Section heading: "Email preferences"

Each setting row (label left, toggle right):
- "Analysis complete" — Notify when contract analysis finishes (default: ON)
- "Renewal reminders" — Emails before contract renewal dates (default: ON)
- "Playbook violations" — Notify when a contract violates your preferences (default: ON)
- "WeeklyDigest" — Weekly summary of contract library and upcoming dates (default: OFF)
- "Product updates" — New features and improvements (default: OFF)

**WhatsApp notifications (Beta):**

Section heading: "WhatsApp notifications (Beta)" + "Beta" badge

Card:
- "Receive contract analysis reports and renewal reminders on WhatsApp"
- Phone number input (+91 prefix, Indian mobile number)
- "Verify via OTP" button → sends OTP via WhatsApp Business API
- OTP input field (appears after "Verify" clicked)
- On verified: "WhatsApp enabled ✓ — reports will be sent to [number]"

WhatsApp notification toggles (only shown after verified):
- "Contract analysis via WhatsApp" toggle
- "Renewal reminders via WhatsApp" toggle

---

### PAGE 24 — SETTINGS — SECURITY (`/settings/security`)

- Change password (current + new + confirm)
- Active sessions (list of devices, "Log out all other devices" button)
- Delete account (destructive action, requires typing "DELETE" to confirm)

---

### PAGE 25 — SETTINGS — DATA & PRIVACY (`/settings/data`)

- "Export my data" button → ZIP file download of all contracts, reports, and account data
- "Delete all contracts" (destructive, confirmation required)
- "Delete my account" (redirects to security page delete flow)
- Link to Privacy Policy
- "Contact privacy team" → `privacy@clauseguard.in`

---

## PART 7 — PAYMENT PIPELINE (STRIPE)

### 7.1 Free Tier
- All users start on Free plan by default on signup
- 3 contract analyses per billing cycle (month starts from signup date)
- When limit hit: `useContractLimit()` hook returns `over_limit: true`
- UI response: "Analyse new contract" button becomes disabled + tooltip: "You've used all 3 free analyses this month. [Upgrade to continue →]"
- Dashboard shows upgrade prompt card

### 7.2 Upgrade Flow

**Trigger points:**
- Limit reached → modal: "Upgrade to continue analysing contracts"
- Dashboard "Upgrade" card
- `/settings/billing` → upgrade buttons
- In-app banners (at 80% usage)

**Upgrade modal (shown when limit hit):**
- Modal overlay (dark backdrop)
- H3: "You've used all [N] analyses this month"
- 3 plan cards (Starter / Growth / Pro) with brief feature callouts
- Primary CTA on recommended plan: "Upgrade to Starter — ₹1,999/month →"
- Secondary: "See all plans →" → `/pricing`
- Dismiss link: "Not now →"

**Stripe Checkout Session creation:**
- `POST /api/billing/checkout`
- Body: `{ plan: 'starter' | 'growth' | 'pro', billing: 'monthly' | 'annual' }`
- Server creates Stripe Checkout session with:
  - `customer_email`: user's email
  - `metadata`: `{ supabase_user_id: user.id }`
  - `success_url`: `/settings/billing?success=1`
  - `cancel_url`: `/settings/billing?cancelled=1`
- Returns `{ url: checkoutUrl }`
- Client redirects to `checkoutUrl`

**Stripe Checkout page (Stripe-hosted):**
- Pre-filled email
- Indian payment methods: UPI, Cards, Netbanking (via Stripe India)
- GST number field (Stripe India handles GST)
- Currency: INR

**Post-payment success:**
- Stripe webhook fires `checkout.session.completed`
- `POST /api/webhooks/stripe` receives event (verified with `stripe.webhooks.constructEvent`)
- Server updates `profiles` table: `plan = 'starter'`, `contracts_used_this_cycle = 0`, `stripe_customer_id`, `cycle_reset_date`
- User redirected to `/settings/billing?success=1`
- Page shows: green success banner "Welcome to [Plan Name]! Your account has been upgraded."

### 7.3 Subscription Management

**Via Stripe Customer Portal (one-click):**
- `POST /api/billing/portal` → creates Stripe portal session → redirect
- In portal: cancel subscription, update payment method, download invoices, update email

**Plan downgrade:**
- Handled by Stripe portal
- Webhook `customer.subscription.updated` fires
- Server updates profile plan accordingly
- If downgraded to Free: usage resets, contracts above limit remain viewable but not re-analysable

**Subscription renewal:**
- Webhook `invoice.payment_succeeded` fires monthly
- Server resets `contracts_used_this_cycle = 0`, updates `cycle_reset_date`
- Sends renewal confirmation email via Resend

**Subscription cancellation:**
- Webhook `customer.subscription.deleted` fires
- Server downgrades to Free plan
- Sends cancellation email with "We're sorry to see you go" message + option to resubscribe

---

## PART 8 — EMAIL PIPELINE (RESEND)

### 8.1 Transactional Emails

All emails built with React Email + Resend. All carry ClauseGuard branding (logo, footer with legal disclaimer, unsubscribe link).

**Email 1: Welcome / Email Verification**
- Trigger: Supabase `signUp` event
- Subject: "Verify your ClauseGuard account"
- Content: Welcome message, large "Verify email" button, "Not you? Ignore this email"

**Email 2: Analysis Complete**
- Trigger: Contract analysis pipeline completes
- Subject: "[Contract name] — Analysis complete: [Risk level]"
- Content: 
  - Risk score and badge
  - 3 highest-risk clauses (summary cards, each with clause type and plain-English explanation)
  - "View full report →" button
  - "Export PDF report →" button

**Email 3: Renewal Alert**
- Trigger: Vercel Cron job runs daily, checks `contract_dates` for upcoming deadlines
- Subject: "⏰ [Contract name] renews in [N] days"
- Content: Contract details, renewal clause excerpt, date highlighted, "Review contract →" button, "View report →" link

**Email 4: Playbook Violation**
- Trigger: Analysis detects a violation of user's preferences
- Subject: "⚠ Your contract preferences were violated"
- Content: Which preference was violated, which clause violated it, "View counter-clause →" button

**Email 5: Plan Upgrade Confirmation**
- Trigger: Stripe `checkout.session.completed` webhook
- Subject: "You're now on [Plan] — ClauseGuard"
- Content: Plan name, what's unlocked, invoice attached, "Start analysing →" button

**Email 6: Approaching Usage Limit**
- Trigger: `contracts_used_this_cycle` hits 80% of limit
- Subject: "You've used [N] of [M] contract analyses this month"
- Content: Usage bar visual, upgrade CTA, "You have [N] remaining" callout

**Email 7: Contact Form Auto-Reply**
- Trigger: Contact form submission
- Subject: "We received your message — ClauseGuard"
- Content: "Thanks [name], we'll respond within 1 business day. Here's a copy of your message: [message]"

**Email 8: Partner Application Received**
- Trigger: Lawyer partner form submission
- Subject: "Your ClauseGuard partner application was received"
- Content: Application details summary, "We'll review and respond within 3 business days"

**Email 9: Password Reset**
- Trigger: Supabase password reset
- Subject: "Reset your ClauseGuard password"
- Content: Reset button, expires in 1 hour, ignore if not requested

---

## PART 9 — MOBILE RESPONSIVENESS

### Breakpoints
- Mobile: < 640px
- Tablet: 640px–1024px
- Desktop: > 1024px

### Mobile-specific behaviors:

**Navigation:** Hamburger → full-screen overlay. All nav items stacked. CTAs full-width.

**Dashboard:** Stats cards → 2×2 grid. Contract table → card-based list (each row becomes a card). Sidebar collapses to bottom navigation bar (fixed, 5 icons).

**Bottom navigation bar (mobile app, < 640px):**
Icons (equal width, 56px height): Dashboard | Contracts | Search | Calendar | Settings
Active icon: teal, label shown. Inactive: gray.

**Upload page:** Upload zone → full screen on mobile when focused. Camera icon option: "Take photo of contract" (opens device camera, saves as PDF via JS).

**Contract report:** Risk badges and clause cards stack vertically. Sticky header shows risk score. Right panel becomes bottom sheet (slide-up from bottom on tap of "Quick actions" button).

**Pricing page:** Plan cards stack vertically. Comparison table → accordion (each feature row expandable).

---

## PART 10 — MICRO-INTERACTIONS & ANIMATION

**Page transitions:** Fade + subtle translate-Y (10px) on route change — 200ms ease.

**Upload drag-over:** Border pulses to solid teal, background tints to rgba(29,158,117,0.04), text changes to "Drop to analyse."

**Analysis progress:** Each step animates in with a 300ms delay between steps. Checkmark appears with a satisfying scale-bounce when step completes.

**Clause card expansion:** Accordion expand with 250ms ease, height animates from 0 to full.

**Risk score gauge:** On page load, gauge needle animates from 0 to final score over 1 second (easeOutCubic).

**Clause counter-clause copy:** Button shows "Copied! ✓" for 2 seconds then returns to "Copy counter-clause."

**Renewal calendar dates:** Day cells with events pulse gently (opacity 0.7 → 1, loop) in red/amber if within 30 days.

**Toast notifications (bottom-right, Sonner library):**
- Analysis complete: green toast, 4 seconds
- Error: red toast, 6 seconds
- Copy success: neutral toast, 2 seconds
- Plan upgraded: confetti burst from top + green toast

**CTA button hover:** Teal deepens, subtle shadow glow, slight scale(1.01) transform.

**Dashboard greeting:** The greeting text types itself in on first login of the day (typewriter effect, 40ms per character) — subtle, one-time.

---

## PART 11 — ERROR STATES & EMPTY STATES

**Analysis failed (network/API error):**
Full-page error card: "Analysis could not be completed" — retry button, contact support link.

**Empty dashboard (0 contracts):**
Illustration (simple SVG of a document with a magnifying glass) + "Upload your first contract to get started" + large CTA.

**Empty repository (0 contracts to search):**
Illustration + "Your contract library is empty" + CTA.

**404 page:**
"This page doesn't exist" + ClauseGuard logo + "Go to dashboard →" + "Go home →"

**Maintenance page:**
"ClauseGuard is briefly offline for maintenance — back in [time]. Your contracts are safe." Dark navy, minimal.

---

## PART 12 — ACCESSIBILITY

- All interactive elements have `aria-label` attributes
- Color never used as sole indicator of meaning (always paired with text or icon)
- Focus rings visible on all interactive elements (2px teal outline)
- All images have `alt` text
- All form fields have associated `<label>` elements
- Tab order logical (left-to-right, top-to-bottom)
- Keyboard navigation fully functional (Escape to close modals, Enter to submit forms)
- Screen-reader-friendly toast announcements (aria-live regions)
- Contrast ratios: all text meets WCAG AA (4.5:1 minimum)

---

## PART 13 — SEO & ANALYTICS

**Every public page has:**
- Unique `<title>` and `<meta description>`
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Canonical URL
- Structured data (JSON-LD): Organization schema on homepage, FAQ schema on pricing FAQ

**PostHog event tracking (key events):**
- `contract_uploaded`
- `analysis_complete` (with risk level as property)
- `clause_expanded` (with clause type)
- `counter_clause_copied`
- `playbook_preference_added`
- `upgrade_modal_shown`
- `upgrade_completed` (with plan)
- `lawyer_referral_clicked`
- `pdf_exported`
- `renewal_alert_set`
- `signup_completed`

---

*End of ClauseGuard Full Website & Product UI Specification v2.0*
*Total pages specified: 25 app/product pages + all supporting states and pipelines*
*Ready for design handoff and development.*
