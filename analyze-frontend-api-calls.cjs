const fs = require('fs');
const path = require('path');

// All the views
const views = [
  'HomeView.vue',
  'StoryView.vue',
  'AboutView.vue',
  'LoginView.vue',
  'SignupView.vue',
  'ForgotPasswordView.vue',
  'ResetPasswordView.vue',
  'EventsView.vue',
  'EventDetailView.vue',
  'ForumView.vue',
  'DiscussionDetailView.vue',
  'GroupsView.vue',
  'GroupDetailView.vue',
  'MapView.vue',
  'MessagesView.vue',
  'ProfileView.vue',
  'SettingsView.vue',
  'NewsletterView.vue',
  'AdminDashboardView.vue'
];

// Extract API calls from Vue file
function extractApiCalls(content, filename) {
  const apiCalls = [];

  // Match api.get, api.post, api.put, api.delete, api.patch
  const patterns = [
    /api\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /api\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      let endpoint = match[2];

      // Replace template literals like ${id} with :id
      endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':id');

      apiCalls.push({
        method,
        endpoint,
        file: filename
      });
    }
  });

  return apiCalls;
}

console.log('🔍 Analyzing Frontend API Calls...\n');

const allCalls = [];

views.forEach(view => {
  const filePath = path.join(__dirname, 'src', 'views', view);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${view} - File not found`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const calls = extractApiCalls(content, view);

  if (calls.length > 0) {
    allCalls.push(...calls);
  }
});

// Group by endpoint
const grouped = {};
allCalls.forEach(call => {
  const key = `${call.method} ${call.endpoint}`;
  if (!grouped[key]) {
    grouped[key] = [];
  }
  grouped[key].push(call.file);
});

// Sort by method and endpoint
const sorted = Object.keys(grouped).sort();

console.log('📋 API Endpoints Used by Frontend:\n');
console.log('=' .repeat(80));

sorted.forEach(key => {
  const files = [...new Set(grouped[key])];
  console.log(`\n${key}`);
  console.log(`  Used in: ${files.join(', ')}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\nTotal unique endpoints: ${sorted.length}`);
console.log('\n💡 Now compare these with the backend test results to find mismatches!\n');

// Also output as JSON for easier parsing
const output = {
  endpoints: sorted.map(key => {
    const [method, endpoint] = key.split(' ');
    return {
      method,
      endpoint,
      usedIn: [...new Set(grouped[key])]
    };
  })
};

fs.writeFileSync('frontend-api-calls.json', JSON.stringify(output, null, 2));
console.log('📄 Detailed report saved to: frontend-api-calls.json\n');
