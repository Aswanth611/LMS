import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HAS_GEMINI = False

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        HAS_GEMINI = True
        logging.info("Gemini API key found. Google Generative AI configured.")
    except Exception as e:
        logging.error(f"Failed to configure Gemini API: {e}. Falling back to Rule-based system.")

class LMSRecommender:
    @staticmethod
    def generate_learning_path(track, skill_level, interests, available_courses):
        """
        Generates a personalized learning roadmap based on the track and skill level.
        Uses Gemini LLM if configured, otherwise falls back to structural rules.
        """
        if HAS_GEMINI:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are an expert academic advisor at EduFlick AI. Your task is to generate a personalized learning roadmap for a student.
                
                STUDENT PROFILE:
                - Selected Track/Goal: {track}
                - Current Skill Level: {skill_level}
                - Interests: {", ".join(interests) if interests else "None specified"}
                
                AVAILABLE COURSES IN OUR DATABASE:
                {json.dumps(available_courses, indent=2)}
                
                INSTRUCTIONS:
                1. Order the learning stages logically based on the student's skill level ({skill_level}) and career goal ({track}).
                2. Map the phases of the roadmap to the AVAILABLE COURSES from our database. Use their "id" strings in the "courses" array.
                3. If a stage requires prerequisite learning not in our courses, you can list a stage with an empty "courses" array but add descriptive "topics" to learn.
                4. You must output the result strictly as a valid JSON object.
                
                EXPECTED JSON RESPONSE FORMAT:
                {{
                  "recommendedCourses": ["course_id_1", "course_id_2"],
                  "roadmapStages": [
                    {{
                      "phase": "Phase 1: Fundamentals",
                      "title": "Stage Title (e.g. Python Programming)",
                      "description": "Description of what the student will learn in this phase.",
                      "topics": ["topic 1", "topic 2", "topic 3"],
                      "courses": ["course_id_from_db"]
                    }}
                  ]
                }}
                
                Do not include any markdown format blocks like ```json ... ```. Output raw JSON only.
                """
                
                response = model.generate_content(prompt)
                text = response.text.strip()
                
                # Strip markdown syntax if LLM returns it anyway
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                data = json.loads(text)
                logging.info("Successfully generated learning path using Gemini API.")
                return data
            except Exception as e:
                logging.error(f"Gemini learning path generation failed: {e}. Falling back to rules.")

        # ==========================================
        # RULE-BASED FALLBACK ENGINE
        # ==========================================
        logging.info("Generating learning path using Local Rule-based engine.")
        
        # Filter courses in student's track
        track_courses = [c for c in available_courses if c.get('category') == track]
        
        # Sort courses by difficulty order
        diff_order = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3}
        track_courses.sort(key=lambda c: diff_order.get(c.get('difficulty'), 1))

        # Adjust start position based on student's skill level
        filtered_courses = []
        if skill_level == 'Intermediate':
            # Skip beginner courses if they are intermediate, or keep them if short
            filtered_courses = [c for c in track_courses if c.get('difficulty') in ['Intermediate', 'Advanced']]
            if not filtered_courses:
                filtered_courses = track_courses
        elif skill_level == 'Advanced':
            filtered_courses = [c for c in track_courses if c.get('difficulty') == 'Advanced']
            if not filtered_courses:
                filtered_courses = track_courses
        else: # Beginner
            filtered_courses = track_courses

        roadmap_stages = []
        recommended_ids = []

        for idx, course in enumerate(filtered_courses):
            c_id = course.get('id') or course.get('_id')
            recommended_ids.append(str(c_id))
            
            # Extract topics from modules if available
            topics = [m.get('title') for m in course.get('modules', [])] if course.get('modules') else ["Core Fundamentals", "Key Concepts", "Practice Projects"]
            
            roadmap_stages.append({
                "phase": f"Phase {idx + 1}: {course.get('difficulty')}",
                "title": course.get('title'),
                "description": course.get('description'),
                "topics": topics,
                "courses": [str(c_id)]
            })

        # If no courses matched, construct a default path
        if not roadmap_stages:
            roadmap_stages.append({
                "phase": "Phase 1: Introduction",
                "title": f"Basic Foundations of {track}",
                "description": f"Kickstart your learning path as a {skill_level} in {track}.",
                "topics": ["Overview of Key Terms", "Setup and Environments", "First Simple Exercises"],
                "courses": []
            })

        return {
            "recommendedCourses": recommended_ids,
            "roadmapStages": roadmap_stages
        }

    @staticmethod
    def recommend_courses(track, skill_level, completed_courses, interests, available_courses):
        """
        Recommends next courses for the user.
        """
        if HAS_GEMINI:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are an AI personalization bot. Recommend the NEXT 1 or 2 best courses for the student to take.
                
                STUDENT PROFILE:
                - Selected Track: {track}
                - Skill Level: {skill_level}
                - Completed Course IDs: {completed_courses}
                - Interests: {interests}
                
                AVAILABLE COURSES IN OUR DATABASE:
                {json.dumps(available_courses, indent=2)}
                
                INSTRUCTIONS:
                1. Recommend courses that the user has NOT completed yet.
                2. Prioritize courses from their track ({track}) that match or step up from their current level.
                3. Return a JSON object with:
                   - "recommendedCourseIds": List of recommended course 'id' strings.
                   - "reasoning": Brief sentence explaining why these courses were selected.
                   
                Output raw JSON only. Do not include markdown codeblocks.
                """
                response = model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())
            except Exception as e:
                logging.error(f"Gemini recommend_courses failed: {e}. Using rules.")

        # Local Fallback
        track_courses = [c for c in available_courses if c.get('category') == track]
        
        # Filter out already completed courses
        remaining = [c for c in track_courses if str(c.get('id') or c.get('_id')) not in completed_courses]
        
        # Sort remaining by difficulty
        diff_order = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3}
        remaining.sort(key=lambda c: diff_order.get(c.get('difficulty'), 1))
        
        rec_ids = [str(c.get('id') or c.get('_id')) for c in remaining[:2]]
        
        if rec_ids:
            reasoning = f"These courses on the {track} track are selected for you because you haven't completed them yet."
        else:
            reasoning = "You have completed all available courses for this track! Feel free to explore other learning domains."

        return {
            "recommendedCourseIds": rec_ids,
            "reasoning": reasoning
        }

    @staticmethod
    def analyze_progress(student_name, track, skill_level, progress):
        """
        Analyzes a student's progress and outlines strengths, weaknesses, and next steps.
        """
        if HAS_GEMINI:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are an AI Student Success coach. Analyze this student's progress report.
                
                STUDENT PROFILE:
                - Name: {student_name}
                - Selected Track: {track}
                - Skill Level: {skill_level}
                
                STUDENT CURRENT PROGRESS DATA:
                {json.dumps(progress, indent=2)}
                
                INSTRUCTIONS:
                Provide a structured feedback analysis in JSON containing:
                - "strengths": What they are doing well.
                - "weaknesses": Areas they need to improve or focus on.
                - "nextSteps": A list of 2 or 3 actionable next steps.
                
                Output raw JSON only. Do not include markdown codeblocks.
                """
                response = model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                return json.loads(text.strip())
            except Exception as e:
                logging.error(f"Gemini progress analysis failed: {e}. Using rules.")

        # Local Fallback
        completed = [p for p in progress if p.get('status') == 'Completed']
        in_progress = [p for p in progress if p.get('status') == 'In Progress']
        
        avg_completion = 0
        if progress:
            avg_completion = sum(float(p.get('completionPercentage', 0)) for p in progress) // len(progress)

        strengths = f"You are building consistent learning habits. Average course completion is {avg_completion}%."
        if completed:
            strengths += f" You have successfully graduated from {len(completed)} course(s)."

        if in_progress:
            weaknesses = f"You have {len(in_progress)} course(s) partially completed. Spreading focus can slow down retention."
            next_steps = [
                f"Dedicate time to finish '{in_progress[0].get('courseTitle')}' which is currently at {in_progress[0].get('completionPercentage')}%.",
                "Dedicate 30 minutes daily to complete modules instead of working on multiple courses."
            ]
        else:
            weaknesses = "You haven't completed any course yet, or have no courses in progress."
            next_steps = [
                "Select a course from your dashboard and enroll.",
                "Review the modules and complete tasks in order."
            ]

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "nextSteps": next_steps
        }

    @staticmethod
    def chat_assistant(message, student_name, track, skill_level, interests, progress_summary, chat_history):
        """
        Chat assistant helper to direct students.
        """
        if HAS_GEMINI:
            try:
                import google.generativeai as genai
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                history_prompt = ""
                for h in chat_history[-6:]: # Include last 6 messages for context
                    history_prompt += f"{h.get('sender', 'user')}: {h.get('text', '')}\n"

                prompt = f"""
                You are an friendly, highly encouraging AI Chatbot helper for EduFlick AI named "EduFlick Assistant".
                You assist students with learning advice, next steps, and explaining concepts.
                
                STUDENT PROFILE:
                - Name: {student_name}
                - Selected Track: {track}
                - Skill Level: {skill_level}
                - Interests: {interests}
                - Courses Enrolled & Progress: [{progress_summary}]
                
                CHAT HISTORY:
                {history_prompt}
                
                STUDENT INQUIRY:
                "{message}"
                
                INSTRUCTIONS:
                1. Give a warm, helpful, concise response.
                2. Offer relevant study tips, suggestions on what course to complete, or answers to their query.
                3. Keep the response under 150 words.
                
                Output ONLY the assistant's reply text.
                """
                response = model.generate_content(prompt)
                return {
                    "reply": response.text.strip()
                }
            except Exception as e:
                logging.error(f"Gemini chat failed: {e}. Using rule fallback.")

        # Local Fallback Chat
        msg = message.lower()
        if "what" in msg and "learn" in msg:
            reply = f"Hi {student_name}! Since your target career track is {track} ({skill_level}), I recommend completing the core modules of your pending courses on the dashboard. They are tailored to build up your concepts step-by-step!"
        elif "improve" in msg or "progress" in msg:
            reply = f"To speed up your {track} progress, focus on finishing the courses you've already started. Consistent study, even 15 minutes a day, will help you reach your goals!"
        elif "course" in msg and ("complete" in msg or "take" in msg):
            reply = f"I recommend taking the beginner courses first, such as 'Python Fundamentals for AI' if you are on the AI track, or 'HTML, CSS & JS Fundamentals' if you are learning Full Stack development!"
        else:
            reply = f"Hello {student_name}! I am the EduFlick AI Learning Assistant. I see you are on the '{track}' track. Let me know if you need recommendations on what to learn next or tips on improving your study habits!"

        return {
            "reply": reply
        }
