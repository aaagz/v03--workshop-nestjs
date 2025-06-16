#!/usr/bin/env node

/**
 * Demo Script - Shows SWE-bench PoC functionality with mock responses
 * Use this to test the system without requiring Ollama to be running
 */

const ProblemLoader = require('./lib/problem-loader');
const Evaluator = require('./lib/evaluator');

/**
 * Mock Ollama Agent for demonstration purposes
 */
class MockOllamaAgent {
  constructor(options = {}) {
    this.model = options.model || 'qwen:2.5-8b';
    console.log(`🤖 Mock Ollama Agent initialized with model: ${this.model}`);
  }

  async testConnection() {
    console.log('✅ Mock connection successful');
    return true;
  }

  async analyzeCode(code, problem) {
    console.log('🔍 Mock analyzing code...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock intelligent responses based on problem patterns
    if (problem.includes('division by zero') || problem.includes('empty list')) {
      return `
ANALYSIS: The function has a division by zero issue when the input list is empty. When len(numbers) is 0, the division operation will raise a ZeroDivisionError.

FIXED_CODE:
\`\`\`python
def calculate_average(numbers):
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)
\`\`\`

EXPLANATION: Added a check for empty input list and raise an appropriate ValueError with a descriptive message. This prevents the ZeroDivisionError and provides clear feedback to the user.
`;
    }

    if (problem.includes('None input') || problem.includes('handle None')) {
      return `
ANALYSIS: The function crashes when None is passed as input because None doesn't have string methods like .lower() and .replace().

FIXED_CODE:
\`\`\`python
def is_palindrome(text):
    if text is None:
        return False
    cleaned = text.lower().replace(' ', '')
    return cleaned == cleaned[::-1]
\`\`\`

EXPLANATION: Added a None check at the beginning of the function. If text is None, return False immediately. This prevents AttributeError when trying to call string methods on None.
`;
    }

    if (problem.includes('index out of bounds') || problem.includes('invalid indices')) {
      return `
ANALYSIS: The function will raise an IndexError when the index is out of bounds (negative or >= list length).

FIXED_CODE:
\`\`\`python
def get_element(lst, index):
    try:
        return lst[index]
    except IndexError:
        return None
\`\`\`

EXPLANATION: Wrapped the list access in a try-except block to catch IndexError exceptions and return None for invalid indices instead of crashing.
`;
    }

    if (problem.includes('negative numbers') || problem.includes('non-integer')) {
      return `
ANALYSIS: The function doesn't handle negative numbers (which don't have factorials) or non-integer inputs, leading to infinite recursion or type errors.

FIXED_CODE:
\`\`\`python
def calculate_factorial(n):
    if not isinstance(n, int) or n < 0:
        return None
    if n == 0:
        return 1
    return n * calculate_factorial(n - 1)
\`\`\`

EXPLANATION: Added validation to check if input is a non-negative integer. Return None for invalid inputs (negative numbers or non-integers).
`;
    }

    if (problem.includes('missing keys') || problem.includes('nested dictionaries')) {
      return `
ANALYSIS: The function will raise KeyError when accessing nested dictionary keys that don't exist.

FIXED_CODE:
\`\`\`python
def safe_get_nested(data, keys, default=None):
    result = data
    try:
        for key in keys:
            result = result[key]
        return result
    except (KeyError, TypeError):
        return default
\`\`\`

EXPLANATION: Wrapped the nested key access in a try-except block to catch KeyError and TypeError exceptions and return the default value when keys are missing.
`;
    }

    // Default response for unknown problems
    return `
ANALYSIS: This appears to be a general code issue that needs to be addressed.

FIXED_CODE:
\`\`\`python
${code.replace(/def (\w+)/, 'def $1_fixed')}
\`\`\`

EXPLANATION: Applied a generic fix to the function. This is a mock response for demonstration purposes.
`;
  }

  async generatePatch(originalCode, fixedCode, filename = 'file.py') {
    console.log('🔧 Mock generating patch...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a basic unified diff-style patch
    const originalLines = originalCode.split('\n');
    const fixedLines = fixedCode.split('\n');
    
    let patch = `--- a/${filename}\n+++ b/${filename}\n`;
    
    // Simple line-by-line comparison
    let lineNum = 1;
    for (let i = 0; i < Math.max(originalLines.length, fixedLines.length); i++) {
      const origLine = originalLines[i] || '';
      const fixedLine = fixedLines[i] || '';
      
      if (origLine !== fixedLine) {
        patch += `@@ -${lineNum},${originalLines.length - i} +${lineNum},${fixedLines.length - i} @@\n`;
        
        if (origLine && !fixedLine) {
          patch += `-${origLine}\n`;
        } else if (!origLine && fixedLine) {
          patch += `+${fixedLine}\n`;
        } else {
          patch += `-${origLine}\n`;
          patch += `+${fixedLine}\n`;
        }
        break;
      }
      lineNum++;
    }
    
    return patch;
  }
}

async function runDemo() {
  console.log('🎯 SWE-bench PoC Demo - Mock Evaluation\n');

  try {
    // Initialize components with mock agent
    const mockAgent = new MockOllamaAgent();
    const loader = new ProblemLoader();
    const evaluator = new Evaluator(mockAgent);

    // Load sample problems
    console.log('📂 Loading sample problems...');
    const problems = await loader.loadBatch('samples/basic-problems.json');
    console.log(`✅ Loaded ${problems.length} problems\n`);

    // Show problem statistics
    const stats = loader.getStatistics(problems);
    console.log('📊 Problem Statistics:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  By difficulty: ${JSON.stringify(stats.by_difficulty)}`);
    console.log(`  With tests: ${stats.with_tests}\n`);

    // Evaluate first 3 problems for demo
    console.log('🚀 Running evaluation on first 3 problems...\n');
    const demoProblems = problems.slice(0, 3);
    
    for (let i = 0; i < demoProblems.length; i++) {
      const problem = demoProblems[i];
      console.log(`\n🔄 Evaluating problem ${i + 1}/${demoProblems.length}: ${problem.id}`);
      
      const result = await evaluator.evaluateProblem(problem);
      
      console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`   Time: ${result.execution_time}ms`);
      
      if (result.success) {
        console.log(`   Tests passed: ${result.test_results.filter(t => t.passed).length}/${result.test_results.length}`);
      }
    }

    // Generate and save report
    console.log('\n📄 Generating evaluation report...');
    await evaluator.saveReport('results/demo-evaluation.json');

    // Print final summary
    const report = evaluator.generateReport();
    console.log('\n📈 Demo Results Summary:');
    console.log(`  Success rate: ${report.summary.success_rate}`);
    console.log(`  Average time: ${report.summary.average_time_ms}ms`);
    console.log(`  Report saved to: results/demo-evaluation.json`);

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n💡 To run with real Ollama:');
    console.log('   1. Start Ollama: ollama serve');
    console.log('   2. Pull model: ollama pull qwen:2.5-8b'); 
    console.log('   3. Run: node main.js batch samples/basic-problems.json --limit 3');

  } catch (error) {
    console.error('❌ Demo error:', error.message);
    process.exit(1);
  }
}

// Run demo if called directly
if (require.main === module) {
  runDemo();
}

module.exports = { MockOllamaAgent, runDemo };