import { spawn } from 'node:child_process';
import { CONFIG } from './src/config/index.ts';

const command = process.argv[2] || 'dev'; // 'dev' hoặc 'start'
const port = String(CONFIG.port);

console.log(`> Khởi chạy Next.js (${command}) trên port ${port}...`);

const child = spawn('npx', ['next', command, '-p', port], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
