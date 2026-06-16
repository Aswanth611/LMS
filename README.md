# AI LMS Automation Engine (EduFlick AI)

An intelligent full-stack Learning Management System (LMS) platform that automates the complete student learning journey—from initial career track selection to course syllabus completions—powered by AI personalization, roadmap generation, analytics feedback, and an interactive learning assistant chatbot.

---

## 🚀 Key Features

*   **SaaS Style Landing Interface**: Modern glassmorphic dashboard design, fluid layouts, custom radial gradients, and micro-interactive tags.
*   **Secure Authentication**: JSON Web Token (JWT) based login and registration with automated bcrypt password hashing.
*   **Career Track Selection**: Students select from predefined learning tracks (e.g., AI Engineer, Full Stack Developer, Data Scientist, Cyber Security Specialist) and set skill levels (Beginner, Intermediate, Advanced) to tailor their learning.
*   **AI Roadmap Generator**: Generates visual phase timelines containing custom study descriptions and technical topics mapped directly to database course modules.
*   **Dual Database Resiliency**: Features an auto-fallback database system. If local MongoDB is offline or unavailable, the backend automatically spins up an in-memory JSON file system database stored in `backend/data/` for zero-setup execution.
*   **Dual AI Service Resiliency**: Integrates a Python FastAPI AI engine using the Google Gemini LLM. If the Gemini API or python microservice is down, the system immediately switches to a rules-based machine matching fallback engine built in JavaScript to ensure 100% service uptime.
*   **Interactive Progress Tracker**: Track courses in progress, toggle complete individual modules via checkbox lists, and view metrics using responsive Recharts diagrams.
*   **AI Chat Assistant**: Floating chatbot widget allowing students to ask contextual questions (e.g., "What should I learn next?") and receive tailored academic counseling.
*   **Admin Management Panel**: Metrics dashboard showing total registered users, database courses list, system completion averages, and forms to add (with dynamic module creation) or delete courses.

---

## 🛠️ Technology Stack

### Frontend
*   **React (Vite)**: Quick rendering SPA framework.
*   **Tailwind CSS**: Modern custom dark theme styling.
*   **React Router Dom**: Client-side page navigation.
*   **Axios**: Server communication and JWT token interceptors.
*   **Recharts**: SVG charting for analytics.
*   **Lucide React**: Premium icon pack.

### Backend
*   **Node.js & Express.js**: REST API server layer.
*   **MongoDB & Mongoose**: Database models and storage schemas.
*   **JWT & BcryptJS**: Encryption and endpoint validation middlewares.

### AI Engine (Microservice)
*   **Python 3.8+ & FastAPI**: Fast async API framework.
*   **Uvicorn**: Server runner.
*   **Google GenerativeAI**: Google Gemini API model integration.

---

## 📂 Project Structure

```
AI-LMS-Automation-Engine
├── backend           # Node/Express API Server (Port 5000)
├── frontend          # React/Vite/Tailwind client application (Port 5173)
├── ai-engine         # Python FastAPI recommender microservice (Port 8000)
├── documentation     # Systems design, database diagram, and future updates
└── README.md         # Main project documentation
```

---

## ⚙️ Installation & Running Instructions

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com/) (Optional: the backend automatically switches to local file-system database if Mongo is down).
*   [Python 3.8+](https://www.python.org/) (Optional: the backend runs rule-based AI recommendations if Python is down).

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Configure variables in the `.env` file (A template is provided as `.env.example`):
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/ai-lms
    JWT_SECRET=supersecretkey_lms_engine_eduflick
    AI_ENGINE_URL=http://127.0.0.1:8000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
4.  Run the database seeder to populate courses and demo accounts:
    ```bash
    npm run seed
    ```
    *(Note: If MongoDB is down, the seeder is not needed; the backend will automatically seed local JSON files on first boot.)*
5.  Start the Express server:
    ```bash
    npm run dev
    ```

### 2. AI Engine Setup (Optional)
1.  Navigate to the AI engine directory:
    ```bash
    cd ai-engine
    ```
2.  Create virtual environment & install dependencies:
    ```bash
    python -m venv venv
    # Windows activation
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  Configure environment variables in `ai-engine/.env`:
    ```env
    PORT=8000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
4.  Start the FastAPI application:
    ```bash
    python main.py
    ```

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:5173` to test the LMS application.

---

## 🔒 Demo Credentials
Use these pre-seeded logins for quick evaluation:
*   **Student Login**:
    *   *Email*: `john@student.com`
    *   *Password*: `studentpassword`
*   **Admin Login**:
    *   *Email*: `admin@eduflick.ai`
    *   *Password*: `adminpassword`

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
1.  Add a `vercel.json` rewrite configuration if needed, or simply host the Vite static build.
2.  Connect your GitHub repository to Vercel.
3.  Set the Framework Preset to **Vite**.
4.  Set the Root Directory to `frontend`.
5.  Add any required build scripts: `npm run build`.

### Backend (Render / Railway)
1.  Create a Web Service pointing to the `backend` folder.
2.  Select **Node** runtime.
3.  Set Start Command to `npm start`.
4.  Configure environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `AI_ENGINE_URL`, `GEMINI_API_KEY`) in the host platform dashboard.
