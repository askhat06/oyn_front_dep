# OYAN Platform — Project Documentation

> Production URL: `https://www.oyan.ink`
> Production API: `https://api.oyan.ink`
> Last updated: 2026-04-27

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Routing Map](#routing-map)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [Environment Variables](#environment-variables)
9. [Running the Project](#running-the-project)

---

## Overview

OYAN is a full-featured online course platform targeting Kazakhstan. It supports four user roles:

| Role | Access |
|------|--------|
| **Student** | Browse & enroll in courses, track progress, complete assessments, edit profile |
| **Teacher** | Create and manage courses, upload video lessons (URL or file), submit for review |
| **Admin** | Review pending courses, publish or reject with reason |
| **Company** | Legacy role — job vacancy posting (via json-server) |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.1.0 | UI component framework |
| React Router DOM | 7.5.0 | Client-side routing (SPA) |
| Redux Toolkit | 2.8.0 | Global state management |
| React Redux | 9.2.0 | React ↔ Redux bindings |
| React Toastify | 11.0.5 | Toast notification system |
| React Icons | 5.6.0 | Icon library |
| React Scripts (CRA) | 5.0.1 | Build tooling (Webpack + Babel) |

### Styling

| Technology | Usage |
|-----------|-------|
| Vanilla CSS | Global styles (`index.css`), component-level CSS files |
| CSS Modules | `CourseLandingPage.module.css` |
| Auth.css | Shared auth page styles (Login, Registration, ForgotPassword, ResetPassword) |

### Utility / Legacy Server

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5.1.0 | Legacy media upload server (port 4000) |
| Multer | 1.4.5-lts.2 | File upload middleware (Express) |
| CORS | 2.8.5 | Cross-origin request headers |
| json-server | 0.17.0 | Mock REST API for legacy features (port 3001) |

### Backend (separate service)

| Technology | Details |
|-----------|---------|
| Spring Boot | Java backend, runs on port 7777 |
| JWT | Stateless authentication (Bearer token, 24h expiry) |
| Cloudflare R2 | Lesson video storage — S3-compatible, presigned PUT/GET URLs |
| Email Service | Email verification and password reset link delivery |

---

## Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                     User Browser                     │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │           React SPA (port 3000)               │  │
│   │                                              │  │
│   │  App.js ──→ React Router (client routes)     │  │
│   │      │                                       │  │
│   │      ├──→ Pages (IndexPage, CourseCatalog,   │  │
│   │      │         LessonViewer, UserPage, ...)   │  │
│   │      │                                       │  │
│   │      ├──→ Redux Store                        │  │
│   │      │       ├── userSlice  (JWT + profile)  │  │
│   │      │       └── themeSlice (light/dark)     │  │
│   │      │                                       │  │
│   │      └──→ lib/api.js (apiFetch)              │  │
│   │               └── Injects Bearer token       │  │
│   └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
          │                          │
          ▼                          ▼
 ┌─────────────────┐       ┌──────────────────┐
 │  Spring Boot    │       │   Cloudflare R2  │
 │  api.oyan.ink   │       │  (video storage) │
 │                 │       │                  │
 │  Auth           │       │  Presigned PUT   │
 │  Courses        │       │  (direct upload) │
 │  Progress       │       │  Presigned GET   │
 │  Teacher LMS    │       │  (30-min expiry) │
 │  Admin Panel    │       └──────────────────┘
 └─────────────────┘
```

### Data Flow

1. **Auth flow**: Login → `POST /api/auth/login` → JWT stored in Redux + localStorage → `apiFetch` auto-injects `Authorization: Bearer` on every request
2. **Email verification**: Register → backend sends link → user clicks → `GET /api/auth/verify?token=` → JWT issued → auto-login
3. **Password reset**: Forgot password form → `POST /api/auth/forgot-password` → email link → `POST /api/auth/reset-password` with token
4. **Course catalog**: App mount → `GET /api/courses` → cached in `CourseContext`
5. **Lesson playback**: `LessonViewer` fetches lesson payload with `videoUrl` (R2 presigned GET, 30-min expiry) → refreshes every 25 min
6. **Progress tracking**: `LessonViewer` calls `PUT .../current-step` and `POST .../complete` after each lesson
7. **Teacher video upload**: Create lesson → `POST .../video-upload` (get presigned PUT URL) → PUT file directly to R2 via XHR (progress bar) → `POST .../video-upload/complete`
8. **Profile edit**: Settings form → `PUT /api/auth/me` → Redux store + sidebar updated via `onSaved` callback

---

## Project Structure

```
oyn_front_dep/
├── public/
│   └── index.html                      # Browser tab title: "OYAN Platform"
│
├── src/
│   ├── App.js                          # Master router + context providers
│   ├── index.js                        # React DOM entry point
│   ├── index.css                       # Global styles (~30KB)
│   │
│   ├── lib/
│   │   └── api.js                      # Centralized HTTP client (apiFetch)
│   │
│   ├── redux/
│   │   ├── store.js                    # Redux store setup
│   │   ├── userSlice.js                # User session state (JWT, profile, normalizeUser)
│   │   └── themeSlice.js               # Light/dark theme state
│   │
│   ├── Components/                     # Shared/reusable components
│   │   ├── Auth.css                    # Shared auth page styles
│   │   ├── Header.jsx                  # Navigation + theme toggle
│   │   ├── Footer.jsx                  # Footer
│   │   ├── Login.jsx                   # Login form (redesigned)
│   │   ├── Registration.jsx            # Role-based sign-up (redesigned)
│   │   ├── ForgotPassword.jsx          # Forgot password form
│   │   ├── ResetPassword.jsx           # Reset password form (reads ?token=)
│   │   ├── RequireRole.jsx             # Auth guard (role-gated routes)
│   │   ├── ThemeToggle.jsx             # Dark/light toggle button
│   │   ├── ProfileSwitch.jsx           # Legacy role-based profile router
│   │   ├── Edit.jsx                    # Legacy profile edit
│   │   └── RefilBalance.jsx            # Legacy balance refill
│   │
│   └── Pages/
│       ├── IndexPage/
│       │   ├── IndexPage.jsx           # Landing page
│       │   ├── Index.jsx               # Landing content
│       │   └── Feature.jsx             # Feature cards
│       │
│       ├── About/
│       │   └── AboutPlatform.jsx       # About page
│       │
│       ├── CoursePage/
│       │   ├── CourseCatalog.jsx       # Course grid with filtering/sorting
│       │   ├── CourseCatalog.css
│       │   ├── CourseLandingPage.jsx   # Course detail + enrollment
│       │   └── CourseLandingPage.module.css
│       │
│       ├── LessonPage/
│       │   ├── LessonViewer.jsx        # Video player + progress tracking
│       │   └── LessonViewer.css
│       │
│       ├── UserPage/
│       │   ├── UserProfile.jsx         # Role-aware dashboard root
│       │   ├── UserPage.css            # Dashboard + sidebar + LMS styles
│       │   └── ui/
│       │       ├── sidebar.jsx                  # Redesigned sidebar (gradient, initials avatar)
│       │       ├── Settings.jsx                 # Profile edit (view/edit toggle, PUT /api/auth/me)
│       │       ├── TeacherDashboard.jsx          # Teacher LMS tab container
│       │       ├── TeacherMyCourses.jsx          # Course CRUD + lesson management
│       │       ├── TeacherUploadVideo.jsx        # Video lessons: URL mode + file upload mode (R2)
│       │       ├── TeacherCreateAssessment.jsx   # JSON-based assessment builder
│       │       ├── certificates.jsx              # Student certificates tab
│       │       ├── userCourses.jsx               # (stub)
│       │       └── wishlist.jsx                  # (stub)
│       │
│       ├── AdminPage/
│       │   ├── AdminPage.jsx           # Admin shell (tabs)
│       │   ├── AdminPendingQueue.jsx   # Course review queue
│       │   └── AdminAllCourses.jsx     # All courses view
│       │
│       ├── CompanyPage/               # Legacy company features
│       │   ├── CompanyPage.jsx
│       │   ├── CompanyProfile.jsx
│       │   ├── CompanyList.jsx
│       │   ├── AddVacancy.jsx
│       │   └── Vacancies.jsx
│       │
│       └── VerifyEmailPage/
│           └── VerifyEmail.jsx        # Email verification handler
│
├── express.js                         # Legacy media upload server (port 4000)
├── server.json                        # json-server mock DB schema
├── package.json
├── .env                               # Environment variables (git-ignored)
├── front_blueprint.md                 # Frontend architecture notes
└── Backend_BluePrint.md               # Backend integration contract
```

---

## Routing Map

| Route | Component | Auth Guard | Description |
|-------|-----------|:----------:|-------------|
| `/` | IndexPage | — | Landing page |
| `/about` | AboutPlatform | — | Platform info |
| `/login` | Login | — | Authentication form |
| `/registration` | Registration | — | Role-based sign-up |
| `/forgot-password` | ForgotPassword | — | Request password reset email |
| `/reset-password` | ResetPassword | — | Set new password via `?token=` |
| `/verify-email` | VerifyEmail | — | Email verification handler |
| `/courses` | CourseCatalog | — | Browse published courses |
| `/courses/:slug` | CourseLandingPage | — | Course details + enrollment |
| `/courses/:courseSlug/lessons/:lessonSlug` | LessonViewer | — | Video playback + progress |
| `/dashboard` | UserProfile | `RequireRole` (any auth) | Student/Teacher dashboard |
| `/admin` | AdminPage | `RequireRole` (admin) | Course moderation panel |
| `/profile/:role/:id` | ProfileSwitch | — | Legacy profile page |
| `/add-vacancy` | AddVacancy | — | Legacy vacancy creation |
| `/all-vacancies/:id` | Vacancies | — | Legacy vacancy listing |
| `/refill-balance/:id` | RefillBalance | — | Legacy balance top-up |
| `/edit` | Edit | — | Legacy profile edit |

---

## API Endpoints

Base URL: `https://api.oyan.ink` (configured via `REACT_APP_SPRING_API`)

### Authentication

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/auth/register` | — | Register (role: STUDENT / TEACHER / COMPANY) |
| `GET` | `/api/auth/verify?token=` | — | Verify email address → returns JWT |
| `POST` | `/api/auth/login` | — | Login → returns JWT |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |
| `PUT` | `/api/auth/me` | Bearer | Update profile (`fullName`, `location`, `avatarUrl`) |
| `POST` | `/api/auth/forgot-password` | — | Send password reset email (`{ email }`) |
| `POST` | `/api/auth/reset-password` | — | Set new password (`{ token, newPassword }`) |

**Error codes:** `401` invalid credentials / expired token, `403` email not verified, `429` rate limit

---

### Course Catalog (Public)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/courses` | — | List all PUBLISHED courses |
| `GET` | `/api/courses/:slug` | — | Course detail (with lessons array) |
| `GET` | `/api/courses/:courseSlug/lessons/:lessonSlug` | — | Lesson payload (includes presigned `videoUrl`) |
| `POST` | `/api/enrollments` | — | Enroll (supports anonymous lead-shell) |
| `GET` | `/api/enrollments?email=` | Bearer | List enrollments for current user |
| `POST` | `/api/courses/:slug/ratings` | Bearer + enrolled | Submit star rating (1–5) |

---

### Progress Tracking

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/progress/courses/:courseSlug` | Bearer + enrolled | Get progress snapshot |
| `POST` | `/api/progress/courses/:courseSlug/start` | Bearer + enrolled | Initialize / resume progress |
| `PUT` | `/api/progress/courses/:courseSlug/current-step` | Bearer + enrolled | Set active lesson (`{ lessonSlug }`) |
| `POST` | `/api/progress/courses/:courseSlug/steps/:lessonSlug/complete` | Bearer + enrolled | Mark lesson complete |
| `POST` | `/api/progress/courses/:courseSlug/complete` | Bearer + enrolled | Mark course complete |
| `POST` | `/api/progress/courses/:courseSlug/reset` | Bearer + enrolled | Reset course progress |

---

### Teacher LMS

> Requires role: `TEACHER` (stored as `professor` in frontend after normalization)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/teacher/courses` | Teacher | List own courses (all statuses) |
| `POST` | `/api/teacher/courses` | Teacher | Create course (starts as DRAFT) |
| `GET` | `/api/teacher/courses/:slug` | Teacher | Get owned course |
| `PUT` | `/api/teacher/courses/:slug` | Teacher | Update course (DRAFT / REJECTED only) |
| `DELETE` | `/api/teacher/courses/:slug` | Teacher | Delete DRAFT course |
| `POST` | `/api/teacher/courses/:slug/submit` | Teacher | Submit for review → PENDING_REVIEW |
| `POST` | `/api/teacher/courses/:slug/withdraw` | Teacher | Withdraw from review → DRAFT |
| `GET` | `/api/teacher/courses/:slug/lessons` | Teacher | List lessons |
| `POST` | `/api/teacher/courses/:slug/lessons` | Teacher | Create lesson (`title`, `summary`, `content`, `videoUrl?`, `durationMinutes`) |
| `PUT` | `/api/teacher/courses/:slug/lessons/:lessonSlug` | Teacher | Update lesson |
| `DELETE` | `/api/teacher/courses/:slug/lessons/:lessonSlug` | Teacher | Delete lesson |
| `POST` | `/api/teacher/courses/:slug/lessons/:lessonSlug/video-upload` | Teacher | Init R2 upload → returns `{ uploadUrl, objectKey, requiredHeaders, expiresAt }` |
| `POST` | `/api/teacher/courses/:slug/lessons/:lessonSlug/video-upload/complete` | Teacher | Confirm upload (`{ objectKey }`) → 204 |
| `DELETE` | `/api/teacher/courses/:slug/lessons/:lessonSlug/video` | Teacher | Delete lesson video |

**Video upload flow:**
```
1. POST /lessons                         → create lesson → lessonSlug
2. POST /lessons/{slug}/video-upload     → { uploadUrl, objectKey, requiredHeaders: { "Content-Type": "video/mp4" } }
3. PUT {uploadUrl}                       → upload file directly to Cloudflare R2 (XHR, no auth header)
   Content-Type must match requiredHeaders["Content-Type"] exactly
4. POST /lessons/{slug}/video-upload/complete  → { objectKey } → 204
```

**Accepted formats:** `video/mp4`, `video/webm` · **Max size:** 512 MB

**Course lifecycle:**
```
DRAFT → [submit] → PENDING_REVIEW → [admin approve] → PUBLISHED
                                  → [admin reject]  → REJECTED → [edit] → DRAFT
                 ← [withdraw] ←
```

---

### Admin Panel

> Requires role: `ADMIN`

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/api/admin/courses` | Admin | All courses (all statuses) |
| `GET` | `/api/admin/courses/pending` | Admin | Courses awaiting review |
| `GET` | `/api/admin/courses/:courseId` | Admin | Get course by ID |
| `POST` | `/api/admin/courses/:courseId/publish` | Admin | Approve → PUBLISHED |
| `POST` | `/api/admin/courses/:courseId/reject` | Admin | Reject (`{ reason }`) → REJECTED |

---

### Legacy Endpoints (json-server, port 3001)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/vacancies` | List job vacancies |
| `POST` | `/vacancies` | Create vacancy |
| `GET` | `/galleries` | Photo galleries |

---

## State Management

### Redux Store Shape

```js
{
  user: {
    user: {
      id: Number,
      email: String,
      role: "student" | "professor" | "company" | "admin",  // normalized by userSlice
      fullName: String,
      username: String,       // falls back to fullName
      location: String | null,
      avatarUrl: String | null,
      companyName: String | null  // company role only
    } | null
  },
  theme: {
    theme: "light" | "dark"
  }
}
```

**Role normalization** (`userSlice.normalizeUser`):
- `TEACHER` → `professor`
- `STUDENT` / `USER` → `student`

### userSlice Actions

| Action | Effect |
|--------|--------|
| `setUser(user)` | Saves normalized user to Redux + localStorage |
| `clearUser()` | Clears Redux state + localStorage token |

---

## Environment Variables

| Variable | Default (fallback) | Description |
|----------|-------------------|-------------|
| `REACT_APP_SPRING_API` | `http://localhost:7777` | Spring Boot backend base URL |
| `REACT_APP_LEGACY_API` | `http://localhost:3001` | json-server base URL (legacy) |
| `DISABLE_ESLINT_PLUGIN` | — | Disables ESLint in dev server |

`.env` (production):
```
REACT_APP_SPRING_API=https://api.oyan.ink
REACT_APP_LEGACY_API=https://api.oyan.ink
DISABLE_ESLINT_PLUGIN=true
```

---

## Running the Project

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
npm install
npm start                                          # React dev server (port 3000)
npx json-server --watch server.json --port 3001   # Legacy server (optional)
node express.js                                    # Legacy media server (optional, port 4000)
```

### Production Build

```bash
npm run build
# Output: /build — serve with any static HTTP server (Nginx, etc.)
```
