# 🎓 Academy Management System with Student AI Support

A modern, full-stack **Academy Management System** featuring Role-Based Access Control (Admin, Teacher, Student), automated Fee Reconciliation, Cohort Batch scheduling, Session Roll Call Attendance, interactive Multiple Choice Quiz Engine with instant grading, an integrated Support Ticket Desk, and a grounded **AI Student Academic Support Chatbot** powered by Google Gemini.

---

## 🌟 Key Features

### 1. 🛡️ Authentication & Role-Based Authorization
- **JWT & bcrypt Authentication**: Secure token-based sessions with hashed passwords.
- **Role Isolation**: Strict access controls guaranteeing Admin, Teacher, and Student only access their respective authorized dashboards and APIs.
- **One-Click Demo Portals**: Instant switcher on login screen for rapid evaluation.

### 2. 🏛️ Admin Management Portal
- **Real-Time Analytics**: Live metrics for Total Students, Teachers, Programs, Cohort Batches, Quizzes, Pending Fees, and Open Support Tickets.
- **Student Management (CRUD)**: Enroll students, filter by cohort, auto-calculate `Remaining Fee = Total Fee - Paid Fee`.
- **Teacher Management (CRUD)**: Manage faculty members and assigned subject specialties.
- **Course Management (CRUD)**: Define curriculums, durations, tuition fees, and assigned lead instructors.
- **Batch Management (CRUD)**: Schedule cohorts, class timings, and physical laboratory rooms.
- **Fee Management**: Process installment receipts with payment method validation (Cash, Bank, Easypaisa, JazzCash). Automatically checks that payments do not exceed remaining balances.

### 3. 👨‍🏫 Teacher Management Portal
- **Session Attendance Tracker**: Select batch & date, load student roster, toggle Present/Absent status with "Mark All Present" helper. Prevents duplicate roll calls for the same batch and date.
- **Quiz Creator & Manager**: Construct MCQ quizzes with 4 choices (A, B, C, D), correct answer designation, and configurable time limits.
- **Submission Grading**: Review student scores, percentages, and pass/fail outcomes.
- **Student Inquiries**: View and reply to student academic support questions.

### 4. 🎓 Student Management Portal
- **Academic Dashboard**: High-level view of attendance percentage, outstanding fee balance, upcoming assessments, and recent marks.
- **Attendance History**: Complete history logs with dates and status badges.
- **Tuition & Receipts**: View tuition invoices, payments made, and outstanding balance.
- **Interactive MCQ Quizzes**: Take quizzes with real-time countdown timer, auto-graded scores upon submission, and duplicate prevention.
- **Support Ticket Desk**: Submit support requests with unique IDs (`TICKET-1001`), categories, priority levels, and multi-turn conversations.

### 5. 🤖 Grounded Student AI Academic Support
- **Server-Side AI Integration**: Powered by `@google/genai` with model `gemini-3.8-flash`. API keys are never exposed to the frontend.
- **Personalized Context Grounding**: When a student asks "What is my remaining fee?", "What is my attendance percentage?", or "When is my next class?", the assistant references that student's verified database record.
- **Graceful Fallback**: If the AI key is unconfigured or temporary errors occur, the assistant cleanly presents the fallback message and a direct **"Create Support Ticket"** action button.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose (with zero-config in-memory fallback store) |
| **Auth & Security** | JSON Web Tokens (JWT), bcryptjs, role authorization middleware |
| **AI Integration** | `@google/genai` TypeScript SDK (`gemini-3.8-flash`) |

---

## 📁 Project Structure

