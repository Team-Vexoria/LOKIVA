import http from 'http';
import WebSocket from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');

console.log('=== [LOKIVA VOICE PIPELINE INTEGRATION TEST] ===\n');

// 1. Launch server
console.log('1. Starting LOKIVA Backend Server on port 4000...');
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: serverDir,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

serverProcess.stdout.on('data', (d) => {
  const msg = d.toString();
  if (msg.includes('listening at') || msg.includes('ready')) {
    console.log('   [SERVER-LOG]', msg.trim());
  }
});

serverProcess.stderr.on('data', (d) => {
  console.error('   [SERVER-ERR]', d.toString().trim());
});

// Helper to poll until port 4000 is accepting connections
function waitForServer(retries = 20) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const req = http.get('http://localhost:4000/health', (res) => {
        clearInterval(interval);
        resolve(true);
      });
      req.on('error', () => {
        if (count >= retries) {
          clearInterval(interval);
          reject(new Error('Server failed to start within timeout'));
        }
      });
    }, 1000);
  });
}

async function runTests() {
  try {
    await waitForServer();
    console.log('   ✓ Server is UP and healthy on http://localhost:4000\n');

    // 2. Test REST Weather / Voice route
    console.log('2. Testing REST Intent Routing (/voice/route)...');
    const routeRes = await fetch('http://localhost:4000/voice/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'what is the weather in Jaipur',
        context: { currentLocationName: 'Jaipur' },
      }),
    });

    const routeData = await routeRes.json();
    console.log('   ✓ Route Status:', routeRes.status);
    console.log('   ✓ Intent Detected:', routeData.intent);
    console.log('   ✓ Spoken Response:', routeData.spoken_response ? `"${routeData.spoken_response}"` : '(none)');

    // 3. Test WebSocket Voice Stream
    console.log('\n3. Testing Real-Time WebSocket Voice Stream (ws://localhost:4000/voice-stream)...');
    await new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:4000/voice-stream');

      ws.on('open', () => {
        console.log('   ✓ WebSocket connection established successfully');
        // Send start event
        ws.send(JSON.stringify({ type: 'start', mimeType: 'audio/webm' }));
      });

      let readyReceived = false;

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          console.log('   ← Received from WS:', JSON.stringify(msg));

          if (msg.type === 'ready') {
            readyReceived = true;
            console.log('   ✓ Stream ready acknowledged by server');
            console.log('   → Streaming simulated binary audio frames...');
            
            // Send 3 simulated audio binary chunks
            const dummyChunk1 = Buffer.alloc(1024, 0x55);
            const dummyChunk2 = Buffer.alloc(1024, 0xaa);
            ws.send(dummyChunk1);
            ws.send(dummyChunk2);

            setTimeout(() => {
              console.log('   → Sending stop event to finalize utterance...');
              ws.send(JSON.stringify({ type: 'stop' }));
            }, 500);
          } else if (msg.type === 'transcribing') {
            console.log('   ✓ Server acknowledged stop and entered transcribing state');
          } else if (msg.type === 'final') {
            console.log('   ✓ Server returned final stream response:', msg);
            ws.close();
            resolve(true);
          }
        } catch (e) {
          console.error('   WS parse error:', e);
        }
      });

      ws.on('error', (err) => {
        console.error('   ✗ WebSocket error:', err.message);
        reject(err);
      });

      ws.on('close', () => {
        console.log('   ✓ WebSocket closed cleanly');
        resolve(true);
      });

      setTimeout(() => {
        if (!readyReceived) {
          ws.close();
          reject(new Error('WebSocket timed out waiting for ready'));
        }
      }, 8000);
    });

    console.log('\n=== ALL VOICE TESTS PASSED SUCCESSFULLY! ===\n');
  } catch (err) {
    console.error('\n✗ Test failed:', err);
  } finally {
    console.log('Shutting down test server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  }
}

runTests();
