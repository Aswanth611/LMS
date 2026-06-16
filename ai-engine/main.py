import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from recommender import LMSRecommender
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EduFlick AI LMS Automation Engine",
    description="Microservice providing personalized course recommendations, roadmap paths, student analysis, and chat assistance",
    version="1.0.0"
)

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class GeneratePathRequest(BaseModel):
    userId: str
    track: str
    skillLevel: str
    interests: List[str]
    availableCourses: List[Dict[str, Any]]

class RecommendCoursesRequest(BaseModel):
    track: str
    skillLevel: str
    completedCourses: List[str]
    interests: List[str]
    availableCourses: List[Dict[str, Any]]

class AnalyzeProgressRequest(BaseModel):
    studentName: str
    track: str
    skillLevel: str
    progress: List[Dict[str, Any]]

class ChatRequest(BaseModel):
    message: str
    studentName: str
    track: str
    skillLevel: str
    interests: List[str]
    progressSummary: str
    chatHistory: Optional[List[Dict[str, Any]]] = []

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EduFlick AI LMS Automation Engine - AI Microservice",
        "endpoints": [
            "/generate-learning-path",
            "/recommend-courses",
            "/analyze-progress",
            "/chat"
        ]
    }

@app.post("/generate-learning-path")
def generate_learning_path(payload: GeneratePathRequest):
    try:
        roadmap = LMSRecommender.generate_learning_path(
            track=payload.track,
            skill_level=payload.skillLevel,
            interests=payload.interests,
            available_courses=payload.availableCourses
        )
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-courses")
def recommend_courses(payload: RecommendCoursesRequest):
    try:
        recommendations = LMSRecommender.recommend_courses(
            track=payload.track,
            skill_level=payload.skillLevel,
            completed_courses=payload.completedCourses,
            interests=payload.interests,
            available_courses=payload.availableCourses
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-progress")
def analyze_progress(payload: AnalyzeProgressRequest):
    try:
        analysis = LMSRecommender.analyze_progress(
            student_name=payload.studentName,
            track=payload.track,
            skill_level=payload.skillLevel,
            progress=payload.progress
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(payload: ChatRequest):
    try:
        response = LMSRecommender.chat_assistant(
            message=payload.message,
            student_name=payload.studentName,
            track=payload.track,
            skill_level=payload.skillLevel,
            interests=payload.interests,
            progress_summary=payload.progressSummary,
            chat_history=payload.chatHistory
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Uvicorn server on port {port}...")
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
