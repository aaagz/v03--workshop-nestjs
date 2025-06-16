const fs = require('fs').promises;
const path = require('path');

/**
 * ProblemLoader - Loads and validates SWE-bench style problems
 */
class ProblemLoader {
  constructor() {
    this.problems = [];
  }

  /**
   * Load a single problem from JSON file
   * @param {string} filePath - Path to the problem JSON file
   * @returns {Promise<Object>} - Loaded problem object
   */
  async loadProblem(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const problem = JSON.parse(content);
      
      this.validateProblem(problem);
      return problem;
    } catch (error) {
      throw new Error(`Failed to load problem from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Load multiple problems from a batch file
   * @param {string} filePath - Path to the batch JSON file
   * @returns {Promise<Array>} - Array of problem objects
   */
  async loadBatch(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const batch = JSON.parse(content);
      
      if (!batch.tasks || !Array.isArray(batch.tasks)) {
        throw new Error('Batch file must contain a "tasks" array');
      }

      const problems = [];
      for (const problem of batch.tasks) {
        this.validateProblem(problem);
        problems.push(problem);
      }

      return problems;
    } catch (error) {
      throw new Error(`Failed to load batch from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate problem structure
   * @param {Object} problem - Problem object to validate
   * @throws {Error} - If validation fails
   */
  validateProblem(problem) {
    const requiredFields = ['id', 'problem_statement', 'base_code'];
    
    for (const field of requiredFields) {
      if (!problem[field]) {
        throw new Error(`Problem missing required field: ${field}`);
      }
    }

    if (typeof problem.id !== 'string') {
      throw new Error('Problem ID must be a string');
    }

    if (typeof problem.problem_statement !== 'string') {
      throw new Error('Problem statement must be a string');
    }

    if (typeof problem.base_code !== 'string') {
      throw new Error('Base code must be a string');
    }

    // Optional fields validation
    if (problem.test_cases && !Array.isArray(problem.test_cases)) {
      throw new Error('Test cases must be an array');
    }

    if (problem.expected_patch && typeof problem.expected_patch !== 'string') {
      throw new Error('Expected patch must be a string');
    }
  }

  /**
   * Create a problem template
   * @param {string} id - Problem ID
   * @param {string} statement - Problem description
   * @param {string} code - Base code
   * @param {Object} options - Additional options
   * @returns {Object} - Problem template
   */
  createProblem(id, statement, code, options = {}) {
    return {
      id,
      repo: options.repo || 'example/repo',
      problem_statement: statement,
      base_code: code,
      filename: options.filename || 'main.py',
      test_cases: options.test_cases || [],
      expected_patch: options.expected_patch || null,
      difficulty: options.difficulty || 'medium',
      tags: options.tags || [],
      created_at: new Date().toISOString()
    };
  }

  /**
   * Save a problem to JSON file
   * @param {Object} problem - Problem object
   * @param {string} filePath - Output file path
   */
  async saveProblem(problem, filePath) {
    try {
      this.validateProblem(problem);
      const content = JSON.stringify(problem, null, 2);
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save problem to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Save multiple problems as a batch
   * @param {Array} problems - Array of problem objects
   * @param {string} filePath - Output file path
   */
  async saveBatch(problems, filePath) {
    try {
      for (const problem of problems) {
        this.validateProblem(problem);
      }

      const batch = {
        metadata: {
          count: problems.length,
          created_at: new Date().toISOString(),
          version: '1.0.0'
        },
        tasks: problems
      };

      const content = JSON.stringify(batch, null, 2);
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save batch to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get problem statistics
   * @param {Array} problems - Array of problems
   * @returns {Object} - Statistics object
   */
  getStatistics(problems) {
    const stats = {
      total: problems.length,
      by_difficulty: {},
      by_repo: {},
      with_tests: 0,
      with_patches: 0
    };

    for (const problem of problems) {
      // Count by difficulty
      const difficulty = problem.difficulty || 'unknown';
      stats.by_difficulty[difficulty] = (stats.by_difficulty[difficulty] || 0) + 1;

      // Count by repo
      const repo = problem.repo || 'unknown';
      stats.by_repo[repo] = (stats.by_repo[repo] || 0) + 1;

      // Count problems with test cases
      if (problem.test_cases && problem.test_cases.length > 0) {
        stats.with_tests++;
      }

      // Count problems with expected patches
      if (problem.expected_patch) {
        stats.with_patches++;
      }
    }

    return stats;
  }
}

module.exports = ProblemLoader;