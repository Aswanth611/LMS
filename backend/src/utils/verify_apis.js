const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log(' EduFlick AI LMS Automation Engine - API Integration Test');
  console.log('====================================================\n');

  let token = '';
  const testEmail = `student_${Math.floor(Math.random() * 10000)}@test.com`;
  const testPassword = 'testpassword123';

  // 1. Health check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(`[PASS] Health Check: Status is "${health.data.status}", Database mode: "${health.data.databaseMode}"`);
  } catch (err) {
    console.error('[FAIL] Health Check Failed:', err.message);
    process.exit(1);
  }

  // 2. Register Test User
  try {
    const register = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Student',
      email: testEmail,
      password: testPassword
    });
    token = register.data.token;
    console.log(`[PASS] Auth Register: Success. Created account for "${testEmail}"`);
  } catch (err) {
    console.error('[FAIL] Registration Failed:', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 3. Login Test User
  try {
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log(`[PASS] Auth Login: Success. JWT token acquired.`);
  } catch (err) {
    console.error('[FAIL] Login Failed:', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // Configure Axios default header for next steps
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // 4. Fetch Course Catalog
  try {
    const courses = await axios.get(`${BASE_URL}/courses`, authHeaders);
    console.log(`[PASS] Course Catalog: Success. Found ${courses.data.count} course(s) in catalog.`);
  } catch (err) {
    console.error('[FAIL] Fetching Courses Failed:', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 5. Select Track and Update Profile
  try {
    const profile = await axios.put(`${BASE_URL}/users/profile`, {
      selectedTrack: 'AI Engineer',
      skillLevel: 'Beginner',
      interests: ['Python', 'Machine Learning']
    }, authHeaders);
    console.log(`[PASS] Update Profile: Success. Set track to "${profile.data.user.selectedTrack}" (${profile.data.user.skillLevel})`);
  } catch (err) {
    console.error('[FAIL] Profile Update Failed:', err.response?.data?.message || err.message);
    process.exit(1);
  }

  // 6. Generate Personalized Learning Path
  try {
    const path = await axios.post(`${BASE_URL}/ai/generate-learning-path`, {}, authHeaders);
    const stages = path.data.learningPath.roadmapStages;
    console.log(`[PASS] Generate Learning Path: Success. Structured ${stages.length} study phases.`);
    stages.forEach(s => {
      console.log(`   -> ${s.phase}: ${s.title} (${s.topics.length} topics)`);
    });
  } catch (err) {
    console.error('[FAIL] Learning Path Generation Failed:', err.response?.data?.message || err.message);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log(' All API Integration checks completed successfully!');
  console.log('====================================================');
};

runTests();
