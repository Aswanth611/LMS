const axios = require('axios');
const dbService = require('../utils/dbService');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

// @desc    Generate personalized learning path using AI Engine
// @route   POST /api/ai/generate-learning-path
// @access  Private
exports.generateLearningPath = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await dbService.findUserById(userId);

    if (!user || !user.selectedTrack) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your career track selection first'
      });
    }

    // Check if user requested fetchOnly and path exists
    const fetchOnly = req.body.fetchOnly || req.query.fetchOnly === 'true';
    if (fetchOnly) {
      const existingPath = await dbService.findLearningPathByUser(userId);
      if (existingPath && existingPath.roadmapStages && existingPath.roadmapStages.length > 0) {
        return res.json({
          success: true,
          learningPath: existingPath
        });
      }
    }

    // Fetch all courses in DB
    const courses = await dbService.findCourses({});

    // Send context to AI engine
    const aiPayload = {
      userId: user._id || user.id,
      track: user.selectedTrack,
      skillLevel: user.skillLevel || 'Beginner',
      interests: user.interests || [],
      availableCourses: courses.map(c => ({
        id: c._id || c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        duration: c.duration
      }))
    };

    console.log(`Calling AI engine at: ${AI_ENGINE_URL}/generate-learning-path`);
    
    let aiResponse;
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/generate-learning-path`, aiPayload);
      aiResponse = response.data;
    } catch (err) {
      console.error('AI Engine connection failed, using local fallback generation...', err.message);
      aiResponse = generateFallbackLearningPath(user, courses);
    }

    // Process AI response and save/update in DB
    const recommendedCourseIds = aiResponse.recommendedCourses || [];
    const roadmapStages = aiResponse.roadmapStages || [];

    // Validate recommended course references
    const validatedStages = (roadmapStages || []).map(stage => {
      const mappedCourses = stage.courses ? stage.courses.map(courseRef => {
        if (!courseRef) return null;
        const refStr = courseRef.toString().toLowerCase();
        const found = courses.find(c => {
          const cId = (c._id || c.id || '').toString().toLowerCase();
          const cTitle = (c.title || '').toLowerCase();
          return cId === refStr || cTitle === refStr;
        });
        return found ? (found._id || found.id) : null;
      }).filter(id => id !== null) : [];

      return {
        phase: stage.phase,
        title: stage.title,
        description: stage.description,
        topics: stage.topics || [],
        courses: mappedCourses
      };
    });

    const validatedRecommendedIds = (recommendedCourseIds || []).map(ref => {
      if (!ref) return null;
      const refStr = ref.toString().toLowerCase();
      const found = courses.find(c => {
        const cId = (c._id || c.id || '').toString().toLowerCase();
        const cTitle = (c.title || '').toLowerCase();
        return cId === refStr || cTitle === refStr;
      });
      return found ? (found._id || found.id) : null;
    }).filter(id => id !== null);

    // Save learning path to DB
    const learningPath = await dbService.updateLearningPath(
      userId,
      validatedRecommendedIds,
      validatedStages
    );

    res.json({
      success: true,
      learningPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Recommend next courses
// @route   POST /api/ai/recommend-course
// @access  Private
exports.recommendCourses = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await dbService.findUserById(userId);
    const courses = await dbService.findCourses({});
    
    // Fetch completed courses
    const progressList = await dbService.findProgressByUser(userId);
    const completedCourseIds = progressList
      .filter(p => p.status === 'Completed' && p.courseId)
      .map(p => {
        const cId = p.courseId._id || p.courseId.id || p.courseId;
        return cId ? cId.toString() : '';
      }).filter(Boolean);

    const aiPayload = {
      track: user.selectedTrack,
      skillLevel: user.skillLevel,
      completedCourses: completedCourseIds,
      interests: user.interests,
      availableCourses: courses.map(c => ({
        id: c._id || c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        duration: c.duration
      }))
    };

    let aiResponse;
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/recommend-courses`, aiPayload);
      aiResponse = response.data;
    } catch (err) {
      console.error('AI Engine recommendation failed, calling local fallback...', err.message);
      aiResponse = generateFallbackRecommendations(user, courses, completedCourseIds);
    }

    // Map title/ID strings to DB objects
    const recIds = (aiResponse.recommendedCourseIds || []).map(id => id ? id.toString() : '');
    const recommendedCourses = courses.filter(c => recIds.includes((c._id || c.id || '').toString()));

    res.json({
      success: true,
      recommendations: recommendedCourses,
      reasoning: aiResponse.reasoning || "Based on your career track preferences."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Analyze student progress using AI
// @route   POST /api/ai/analyze-progress
// @access  Private
exports.analyzeProgress = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await dbService.findUserById(userId);
    const progressList = await dbService.findProgressByUser(userId);

    const progressData = progressList.map(p => ({
      courseTitle: p.courseId ? p.courseId.title : 'Unknown Course',
      category: p.courseId ? p.courseId.category : '',
      completionPercentage: p.completionPercentage,
      status: p.status
    }));

    const aiPayload = {
      studentName: user.name,
      track: user.selectedTrack,
      skillLevel: user.skillLevel,
      progress: progressData
    };

    let aiResponse;
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/analyze-progress`, aiPayload);
      aiResponse = response.data;
    } catch (err) {
      console.error('AI Engine progress analysis failed, using local fallback...', err.message);
      aiResponse = generateFallbackAnalysis(user, progressData);
    }

    res.json({
      success: true,
      analysis: aiResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Ask the AI Assistant chatbot
// @route   POST /api/ai/chat
// @access  Private
// exports.askAssistant = async (req, res) => {
exports.askAssistant = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await dbService.findUserById(userId);
    const progressList = await dbService.findProgressByUser(userId);

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const progressSummary = progressList.map(p => {
      const title = p.courseId ? p.courseId.title : 'Unknown Course';
      return `${title} (${p.completionPercentage}% completed - ${p.status})`;
    }).join(', ');

    const aiPayload = {
      message,
      studentName: user.name,
      track: user.selectedTrack,
      skillLevel: user.skillLevel,
      interests: user.interests,
      progressSummary,
      chatHistory: chatHistory || []
    };

    let aiResponse;
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/chat`, aiPayload);
      aiResponse = response.data;
    } catch (err) {
      console.error('AI Engine chat failed, calling local fallback...', err.message);
      aiResponse = {
        reply: `Hi ${user.name}! I am currently running in offline safety mode. You are on the "${user.selectedTrack}" track as a ${user.skillLevel} student. Your enrolled courses: ${progressSummary || 'None enrolled yet'}. Let me know if you need help with any specific topic in ${user.selectedTrack}!`
      };
    }

    res.json({
      success: true,
      reply: aiResponse.reply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// LOCAL FALLBACK GENERATION LOGIC
// ==========================================

function generateFallbackLearningPath(user, courses) {
  const trackCourses = courses.filter(c => c.category === user.selectedTrack);
  const sorted = [...trackCourses].sort((a, b) => {
    const order = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    return order[a.difficulty] - order[b.difficulty];
  });

  const recommendedCourses = sorted.map(c => (c._id || c.id).toString());
  const roadmapStages = [];

  if (sorted.length > 0) {
    sorted.forEach((course, idx) => {
      roadmapStages.push({
        phase: `Phase ${idx + 1}: ${course.difficulty}`,
        title: course.title,
        description: course.description,
        topics: course.modules.map(m => m.title),
        courses: [(course._id || course.id).toString()]
      });
    });
  } else {
    roadmapStages.push({
      phase: "Phase 1",
      title: `Introduction to ${user.selectedTrack}`,
      description: `Fundamentals course for ${user.selectedTrack}`,
      topics: ["Getting Started", "Core Concepts", "Basic Setup"],
      courses: []
    });
  }

  return {
    recommendedCourses,
    roadmapStages
  };
}

function generateFallbackRecommendations(user, courses, completedCourseIds) {
  const availableTrackCourses = courses.filter(
    c => c.category === user.selectedTrack && !completedCourseIds.includes((c._id || c.id).toString())
  );

  const recommendedCourseIds = availableTrackCourses.slice(0, 2).map(c => (c._id || c.id).toString());
  
  return {
    recommendedCourseIds,
    reasoning: recommendedCourseIds.length > 0
      ? `Based on your track: ${user.selectedTrack}, these courses are next in line for you.`
      : "You have completed all available courses for your career track!"
  };
}

function generateFallbackAnalysis(user, progressData) {
  const completed = progressData.filter(p => p.status === 'Completed').length;
  const inProgress = progressData.filter(p => p.status === 'In Progress').length;
  
  let strengths = `You have started learning in the ${user.selectedTrack} track.`;
  let weaknesses = "You need to spend more time completing the modules.";
  let nextSteps = ["Go to the Track Selection page and make sure your track is correct.", "Enroll in recommended courses."];

  if (progressData.length > 0) {
    const avgPercentage = Math.round(progressData.reduce((acc, p) => acc + p.completionPercentage, 0) / progressData.length);
    strengths = `Showing solid persistence with an average of ${avgPercentage}% completion across enrolled courses.`;
    
    if (completed > 0) {
      strengths += ` Successfully completed ${completed} course(s).`;
    }
    if (inProgress > 0) {
      weaknesses = `You have ${inProgress} course(s) in progress. Try to focus on completing one course before starting the next.`;
      const currentCourse = progressData.find(p => p.status === 'In Progress');
      nextSteps = [
        `Focus on completing "${currentCourse.courseTitle}" which is currently at ${currentCourse.completionPercentage}%.`,
        "Take quizzes or review modules that you finished to retain the information."
      ];
    } else {
      nextSteps = [
        "Select your next course from the recommended list on your dashboard.",
        "Practice coding tasks based on what you learned."
      ];
    }
  }

  return {
    strengths,
    weaknesses,
    nextSteps
  };
}

// @desc    Voice Mentor speech completion
// @route   POST /api/ai/voice-mentor
// @access  Private
const sendToGroq = async (text) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key is not configured on the server. Please add GROQ_API_KEY to backend/.env file.');
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are EduFlick AI Mentor. Help students learn AI, Prompt Engineering, Content Creation, Software Development and Agentic Automation. Give beginner-friendly answers.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
    return response.data.choices[0].message.content;
  } else {
    throw new Error('Unexpected response format from Groq API');
  }
};

exports.voiceMentor = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    const reply = await sendToGroq(text);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Groq integration error:', error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Failed to call Groq API'
    });
  }
};

