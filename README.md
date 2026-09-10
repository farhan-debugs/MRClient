# Unified Request & Task Tracker

A full-stack, responsive web application designed for small-to-mid service businesses to eliminate lost requests across spreadsheets, WhatsApp, and email.

## Key Features

1. **30-Second Quick Intake Modal**:
   - Fast logging of incoming requests (Client name, origin channel e.g. WhatsApp/Email/Phone, category, priority, assignee, due date, description).
   - Press <kbd>N</kbd> anywhere or click **+ New Request**.
2. **Dynamic Kanban Board**:
   - 4-stage pipeline: **New Requests**, **In Progress**, **Blocked / Waiting**, and **Completed**.
   - Drag-and-drop workflow and 1-click status stepper buttons.
   - Overdue deadline alerts and Stale task warnings (>3 days stagnant without update).
3. **Multi-Criteria Table View**:
   - Filter by Category, Priority, Assignee, and Status.
   - Sort by Due Date, Priority, Activity timestamp, and Title.
   - Inline status updates directly within table rows.
4. **Focused "My Work" Queue**:
   - Distraction-free personal dashboard for technicians and specialists.
   - Grouped into Urgent/Overdue, In Progress, Queued, and Completed.
   - 1-click **Start** and **Complete** execution triggers.
5. **Manager Visibility & Analytics Dashboard**:
   - Metric KPI cards: Open requests, Overdue alerts, Stale bottlenecks, Resolved this week.
   - Visual pipeline status distribution bar.
   - Team capacity & workload balancing matrix.
   - Stalled bottlenecks watchlist with 1-click expedite flow.
   - Live audit stream of all activity across the organization.
6. **Immutable Activity Audit Trail & Comments**:
   - Every status change, assignment, and note is permanently recorded with actor and timestamp.
   - Real-time comment threads on every request.
7. **Demo Person Impersonation Switcher**:
   - Instant 1-click switching between team members (Sarah - Operations Manager, Alex - Senior Tech, Maya - Client Success, Liam - Field Engineer) to experience role-based views.

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js, CORS, JSON body parser.
- **Database & ORM**: Prisma ORM with SQLite (instantly runnable with zero external database configuration, schema ready for PostgreSQL/Supabase).

---

## Getting Started

### 1. Start Backend Server
```bash
cd server
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
Server runs at `http://localhost:5000`.

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client runs at `http://localhost:5173`.
