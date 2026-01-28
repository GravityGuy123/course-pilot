# CoursePilot — Frontend (course-pilot/) — Developer README

Last updated: 2025-12-10

This README documents the Next.js frontend application located at `course-pilot/`. It explains architecture, auth integration, how pages and components map to backend APIs, local developer setup, and maintenance notes. It's written for developers who will run, develop, or extend the frontend.

Table of contents
- Overview
- Architecture and key files
- Authentication & CSRF workflow
- Dashboard routing and role behavior
- API surface used by the frontend (summary)
- How to run locally (dev + typecheck)
- Linting, tests, and formatting
- Common issues & debugging tips
- Where to change labels / i18n
- Changelog pointers

Overview
--------
The frontend is a Next.js 13+ (App Router) TypeScript application that consumes a Django REST API. It uses Axios with cookie-based authentication, Tailwind CSS for styling, and component-first layouts. The app's main areas:

- `src/app/` — Next.js pages & routes (App Router) — includes `dashboard/`, `courses/`, `lessons/`, `apply/`, `login/`, `signup/`, etc.
- `src/components/` — shared and feature components (auth, dashboard, lessons, UI primitives)
- `src/context/` — auth context provider (`auth-context.tsx`) used across the app
- `src/lib/` — axios config, constants, types, utilities

Architecture and key files
--------------------------
- `src/context/auth-context.tsx`
    - Central auth provider. On mount it fetches CSRF (GET `/csrf/`) and then GET `/user` to discover the authenticated user.
    - Exposes `user`, `loading`, `isLoggedIn`, `login`, `logout`, and `checkAuth` via `useAuth()`.
    - `user` is typed to include optional role flags: `is_student`, `is_tutor`, `is_moderator`, `is_admin`.

- `src/lib/axios.config.ts`
    - Shared Axios instance with `withCredentials: true`. It adds `X-CSRFToken` header for unsafe requests (POST/PUT/PATCH/DELETE) by reading the `csrftoken` cookie.
    - Contains a retry/refresh mechanism: on 401 the client POSTs to `/refresh` to rotate tokens then retries the original request.

- Dashboard components
    - `src/components/dashboard/shared/DashboardLayout.tsx` — sidebar + content layout used by dashboard pages.
    - `src/components/dashboard/shared/DashboardsList.tsx` — shows available dashboards derived from `user` role flags and counts them.

- Pages
    - `src/app/login/page.tsx` — login form; after successful login the page inspects the `user` role flags and redirects to the appropriate dashboard:
        - Priority: admin -> moderator -> tutor -> student -> general (`/dashboard`).
    - `src/app/dashboard/*` — pages for general, student, tutor, moderator, admin dashboards.

Authentication & CSRF workflow
-----------------------------
Frontend <-> Backend contract summary:

- Authentication tokens are issued by the backend (`djangorestframework-simplejwt`) and stored in HttpOnly cookies (access_token, refresh_token). The frontend never reads HttpOnly cookies.
- To perform state-changing requests the frontend first calls GET `/csrf/`. The backend returns a JSON `{ csrfToken: '...' }` and sets a CSRF cookie. The frontend sets the `X-CSRFToken` header to that token for unsafe requests.
- Axios is configured with `withCredentials: true` so cookies are sent automatically.
- If the backend responds with 401, the axios interceptor will POST `/refresh` and, on success, retry the original request.

Dashboard routing and role behavior
----------------------------------
- After login the frontend redirects users based on role flags present on the `user` object (as returned by `/user`):
    - `is_admin` or `is_staff` → `/dashboard/admin`
    - `is_moderator` → `/dashboard/moderator`
    - `is_tutor` → `/dashboard/tutor`
    - `is_student` → `/dashboard/student`
    - otherwise → `/dashboard` (general)

- `DashboardsList` in the sidebar shows how many dashboards the user can access and links to them (General, Student, Tutor, Moderator, Admin). If the backend returns roles in a different shape (e.g., an array of strings), update `src/components/dashboard/shared/DashboardsList.tsx` to match.

