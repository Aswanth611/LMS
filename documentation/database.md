# Database Design - AI LMS Automation Engine

This document details the MongoDB schemas, models, and relationships used by the EduFlick AI LMS.

---

## 🗄️ Database Models

```mermaid
erDiagram
    USER ||--o{ PROGRESS : tracks
    USER ||--o| LEARNING-PATH : owns
    COURSE ||--o{ PROGRESS : records
    COURSE ||--o{ ROADMAP-STAGE : maps
    LEARNING-PATH ||--|{ ROADMAP-STAGE : contains

    USER {
        ObjectId id PK
        string name
        string email UK
        string password
        string role
        string selectedTrack
        string skillLevel
        string_array interests
        date createdAt
    }

    COURSE {
        ObjectId id PK
        string title
        string description
        string category
        string difficulty
        number duration
        array modules
        date createdAt
    }

    PROGRESS {
        ObjectId id PK
        ObjectId userId FK
        ObjectId courseId FK
        number completionPercentage
        string status
        string_array completedModules
        date lastAccessed
    }

    LEARNING-PATH {
        ObjectId id PK
        ObjectId userId FK
        ObjectId_array recommendedCourses FK
        array roadmapStages
        date createdAt
    }
```

---

## 📝 Schemas Description

### 1. User Model (`User.js`)
Stores user accounts. Password fields are marked with `select: false` to prevent accidental credential leakage in server returns.
*   `role`: Restricts operations to `student` or `admin`.
*   `selectedTrack` & `skillLevel`: Drives the AI personalization engine logic.

### 2. Course Model (`Course.js`)
Maintains the LMS syllabus curriculum items.
*   `modules`: Sub-document array storing specific sub-topics, descriptions, and durations (in minutes).

### 3. Progress Model (`Progress.js`)
An associative table holding student completion statistics for enrolled courses.
*   `completedModules`: Stores titles of completed course modules.
*   `completionPercentage`: Automatically calculated as: `(completedModules.length / course.modules.length) * 100`.
*   `status`: Automatically toggled as `Not Started`, `In Progress`, or `Completed` based on the percentage metric.

### 4. Learning Path Model (`LearningPath.js`)
Caches the AI-generated roadmap structures.
*   `roadmapStages`: Nested array displaying the recommended phases.
*   `courses`: Array of Course references linked to each study phase.
