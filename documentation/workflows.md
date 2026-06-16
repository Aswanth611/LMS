# Workflow Diagrams - AI LMS Automation Engine

This document explains the workflows and algorithms running inside the AI LMS Automation Engine.

---

## 🧭 Workflow 1: Learning Path Generation

This flow initiates when a student completes their track selection details:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant Express as Express API Server
    participant DB as MongoDB / JSON Store
    participant AI as FastAPI AI Engine
    participant LLM as Google Gemini API

    Student->>Express: POST /api/ai/generate-learning-path
    Express->>DB: Fetch user profile & available courses list
    DB-->>Express: Return user choices & course catalogue
    Express->>AI: POST /generate-learning-path (send context)
    alt Gemini Key Configured
        AI->>LLM: Generate structured roadmap prompt
        LLM-->>AI: Return generated JSON
    else Gemini Offline
        AI->>AI: Trigger local rule-based sorting
    end
    AI-->>Express: Return customized stages JSON
    Express->>DB: Save generated path inside LearningPath collection
    Express-->>Student: Return populated roadmap object
```

---

## 📝 Workflow 2: Progress Updates and Calculations

This flow updates student progress:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant Express as Express API Server
    participant DB as MongoDB / JSON Store

    Student->>Express: PUT /api/progress/update (courseId, completedModules)
    Express->>DB: Fetch Course details (number of modules)
    DB-->>Express: Return module counts
    Express->>Express: Compute completion rate = (completedModules / totalModules) * 100
    Express->>Express: Auto-adjust status (Not Started / In Progress / Completed)
    Express->>DB: Update user Progress model fields
    Express-->>Student: Return updated progress stats
```

---

## 💬 Workflow 3: Chatbot Helper

This flow details how the chat assistant resolves messages:

1.  The student clicks a quick prompt or inputs a custom question.
2.  Axios submits a `POST /api/ai/chat` request to the backend.
3.  The backend pulls the user's current progress reports (enrolled courses, completion rates) to formulate context.
4.  The backend passes the user inquiry and progress summaries to the python AI microservice.
5.  If Gemini is configured, it calls the LLM with the context to generate a natural response.
6.  If Gemini is down, the local chatbot helper checks for keywords ("learn", "progress", "course") to provide immediate, context-aware study tips.
