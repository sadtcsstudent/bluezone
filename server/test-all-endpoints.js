const API_BASE = 'http://localhost:4000/api';

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper to make requests using native fetch
async function testEndpoint(method, path, data = null, token = null, description = '') {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const config = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(`${API_BASE}${path}`, config);
    const responseData = await response.json().catch(() => ({}));

    if (response.ok) {
      results.passed.push({ method, path, status: response.status, description });
      return responseData;
    } else {
      results.failed.push({
        method,
        path,
        status: response.status,
        message: responseData.message || response.statusText,
        description
      });
      return null;
    }
  } catch (error) {
    results.failed.push({
      method,
      path,
      status: 'ERROR',
      message: error.message,
      description
    });
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');

  let authToken = null;
  let userId = null;

  // === AUTH ENDPOINTS ===
  console.log('📝 Testing Auth Endpoints...');

  // Signup
  const signupData = {
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'Test1234!',
    location: 'Test City'
  };

  const signupResult = await testEndpoint('POST', '/auth/signup', signupData, null, 'User Signup');
  if (signupResult?.token) {
    authToken = signupResult.token;
    userId = signupResult.user?.id;
    console.log('✅ Signup successful, got auth token');
  }

  // Get Me
  await testEndpoint('GET', '/auth/me', null, authToken, 'Get Current User');

  // Login
  await testEndpoint('POST', '/auth/login', {
    email: signupData.email,
    password: signupData.password
  }, null, 'User Login');

  // === USER ENDPOINTS ===
  console.log('\n👤 Testing User Endpoints...');

  await testEndpoint('GET', '/users/profile', null, authToken, 'Get User Profile');
  await testEndpoint('PUT', '/users/profile', { bio: 'Test bio' }, authToken, 'Update Profile');
  await testEndpoint('GET', '/users/search?q=test', null, authToken, 'Search Users');

  // === EVENT ENDPOINTS ===
  console.log('\n📅 Testing Event Endpoints...');

  await testEndpoint('GET', '/events', null, authToken, 'List Events');

  const eventData = {
    title: 'Test Event',
    description: 'Test Description',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Test Location',
    category: 'community'
  };

  const event = await testEndpoint('POST', '/events', eventData, authToken, 'Create Event');

  if (event?.event?.id) {
    await testEndpoint('GET', `/events/${event.event.id}`, null, authToken, 'Get Event by ID');
    await testEndpoint('PUT', `/events/${event.event.id}`, { title: 'Updated Event' }, authToken, 'Update Event');
    await testEndpoint('POST', `/events/${event.event.id}/register`, {}, authToken, 'Register for Event');
    await testEndpoint('DELETE', `/events/${event.event.id}`, null, authToken, 'Delete Event');
  }

  // === FORUM ENDPOINTS ===
  console.log('\n💬 Testing Forum Endpoints...');

  await testEndpoint('GET', '/forum/discussions', null, authToken, 'List Discussions');

  const discussionData = {
    title: 'Test Discussion',
    content: 'Test content',
    category: 'general'
  };

  const discussion = await testEndpoint('POST', '/forum/discussions', discussionData, authToken, 'Create Discussion');

  if (discussion?.discussion?.id) {
    await testEndpoint('GET', `/forum/discussions/${discussion.discussion.id}`, null, authToken, 'Get Discussion');
    await testEndpoint('POST', `/forum/discussions/${discussion.discussion.id}/replies`, {
      content: 'Test reply'
    }, authToken, 'Create Reply');
    await testEndpoint('POST', `/forum/discussions/${discussion.discussion.id}/like`, {}, authToken, 'Like Discussion');
  }

  // === GROUP ENDPOINTS ===
  console.log('\n👥 Testing Group Endpoints...');

  await testEndpoint('GET', '/groups', null, authToken, 'List Groups');

  const groupData = {
    name: 'Test Group',
    description: 'Test Description',
    category: 'community'
  };

  const group = await testEndpoint('POST', '/groups', groupData, authToken, 'Create Group');

  if (group?.group?.id) {
    await testEndpoint('GET', `/groups/${group.group.id}`, null, authToken, 'Get Group');
    await testEndpoint('POST', `/groups/${group.group.id}/join`, {}, authToken, 'Join Group');
  }

  // === INITIATIVE ENDPOINTS ===
  console.log('\n🌱 Testing Initiative Endpoints...');

  await testEndpoint('GET', '/initiatives', null, authToken, 'List Initiatives');

  const initiativeData = {
    title: 'Test Initiative',
    description: 'Test Description',
    category: 'environment'
  };

  const initiative = await testEndpoint('POST', '/initiatives', initiativeData, authToken, 'Create Initiative');

  if (initiative?.initiative?.id) {
    await testEndpoint('GET', `/initiatives/${initiative.initiative.id}`, null, authToken, 'Get Initiative');
    await testEndpoint('POST', `/initiatives/${initiative.initiative.id}/support`, {}, authToken, 'Support Initiative');
  }

  // === NOTIFICATION ENDPOINTS ===
  console.log('\n🔔 Testing Notification Endpoints...');

  await testEndpoint('GET', '/notifications', null, authToken, 'List Notifications');
  await testEndpoint('PUT', '/notifications/read-all', {}, authToken, 'Mark All Read');

  // === MESSAGE ENDPOINTS ===
  console.log('\n💌 Testing Message Endpoints...');

  await testEndpoint('GET', '/messages/conversations', null, authToken, 'List Conversations');

  // === NEWSLETTER ENDPOINTS ===
  console.log('\n📧 Testing Newsletter Endpoints...');

  await testEndpoint('POST', '/newsletter/subscribe', {
    email: `newsletter${Date.now()}@test.com`
  }, null, 'Subscribe to Newsletter');

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));

  console.log(`\n✅ PASSED: ${results.passed.length}`);
  results.passed.forEach(r => {
    console.log(`   ${r.method.padEnd(6)} ${r.path.padEnd(40)} [${r.status}] - ${r.description}`);
  });

  console.log(`\n❌ FAILED: ${results.failed.length}`);
  results.failed.forEach(r => {
    console.log(`   ${r.method.padEnd(6)} ${r.path.padEnd(40)} [${r.status}]`);
    console.log(`      ↳ ${r.message}`);
    console.log(`      ↳ ${r.description}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.passed.length + results.failed.length} tests`);
  console.log(`Success Rate: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);
