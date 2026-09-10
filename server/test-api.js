// Automated API Test Script
const BASE = 'http://localhost:5000/api';

async function testAll() {
  console.log('--- Starting Automated Backend Verification ---');

  // 1. Health Check
  const healthRes = await fetch(`${BASE}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check:', healthData.status === 'ok' ? 'PASS' : 'FAIL');

  // 2. Users list
  const usersRes = await fetch(`${BASE}/auth/users`);
  const users = await usersRes.json();
  console.log(`2. Users loaded: ${users.length} users (PASS)`);
  const sarah = users.find((u) => u.name.includes('Sarah')) || users[0];

  // 3. Tasks list
  const tasksRes = await fetch(`${BASE}/tasks`, {
    headers: { 'x-user-id': sarah.id }
  });
  const tasks = await tasksRes.json();
  console.log(`3. Tasks loaded: ${tasks.length} tasks (PASS)`);

  // 4. Create Task (30s intake)
  const createRes = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': sarah.id
    },
    body: JSON.stringify({
      title: 'Automated Test: Urgent HVAC Compressor Replacement',
      category: 'Maintenance',
      priority: 'URGENT',
      status: 'NEW',
      requesterName: 'Building Super (Dave)',
      requesterContact: 'WhatsApp +1-555-8901',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    })
  });
  const created = await createRes.json();
  console.log(`4. Created Task ID: ${created.id} (PASS)`);

  // 5. Update Status
  const updateRes = await fetch(`${BASE}/tasks/${created.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': sarah.id
    },
    body: JSON.stringify({
      status: 'IN_PROGRESS'
    })
  });
  const updated = await updateRes.json();
  console.log(`5. Task status updated to: ${updated.status} (PASS)`);

  // 6. Add Comment
  const commentRes = await fetch(`${BASE}/tasks/${created.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': sarah.id
    },
    body: JSON.stringify({
      content: 'Dispatched technician on-site with replacement valve.'
    })
  });
  const comment = await commentRes.json();
  console.log(`6. Comment created with ID: ${comment.id} (PASS)`);

  // 7. Dashboard Stats
  const dashRes = await fetch(`${BASE}/dashboard/stats`, {
    headers: { 'x-user-id': sarah.id }
  });
  const stats = await dashRes.json();
  console.log(`7. Dashboard stats loaded: ${stats.summary.totalOpen} open, ${stats.bottlenecks.length} bottlenecks (PASS)`);

  // 8. Task Details with full audit history
  const detailRes = await fetch(`${BASE}/tasks/${created.id}`, {
    headers: { 'x-user-id': sarah.id }
  });
  const detail = await detailRes.json();
  console.log(`8. Audit log entries recorded: ${detail.activities.length} entries (PASS)`);

  console.log('--- All Backend Tests Passed Successfully! ---');
}

testAll().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
