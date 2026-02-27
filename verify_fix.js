const http = require('http');
const { spawn } = require('child_process');

console.log("Starting server for verification...");
const serverProcess = spawn('node', ['server.js'], { stdio: 'pipe' });

let serverOutput = '';

serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log(`SERVER: ${data}`);

    // Wait for server to be ready
    if (data.toString().includes('Serveur actif')) {
        runTests();
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error(`SERVER ERROR: ${data}`);
});

function runTests() {
    console.log("Running verification tests...");

    // Test 1: Check if index.html is served
    const req1 = http.get('http://localhost:3000/', (res) => {
        console.log(`TEST 1 (GET /): Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log("TEST 1 PASSED: index.html is accessible.");
        } else {
            console.error("TEST 1 FAILED: Could not access index.html");
            process.exit(1);
        }

        // Test 2: Check /visit endpoint
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/visit',
            method: 'POST'
        };

        const req2 = http.request(options, (res) => {
            console.log(`TEST 2 (POST /visit): Status Code: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log("TEST 2 PASSED: /visit endpoint works.");
                cleanup();
            } else {
                console.error("TEST 2 FAILED: /visit endpoint failed.");
                process.exit(1);
            }
        });

        req2.on('error', (e) => {
            console.error(`TEST 2 ERROR: ${e.message}`);
            process.exit(1);
        });

        req2.end();
    });

    req1.on('error', (e) => {
        console.error(`TEST 1 ERROR: ${e.message}`);
        process.exit(1);
    });
}

function cleanup() {
    console.log("All tests passed. Cleaning up...");
    serverProcess.kill();
    process.exit(0);
}

// Timeout to prevent hanging
setTimeout(() => {
    console.error("TIMEOUT: Tests took too long.");
    serverProcess.kill();
    process.exit(1);
}, 10000);
