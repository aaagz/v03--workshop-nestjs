const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Evaluator - Processes problems and evaluates solutions
 */
class Evaluator {
  constructor(ollamaAgent) {
    this.agent = ollamaAgent;
    this.results = [];
  }

  /**
   * Evaluate a single problem
   * @param {Object} problem - Problem object
   * @returns {Promise<Object>} - Evaluation result
   */
  async evaluateProblem(problem) {
    const startTime = Date.now();
    const result = {
      problem_id: problem.id,
      success: false,
      error: null,
      analysis: null,
      generated_fix: null,
      patch: null,
      test_results: [],
      execution_time: 0,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`\n🔍 Evaluating problem: ${problem.id}`);
      console.log(`📝 Problem: ${problem.problem_statement}`);

      // Step 1: Analyze the code and generate fix
      console.log('⚡ Analyzing code...');
      const analysis = await this.agent.analyzeCode(
        problem.base_code,
        problem.problem_statement
      );
      result.analysis = analysis;

      // Step 2: Extract the fixed code from analysis
      const fixedCode = this.extractFixedCode(analysis);
      if (!fixedCode) {
        throw new Error('Could not extract fixed code from analysis');
      }
      result.generated_fix = fixedCode;

      // Step 3: Generate patch
      console.log('🔧 Generating patch...');
      const patch = await this.agent.generatePatch(
        problem.base_code,
        fixedCode,
        problem.filename || 'main.py'
      );
      result.patch = patch;

      // Step 4: Basic syntax validation
      console.log('✅ Validating syntax...');
      const syntaxValid = await this.validateSyntax(fixedCode);
      if (!syntaxValid) {
        throw new Error('Generated code has syntax errors');
      }

      // Step 5: Run test cases if available
      if (problem.test_cases && problem.test_cases.length > 0) {
        console.log('🧪 Running test cases...');
        result.test_results = await this.runTestCases(
          problem.test_cases,
          fixedCode,
          problem
        );
      }

      // Step 6: Determine success
      result.success = this.determineSucess(result, problem);
      
      if (result.success) {
        console.log('✅ Problem solved successfully!');
      } else {
        console.log('❌ Problem solution failed');
      }

    } catch (error) {
      console.error(`❌ Error evaluating problem ${problem.id}:`, error.message);
      result.error = error.message;
      result.success = false;
    }

    result.execution_time = Date.now() - startTime;
    this.results.push(result);
    return result;
  }

  /**
   * Extract fixed code from analysis response
   * @param {string} analysis - Full analysis response
   * @returns {string|null} - Extracted code or null
   */
  extractFixedCode(analysis) {
    // Look for code between FIXED_CODE markers
    const fixedCodeMatch = analysis.match(/FIXED_CODE:\s*```python\s*([\s\S]*?)\s*```/i);
    if (fixedCodeMatch) {
      return fixedCodeMatch[1].trim();
    }

    // Alternative: Look for any Python code block
    const codeBlockMatch = analysis.match(/```python\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Last resort: Look for lines that start with def, class, import, etc.
    const lines = analysis.split('\n');
    const codeLines = [];
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.trim().match(/^(def|class|import|from|if|for|while|try|with|\s+)/)) {
        inCodeBlock = true;
      }
      if (inCodeBlock) {
        codeLines.push(line);
      }
    }

    return codeLines.length > 0 ? codeLines.join('\n').trim() : null;
  }

  /**
   * Validate Python syntax
   * @param {string} code - Python code to validate
   * @returns {Promise<boolean>} - True if syntax is valid
   */
  async validateSyntax(code) {
    try {
      // Create temporary file
      const tempFile = `/tmp/validate_${Date.now()}.py`;
      await fs.writeFile(tempFile, code, 'utf8');

      // Use python to check syntax
      await execAsync(`python3 -m py_compile "${tempFile}"`);
      
      // Clean up
      await fs.unlink(tempFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Run test cases against the fixed code
   * @param {Array} testCases - Array of test case strings
   * @param {string} fixedCode - The fixed code to test
   * @param {Object} problem - Original problem object
   * @returns {Promise<Array>} - Array of test results
   */
  async runTestCases(testCases, fixedCode, problem) {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const testResult = {
        test_id: i,
        test_case: testCase,
        passed: false,
        output: null,
        error: null
      };

      try {
        // Create test file with the fixed code and test case
        const testCode = `
${fixedCode}

# Test case
${testCase}
print("TEST_PASSED")
`;

        const tempFile = `/tmp/test_${Date.now()}_${i}.py`;
        await fs.writeFile(tempFile, testCode, 'utf8');

        // Run the test
        const { stdout, stderr } = await execAsync(`python3 "${tempFile}"`);
        
        testResult.output = stdout;
        testResult.passed = stdout.includes('TEST_PASSED') && !stderr;
        
        if (stderr) {
          testResult.error = stderr;
        }

        // Clean up
        await fs.unlink(tempFile);

      } catch (error) {
        testResult.error = error.message;
        testResult.passed = false;
      }

      results.push(testResult);
    }

    return results;
  }

  /**
   * Determine if the solution is successful
   * @param {Object} result - Evaluation result object
   * @param {Object} problem - Original problem object
   * @returns {boolean} - True if successful
   */
  determineSucess(result, problem) {
    // Basic criteria for success:
    // 1. No errors during evaluation
    // 2. Generated fix is not empty
    // 3. If test cases exist, at least one must pass

    if (result.error) {
      return false;
    }

    if (!result.generated_fix || result.generated_fix.trim().length === 0) {
      return false;
    }

    if (result.test_results && result.test_results.length > 0) {
      const passedTests = result.test_results.filter(t => t.passed).length;
      return passedTests > 0;
    }

    // If no test cases, consider success if we got a fix without errors
    return true;
  }

  /**
   * Evaluate multiple problems in batch
   * @param {Array} problems - Array of problem objects
   * @returns {Promise<Array>} - Array of evaluation results
   */
  async evaluateBatch(problems) {
    console.log(`\n🚀 Starting batch evaluation of ${problems.length} problems...`);
    
    const results = [];
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      console.log(`\n📊 Progress: ${i + 1}/${problems.length}`);
      
      const result = await this.evaluateProblem(problem);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate evaluation report
   * @param {Array} results - Array of evaluation results
   * @returns {Object} - Summary report
   */
  generateReport(results = this.results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    
    const avgTime = results.length > 0 
      ? results.reduce((sum, r) => sum + r.execution_time, 0) / results.length 
      : 0;

    const errorTypes = {};
    results.filter(r => r.error).forEach(r => {
      const errorType = r.error.split(':')[0];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    return {
      summary: {
        total_problems: total,
        successful_solutions: successful,
        failed_solutions: failed,
        success_rate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
        average_time_ms: Math.round(avgTime)
      },
      error_analysis: errorTypes,
      detailed_results: results,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Save evaluation report to file
   * @param {string} filePath - Output file path
   * @param {Array} results - Results to include (defaults to this.results)
   */
  async saveReport(filePath, results = this.results) {
    const report = this.generateReport(results);
    const content = JSON.stringify(report, null, 2);
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`\n📄 Report saved to: ${filePath}`);
  }
}

module.exports = Evaluator;