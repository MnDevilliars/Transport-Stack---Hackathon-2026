/**
 * TransitPulse Delhi - Full Stack Orchestrator
 * Starts both Express Backend (Port 5001) and Vite React Frontend (Port 3000)
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;

console.log('===============================================================');
console.log('🚌 STARTING TRANSITPULSE DELHI - TRANSPORT STACK HACKATHON 2026');
console.log('===============================================================');

// 1. Start Express Server
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Frontend
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nShutting down TransitPulse processes...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