API surface used by the frontend (summary)
----------------------------------------
The frontend calls the following notable endpoints (backend paths under `course-pilot_back/core/urls.py`):

- Auth
    - GET `/csrf/` — obtain CSRF token JSON
    - POST `/login` — login (body: { identifier, password })
    - POST `/logout` — logout
    - POST `/refresh` — refresh tokens
    - GET `/user` — return authenticated user object (should include role flags)

- Applications & admin
    - POST `/apply/role` — apply to become a role (body: { role: 'tutor'|'admin', bio })
    - GET `/applications` — admin listing
    - POST `/admin/set-roles` — admin sets user flags

- Courses & lessons
    - Public: GET `/courses`, GET `/courses/<id>`
    - Enroll: POST `/courses/<id>/enroll`
    - My enrollments: GET `/users/me/enrollments` or `/my-enrollments`
    - Tutor-only (previously instructor): POST `/tutor/courses/create`, POST `/tutor/courses/<id>/lessons/add`, PUT `/tutor/lessons/<id>/update`, DELETE `/tutor/lessons/<id>/delete`, and media upload at `/tutor/media/upload`.

How to run locally
-------------------
Prerequisites:
- Node.js 18+, npm
- Python 3.11+ (for backend)

Frontend dev server (in `course-pilot/`):

```bash
cd course-pilot
npm install
npm run dev
```

The frontend expects the backend to be available at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`). If your backend serves at a different host, set the environment variable in `.env.local`.

Backend (for local end-to-end development):
(See `course-pilot_back/README.md` for details.)

Linting, tests, and formatting
-----------------------------
- TypeScript types: `npm run build` or `tsc --noEmit` will run type checks.
- ESLint: `npm run lint`.
- Tests (Jest): `npm test` (config in `jest.config.js`); some tests are scaffolds and may require mocks or a running backend for integration.

Common issues & debugging tips
------------------------------
- 401 responses: ensure cookies are sent and that the backend domain matches `NEXT_PUBLIC_API_URL`. If cross-origin, ensure the backend sets cookies with `SameSite=None; Secure` and `Access-Control-Allow-Credentials: true`.
- CSRF errors: call GET `/csrf/` (frontend `auth-context` does this automatically) and ensure `X-CSRFToken` header is present for POST/PUT/DELETE.
- Role-based redirects: verify the `GET /user` response contains role flags. If roles are sent as strings/arrays, change `DashboardsList` and login redirect logic.

Where to change UI labels
-------------------------
- Global copy: many UI strings live inside individual components and pages. Use the editor's global search for "Instructor" or "instructor" (some remaining sample data may use that string) and update. Note: a deep rename from Instructor->Tutor was applied across backend and frontend; samples may still have legacy strings.

Changelog pointers
------------------
- `README_IMPLEMENTED_FEATURES.md` holds a short changelog. `README_FULL_FEATURES.md` contains a much more detailed developer reference.

If something breaks
-------------------
- Tell me which page or endpoint is failing and I will run the relevant checks locally (axios logs, network traces, and backend logs) and propose a fix.

Contact / Contributing
----------------------
Pull requests welcome. If you want me to add CI, type checks, or run the migration in your environment, say which step and I will run it here.

Changelog (recent)
-------------------
- 2025-12-10: Performed a deep rename of "Instructor(s)" → "Tutor(s)" across backend and frontend. Added a safe Django migration `core.0009_rename_instructor_to_tutor` (RenameField + data RunPython) to rename `is_instructor` -> `is_tutor` and `Course.instructor` -> `Course.tutor` and to update existing `Application.role` values.
- 2025-12-10: Fixed backend import and test issues, bootstrapped pip in the backend venv, installed `whitenoise`, and fixed test modules. Verified `core` tests passed locally (`core.tests.test_applications`, `core.tests.test_email_verification`).

