import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testValidation() {
    console.log('Testing Validation...');
    try {
        await axios.post(`${API_URL}/auth/signup`, {
            email: 'invalid-email',
            password: '123'
        });
        console.error('Validation Test Failed: Should have returned 400');
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            console.log('Validation Test Passed: Got 400 as expected');
            console.log('Errors:', error.response.data.errors);
        } else {
            console.error('Validation Test Failed:', error.message);
        }
    }
}

async function testRateLimit() {
    console.log('\nTesting Rate Limiting (Login)...');
    try {
        for (let i = 0; i < 6; i++) {
            try {
                await axios.post(`${API_URL}/auth/login`, {
                    email: 'test@example.com',
                    password: 'Password123!'
                });
                console.log(`Request ${i + 1}: Success`);
            } catch (error: any) {
                if (error.response && error.response.status === 429) {
                    console.log(`Request ${i + 1}: Rate Limited (Expected)`);
                    return;
                }
                console.log(`Request ${i + 1}: Failed with ${error.response ? error.response.status : error.message}`);
            }
        }
        console.error('Rate Limit Test Failed: Should have been rate limited');
    } catch (error) {
        console.error('Rate Limit Test Error:', error);
    }
}

async function runTests() {
    // Ensure server is running before running this script
    await testValidation();
    await testRateLimit();
}

runTests();
