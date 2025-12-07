
const http = require('http');

function post(path, data, token) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function put(path, data, token) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: 'GET',
            headers: {}
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        const email = `testbio_${Date.now()}@example.com`;
        console.log(`Creating user ${email}...`);
        const signup = await post('/auth/signup', {
            email,
            password: 'password123',
            name: 'Bio Tester'
        });

        if (signup.status !== 201 && signup.status !== 200) {
            console.error('Signup failed:', signup);
            return;
        }

        const token = signup.body.token;
        console.log('User created, token obtained.');

        console.log('Updating bio...');
        const update = await put('/users/me', { bio: 'This is my new bio' }, token);

        if (update.status !== 200) {
            console.error('Update failed:', update);
            // If update failed, check if bio is present in user object in response?
        } else {
            console.log('Update response:', update.body);
        }

        console.log('Fetching profile...');
        const profile = await get('/users/me', token);
        console.log('Profile:', profile.body.user);

        if (profile.body.user.bio === 'This is my new bio') {
            console.log('SUCCESS: Bio updated and retrieved correctly.');
        } else {
            console.error('FAILURE: Bio mismatch.');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
