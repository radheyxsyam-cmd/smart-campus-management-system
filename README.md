# Smart Campus Complaint & Maintenance Management System

A role-based campus complaint management platform where students submit maintenance complaints (WiFi, electricity, plumbing, etc.) and administrators assign them to staff, track progress, and view reports. Originally designed as a 3-layer Java/Swing/MySQL desktop application, this version is ported to a hosted React + Supabase web app while preserving the Presentation → Service → DAO separation.

## Tech Stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, React Router
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Icons:** Lucide React
- **Architecture:** 3-layer (Presentation → Service → DAO)

## Live Demo

 live URL: https://smart-campus-complai-4u6z.bolt.host/login

## Demo Credentials

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@campus.edu     | Admin@123    |
| Student | student1@campus.edu  | Student@123  |
| Student | student2@campus.edu  | Student@123  |

## Setup Instructions

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `https://vnjhhnvgoxdhzxakjyhn.supabase.co` — your Supabase project URL
- `sb_publishable_AWgwYlBc7q3t9b0Lz-uYgQ_93krVs8u` — your Supabase public key

### Database Setup

The Supabase migrations in `supabase/migrations/` create the schema and seed demo data. Apply them through the Supabase MCP tools or the Supabase dashboard.

## Folder Structure

```
src/
├── pages/              # PRESENTATION LAYER — UI screens
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── StudentDashboard.tsx
│   └── AdminDashboard.tsx
├── components/          # PRESENTATION LAYER — reusable UI
│   ├── SubmitComplaintForm.tsx
│   ├── MyComplaintsTable.tsx
│   ├── AllComplaintsTable.tsx
│   ├── AssignStaffModal.tsx
│   ├── ManageStaffPanel.tsx
│   ├── ReportsPanel.tsx
│   ├── StatusBadge.tsx
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── LoadingSpinner.tsx
├── services/           # SERVICE LAYER — validation + business rules
│   ├── authService.ts
│   ├── complaintService.ts
│   ├── staffService.ts
│   └── reportService.ts
├── dao/                # DAO LAYER — the ONLY layer that calls Supabase
│   ├── userDAO.ts
│   ├── complaintDAO.ts
│   ├── staffDAO.ts
│   └── assignmentDAO.ts
├── context/            # React context providers (auth, toasts)
├── lib/supabaseClient.ts
└── types/models.ts     # TypeScript interfaces for all models
```

### Layer Separation

- **Presentation Layer** (`pages/`, `components/`): Renders UI, collects input, calls services. Never touches the database directly.
- **Service Layer** (`services/`): Validates input, enforces business rules (e.g. "can't assign a resolved complaint"), calls DAOs.
- **DAO Layer** (`dao/`): The only layer that runs Supabase queries. Each DAO handles one entity.

## Database Schema

Four tables in PostgreSQL with Row Level Security:

1. **profiles** — extends `auth.users`. Fields: `id`, `full_name`, `email`, `role` (STUDENT/ADMIN).
2. **staff** — maintenance staff. Fields: `staff_id`, `staff_name`, `department`, `contact`, `is_active`.
3. **complaints** — student complaints. Fields: `complaint_id`, `student_id`, `category`, `description`, `status`, `submitted_at`, `updated_at`.
4. **complaint_assignments** — links complaints to staff. Fields: `assignment_id`, `complaint_id`, `staff_id`, `assigned_by`, `assigned_at`, `notes`.

## Features

### Student
- Register and log in
- Submit complaints with category and description
- View own complaints with live status and assignment info

### Admin
- View all complaints, filter by status and category
- Assign complaints to staff (auto-sets status to In Progress)
- Update complaint status (forward-only: Resolved is final)
- Manage staff (add/remove)
- View reports: counts by status, by category, resolved per staff member

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript type checking
- `npm run lint` — ESLint
