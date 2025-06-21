# Disaster Response Coordination Platform

A MERN stack app for real-time disaster management, integrating geospatial queries, social media monitoring, official updates, and AI-powered location/image analysis.

## Live Demo

- **Frontend**: [https://disaster-response-coordination-plat-olive.vercel.app/](https://disaster-response-coordination-plat-olive.vercel.app/)
- **Backend**: [https://disaster-response-coordination-platform-xgm8.onrender.com/](https://disaster-response-coordination-platform-xgm8.onrender.com/)

---

## Features

- **Disaster Data Management**: Robust CRUD for disaster records with audit trails and ownership.
- **Location Extraction & Geocoding**: Uses Google Gemini API to extract locations from descriptions, then geocodes via Google Maps, or OpenStreetMap.
- **Real-Time Social Media Monitoring**: Fetches and processes social media reports via Twitter API .
- **Geospatial Resource Mapping**: Supabase geospatial queries to locate affected areas, shelters, and resources.
- **Official Updates Aggregation**: Scrapes updates from government/relief sites (e.g., FEMA, Red Cross).
- **Image Verification**: Uses Gemini API to verify authenticity of user-uploaded disaster images.
- **Backend Optimization**: Caching, geospatial indexes, structured logging, rate limiting, and error handling.
- **WebSockets**: Real-time updates for disasters, social media, and resources.
- **Mock Authentication**: Hard-coded users and roles for demo/testing.

---

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Axios, React Router, Socket.IO client
- **Backend**: Node.js, Express, Supabase JS SDK, Google Gemini API, Cheerio, Socket.IO, Express Rate Limit, dotenv
- **Database**: Supabase (PostgreSQL with geospatial and GIN indexes)
- **External APIs**: Google Gemini, Google Maps/Mapbox/OpenStreetMap, (Mock) Twitter, FEMA/Red Cross

---

## API Endpoints

- `POST /disasters` — Create disaster
- `GET /disasters?tag=flood` — List disasters (filter by tag)
- `PUT /disasters/:id` — Update disaster
- `DELETE /disasters/:id` — Delete disaster
- `GET /disasters/:id/social-media` — Social media reports
- `GET /disasters/:id/resources?lat=...&lon=...` — Nearby resources (geospatial)
- `GET /disasters/:id/official-updates` — Official updates
- `POST /disasters/:id/verify-image` — Image verification (Gemini)
- `POST /geocode` — Extract and geocode location

---

## Database Schema

- **disasters**: id, title, location_name, location (GEOGRAPHY), description, tags, owner_id, created_at, audit_trail (JSONB)
- **reports**: id, disaster_id, user_id, content, image_url, verification_status, created_at
- **resources**: id, disaster_id, name, location_name, location (GEOGRAPHY), type, created_at
- **cache**: key, value (JSONB), expires_at


---

## Setup

### Prerequisites

- Node.js (v18+)
- Supabase project (free tier)
- API keys for Google Gemini and mapping service (Google Maps, Mapbox)

### Backend

```bash
cd backend
npm install
# Create .env with Supabase and API keys
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---


## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
# Mapping Service (Google Maps example)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### Frontend (`frontend/.env`)

```env
VITE_REACT_APP_API_URL=https://disaster-response-coordination-platform-xgm8.onrender.com/api
VITE_REACT_APP_SOCKET_URL=https://disaster-response-coordination-platform-xgm8.onrender.com
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

**Replace the example values with your actual keys and URLs.**

## Usage

- Use the frontend to create/update disasters, submit reports, and view real-time updates.
- Test all backend APIs via the frontend or tools like Postman.
- Real-time updates are pushed via WebSockets.

---

## AI Tool Usage

- **Cursor** was used to:
  - Fix WebSocket errors
  - Generate frontend buttons and forms
  - Write Supabase queries
  - Check code quality
  - Generate API routes, caching logic, and WebSocket integration
  - Assist in mock social media logic

---
 
## Notes

- Mock data and endpoints are provided for testing.
- API rate limits are handled with Supabase caching (TTL: 1 hour).
- Used mock Twitter API due to access limits.

---

## License

MIT 
