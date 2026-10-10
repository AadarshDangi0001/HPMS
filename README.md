# HPMS — Hospital Patient Admission and Process Management System

A MERN-stack hospital administration dashboard built as a college/project demonstration. It covers patient registration, appointment booking with real backend availability checks, doctor management, bed availability, and basic billing — all backed by a real MongoDB database.

> **This is a demo project.** It uses fictional data and does not implement authentication, role-based access control, or real payment processing. It is not intended for real patient information.

## Features

- **Live dashboard** — patient/appointment/bed counts, recent appointments, appointment status chart, and bed occupancy overview, all computed from the database.
- **Patient registration** — validated form, auto-generated patient ID, instant feedback.
- **Appointment booking** — real-time doctor availability checks, double-booking prevention (enforced at the database level), past-date rejection, cancel/complete actions.
- **Patient directory** — search by name or patient ID.
- **Doctor management** — add doctors, toggle availability (only available doctors can be booked).
- **Beds & Wards** — available/occupied/maintenance status with visual indicators and guarded status transitions.
- **Billing** — itemized charges with a backend-calculated total, mark-as-paid workflow.
- **Toast notifications**, loading states, empty states, and clear error states throughout.

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React, Recharts, Sonner
**Backend:** Node.js, Express, MongoDB, Mongoose, express-validator, dotenv, cors

## Folder Structure

```
hospital-management-system/
├── backend/
│   ├── config/        # DB connection
│   ├── controllers/   # Route handlers / business logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers + validation
│   ├── middleware/    # Error handling, validation, async wrapper
│   ├── utils/         # ID generator, AppError
│   ├── scripts/       # seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, Topbar, StatCard, shared UI
│   │   ├── pages/       # Dashboard, Patients, Appointments, Doctors, Beds, Billing, Settings
│   │   ├── layouts/     # DashboardLayout
│   │   ├── services/    # Axios API client + per-resource services
│   │   ├── hooks/       # useFetch
│   │   └── utils/       # formatting, status color maps
│   └── index.html
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (or a MongoDB Atlas connection string)

## MongoDB Setup

Start a local MongoDB instance (default port `27017`), or use a hosted connection string (e.g. MongoDB Atlas). No manual database/collection creation is needed — Mongoose creates them on first write.

## Environment Variables

**backend/.env** (copy from `backend/.env.example`):

```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/hpms
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> Port `5000` is used by macOS's AirPlay Receiver on most Macs, so this project defaults to `5001`. Change it freely if it's free on your machine.

**frontend/.env** (copy from `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5001/api
```

## Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Seed Demo Data

From the `backend` folder:

```bash
npm run seed
```

This **clears** the Patient, Doctor, Appointment, Bed, and Bill collections (with a console warning) and inserts fresh fictional demo data: 5 doctors, 8 patients, 12 beds (mixed statuses), a handful of appointments, and a few bills. Safe to re-run any time before a demo.

To start with a completely empty database instead:

```bash
npm run seed:clear
```

## Running the App

**Backend** (from `backend/`):

```bash
npm run dev     # development, auto-restarts on file changes (nodemon)
npm start       # production-style start, no file watching (plain node)
```

Runs on `http://localhost:5001` (or your configured `PORT`).

**Frontend** (from `frontend/`):

```bash
npm run dev
```

Runs on Vite's default port, `http://localhost:5173`.

Open `http://localhost:5173` in your browser once both are running.

## API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/stats` | Aggregated dashboard statistics |
| POST | `/api/patients` | Register a patient |
| GET | `/api/patients?search=` | List / search patients |
| GET | `/api/patients/:id` | Get a patient |
| POST | `/api/doctors` | Add a doctor |
| GET | `/api/doctors?activeOnly=true` | List doctors |
| GET | `/api/doctors/:id` | Get a doctor |
| PATCH | `/api/doctors/:id/availability` | Enable/disable a doctor |
| POST | `/api/appointments` | Book an appointment (with availability checks) |
| GET | `/api/appointments?status=` | List / filter appointments |
| GET | `/api/appointments/:id` | Get an appointment |
| PATCH | `/api/appointments/:id/status` | Cancel or complete an appointment |
| GET | `/api/beds` | List beds |
| PATCH | `/api/beds/:id/status` | Change a bed's status |
| POST | `/api/bills` | Create a bill (total computed server-side) |
| GET | `/api/bills` | List bills |
| GET | `/api/bills/:id` | Get a bill |
| PATCH | `/api/bills/:id/payment` | Mark a bill as paid |

All responses follow `{ success, data, message? }`. Errors return `{ success: false, message }` with an appropriate HTTP status (400 for validation, 404 for not found, 409 for conflicts like double-booking).

## Troubleshooting

- **"Cannot reach the server" in the UI** — make sure the backend is running and `VITE_API_URL` in `frontend/.env` matches its port.
- **Port 5000 already in use** — this is almost always macOS AirPlay Receiver. The backend defaults to `5001` to avoid it; adjust `PORT` in `backend/.env` if needed and update `VITE_API_URL` to match.
- **`MongoServerError: connect ECONNREFUSED`** — MongoDB isn't running. Start it (`mongod` or your platform's service) before starting the backend.
- **CORS errors in the browser console** — check that `CLIENT_URL` in `backend/.env` matches the exact origin the frontend is served from (including port).
- **Seed script seems to do nothing** — re-check `MONGODB_URI` in `backend/.env`; it may be pointing at a different database than the one the app reads from.
- **Double-booking error even on an empty slot** — another appointment may already hold that exact doctor/date/time as `Confirmed`; cancel it or pick a different slot.

## Presentation Demo Workflow

1. Open the dashboard and show the current patient/appointment/bed statistics.
2. Register a new patient and note the generated patient ID.
3. Open **Patients** and confirm the new patient is listed.
4. Open **Appointments**, select the new patient and an available doctor, pick a future date/time, and book.
5. Show the confirmation toast with the appointment ID.
6. Confirm the new appointment appears in the table.
7. Try booking the same doctor/date/time again — show the "already booked" error.
8. Open **Beds & Wards** and point out available, occupied, and maintenance beds.
9. Open **Billing**, create a bill for a patient, and mark it as paid.
10. Return to the dashboard and show that the statistics have updated.

## Limitations

- No authentication or role-based access control — this is a single-admin demo console.
- No real payment gateway integration.
- No real inpatient admission workflow — bed allocation is a simplified demonstration.
- All data is fictional; the system is not built or audited for handling real patient records.
# HPMS
