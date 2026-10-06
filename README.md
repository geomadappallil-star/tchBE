# TCH Health Backend (tchBE)

Backend REST API for **TCH Support Services (TCH Health)** — delivering clinical nursing, allied health therapies, home & yard care, and housing supports across Townsville, Ingham, and Charters Towers.

## Features

- **Participant & General Enquiries (`POST /api/enquiries`)**: Validates and records client care requests with automatic reference IDs.
- **Provider Shift Bookings (`POST /api/shifts`)**: Allows registered NDIS and healthcare providers to submit urgent or planned shift cover requests.
- **Careers Application Hub (`POST /api/careers`)**: Onboarding intake for RNs, ENs, AINs, Support Workers, Cleaners, and Gardeners.
- **Suburb & Regional Coverage Search (`GET /api/suburbs?q=...`)**: Query coverage and travel policies across Townsville districts, Northern Beaches, and regional North Queensland.
- **Health Check (`GET /api/health`)**: Service diagnostics and uptime monitoring.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Production Build
```bash
npm run build
npm start
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/enquiries` | Submit client or coordinator enquiry |
| `GET` | `/api/enquiries` | List all enquiries |
| `POST` | `/api/shifts` | Submit urgent or planned shift request |
| `GET` | `/api/shifts` | List shift requests |
| `POST` | `/api/careers` | Submit worker application |
| `GET` | `/api/careers` | List career applications |
| `GET` | `/api/suburbs` | Query Townsville suburb zones and travel notes |
