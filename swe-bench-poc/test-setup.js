#!/usr/bin/env node

/**
 * Test Setup Script - Validates SWE-bench PoC installation
 */

const fs = require('fs').promises;
const path = require('path');

const OllamaAgent = require('./lib/ollama-agent');
const ProblemLoader = require('./lib/problem-loader');

async function testSetup() {
  console.log('🧪 Testing SWE-bench PoC Setup\n');

  const tests = [
    { name: 'Check Node.js version', test: testNodeVersion },
    { name: 'Check required files', test: testRequiredFiles },
    { name: 'Test problem loader', test: testProblemLoader },
    { name: 'Test Ollama connection', test: testOllamaConnection },
    { name: 'Create results directory', test: createResultsDir }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}...`);
      await test.test();
      console.log(`✅ ${test.name} - PASSED\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Setup is ready.');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure Ollama is running: ollama serve');
    console.log('   2. Pull the model: ollama pull qwen:2.5-8b');
    console.log('   3. Test connection: node main.js test-connection');
    console.log('   4. Run evaluation: node main.js batch samples/basic-problems.json --limit 2');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues above.');
    process.exit(1);
  }
}

async function testNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));
  
  if (major < 18) {
    throw new Error(`Node.js 18+ required, found ${version}`);
  }
}

async function testRequiredFiles() {
  const requiredFiles = [
    'lib/ollama-agent.js',
    'lib/problem-loader.js', 
    'lib/evaluator.js',
    'samples/basic-problems.json',
    'package.json'
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      throw new Error(`Missing required file: ${file}`);
    }
  }
}

async function testProblemLoader() {
  const loader = new ProblemLoader();
  
  // Test creating a problem
  const testProblem = loader.createProblem(
    'test-001',
    'Test problem statement',
    'def test():\n    pass'
  );

  // Test validation
  loader.validateProblem(testProblem);

  // Test loading the sample problems
  const problems = await loader.loadBatch('samples/basic-problems.json');
  
  if (problems.length === 0) {
    throw new Error('No problems loaded from sample file');
  }
}

async function testOllamaConnection() {
  const agent = new OllamaAgent();
  
  try {
    // Test with a short timeout to avoid hanging
    agent.timeout = 5000;
    const connected = await agent.testConnection();
    
    if (!connected) {
      throw new Error('Cannot connect to Ollama (this is expected if Ollama is not running)');
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      throw new Error('Ollama not running - start with: ollama serve');
    }
    throw error;
  }
}

async function createResultsDir() {
  try {
    await fs.mkdir('results', { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  testSetup().catch(console.error);
}

module.exports = { testSetup };