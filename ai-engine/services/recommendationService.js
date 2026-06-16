const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Clean and parse JSON from Gemini response
 */
function cleanAndParseJSON(text) {
  try {
    let cleanText = text.trim();
    // Strip markdown code block wrappers if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '');
      cleanText = cleanText.replace(/\n?```$/i, '');
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', error);
    throw new Error('Invalid JSON response from AI model');
  }
}

/**
 * Generate local fallback learning path
 */
function generateLocalFallbackPath(track, skillLevel, availableCourses) {
  console.log('Using local fallback path generation...');
  // Filter courses by category
  const trackCourses = availableCourses.filter(
    c => c.category && c.category.toLowerCase() === track.toLowerCase()
  );

  // Sort courses by difficulty level
  const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
  const sortedCourses = [...trackCourses].sort((a, b) => {
    const diffA = difficultyOrder[a.difficulty] || 1;
    const diffB = difficultyOrder[b.difficulty] || 1;
    return diffA - diffB;
  });

  const recommendedCourses = sortedCourses.map(c => c.id);
  const roadmapStages = [];

  if (sortedCourses.length > 0) {
    sortedCourses.forEach((course, index) => {
      roadmapStages.push({
        phase: `Phase ${index + 1}: ${course.difficulty}`,
        title: course.title,
        description: course.description,
        topics: [course.title, `Core concepts of ${course.difficulty} level`],
        courses: [course.id]
      });
    });
  } else {
    // If no course in track, generate a default stage
    roadmapStages.push({
      phase: 'Phase 1: Introduction',
      title: `Introduction to ${track}`,
      description: `Embark on your journey to becoming a ${track}.`,
      topics: ['Getting Started', 'Core Concepts', 'Basic Tools'],
      courses: []
    });
  }

  return {
    recommendedCourses,
    roadmapStages
  };
}

/**
 * Generate local fallback recommendations
 */
function generateLocalFallbackRecs(track, skillLevel, completedCourses, availableCourses) {
  console.log('Using local fallback course recommendations...');
  const incompleteTrackCourses = availableCourses.filter(
    c => c.category && c.category.toLowerCase() === track.toLowerCase() && !completedCourses.includes(c.id.toString())
  );

  // Sort by difficulty
  const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
  const sorted = [...incompleteTrackCourses].sort((a, b) => {
    const diffA = difficultyOrder[a.difficulty] || 1;
    const diffB = difficultyOrder[b.difficulty] || 1;
    return diffA - diffB;
  });

  const recommendedCourseIds = sorted.slice(0, 2).map(c => c.id);
  let reasoning = `Based on your track: ${track}, these courses are next in line for you.`;
  if (recommendedCourseIds.length === 0) {
    reasoning = "You have completed all available courses for your career track!";
  }

  return {
    recommendedCourseIds,
    reasoning
  };
}

/**
 * Generate Learning Path
 */
async function generateLearningPath(track, skillLevel, interests = [], availableCourses = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateLocalFallbackPath(track, skillLevel, availableCourses);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert curriculum designer and career advisor for EduFlick AI.
Create a personalized learning path/roadmap for a student with the following profile:
- Career Track Goal: ${track}
- Current Skill Level: ${skillLevel}
- Expressed Interests: ${interests.join(', ') || 'None specified'}

Here are the courses available in our catalog:
${JSON.stringify(availableCourses, null, 2)}

Instructions:
1. Return a JSON object with:
   - "recommendedCourses": An array of Course IDs that are highly recommended, ordered sequentially. Only use IDs from the provided available courses.
   - "roadmapStages": An array of roadmap stage objects, where each stage contains:
     - "phase": string (e.g., "Phase 1: Getting Started", "Phase 2: Core Concepts")
     - "title": string (the name of this stage)
     - "description": string (what the student will learn in this stage)
     - "topics": array of strings (specific sub-topics/skills covered)
     - "courses": array of course IDs from the available courses list that fit this stage. You MUST map these to the actual "id" of the course from the available courses list.

2. Structure the phases logically: start with beginner topics if the student is a Beginner, or skip directly to intermediate/advanced if they are Advanced.
3. Keep the output strictly in valid JSON format. Do not write any explanatory text outside the JSON.

JSON Response Schema:
{
  "recommendedCourses": ["courseId1", "courseId2", ...],
  "roadmapStages": [
    {
      "phase": "Phase 1",
      "title": "...",
      "description": "...",
      "topics": ["...", "..."],
      "courses": ["courseId1"]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Gemini generateLearningPath API call failed:', error);
    return generateLocalFallbackPath(track, skillLevel, availableCourses);
  }
}

/**
 * Recommend Next Courses
 */
async function recommendCourses(track, skillLevel, completedCourses = [], interests = [], availableCourses = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateLocalFallbackRecs(track, skillLevel, completedCourses, availableCourses);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI educational advisor for EduFlick AI.
Recommend the next courses for a student:
- Selected Track: ${track}
- Skill Level: ${skillLevel}
- Completed Course IDs: ${JSON.stringify(completedCourses)}
- Interests: ${interests.join(', ') || 'None specified'}

Available Course Catalog:
${JSON.stringify(availableCourses, null, 2)}

Instructions:
1. Select 1 to 3 course IDs from the available courses that the student should take next. Do not recommend courses they have already completed.
2. Provide a short, motivating professional reason explaining why these courses were recommended based on their goals and interests.
3. Return ONLY a JSON object matching the schema:
{
  "recommendedCourseIds": ["courseId1", "courseId2"],
  "reasoning": "A brief explanation of why these courses fit the student's current needs."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Gemini recommendCourses API call failed:', error);
    return generateLocalFallbackRecs(track, skillLevel, completedCourses, availableCourses);
  }
}

module.exports = {
  generateLearningPath,
  recommendCourses
};
