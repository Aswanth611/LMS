const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Clean and parse JSON from Gemini response
 */
function cleanAndParseJSON(text) {
  try {
    let cleanText = text.trim();
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
 * Generate local fallback progress analysis
 */
function generateLocalFallbackAnalysis(studentName, track, skillLevel, progress = []) {
  console.log('Using local fallback progress analysis...');
  const completed = progress.filter(p => p.status === 'Completed').length;
  const inProgress = progress.filter(p => p.status === 'In Progress').length;
  const notStarted = progress.filter(p => p.status === 'Not Started').length;
  
  let strengths = `${studentName} has embarked on the ${track} track at a ${skillLevel} level.`;
  let weaknesses = "No active course progress detected yet. Try enrolling in a course and completing your first lesson!";
  let nextSteps = [
    "Navigate to the Course Catalog and enroll in a foundational course.",
    "Schedule 15 minutes of study time daily to build learning consistency."
  ];

  if (progress.length > 0) {
    const avgPercentage = Math.round(progress.reduce((acc, p) => acc + p.completionPercentage, 0) / progress.length);
    strengths = `Demonstrating focus with an average of ${avgPercentage}% progress across ${progress.length} enrolled courses.`;
    
    if (completed > 0) {
      strengths += ` Successfully completed ${completed} course(s) on this learning pathway.`;
    }

    if (inProgress > 0) {
      weaknesses = `You currently have ${inProgress} course(s) in progress. Focus on completing them sequentially before taking on new ones to prevent cognitive overload.`;
      const activeCourse = progress.find(p => p.status === 'In Progress') || progress[0];
      nextSteps = [
        `Focus on completing "${activeCourse.courseTitle}" which is currently at ${activeCourse.completionPercentage}%.`,
        "Spend time reviewing modules you've completed to reinforce core learning."
      ];
    } else if (notStarted > 0) {
      weaknesses = `You have ${notStarted} course(s) enrolled but not yet started.`;
      const notStartedCourse = progress.find(p => p.status === 'Not Started');
      nextSteps = [
        `Begin the first lesson of "${notStartedCourse.courseTitle}" today.`,
        "Set a simple goal to complete one module per week."
      ];
    } else {
      // All enrolled are completed
      weaknesses = "No current weaknesses identified. Excellent job completing your course list!";
      nextSteps = [
        "Check your custom learning roadmap for recommended next-phase courses.",
        "Talk to the AI Assistant to explore advanced topics in your track."
      ];
    }
  }

  return {
    strengths,
    weaknesses,
    nextSteps
  };
}

/**
 * Analyze student progress
 */
async function analyzeProgress(studentName, track, skillLevel, progress = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateLocalFallbackAnalysis(studentName, track, skillLevel, progress);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI educational coach and analyst for EduFlick AI.
Analyze the progress of the following student and provide constructive feedback:
- Student Name: ${studentName}
- Chosen Track: ${track}
- Skill Level: ${skillLevel}

Student Progress Data:
${JSON.stringify(progress, null, 2)}

Instructions:
1. Review the completion percentages and statuses of all enrolled courses.
2. Provide a professional, encouraging analysis. Highlight:
   - "strengths": A string detailing positive learning habits (e.g. high average completion, active engagement, target track progress).
   - "weaknesses": A string noting potential blocks, pacing issues, or learning suggestions (e.g. starting too many courses, low completion rates, offline lessons).
   - "nextSteps": An array of 2 to 3 actionable, specific tasks the student should do next to maintain progress.
3. Return ONLY a JSON object matching this schema:
{
  "strengths": "...",
  "weaknesses": "...",
  "nextSteps": ["Step 1...", "Step 2..."]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Gemini analyzeProgress API call failed:', error);
    return generateLocalFallbackAnalysis(studentName, track, skillLevel, progress);
  }
}

module.exports = {
  analyzeProgress
};
