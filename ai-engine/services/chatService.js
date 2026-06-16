const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate local offline fallback response based on keywords
 */
function generateLocalFallbackReply(message, studentName, track, skillLevel, interests = [], progressSummary = '') {
  console.log('Using local fallback chat reply...');
  const msg = message.toLowerCase();
  
  let reply = `Hi ${studentName}! I am currently running in offline helper mode. `;

  if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
    reply += `How can I help you today? You are currently pursuing the **${track}** track at a **${skillLevel}** level. Let me know if you have questions about your studies!`;
  } else if (msg.includes('course') || msg.includes('learn') || msg.includes('study')) {
    reply += `Based on your profile, you are working on the **${track}** track. `;
    if (progressSummary) {
      reply += `Your current status: ${progressSummary}. Keep up the great work! You can also check your Dashboard for personalized recommendations.`;
    } else {
      reply += `You haven't enrolled in any courses yet. Go to your Dashboard or Track Selection page to choose some recommended courses!`;
    }
  } else if (msg.includes('python') || msg.includes('machine learning') || msg.includes('ai')) {
    reply += `It looks like you're interested in AI! Since you're on the **${track}** track, studying Python syntax, data libraries (like Pandas and NumPy), and learning models is highly recommended. Try enrolling in *Python Fundamentals for AI* or *Machine Learning Essentials*!`;
  } else if (msg.includes('react') || msg.includes('html') || msg.includes('javascript') || msg.includes('frontend')) {
    reply += `Web development is a fantastic path! Focus on mastering JavaScript (ES6+), HTML5 semantic structure, and React state management. Try taking the *HTML, CSS & JavaScript Fundamentals* course in your catalog!`;
  } else if (msg.includes('help') || msg.includes('what can you do') || msg.includes('what is this')) {
    reply += `I can help you design your learning path, analyze your course progress, suggest next steps, or answer questions about career tracks (AI, Full Stack, Data Science, Cyber Security). What would you like to explore?`;
  } else {
    reply += `You are on the **${track}** track as a **${skillLevel}** student. ${progressSummary ? `Your progress: ${progressSummary}.` : ''} If you have a specific question about coding or computer science, feel free to ask, and I will do my best to guide you!`;
  }

  return { reply };
}

/**
 * Ask Assistant Chatbot
 */
async function askAssistant(message, studentName, track, skillLevel, interests = [], progressSummary = '', chatHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateLocalFallbackReply(message, studentName, track, skillLevel, interests, progressSummary);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct system instructions
    const systemInstruction = `You are a helpful, encouraging AI Learning Assistant for EduFlick AI. Your goal is to guide students on their learning path, answer questions about programming and technology, and recommend courses.
You are speaking with ${studentName}, who is on the "${track}" track at a "${skillLevel}" skill level.
Their interests are: ${interests.join(', ') || 'None specified'}.
Their current progress is: ${progressSummary || 'No courses enrolled yet'}.
Keep your answers friendly, supportive, and relatively concise. Make references to their current courses and track whenever appropriate.`;

    // Construct conversation history text
    let historyText = '';
    chatHistory.forEach(turn => {
      // Standardize role names
      const role = (turn.role === 'user' || turn.sender === 'user') ? 'User' : 'Assistant';
      const text = turn.message || turn.content || turn.text || '';
      if (text) {
        historyText += `${role}: ${text}\n`;
      }
    });

    const prompt = `${systemInstruction}\n\nPrevious Conversation:\n${historyText}\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();
    return { reply };
  } catch (error) {
    console.error('Gemini askAssistant API call failed:', error);
    return generateLocalFallbackReply(message, studentName, track, skillLevel, interests, progressSummary);
  }
}

module.exports = {
  askAssistant
};
