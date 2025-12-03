const API_BASE = 'http://localhost:4000/api';

console.log('🔍 Verifying Database Persistence...\n');

async function verifyPersistence() {
  const results = { passed: [], failed: [] };

  // Step 1: Create a user
  console.log('1️⃣  Creating test user...');
  const signupData = {
    name: 'DB Test User',
    email: `dbtest${Date.now()}@test.com`,
    password: 'Test1234!'
  };

  const signupRes = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData)
  });

  if (!signupRes.ok) {
    console.error('❌ Failed to create user');
    return;
  }

  const { token, user } = await signupRes.json();
  console.log(`✅ User created with ID: ${user.id}`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Step 2: Create an event
  console.log('\n2️⃣  Creating event...');
  const eventData = {
    title: 'DB Test Event',
    description: 'Testing database persistence',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Test Location'
  };

  const createEventRes = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(eventData)
  });

  const { event } = await createEventRes.json();
  console.log(`✅ Event created with ID: ${event.id}`);

  // Step 3: Verify event was saved (read it back)
  console.log('\n3️⃣  Reading event back from DB...');
  const getEventRes = await fetch(`${API_BASE}/events/${event.id}`, { headers });
  const { event: savedEvent } = await getEventRes.json();

  if (savedEvent.title === eventData.title && savedEvent.id === event.id) {
    console.log('✅ Event persisted correctly in database');
    results.passed.push('Event persistence');
  } else {
    console.log('❌ Event data mismatch');
    results.failed.push('Event persistence');
  }

  // Step 4: Update the event
  console.log('\n4️⃣  Updating event...');
  const updateData = { title: 'Updated DB Test Event' };
  await fetch(`${API_BASE}/events/${event.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData)
  });

  // Step 5: Verify update persisted
  console.log('\n5️⃣  Verifying update persisted...');
  const getUpdatedRes = await fetch(`${API_BASE}/events/${event.id}`, { headers });
  const { event: updatedEvent } = await getUpdatedRes.json();

  if (updatedEvent.title === 'Updated DB Test Event') {
    console.log('✅ Event update persisted correctly');
    results.passed.push('Event update');
  } else {
    console.log('❌ Event update did not persist');
    results.failed.push('Event update');
  }

  // Step 6: Create a discussion
  console.log('\n6️⃣  Creating discussion...');
  const discussionData = {
    title: 'DB Test Discussion',
    content: 'Testing forum persistence',
    category: 'general'
  };

  const createDiscRes = await fetch(`${API_BASE}/forum/discussions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(discussionData)
  });

  const { discussion } = await createDiscRes.json();
  console.log(`✅ Discussion created with ID: ${discussion.id}`);

  // Step 7: Add a reply
  console.log('\n7️⃣  Adding reply to discussion...');
  const replyData = { content: 'Test reply content' };

  const createReplyRes = await fetch(`${API_BASE}/forum/discussions/${discussion.id}/replies`, {
    method: 'POST',
    headers,
    body: JSON.stringify(replyData)
  });

  const { reply } = await createReplyRes.json();
  console.log(`✅ Reply created with ID: ${reply.id}`);

  // Step 8: Verify discussion with replies
  console.log('\n8️⃣  Reading discussion with replies...');
  const getDiscRes = await fetch(`${API_BASE}/forum/discussions/${discussion.id}`, { headers });
  const { discussion: savedDisc } = await getDiscRes.json();

  if (savedDisc.replies && savedDisc.replies.length > 0) {
    console.log('✅ Discussion and replies persisted correctly');
    results.passed.push('Discussion persistence');
  } else {
    console.log('❌ Replies not found');
    results.failed.push('Discussion persistence');
  }

  // Step 9: Create a group
  console.log('\n9️⃣  Creating group...');
  const groupData = {
    name: 'DB Test Group',
    description: 'Testing group persistence',
    category: 'community'
  };

  const createGroupRes = await fetch(`${API_BASE}/groups`, {
    method: 'POST',
    headers,
    body: JSON.stringify(groupData)
  });

  const { group } = await createGroupRes.json();
  console.log(`✅ Group created with ID: ${group.id}`);

  // Step 10: Join the group
  console.log('\n🔟 Joining group...');
  await fetch(`${API_BASE}/groups/${group.id}/join`, {
    method: 'POST',
    headers
  });

  // Step 11: Verify membership
  console.log('\n1️⃣1️⃣  Verifying group membership...');
  const getGroupRes = await fetch(`${API_BASE}/groups/${group.id}`, { headers });
  const { group: savedGroup } = await getGroupRes.json();

  if (savedGroup.members && savedGroup.members.some(m => m.userId === user.id)) {
    console.log('✅ Group membership persisted correctly');
    results.passed.push('Group membership');
  } else {
    console.log('❌ Group membership not found');
    results.failed.push('Group membership');
  }

  // Step 12: Delete the event
  console.log('\n1️⃣2️⃣  Deleting event...');
  await fetch(`${API_BASE}/events/${event.id}`, {
    method: 'DELETE',
    headers
  });

  // Step 13: Verify deletion
  console.log('\n1️⃣3️⃣  Verifying event deletion...');
  const getDeletedRes = await fetch(`${API_BASE}/events/${event.id}`, { headers });

  if (getDeletedRes.status === 404) {
    console.log('✅ Event deletion persisted correctly');
    results.passed.push('Event deletion');
  } else {
    console.log('❌ Event still exists after deletion');
    results.failed.push('Event deletion');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATABASE PERSISTENCE VERIFICATION');
  console.log('='.repeat(60));
  console.log(`\n✅ PASSED: ${results.passed.length}`);
  results.passed.forEach(test => console.log(`   ✓ ${test}`));

  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED: ${results.failed.length}`);
    results.failed.forEach(test => console.log(`   ✗ ${test}`));
  }

  console.log('\n' + '='.repeat(60));
  const successRate = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1);
  console.log(`Database Persistence: ${successRate}%`);
  console.log('='.repeat(60) + '\n');
}

verifyPersistence().catch(console.error);
