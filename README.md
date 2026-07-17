<div align="center">

<br/>

<img src="https://img.shields.io/badge/Mentorque-AI%20Scheduling%20Platform-4F46E5?style=for-the-badge&logo=lightning&logoColor=white" alt="Mentorque" height="38"/>

<h1>Mentorque</h1>
<p><strong>An intelligent, AI-powered mentoring and scheduling platform — built for the modern enterprise</strong></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq_AI-LLaMA_3.1-F55036?style=flat-square&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white"/>
</p>

<p>
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#%EF%B8%8F-architecture"><strong>Architecture</strong></a> ·
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-file-structure"><strong>File Structure</strong></a> ·
  <a href="#-deployment-vercel"><strong>Deploy</strong></a>
</p>

<br/>

> **Mentorque** eliminates scheduling friction between junior talent and senior industry experts through AI-driven matchmaking, real-time availability grids, and a zero-friction booking workflow — all in one coherent platform.

<br/>

</div>

---

## ? What Is Mentorque?

Mentorque is a **full-stack, production-ready** mentoring platform that automates the entire lifecycle of a mentoring engagement — from a mentee posting their first request, to an AI ranking the best mentor matches, to an admin locking in a confirmed session slot. It is built around three distinct role-based consoles with real-time state and a shared PostgreSQL backend.

### The Three Consoles

| Role | Console | Primary Capability |
|---|---|---|
| ?? **Mentee** | Mentee Console | Submit requirements, set recurring weekly availability, track bookings |
| ?? **Mentor** | Mentor Console | Manage availability schedule, view confirmed upcoming sessions |
| ??? **Admin** | Admin Console | Review requirements queue, run AI batch matching, confirm session bookings |

---

## ??? Architecture

### High-Level System Topology

```mermaid
graph TD
    subgraph Client ["Browser Client"]
        UI["React 18 + TypeScript SPA\n(Vite Dev Server / Vercel Static)"]
        RC["Role Guard + Auth Context\n(JWT in localStorage)"]
        UI --> RC
    end

    subgraph API ["Express.js REST API (Node.js 20)"]
        direction TB
        MW["Auth Middleware\n(JWT Verification + RBAC)"]
        AuthR["POST /auth/login\nPOST /auth/signup\nGET /auth/me"]
        AvailR["GET/PUT /availability/me\nGET /availability/overlap"]
        ReqR["GET/POST /requirements\nPATCH /:id/status\nPOST /batch-match"]
        MentorR["GET /mentors\nPATCH /mentors/:id"]
        RecR["POST /recommendations/:reqId\nGET /recommendations/summary"]
        BookR["GET /bookings/me\nGET /bookings/all\nPOST /bookings\nDELETE /bookings/:id"]
        SetR["GET/PATCH /settings\nPOST /settings/backup"]

        MW --> AuthR
        MW --> AvailR
        MW --> ReqR
        MW --> MentorR
        MW --> RecR
        MW --> BookR
        MW --> SetR
    end

    subgraph DB ["PostgreSQL 15"]
        Users[("users")]
        Profiles[("user_profiles\nmentor_profiles")]
        Avail[("availability")]
        Reqs[("requirements")]
        Recs[("recommendations")]
        Books[("bookings")]
        Settings[("settings")]
    end

    subgraph External ["External AI"]
        Groq["Groq Cloud API\n(LLaMA-3.1-8b-instant)"]
    end

    RC -- "REST / JSON" --> MW
    AuthR --> Users
    AvailR --> Avail
    ReqR --> Reqs
    MentorR --> Profiles
    RecR --> Recs
    BookR --> Books
    SetR --> Settings
    RecR <--> Groq
```

---

