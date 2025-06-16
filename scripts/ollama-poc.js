#!/usr/bin/env node
/*
 * PoC: Query Ollama with the Qwen 2.5-8B model
 * --------------------------------------------
 * Prerequisites
 * 1) Install Ollama from https://ollama.ai and make sure the daemon is running (default port 11434).
 * 2) Pull the model once via CLI:   ollama pull qwen:2.5-8b
 * 3) Run:  node scripts/ollama-poc.js "Your question here"
 *
 * The script sends a non-streaming request to the local Ollama HTTP API and
 * prints the model's response to stdout.
 */
const http = require('http');

const prompt = process.argv.slice(2).join(' ') || 'อธิบายกลไกการเกิดรุ้งกินน้ำอย่างง่าย';

const postData = JSON.stringify({
  model: 'qwen:2.5-8b',
  prompt,
  stream: false
});

const options = {
  hostname: 'localhost',
  port: 11434,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, res => {
  let raw = '';
  res.setEncoding('utf8');
  res.on('data', chunk => (raw += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(raw);
      console.log('\n=== Model Response ===\n');
      console.log(json.response.trim());
    } catch (e) {
      console.error('Failed to parse response:', e);
      console.error('Raw:', raw);
    }
  });
});

req.on('error', e => {
  console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();