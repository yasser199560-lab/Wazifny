# Wazifny — AI-Powered Job Matching Platform for Lebanon

Monorepo containing the Next.js frontend and the FastAPI backend.

## Structure

```
wazifny/
├── frontend/                      Next.js 14 (App Router) + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx                Landing page (built)
│   │   ├── layout.tsx              Root layout, fonts, metadata
│   │   ├── globals.css             Tailwind entrypoint
│   │   ├── (auth)/                 login/, register/
│   │   ├── (talent)/               dashboard/, matches/, profile/, applications/,
│   │   │                           saved-jobs/, courses/
│   │   ├── (employer)/             dashboard/, post-job/, manage-jobs/, applicants/,
│   │   │                           saved-candidates/, company-profile/, subscription/
│   │   ├── (admin)/                overview/, users/, blocked-users/, jobs-moderation/
│   │   ├── jobs/                   Public job search
│   │   └── api/                    Next.js route handlers (if ever needed as a BFF)
│   ├── components/
│   │   ├── landing/                Navbar, Hero, StatsBar, Features, Categories,
│   │   │                           HowItWorks, Testimonials, CTABanner, Footer (built)
│   │   ├── ui/                     Button, Input, Badge, Card, Modal primitives
│   │   ├── layout/                 Sidebar/topbar shells per role
│   │   ├── talent/ employer/ admin/ shared/
│   ├── lib/                        landing-data.ts, api client, helpers
│   ├── hooks/                      useAuth, useJobMatches, etc.
│   ├── store/                      Client-side state (session, filters)
│   ├── types/                      Shared TS types mirroring backend schemas
│   └── public/images/              Logo + static assets
│
├── backend/                        FastAPI + MongoDB Atlas + AI pipeline
│   ├── app/
│   │   ├── main.py                 App entrypoint, CORS, startup/shutdown
│   │   ├── core/                   config.py (settings), security.py (JWT/hashing)
│   │   ├── db/                     mongodb.py (Motor async client)
│   │   ├── api/v1/
│   │   │   ├── router.py           Aggregates all endpoint routers
│   │   │   └── endpoints/          auth.py (built), talents.py, employers.py, jobs.py,
│   │   │                           applications.py, matches.py, courses.py, messages.py,
│   │   │                           notifications.py, admin.py
│   │   ├── models/                 Mongo document shapes (one file per collection group)
│   │   ├── schemas/                Pydantic request/response models
│   │   ├── services/                cv_parser_service.py, matching_service.py,
│   │   │                           notification_service.py, auth_service.py
│   │   ├── ai/
│   │   │   ├── cv_extraction/      spaCy + optional Gemini field extraction
│   │   │   ├── embeddings/         sentence-transformers embedding model
│   │   │   └── matching/           FAISS / cosine similarity ranking
│   │   └── utils/                  file_extraction.py, deps.py
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── docs/                           BRD, ERD, and other project documents
```

## Getting started

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

`.env` already exists with your real `MONGODB_URI` filled in and a generated
`JWT_SECRET_KEY`. Before running anything else, check the DB is actually
reachable (this catches DNS/firewall/Atlas allow-list issues immediately,
with a specific fix for each):
```bash
python -m scripts.check_db
```
If that succeeds, seed demo users + sample jobs + testimonials (safe to
re-run — it upserts, never duplicates):
```bash
python -m scripts.seed
```
Optionally, confirm your AI keys actually work (this also lists every
Groq model name your key currently has access to):
```bash
python -m scripts.check_ai
```
Then start the API:
```bash
uvicorn app.main:app --reload    # http://localhost:8000  (docs at /docs)
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000 — .env.local already points at the backend above
```

### Demo credentials (created by `scripts/seed.py`)

| Role     | Email                  | Password         |
|----------|-------------------------|------------------|
| Admin    | admin@wazifny.lb        | Admin@12345      |
| Employer | employer@wazifny.lb     | Employer@12345   |
| Talent   | talent@wazifny.lb       | Talent@12345     |

Log in at `/login` with any of these — it's a single unified form, no role
picker; the backend looks the account up by email and routes you to the
right place based on its `role`.

## What's built right now

- **Frontend:** the landing page, unified `/login`, role-toggle `/register`,
  `/forgot-password` + `/reset-password`, an auth-aware navbar, the public
  `/jobs` Find Jobs page + `/jobs/[id]` job detail page, a full **talent
  dashboard** at `/talent/*` (AI Matches, Browse Jobs, My Profile — now
  with real CV upload + AI autofill, Saved Jobs, Applications, Courses &
  Skill Gaps, Messages — now with AI-suggested replies, Notifications), and
  a full **employer dashboard** at `/employer/*` (Dashboard, Post a Job,
  Manage Jobs, Applicants — now with AI-assisted screening, Saved
  Candidates, Company Profile, Subscription, Messages, Notifications),
  plus `/about` with AI-authored Guides.
- **Backend:** JWT auth (incl. password reset via Elastic Email), MongoDB
  with DNS-aware diagnostics, AI-ranked job search, persisted AI Job
  Matches, personalized recommendations, one-click applications (email +
  in-app-notify the employer with the applicant's full profile, email-
  confirm the talent), save/unsave jobs, a full talent profile API
  including **CV upload + AI parsing/autofill**, AI-assisted skill-gap
  analysis, notifications, a conversations/messages system with
  **AI-suggested replies**, and the full employer side including
  **AI-assisted applicant screening**. A seed script populates all of it
  with demo data matching the reference design.

## CV upload + AI autofill (BRD §4.1)

