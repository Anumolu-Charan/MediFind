# MediFind – Medicine Availability Finder 🏥💊

MediFind is a production-ready, full-stack healthcare web application that connects patients and caregivers directly to real-time medicine inventory across local pharmacies. Patients can search for medications by brand name, active generic chemical compound, or natural language (powered by **Google Gemini AI**), detect nearby pharmacies using browser geolocation, inspect real-time stock levels (**Supabase Realtime**), and get instant turn-by-turn **Google Maps** navigation directions.

---

## 🌟 Key Features & Role Breakdown

### 🧑‍⚕️ 1. Patient
- **Natural Language & Direct Search**: Search by commercial brand name (e.g., *Dolo 650*, *Amoxicillin*) or plain English descriptions (e.g., *"I have fever and severe headache, what is in stock?"*).
- **Geolocation & Proximity**: Automatically detects browser GPS coordinates to calculate Haversine distance, travel time, and nearest store ranking.
- **Realtime Stock Verification**: Supabase Realtime synchronization automatically updates availability badges (**In Stock**, **Low Stock**, **Out of Stock**) when pharmacy staff adjust counts.
- **Turn-by-Turn Directions**: Generates direct Google Maps navigation links and modal previews.
- **AI Search History**: Access previous searches with 1-click re-run.

### 🏪 2. Pharmacy
- **Protected Pharmacy Portal**: Authenticated dashboard displaying store profile, total catalog, and inventory distribution.
- **Full Inventory CRUD**: Add medicines from the central catalog, adjust quantity, set unit prices, and update stock status.
- **Instant Realtime Broadcasts**: Any stock modification immediately updates active patient queries via WebSocket broadcasts.
- **Store Profile Management**: Update address, operating hours, phone numbers, and state pharmacy license details.

### 🛡️ 3. Admin
- **Master Command Center**: Real-time telemetry covering total users, pharmacies, registered medicines, inventory records, and AI searches.
- **User Management**: Inspect and manage platform accounts (Patient, Pharmacy, Admin).
- **Catalog Management**: Add, update, or remove medicines from the standard catalog.
- **Audit Logs**: Live activity feed of recent stock adjustments and AI natural language queries.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons |
| **Backend** | Node.js (v24), Express REST API, CORS, Morgan |
| **Database** | Supabase PostgreSQL 17 with UUID primary keys & B-tree/GIN indexes |
| **Realtime** | Supabase Realtime (`postgres_changes` on `inventory` publication) |
| **Authentication** | bcryptjs password hashing + JSON Web Tokens (JWT) + Role-based middleware |
| **Validation** | Zod schema validation for HTTP requests and AI outputs |
| **AI Integration** | Google Gemini API (`@google/genai`) with medical safety guardrails & local NLP engine fallback |
| **Mapping & Location**| Google Places/Maps API + Haversine formula distance computation + Google Maps directions |

---

## 📂 Project Structure

```
MediFind Application/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # StockBadge, PharmacyCard, MedicineCard, MapDirectionsModal, etc.
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── lib/                # api.js fetch client, supabase.js realtime client
│   │   ├── pages/              # Landing, Login, Register, Search, Dashboards, Profile, History, 404
│   │   ├── App.jsx             # React Router routing hierarchy
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # env.js, db.js (Supabase client)
│   │   ├── middleware/         # auth.js, roles.js, validate.js, errorHandler.js
│   │   ├── routes/             # auth, medicines, pharmacies, inventory, ai, admin
│   │   ├── services/           # geminiService.js, mapsService.js
│   │   ├── validators/         # authSchema, medicineSchema, inventorySchema
│   │   ├── scripts/            # seed.js (database seeder), test-api.js (automated tests)
│   │   └── index.js            # Express server entry point & static dist delivery
│   ├── package.json
│   └── .env
├── package.json                # Monorepo scripts (dev, seed, build, start)
├── .env.example                # Example environment variables (no hardcoded secrets)
└── README.md                   # This documentation
```

---

## 🔐 Demo Credentials for Quick Testing

You can click any demo account pill on the Login page to auto-fill credentials:

| Role | Email | Password | Store / Name |
|---|---|---|---|
| **Admin** | `admin@medifind.com` | `Admin@123` | System Administrator |
| **Pharmacy** | `careplus@medifind.com` | `Pharmacy@123` | CarePlus 24/7 Pharmacy (DEMO) |
| **Pharmacy** | `medihealth@medifind.com` | `Pharmacy@123` | MediHealth Chemist & Superstore (DEMO) |
| **Pharmacy** | `lifeline@medifind.com` | `Pharmacy@123` | LifeLine Wellness Drugs (DEMO) |
| **Patient** | `patient@medifind.com` | `Patient@123` | John Patient |

