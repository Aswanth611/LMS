# Future Improvements - AI LMS Automation Engine

This document maps out future features and scalability improvements for the EduFlick AI LMS Automation Engine.

---

## 1. Advanced AI Engine Extensions

- **LLM Caching**: Integrate a Redis caching layer to store generated learning paths. Similar requests for common tracks (e.g. "Full Stack Developer - Beginner") can be served instantly, reducing API latency and cost.
- **Dynamic Quiz & Skill Evaluation**: Introduce real test generation. Instead of self-reporting skill levels, the AI Engine can generate short interactive coding assessments and adjust the learning path dynamically based on score performance.
- **Multi-Agent Student Buddy**: Implement a multi-agent system where one agent acts as a strict "Examiner" (grading coding submissions), another as an "Explainer" (simplifying difficult concepts with analogical summaries), and a third as a "Motivator" (tracking consistency and sending encouraging study reminders).

---

## 2. Platform Features

- **PWA Capabilities**: Enable offline caching for course text and lesson videos so students can continue learning even during connectivity drops.
- **Micro-Credentials and Certifications**: Hook up a PDF-generation library to automatically create signed PDF certificates of completion when progress hits 100% on recommended courses.
- **Community Learning Boards**: Create discussion panels within courses where AI can summarize student questions and auto-answer FAQs before human instructors intervene.

---

## 3. Operations and DevSecOps

- **OAuth Authentication**: Migrate from simple JWT credentials to external provider authentication (such as Google, GitHub, or Okta) to simplify student logins.
- **API Rate Limiting**: Implement Express Rate Limit on API endpoints, especially `/api/ai/chat` and `/api/ai/generate-learning-path`, to prevent brute-force abuse and manage API key costs.
- **Automated Deployment**: Set up CD pipelines in GitHub actions to deploy the backend and AI-Engine services automatically to platforms like Render or AWS ECS on successful builds.
