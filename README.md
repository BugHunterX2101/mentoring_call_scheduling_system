<div align="center">

<img src="https://img.shields.io/badge/Mentoring%20Call%20Scheduler-2B579A?style=for-the-badge&logo=react&logoColor=white" alt="Mentoring Call Scheduling System" />

<h1>Mentoring Call Scheduling System</h1>
<p><strong>An intelligent, real-time matchmaking and scheduling platform for industry mentorship</strong></p>
<p>Built with Node.js · React 18 · TypeScript · PostgreSQL · Tailwind CSS · Google Gemini AI</p>

<br/>

[![Frontend App](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge)](#)
[![Backend API](https://img.shields.io/badge/API_Docs-Express.js-000000?style=for-the-badge)](#)

<br/>

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## Executive Summary

This project delivers a **fully functional, AI-powered mentoring and scheduling platform** designed to eliminate the friction of pairing junior talent with senior industry experts. It is built as a complete full-stack application, prioritizing seamless UX, automated matchmaking, and a robust data model.

- **Intelligent Matchmaking**: Integrates with Google Gemini AI to analyze mentee requirements, rank the most qualified mentors, and generate natural language rationales for the match.
- **Advanced Scheduling Engine**: Features a bespoke React-based TimeGrid for managing complex availability schedules, mathematically ensuring overlap precision.
- **Role-Based Architecture**: Distinct, real-time dashboards for Mentees, Mentors, and Platform Administrators powered by an Express.js and PostgreSQL backend.
- **Enterprise UI/UX**: High-fidelity interfaces utilizing Tailwind CSS, offering optimistic UI updates and interactive data filtering out-of-the-box.

---

## System Architecture

### High-Level Topology

```mermaid
graph TD
    Browser["Browser Client (React/Vite)"]

    subgraph Backend ["Node.js Express Backend"]
        Auth["Auth Router\n(JWT Middleware)"]
        Mentors["Mentors Router\n(Directory & Status)"]
        Reqs["Requirements Router\n(Batch Matching)"]
        Bookings["Bookings Router\n(Overlap & Scheduling)"]
        AI["Recommendations Router\n(LLM Integration)"]
    end

    subgraph Database ["PostgreSQL"]
        DB[(Relational Tables)]
    end
    
    subgraph External ["External Services"]
        Gemini[Google Gemini API]
    end

    Browser -->|REST API| Auth
    Browser -->|REST API| Mentors
    Browser -->|REST API| Reqs
    Browser -->|REST API| Bookings
    Browser -->|REST API| AI
    
    Auth --> DB
    Mentors --> DB
    Reqs --> DB
    Bookings --> DB
    AI --> DB
    
    AI <-->|Prompt Generation| Gemini
```

### Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string hashed_password
        string role "admin, user, mentor"
    }
    
    USER_PROFILES {
        int id PK
        int user_id FK
        string tags "JSON Array"
    }
    
    MENTOR_PROFILES {
        int id PK
        int user_id FK
        string quote
        string ai_rationale
        int network_health
        boolean is_active
    }
    
    REQUIREMENTS {
        int id PK
        int user_id FK
        string call_type
        string description
        string status "pending, matched, booked"
    }
    
    AVAILABILITY {
        int id PK
        int owner_id FK
        int day_of_week
        time start_time
        time end_time
    }
    
    BOOKINGS {
        int id PK
        int requirement_id FK
        int user_id FK
        int mentor_id FK
        datetime start_time
        datetime end_time
    }
    
    RECOMMENDATIONS {
        int id PK
        int requirement_id FK
        int mentor_id FK
        int fit_score
        string rationale
    }

    USERS ||--o{ USER_PROFILES : "has"
    USERS ||--o{ MENTOR_PROFILES : "has"
    USERS ||--o{ REQUIREMENTS : "submits"
    USERS ||--o{ AVAILABILITY : "sets"
    USERS ||--o{ BOOKINGS : "participates in"
    
    REQUIREMENTS ||--o{ RECOMMENDATIONS : "generates"
    REQUIREMENTS ||--o| BOOKINGS : "results in"
```

### Request Flow: Core Booking & AI Matching

```mermaid
sequenceDiagram
    participant Mentee
    participant Admin
    participant System
    participant GeminiAI
    
    Mentee->>System: Submit Requirement (Call Type, Description)
    Mentee->>System: Update Weekly Availability
    
    Admin->>System: Select Pending Requirements & Run Batch Match
    System->>GeminiAI: Send Requirement + Mentor Pool
    GeminiAI-->>System: Return Ranked List & Rationales
    System->>System: Save Recommendations
    
    Admin->>System: Open Matching Workspace
    System-->>Admin: Display AI Rationale & Mutual Overlap Grid
    Admin->>System: Select Time Slot & Confirm Booking
    System->>System: Finalize Booking & Remove Used Slots
```

---

## Core Capabilities

### Administrative Tools & Matchmaking

| Feature | Details |
|---|---|
| AI-Powered Matching | Evaluates mentor pools against mentee needs using Google Gemini, returning a ranked fit score and customized rationale. |
| Batch Processing | Multi-select interface in the Requirements Queue to trigger background matching for dozens of mentees simultaneously. |
| Overlap Analysis | Visual TimeGrid explicitly highlights mutual availability overlaps between a mentee and a selected mentor. |
| Mentor Directory | Real-time directory with Quick Filters (FAANG, Active Only) and instant state toggling for mentor availability. |

### Mentee & Mentor Workflows

| Feature | Details |
|---|---|
| Dynamic Tags | Mentees can submit free-form tags and requirements directly into the system to guide the AI matchmaker. |
| Real-Time Dashboard | Mentees receive live AI feedback banners indicating the number of mentors in the network matching their exact timezone/needs. |
| Confirmed Sessions | Mentors see a live-updating sidebar of confirmed upcoming calls mapped exactly to their availability inputs. |
| TimeGrid State Management | Drag, drop, and clear scheduling grids that intelligently format complex timestamp logic into simple UI states. |

---

## Technology Stack

| Domain | Technology | Implementation Details |
|---|---|---|
| **Frontend Framework** | React 18 / Vite | Handles component rendering, routing, and fast local development. |
| **Styling** | Tailwind CSS | Custom utility classes tailored to replicate enterprise SaaS design tokens. |
| **Backend Framework** | Node.js + Express.js | High-performance RESTful API architecture. |
| **Database** | PostgreSQL | Robust relational storage with the pg client wrapper. |
| **Artificial Intelligence** | Google Generative AI SDK | Integrates gemini-1.5-flash for high-speed, JSON-structured output ranking. |
| **Security** | bcrypt & JWT | Industry-standard password hashing and secure token-based session generation. |

---

## Local Development Guide

### System Requirements

- Node.js 18 or higher
- PostgreSQL 15 or higher

### 1. Repository Initialization

```bash
git clone https://github.com/BugHunterX2101/mentoring_call_scheduling_system.git
cd mentoring_call_scheduling_system
```

### 2. Backend Environment Setup

```bash
cd backend
npm install
```

Configure your `/backend/.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
JWT_SECRET=your_super_secret_key
LLM_API_KEY=your_google_gemini_api_key
```

Execute the server:
```bash
npm run dev
```

### 3. Frontend Environment Setup

```bash
cd frontend
npm install
```

Configure your `/frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Execute the frontend client:
```bash
npm run dev
```

Navigate to [http://localhost:5173](http://localhost:5173).

---

## Project Directory Structure

```text
mentoring_call_scheduling_system/
|-- backend/
|   |-- src/
|   |   |-- config/          # DB connection and schema update scripts
|   |   |-- middleware/      # JWT auth and RBAC guards
|   |   |-- modules/         # API Route Controllers (mentors, bookings, etc.)
|   |   `-- server.js        # Express application entry point
|   |-- fixPasswords.js      # Utility script for hash migration
|   |-- .env                 # Backend environment variables
|   `-- package.json
|
`-- frontend/
    |-- src/
    |   |-- components/
    |   |   |-- layout/      # Shared dashboard layouts and sidebars
    |   |   `-- ui/          # Reusable UI primitives (TimeGrid, TagPill)
    |   |-- lib/
    |   |   `-- api/         # Fetch wrapper with interceptors
    |   |-- pages/
    |   |   |-- admin/       # Requirements Queue & Matching Workspace
    |   |   |-- auth/        # Login/Signup interfaces
    |   |   |-- mentor/      # Mentor schedule & confirmed calls
    |   |   `-- user/        # Mentee dashboard & AI helper
    |   |-- index.css        # Tailwind directives
    |   `-- main.tsx         # React root
    |-- .env                 # Frontend environment variables
    |-- tailwind.config.js   # Tailwind theme configuration
    `-- vite.config.ts
```

---

## Licensing

Distributed under the MIT License. Free for commercial and non-commercial utilization.

---

<div align="center">
  <p>Engineered as a comprehensive full-stack technical showcase.</p>
</div>