### Database Schema (Entity-Relationship Diagram)

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar hashed_password
        varchar role "admin or user or mentor"
        timestamp created_at
    }

    USER_PROFILES {
        uuid id PK
        uuid user_id FK
        jsonb tags
        text bio
    }

    MENTOR_PROFILES {
        uuid id PK
        uuid user_id FK
        text description
        jsonb tags
        text ai_rationale
        int network_health
        boolean is_active
        numeric rating_avg
        int rating_count
    }

    REQUIREMENTS {
        uuid id PK
        uuid user_id FK
        uuid assigned_mentor_id FK
        varchar call_type
        text description
        varchar status "pending or matched or booked or rejected"
        timestamp created_at
    }

    AVAILABILITY {
        uuid id PK
        uuid owner_id FK
        int day_of_week "0=Sun to 6=Sat"
        time start_time
        time end_time
        varchar timezone
        boolean is_recurring
    }

    BOOKINGS {
        uuid id PK
        uuid requirement_id FK
        uuid user_id FK
        uuid mentor_id FK
        uuid admin_id FK
        timestamp start_time
        timestamp end_time
        varchar status
    }

    RECOMMENDATIONS {
        uuid id PK
        uuid requirement_id FK
        uuid mentor_id FK
        int fit_score "0-100"
        text rationale
        timestamp created_at
    }

    SETTINGS {
        uuid id PK
        varchar key UK
        text value
        timestamp updated_at
    }

    USERS ||--o| USER_PROFILES : "has profile"
    USERS ||--o| MENTOR_PROFILES : "has mentor profile"
    USERS ||--o{ REQUIREMENTS : "submits"
    USERS ||--o{ AVAILABILITY : "defines"
    USERS ||--o{ BOOKINGS : "participates in"
    REQUIREMENTS ||--o{ RECOMMENDATIONS : "generates"
    REQUIREMENTS ||--o| BOOKINGS : "results in"
    MENTOR_PROFILES ||--o{ RECOMMENDATIONS : "appears in"
```

---

### Core Booking & AI Matching — Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Mentee
    actor Admin
    participant Frontend as React Frontend
    participant API as Express API
    participant Groq as Groq AI (LLaMA 3.1)
    participant DB as PostgreSQL

    Mentee->>Frontend: Fill requirement form (call type, description, tags)
    Frontend->>API: POST /requirements
    API->>DB: INSERT requirements (status=pending)
    API-->>Frontend: 201 Created

    Mentee->>Frontend: Click slots on TimeGrid
    Frontend->>API: PUT /availability/me
    API->>DB: DELETE old slots, INSERT new slots
    API-->>Frontend: 200 OK

    Admin->>Frontend: Open Requirements Queue
    Frontend->>API: GET /requirements?status=pending
    API->>DB: SELECT pending requirements
    API-->>Frontend: list of requirements

    Admin->>Frontend: Select requirements, Run Batch Match
    Frontend->>API: POST /requirements/batch-match

    loop For each requirement ID
        API->>DB: SELECT mentor pool + availability
        API->>Groq: Chat completion — rank mentors by fit score
        Groq-->>API: JSON ranked list with rationale
        API->>DB: UPDATE requirement status=matched
        API->>DB: INSERT recommendations
    end

    API-->>Frontend: batch match complete

    Admin->>Frontend: Click Find Match on a requirement
    Frontend->>API: POST /recommendations/:reqId
    API->>DB: SELECT overlap(user_avail, mentor_avail)
    API-->>Frontend: matches + overlap slots

    Admin->>Frontend: Select overlap slot, Confirm Booking
    Frontend->>API: POST /bookings
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT bookings
    API->>DB: UPDATE requirements status=booked
    API->>DB: DELETE used availability slots
    API->>DB: COMMIT
    API-->>Frontend: booking confirmed
    Frontend-->>Admin: Navigate to Requirements Queue
```

---

### Frontend Component Architecture

```mermaid
graph TD
    App["App.tsx"]
    Router["AppRoutes (BrowserRouter)"]
    AuthCtx["AuthContext\n(JWT, User, Profile)"]
    RoleGuard["RoleGuard\n(role-based redirect)"]

    App --> Router
    Router --> AuthCtx
    AuthCtx --> RoleGuard

    subgraph Public ["Public Pages"]
        Login["Login.tsx"]
        Signup["Signup.tsx"]
    end

    subgraph MenteePages ["Mentee Console"]
        MD["MenteeDashboard.tsx\nAvailability, Requirements, Bookings"]
    end

    subgraph MentorPages ["Mentor Console"]
        MentorD["MentorDashboard.tsx\nAvailability, Confirmed Calls"]
    end

    subgraph AdminPages ["Admin Console"]
        ADash["AdminDashboard.tsx"]
        RQ["RequirementsQueue.tsx"]
        MW["MatchingWorkspace.tsx"]
        MDir["MentorDirectory.tsx"]
        AB["AdminBookings.tsx"]
        AS["AdminSettings.tsx"]
    end

    subgraph Shared ["Shared Components"]
        DL["DashboardLayout.tsx"]
        SN["SideNav.tsx"]
        TG["TimeGrid.tsx"]
        SB["StatusBadge.tsx"]
        TP["TagPill.tsx"]
    end

    RoleGuard --> Login
    RoleGuard --> Signup
    RoleGuard --> MD
    RoleGuard --> MentorD
    RoleGuard --> ADash
    RoleGuard --> RQ
    RoleGuard --> MW
    RoleGuard --> MDir
    RoleGuard --> AB
    RoleGuard --> AS

    MD --> DL
    MentorD --> DL
    ADash --> DL
    DL --> SN
    MD --> TG
    MentorD --> TG
    MW --> TG
```

---

### AI Matching Engine — Internal Logic

```mermaid
flowchart TD
    Start(["Admin triggers matching for requirement ID"])
    FetchMentors["Fetch active mentor pool from mentor_profiles"]
    FetchAvail["Fetch mentee and mentor availability slots"]
    CalcOverlap["Calculate overlap days using overlap.util.js"]
    HasOverlap{Overlapping slots found?}
    BuildPrompt["Build structured prompt:\ncall type + description\nmentee tags\nmentor pool name, tags, description\noverlap windows"]
    GroqAPI["Send to Groq API\n(LLaMA-3.1-8b-instant)\nJSON mode output"]
    ParseJSON["Parse AI response:\nid, fit_score, rationale"]
    ValidJSON{Valid JSON array?}
    Fallback["Fallback: Tag-match scoring\ncount matching tags divided by max_tags times 100"]
    Sort["Sort by fit_score DESC"]
    Save["INSERT recommendations\nrequirement_id, mentor_id, fit_score, rationale"]
    Return(["Return ranked matches to Admin Workspace"])

    Start --> FetchMentors
    FetchMentors --> FetchAvail
    FetchAvail --> CalcOverlap
    CalcOverlap --> HasOverlap
    HasOverlap -- Yes --> BuildPrompt
    HasOverlap -- No --> Fallback
    BuildPrompt --> GroqAPI
    GroqAPI --> ParseJSON
    ParseJSON --> ValidJSON
    ValidJSON -- Yes --> Sort
    ValidJSON -- No --> Fallback
    Fallback --> Sort
    Sort --> Save
    Save --> Return
```

---

## ?? Features

### ??? Admin Workspace

| Feature | Description |
|---|---|
| **AI Batch Matching** | Multi-select pending requirements and trigger LLaMA 3.1 ranking against the entire active mentor pool in one click |
| **Matching Workspace** | Full 3-panel interface: Mentee details, Ranked mentor list with AI rationale, Real-time overlap TimeGrid |
| **Requirements Queue** | Filterable, paginated queue with inline expansion, batch selection, and instant reject/accept actions |
| **Mentor Directory** | Real-time directory with FAANG/Active filters, inline Quick Edit for tags & bio, and live active toggle |
| **Booking Management** | Full-view table of all confirmed sessions across the platform, with one-click CSV export |
| **Platform Settings** | Persistent settings console: toggle auto-matching, configure AI sensitivity, set timezone, trigger DB backup |

### ?? Mentee Console

| Feature | Description |
|---|---|
| **Requirement Submission** | Submit call type, description, and skill tags — directly queued for admin matching |
| **Weekly Availability Grid** | Click-to-select recurring weekly time slots (Mon–Fri, 09:00–16:00) with week navigation |
| **Live AI Match Helper** | Sidebar widget showing real-time count of mentors matching timezone and skill tags |
| **Booking History** | Full-width table with upcoming vs past session distinction, status badges, and cancel-only-future logic |

### ?? Mentor Console

| Feature | Description |
|---|---|
| **Recurring Availability** | Set and update weekly schedule with the interactive TimeGrid — past weeks are read-only |
| **Confirmed Sessions** | Full-width data table showing all booked calls, upcoming/past labels, and cancel option |
| **Match Performance Card** | Live compatibility score dynamically calculated from the mentor pool against pending demand |

---

## ?? Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React | 18 | Component-based SPA rendering |
| **Language** | TypeScript | 5 | End-to-end type safety |
| **Build Tool** | Vite | 5 | Sub-second HMR, optimized production bundles |
| **Styling** | Tailwind CSS | 3 | Utility-first with custom design tokens |
| **Routing** | React Router | 6 | Client-side navigation with role guards |
| **Backend** | Node.js + Express.js | 20 / 4.x | RESTful API with middleware pipeline |
| **Database** | PostgreSQL | 15 | Relational storage with transactional booking logic |
| **ORM/Driver** | `pg` (node-postgres) | latest | Direct SQL with parameterized inputs |
| **AI Engine** | Groq SDK + LLaMA 3.1 | 3.1-8b-instant | Fast JSON-structured mentor ranking |
| **Auth** | bcrypt + JWT | — | Password hashing + stateless token sessions |
| **Deployment** | Vercel | v2 | Monorepo: Static frontend + Serverless backend |

---

## ?? File Structure

```
mentoring_call_scheduling_system/
¦
+-- vercel.json                       # Monorepo build & routing config
+-- README.md
¦
+-- backend/
¦   +-- package.json
¦   +-- .env                          # PORT, DATABASE_URL, JWT_SECRET, GROQ_API_KEY
¦   +-- fixPasswords.js               # One-time bcrypt migration utility
¦   ¦
¦   +-- src/
¦       +-- server.js                 # HTTP server entry point
¦       +-- app.js                    # Express app: CORS, JSON, route mounting
¦       ¦
¦       +-- config/
¦       ¦   +-- db.js                 # PostgreSQL pool (node-postgres)
¦       ¦   +-- schema.sql            # Table definitions
¦       ¦   +-- seed.js               # Demo data seeder
¦       ¦   +-- seedNames.js          # Name arrays for seed generation
¦       ¦
¦       +-- middleware/
¦       ¦   +-- auth.middleware.js    # JWT verification ? req.user injection
¦       ¦   +-- rbac.middleware.js    # Role-based access control factory
¦       ¦
¦       +-- modules/
¦           +-- auth/
¦           ¦   +-- auth.routes.js    # POST /login · POST /signup · GET /me
¦           ¦
¦           +-- availability/
¦           ¦   +-- availability.routes.js   # GET|PUT /me · GET /overlap
¦           ¦   +-- overlap.util.js          # Pure function: slot intersection logic
¦           ¦
¦           +-- bookings/
¦           ¦   +-- bookings.routes.js       # GET /me · GET /all · POST / · DELETE /:id
¦           ¦
¦           +-- mentors/
¦           ¦   +-- mentors.routes.js        # GET / · PATCH /:id · GET /me/performance
¦           ¦
¦           +-- recommendations/
¦           ¦   +-- recommendations.routes.js  # POST /:reqId · GET /summary
¦           ¦   +-- groqService.js             # Prompt builder + Groq API + fallback scorer
¦           ¦
¦           +-- requirements/
¦           ¦   +-- requirements.routes.js  # Full CRUD + batch-match endpoint
¦           ¦
¦           +-- settings/
¦               +-- settings.routes.js  # GET / · PATCH / · POST /backup · POST /clear-cache
¦
+-- frontend/
    +-- package.json
    +-- .env                           # VITE_API_URL=http://localhost:5000/api
    +-- tailwind.config.js             # Custom tokens: primary, text-muted, border-subtle
    +-- vite.config.ts
    +-- tsconfig.json
    ¦
    +-- src/
        +-- main.tsx                   # React root (ReactDOM.createRoot)
        +-- App.tsx                    # Renders <AppRoutes />
        +-- index.css                  # Tailwind directives
        ¦
        +-- app/
        ¦   +-- routes.tsx             # BrowserRouter + all route definitions + catch-all
        ¦   +-- RoleGuard.tsx          # HOC: redirect by role if unauthorized
        ¦
        +-- lib/
        ¦   +-- api/
        ¦   ¦   +-- client.ts          # Fetch wrapper: auto-injects JWT, throws on error
        ¦   +-- auth/
        ¦       +-- AuthContext.tsx    # createContext: user, profile, login(), logout()
        ¦
        +-- components/
        ¦   +-- layout/
        ¦   ¦   +-- DashboardLayout.tsx  # Sidebar + topbar shell for all console pages
        ¦   ¦   +-- SideNav.tsx          # Role-aware nav links + logout redirect
        ¦   ¦
        ¦   +-- ui/
        ¦       +-- TimeGrid.tsx       # Weekly availability grid (click-to-select, week nav)
        ¦       +-- StatusBadge.tsx    # Colored badge: confirmed / pending / booked / rejected
        ¦       +-- TagPill.tsx        # Tag chip component with color variants
        ¦
        +-- pages/
            +-- auth/
            ¦   +-- Login.tsx          # Email + password form, role-based redirect on success
            ¦   +-- Signup.tsx         # Name, email, password, role selection
            ¦
            +-- user/
            ¦   +-- MenteeDashboard.tsx  # Availability grid, Requirement form, Booking table
            ¦
            +-- mentor/
            ¦   +-- MentorDashboard.tsx  # Availability grid, Confirmed calls table, Performance
            ¦
            +-- admin/
                +-- AdminDashboard.tsx   # Platform stats overview + quick action links
                +-- RequirementsQueue.tsx  # Pending queue, Batch match, Reject, Find Match
                +-- MatchingWorkspace.tsx  # 3-panel: Mentee info, AI matches, Overlap grid
                +-- MentorDirectory.tsx    # Directory grid, Filters, Quick Edit, Active toggle
                +-- AdminBookings.tsx      # All bookings table, Status filter, CSV export
                +-- AdminSettings.tsx      # AI config, Notifications, Timezone, DB backup
```

---

## ? Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 15
- **Groq API Key** — free at [console.groq.com](https://console.groq.com)

### 1 · Clone

```bash
git clone https://github.com/BugHunterX2101/mentoring_call_scheduling_system.git
cd mentoring_call_scheduling_system
```

### 2 · Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/mentorque
JWT_SECRET=your_super_secret_jwt_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Initialize database and seed demo data:

```bash
# Create schema (run via psql or your DB client)
psql -d mentorque -f src/config/schema.sql

# Seed demo accounts and availability
node src/config/seed.js
```

Start the API server:

```bash
npm run dev
# API running at http://localhost:5000
```

### 3 · Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
# App running at http://localhost:5173
```

### 4 · Demo Accounts

| Role | Email | Password |
|---|---|---|
| ??? Admin | `admin@mentorque.com` | `adminpassword` |
| ?? Mentor | `mentor1@example.com` | `password123` |
| ?? Mentee | `user1@example.com` | `password123` |

---

## ?? Deployment (Vercel)

This repository is pre-configured as a **Vercel Monorepo** with a single `vercel.json` at the root.

### Steps

1. **Push** your code to GitHub
2. **Import** the repository on [vercel.com](https://vercel.com)
3. **Set Environment Variables** in the Vercel project settings:

```
DATABASE_URL  ?  your production PostgreSQL connection string
JWT_SECRET    ?  a strong random secret
GROQ_API_KEY  ?  your Groq API key
```

4. **Deploy** — Vercel auto-detects the build config:

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "backend/src/app.js",    "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/app.js" },
    { "src": "/(.*)",     "dest": "/frontend/index.html" }
  ]
}
```

The frontend is served as a static SPA with client-side routing fallback. The backend runs as a Vercel Serverless Function at `/api/*`.

---

## ?? Security Model

```mermaid
flowchart LR
    Req["Incoming Request"] --> MW["auth.middleware.js\n(requireAuth)"]
    MW -- "No token or invalid" --> E401["401 Unauthorized"]
    MW -- "Valid JWT" --> Dec["Decode payload\nreq.user = id, role"]
    Dec --> RBAC["rbac.middleware.js\n(requireRole)"]
    RBAC -- "Role mismatch" --> E403["403 Forbidden"]
    RBAC -- "Role matches" --> Handler["Route Handler\n(Business Logic)"]
    Handler --> PG["PostgreSQL\n(parameterized queries)"]
```

- **Passwords** hashed with `bcrypt` (10 salt rounds) — plaintext never stored
- **JWT** tokens verified on every protected request via `Authorization: Bearer <token>`
- **RBAC** enforced at route level — admins, mentors, and users have distinct API access
- **SQL Injection** prevented by parameterized queries (`$1, $2, ...`) throughout all database calls
- **CORS** configured on the Express app — restrict `origin` in production to your frontend domain

---

## ??? User Journey Map

```mermaid
journey
    title Complete Mentoring Lifecycle
    section Mentee Onboarding
      Sign Up with email and role: 5: Mentee
      Set Weekly Availability: 4: Mentee
      Submit Requirement: 5: Mentee
    section Admin Processing
      Review Requirements Queue: 5: Admin
      Run AI Batch Match: 4: Admin
      Open Matching Workspace: 5: Admin
      Select Overlap Slot: 4: Admin
      Confirm Booking: 5: Admin
    section Session Delivery
      Mentor Sees Upcoming Booking: 5: Mentor
      Mentee Sees Upcoming Booking: 5: Mentee
      Session Completed: 5: Mentor, Mentee
```

---

## ?? API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | None | Login and receive JWT token |
| `POST` | `/api/auth/signup` | None | Register a new account |
| `GET` | `/api/auth/me` | JWT | Get current user + profile |

### Availability
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/availability/me` | User / Mentor | Get own recurring availability |
| `PUT` | `/api/availability/me` | User / Mentor | Replace own availability (full swap) |
| `GET` | `/api/availability/overlap` | Admin | Get slot intersection for a user + mentor pair |

### Requirements
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/requirements` | User | Submit a new mentoring request |
| `GET` | `/api/requirements` | Admin | List all requirements (filterable by status) |
| `GET` | `/api/requirements/me` | User | Get own submitted requirements |
| `GET` | `/api/requirements/:id` | Any | Get a single requirement by ID |
| `PATCH` | `/api/requirements/:id/status` | Admin | Update status (reject, match, etc.) |
| `POST` | `/api/requirements/batch-match` | Admin | Trigger AI matching for multiple IDs |
| `DELETE` | `/api/requirements/:id` | Admin / Owner | Delete a requirement (blocked if booked) |

### Recommendations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/recommendations/:reqId` | Admin | Run AI ranking for a requirement |
| `GET` | `/api/recommendations/summary` | JWT | Get platform-wide match summary stats |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Admin | Confirm a booking (transactional) |
| `GET` | `/api/bookings/me` | User / Mentor | Get own bookings |
| `GET` | `/api/bookings/all` | Admin | Get all platform bookings |
| `DELETE` | `/api/bookings/:id` | Admin / Owner | Cancel booking + revert requirement to pending |

### Mentors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/mentors` | Admin | Get full mentor directory |
| `PATCH` | `/api/mentors/:id` | Admin | Update mentor profile (tags, bio, isActive) |
| `GET` | `/api/mentors/me/performance` | Mentor | Get own compatibility performance score |

### Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/settings` | Admin | Get platform configuration |
| `PATCH` | `/api/settings` | Admin | Save configuration changes |
| `POST` | `/api/settings/backup` | Admin | Trigger PostgreSQL database backup |
| `POST` | `/api/settings/clear-cache` | Admin | Clear system-level cache |

---

## ?? Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a Pull Request

---

## ?? License

Distributed under the **MIT License**. Free for commercial and personal use.

---

<div align="center">
  <br/>
  <p>
    <strong>Mentorque</strong> — Engineered as a comprehensive full-stack technical showcase.<br/>
    Built with React 18 · Node.js · PostgreSQL · Groq AI
  </p>
  <br/>
</div>
