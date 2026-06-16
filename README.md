# AI Powered LMS Automation Engine (EduFlick AI)

A complete, production-ready AI Powered Learning Management System (LMS) Automation Engine featuring personalized learning roadmaps, course progress analysis, an AI chat assistant, an Express-MongoDB backend, and a Vite-React frontend.

---

## Folder Structure

```
├── backend/            # Express Backend API server (Port 5000)
│   ├── src/
│   │   ├── config/     # Database configurations
│   │   ├── controllers/# Business logic handlers
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # Express routes
│   │   ├── utils/      # dbService & fallback seeder
│   │   └── server.js   # Server entry point
│   └── package.json
├── ai-engine/          # Express AI Service (Port 8000)
│   ├── services/       # Recommendation, Analysis, and Chat services
│   ├── server.js       # AI Service entry point
│   └── package.json
├── frontend/           # Vite + React Client application (Port 5173)
│   ├── src/            # Components, pages, router, styles
│   └── package.json
├── documentation/      # System guides & specifications
│   ├── architecture.md # Service and network diagrams
│   ├── database.md     # Mongoose and JSON DB structures
│   ├── workflows.md    # Sequence charts of student pathways
│   └── improvements.md # Future upgrades list
└── README.md           # Getting started guide (This file)
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Optional: local JSON fallback files database will be used automatically if MongoDB is not running!)

### 1. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-lms
JWT_SECRET=supersecretkey_lms_engine_eduflick
AI_ENGINE_URL=http://127.0.0.1:8000
```

**AI Engine (`ai-engine/.env`):**
```env
PORT=8000
GEMINI_API_KEY=your_optional_gemini_api_key_here
```

### 2. Install Dependencies

Install the packages for all three components:

```bash
# Backend
cd backend
npm install

# AI Engine
cd ../ai-engine
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run the Services

Open three terminal windows to run the servers concurrently:

* **Backend Service**:
  ```bash
  cd backend
  npm run dev
  ```
  *(Runs on port 5000)*

* **AI Engine Service**:
  ```bash
  cd ai-engine
  npm run dev
  ```
  *(Runs on port 8000)*

* **Frontend Client**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(Runs on port 5173)*

---

## Running without MongoDB (JSON Database Fallback)

If MongoDB is not running locally, the backend server automatically creates a fallback JSON file-based database at `backend/data/`. Initial courses and admin/student users will be seeded automatically inside the JSON files. 

You can log in immediately using:
- **Admin**: `admin@eduflick.ai` / `adminpassword`
- **Student**: `john@student.com` / `studentpassword`