---

## ⚙️ Environment Variables

A `.env.example` file is included in the project root:

```env
PORT=5000
NODE_ENV=development

# Supabase PostgreSQL & Realtime Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_or_secret_key

# Authentication
JWT_SECRET=your_jwt_secret_must_be_at_least_32_characters_long

# AI Medicine Search (Backend Only)
GEMINI_API_KEY=your_google_gemini_api_key

# Google Maps / Places (Optional - Seeded pharmacies fallback provided)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> **Note:** If `GEMINI_API_KEY` is not provided, the application automatically engages its integrated local NLP medical dictionary to extract generic compounds and synonyms without crashing.
> If `GOOGLE_MAPS_API_KEY` is not provided, the application displays verified network pharmacies with accurate Haversine geolocation calculations and Google Maps directions links.

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
# In the project root:
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Seed the Database
Populates the 5 fictional pharmacies, 15 medicines, and demo inventory:
```bash
npm run seed
```

### 3. Run Automated Tests
Verifies all 11 backend REST API suites:
```bash
node server/src/scripts/test-api.js
```

### 4. Start the Application
Run both backend Express server and frontend Vite development server concurrently:
```bash
npm run dev
```

- **Frontend (Vite HMR)**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

Alternatively, to run the production build on a single port:
```bash
npm run build:client
npm start
```
The application will be served at `http://localhost:5000`.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create patient or pharmacy account
- `POST /api/auth/login` - Authenticate and retrieve JWT
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Retrieve current user profile (Protected)
- `PUT /api/auth/profile` - Update user or store details (Protected)

### Medicines (`/api/medicines`)
- `GET /api/medicines` - List catalog medicines with stock summary
- `GET /api/medicines/search?q=...&category=...` - Search medicines and return store links
- `GET /api/medicines/:id` - Medicine details with inventory breakdown
- `POST /api/medicines` - Add medicine to catalog (Admin only)
- `PUT /api/medicines/:id` - Update catalog medicine (Admin only)
- `DELETE /api/medicines/:id` - Delete catalog medicine (Admin only)

### Pharmacies (`/api/pharmacies`)
- `GET /api/pharmacies` - List all network pharmacies
- `GET /api/pharmacies/:id` - Pharmacy profile with full inventory catalog
- `GET /api/pharmacies/nearby?lat=...&lng=...&radius=...&q=...` - Proximity search with distance & travel time
- `PUT /api/pharmacies/:id` - Update pharmacy profile (Owner or Admin)

### Inventory (`/api/inventory`)
- `GET /api/inventory?pharmacy_id=...` - Query inventory records
- `POST /api/inventory` - Add medicine to store stock (Pharmacy or Admin)
- `PUT /api/inventory/:id` - Update stock count, status, or price (Pharmacy or Admin)
- `DELETE /api/inventory/:id` - Remove item from store stock (Pharmacy or Admin)

### AI Natural Language Search (`/api/ai`)
- `POST /api/ai/medicine-search` - Natural language query to Gemini AI; extracts search terms and matches medicines
- `GET /api/ai/history` - View past AI query history and extracted entities

### Admin Command Center (`/api/admin`)
- `GET /api/admin/stats` - System overview counters and stock distribution
- `GET /api/admin/users` - View and manage platform accounts
- `DELETE /api/admin/users/:id` - Delete a user account
- `GET /api/admin/activity` - Recent inventory modifications and AI search logs

---

## 🛡️ Medical AI Safety Directive

MediFind strictly abides by healthcare safety standards:
1. **No Diagnosis**: Gemini prompts instruct the model never to attempt diagnosing symptoms or diseases.
2. **No Prescriptions**: The AI only maps user language to existing pharmacological compounds or over-the-counter equivalents in the catalog.
3. **No Dosage Guidance**: The model never recommends dosages, administration intervals, or durations.
4. **Prominent Disclaimers**: Displayed across the UI and API response envelopes reminding users to consult a licensed medical professional.

---

## ⚡ Supabase Realtime Architecture

1. The `inventory` table is registered under the `supabase_realtime` publication in PostgreSQL.
2. When a pharmacy updates medicine stock via `PUT /api/inventory/:id`, PostgreSQL emits a `postgres_changes` event.
3. Connected patient search clients subscribed via `@supabase/supabase-js` receive the event instantly over WebSockets.
4. The client updates stock badges and quantities live on screen without page reloads.

---

## 📄 License
MIT License. Built for healthcare accessibility and emergency medicine discovery.