```text
academy-management-system/
├── index.html
├── metadata.json
├── package.json
├── server.ts                    # Full-stack entry point (Express + Vite)
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── README.md
└── src/
    ├── App.tsx                  # Client router with role protection
    ├── main.tsx
    ├── index.css                # Tailwind CSS entry
    ├── context/
    │   └── AuthContext.tsx      # Auth state, login/logout, tokens
    ├── services/
    │   └── api.ts               # Axios client with interceptors
    ├── components/
    │   ├── Badge.tsx            # Status pills
    │   ├── Modal.tsx            # Reusable popup dialogs
    │   ├── Navbar.tsx           # Global header with active user
    │   ├── Sidebar.tsx          # Role-based navigation
    │   └── StatCard.tsx         # Dashboard KPI cards
    ├── pages/
    │   ├── LoginPage.tsx        # Login & 1-click demo accounts
    │   ├── admin/
    │   │   ├── AdminDashboard.tsx
    │   │   ├── StudentsManagement.tsx
    │   │   ├── TeachersManagement.tsx
    │   │   ├── CoursesManagement.tsx
    │   │   ├── BatchesManagement.tsx
    │   │   ├── AttendanceManagement.tsx
    │   │   ├── FeeManagement.tsx
    │   │   ├── QuizManagement.tsx
    │   │   └── SupportTicketsManagement.tsx
    │   ├── teacher/
    │   │   ├── TeacherDashboard.tsx
    │   │   ├── TeacherAttendance.tsx
    │   │   ├── TeacherQuizzes.tsx
    │   │   ├── TeacherStudents.tsx
    │   │   └── TeacherSupportTickets.tsx
    │   └── student/
    │       ├── StudentDashboard.tsx
    │       ├── StudentAttendance.tsx
    │       ├── StudentFees.tsx
    │       ├── StudentQuizzes.tsx
    │       ├── StudentQuizAttempt.tsx
    │       ├── StudentAiSupport.tsx
    │       └── StudentSupportTickets.tsx
    └── backend/
        ├── config/
        │   └── db.ts            # Mongoose & MongoDB connection
        ├── middleware/
        │   ├── auth.ts          # JWT verification & role authorization
        │   └── errorHandler.ts  # Global Express error handler
        ├── models/
        │   └── index.ts         # Mongoose schemas for all 10 models
        ├── routes/
        │   └── apiRoutes.ts     # Working REST endpoints
        ├── services/
        │   ├── geminiAiService.ts # Gemini AI client & prompt builder
        │   └── store.ts         # Data store layer (MongoDB + in-memory sync)
        └── seed/
            ├── initialSeedData.ts # Demo users, courses, batches, quizzes
            └── seedData.ts      # Standalone seed executable
```

---

## 🔑 Demo Credentials

All accounts are pre-seeded with the universal password: `password123`

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Admin** | `admin@academy.com` | `password123` | Complete system management, student/teacher/course CRUD, fees & tickets |
| **Teacher** | `teacher@academy.com` | `password123` | Session roll call, quiz creation, test results, student queries |
| **Student** | `student@academy.com` | `password123` | Personal profile, attendance stats, fee invoices, quiz tests, AI assistant |

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local `.env`:

```env
# Google Gemini API Key for AI Student Academic Assistant
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# AI Model Name (defaults to gemini-3.8-flash)
AI_MODEL="gemini-3.8-flash"

# Port (defaults to 3000)
PORT=3000

# MongoDB URI (Optional: e.g. mongodb://localhost:27017/academy or mongodb+srv://...)
# If not configured, an in-memory repository is automatically active.
MONGO_URI=""

# JWT Secret for signing auth tokens
JWT_SECRET="academy_jwt_secret_key_2026_super_secure"
```

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Run Database Seed Script
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
The server will boot at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Deploy to Render (from GitHub)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/iqramalik12/academy-management-system)

The repo includes a [`render.yaml`](render.yaml) blueprint. In Render choose **New → Blueprint**, connect this repository, and fill in:
- `GEMINI_API_KEY` — optional, enables the AI chatbot
- `MONGO_URI` — optional; without it the free instance uses the in-memory store, which resets on every restart/sleep

Every push to `main` redeploys automatically.

---

## 🧪 Testing Checklist

- [x] Login with Admin, Teacher, and Student credentials
- [x] Role protection prevents unauthorized access
- [x] Admin can Add, Edit, Delete students (auto fee calculation verified)
- [x] Admin can Add, Edit, Delete teachers, courses, batches
- [x] Roll call attendance marks Present/Absent and prevents duplicate submissions
- [x] Fee payments validate amount $\le$ remaining balance
- [x] MCQ quiz creation supports questions with options A–D and correct answer selection
- [x] Students can attempt quizzes with live countdown timer and instant grading
- [x] Student AI Chatbot answers questions using authentic student record data
- [x] AI fallback triggers smoothly if AI API is unreachable
- [x] Support tickets support multi-turn replies and status transitions