`POST /talents/me/cv` (PDF or DOCX, 5 MB max) — extracts raw text
(pdfplumber / python-docx), asks the AI to pull out structured fields
(phone, city, country, headline, education, experience, skills) grounded
*only* in what's actually in the document, then merges the result onto the
profile with rules that make re-uploading safe:
- **Personal info** — only fills a field that's currently empty or was
  itself set by a *previous* CV parse. A field you typed in manually is
  never silently overwritten; editing a field also clears its "AI" badge.
- **Education/experience** — previous AI-sourced entries are replaced;
  anything you added manually is untouched (tracked via a `source` field).
- **Skills** — new ones are added; nothing is ever removed.
- The raw file is stored in MongoDB GridFS.
- If AI parsing fails (both providers down), the file still uploads and
  you're told plainly to fill fields in manually — upload never blocks on
  AI being available.

## AI features (Gemini primary, Groq fallback, always-on via plain fallback)

All AI calls go through `app/services/ai_service.py` — Gemini first, Groq
if Gemini fails, and a deterministic non-AI fallback if both are down.
Every call logs clearly which provider actually answered (or why it
didn't) — run `python -m scripts.check_ai` any time for a one-shot
diagnosis, including a live list of the Groq model names your key
currently has access to.

- **Job search ranking** (`GET /jobs?q=...`) — ranks real jobs by relevance.
- **AI Job Matches** (`GET /matches/me`) — scores every active job 0-100,
  persists scores to `job_matches` so Applications/Saved Jobs/Applicants/
  Saved Candidates all read the same number.
- **Recommendations** (`GET /jobs/recommended`) — same scoring, split view.
- **CV parsing/autofill** (`POST /talents/me/cv`) — see above.
- **Skill-gap analysis** (`GET /courses/skill-gap`) — deterministic
  detection/severity from real data; AI only clusters raw phrases into
  clean labels.
- **Chat "suggest a reply"** (`GET /messages/conversations/{id}/suggest-replies`)
  — 2-3 short draft replies grounded only in the real conversation so far,
  for either side (talent or employer). Never auto-sent — always shown as
  editable drafts the person reviews before clicking Send. Returns
  `ai_available: false` with an empty list (not generic canned text) if
  both providers are down, so nothing is ever mislabeled as "AI" when it
  isn't.
- **AI-assisted applicant screening** (`POST /applications/{id}/ai-screen`)
  — BRD §4.5, brought forward from "Phase 2 planned" on request. Compares
  a real applicant's profile against a real job's requirements, returns a
  recommendation (shortlist/consider/reject) with reasoning, strengths,
  and gaps — grounded only in the actual data, nothing invented. This is
  advisory, not autonomous: it never changes an application's status by
  itself. The employer sees the suggestion and applies it (or not) via the
  existing status dropdown — a human makes every final hiring call, which
  matters both because the AI can be wrong and for basic accountability in
  something this consequential.
- **About page "Guides"** — AI-authored but strictly grounded in facts
  about Wazifny's own real, already-built features — not fabricated news.

**On "outer" (external) jobs:** the `jobs` collection already has a
`source: "wazifny" | "external"` field and every search/matching function
handles it transparently. What's intentionally *not* here is any code
asking Gemini/Groq to *generate* external-looking listings — text models
can't browse the web or verify a real posting exists, so that would mean
showing users fabricated companies and job links. Real aggregation needs
an actual job-board API; [Adzuna](https://developer.adzuna.com/) has a
genuinely free tier (250 calls/day, real listings) that would be the
natural next integration.

## Email (Elastic Email) — and why your reset email got flagged

`app/services/notification_service.py` sends transactional email via
Elastic Email's v4 REST API — every call is best-effort (a failed send
logs a warning and never breaks the request that triggered it). Three
flows: password reset, application confirmation (talent), new-applicant
alert (employer, with the applicant's name/score and a link to their full
profile).

**Your Gmail "might be dangerous" warning was a real, structural issue —
not an HTML/button bug.** `ELASTIC_EMAIL_FROM_EMAIL` was set to a personal
`@gmail.com` address. Gmail (and most providers) actively distrust mail
claiming to be FROM their own domain when it wasn't actually sent through
their servers — that's exactly the phishing pattern their filter is built
to catch, regardless of how correct the email's HTML/CSS is (the button
you saw rendered fine; Gmail just disables interaction on flagged mail).
I added a startup/send-time check: the server now logs a clear WARNING
the moment it detects a free-provider FROM address, explaining the fix
(verify a domain you control in Elastic Email — Settings → Domains → add
the SPF/DKIM records they give you — then send from an address on that
domain, e.g. `notifications@yourdomain.com`). Until that's done, treat
email delivery as unreliable/best-effort, which is exactly how the code
already treats it.

### Current delivery safeguards

Reset emails are refused when the From address is a free-provider domain or,
outside development, when `FRONTEND_URL` is localhost/non-HTTPS. Before
enabling live email, verify a domain in Elastic Email, publish its SPF/DKIM
records, set a sender on that domain, and set `FRONTEND_URL` to the deployed
HTTPS frontend URL.

## Next steps (not built yet)

- The admin panel (`/overview` is still a placeholder).
- Real external job aggregation (see above).
- WebSocket-based live chat (Messages currently polls every 6s).
- Real payment processing for employer subscriptions (plan switching is
  instant/manual right now, matching the reference design).
- Multilingual (Arabic/English) support (BRD item, not yet started).
- Admin moderation/blocked-user management (BRD item, not yet started).
