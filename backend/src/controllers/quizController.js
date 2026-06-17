const dbService = require('../utils/dbService');
const quizzesData = require('../utils/quizzesData');

// @desc    Submit a phase quiz, evaluate it, update progress & unlock next phase
// @route   POST /api/quiz/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { phaseId, answers } = req.body;
    const userId = req.user.id || req.user._id;

    if (phaseId === undefined || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Phase ID and answers are required.'
      });
    }

    const learningPath = await dbService.findLearningPathByUser(userId.toString());
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found.'
      });
    }

    const stageIdx = Number(phaseId) - 1;
    if (stageIdx < 0 || stageIdx >= learningPath.roadmapStages.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid phase ID: ${phaseId}`
      });
    }

    const stage = learningPath.roadmapStages[stageIdx];
    const courseObj = stage.courses && stage.courses.length > 0 ? stage.courses[0] : null;
    if (!courseObj) {
      return res.status(400).json({
        success: false,
        message: 'No course associated with this phase.'
      });
    }

    const courseId = (courseObj._id || courseObj.id || courseObj).toString();
    const questions = quizzesData[courseId] || [];

    if (questions.length === 0) {
      return res.json({
        success: true,
        message: "Phase completed. Next phase unlocked.",
        unlockedPhase: Number(phaseId) + 1,
        score: 100
      });
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && Number(answers[idx]) === q.answerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 60;

    if (passed) {
      const nextPhase = Number(phaseId) + 1;
      
      let unlockedPhases = learningPath.unlockedPhases || [1];
      if (!unlockedPhases.includes(nextPhase)) {
        unlockedPhases.push(nextPhase);
      }

      let completedPhases = learningPath.completedPhases || [];
      const existingIdx = completedPhases.findIndex(cp => cp.phaseId === Number(phaseId));
      const phaseInfo = { phaseId: Number(phaseId), quizScore: score, completed: true };
      if (existingIdx !== -1) {
        completedPhases[existingIdx] = phaseInfo;
      } else {
        completedPhases.push(phaseInfo);
      }

      // Update LearningPath fields
      await dbService.updateLearningPathProgression(
        userId.toString(),
        Math.max(learningPath.currentPhase || 1, nextPhase),
        completedPhases,
        unlockedPhases
      );

      // Also update course progress in database to 'Completed' with the quiz score
      await dbService.updateProgress(userId.toString(), courseId, {
        quizScore: score
      });

      return res.json({
        success: true,
        message: "Phase completed. Next phase unlocked.",
        unlockedPhase: nextPhase,
        score
      });
    } else {
      return res.json({
        success: false,
        message: "You need 60% to unlock the next phase.",
        score,
        retry: true
      });
    }
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
