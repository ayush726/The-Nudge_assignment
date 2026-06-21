# NudgeSupport — Internal Ticket Platform

A Jira-inspired internal support ticketing tool built for employees to raise and track IT, HR, Finance, and Admin requests — with an AI layer for smart categorization and agent assistance.

---

## ✨ Features

### Employee Portal
- Raise support tickets with title, description, department, and priority
- View personal ticket history with live status updates
- Receive in-app notifications when tickets are updated

### Agent Board
- **Kanban Board** — drag-feel columns for Open → In Progress → Resolved → Closed
- **List View** — sortable, searchable table with filters by category and priority
- Assign tickets to team members
- Add internal notes and public comments
- Enforce valid status transitions (no illegal jumps)

### AI Layer
- **Auto-categorization** — AI detects the department (IT, HR, Finance, Admin) from the description
- **Duplicate detection** — surfaces similar resolved tickets before submission
- **AI-drafted first response** — agents get a suggested reply when opening a ticket

### Reports & Analytics
- KPI cards: total, open, in-progress, resolved, resolution rate
- 7-day ticket volume trend (line chart)
- Issues by department (bar chart)
- Status distribution (pie chart)
- Issues by priority (horizontal bar chart)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| State | Zustand with `localStorage` persistence |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS (Jira-inspired dark design system) |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── CreateTicketModal.tsx   # New ticket form with AI
│   ├── TicketDetailModal.tsx   # Full ticket view with comments & agent tools
│   └── JiraComponents.tsx      # Shared UI primitives (badges, avatars, tags)
├── pages/
│   ├── EmployeeDashboard.tsx   # My Requests view
│   ├── AgentDashboard.tsx      # Kanban + List board
│   └── AnalyticsDashboard.tsx  # Reports & charts
├── services/
│   └── aiService.ts            # Mock AI categorization & response drafting
├── store/
│   └── ticketStore.ts          # Zustand store with all business logic
└── types/
    └── ticket.ts               # TypeScript interfaces
```

---

## 👤 Demo Roles

The prototype ships with two simulated roles navigable via the sidebar:

| View | Path | User |
|---|---|---|
| Employee Portal | `/` | Alice Employee |
| Agent Board | `/agent` | Support Agent |
| Reports | `/analytics` | All |

> **Note:** There is no real authentication. Role switching is done by navigating between views. In production this would be backed by JWT-protected routes.

---

## 📌 Known Limitations

- Data is stored in the browser's `localStorage` — clearing browser data resets all tickets
- AI layer uses keyword-based mock logic; replace `src/services/aiService.ts` with a real LLM API (e.g. Gemini) for production
- No cross-tab real-time sync

---

*Built as part of The Nudge assignment — June 2026*
