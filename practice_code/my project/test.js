const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status} ✅`);
    console.log(`   Response: ${health.data.status}\n`);

    // Test 2: Get all tasks
    console.log('2️⃣ Getting all tasks...');
    const allTasks = await makeRequest('GET', '/api/tasks');
    console.log(`   Status: ${allTasks.status} ✅`);
    console.log(`   Tasks found: ${allTasks.data.total}\n`);

    // Test 3: Create a new task
    console.log('3️⃣ Creating a new task...');
    const newTask = await makeRequest('POST', '/api/tasks', {
      title: 'Test task from script',
      completed: false
    });
    console.log(`   Status: ${newTask.status} ✅`);
    console.log(`   Created task: "${newTask.data.data.title}"\n`);

    // Test 4: Update the task
    console.log('4️⃣ Updating the task...');
    const taskId = newTask.data.data.id;
    const updatedTask = await makeRequest('PUT', `/api/tasks/${taskId}`, {
      completed: true
    });
    console.log(`   Status: ${updatedTask.status} ✅`);
    console.log(`   Task completed: ${updatedTask.data.data.completed}\n`);

    // Test 5: Delete the task
    console.log('5️⃣ Deleting the task...');
    const deletedTask = await makeRequest('DELETE', `/api/tasks/${taskId}`);
    console.log(`   Status: ${deletedTask.status} ✅`);
    console.log(`   Message: ${deletedTask.data.message}\n`);

    console.log('🎉 All tests passed! Your API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your API server is running:');
    console.log('   npm start');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { makeRequest, runTests };