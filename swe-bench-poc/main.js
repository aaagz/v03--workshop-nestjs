#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const OllamaAgent = require('./lib/ollama-agent');
const ProblemLoader = require('./lib/problem-loader');
const Evaluator = require('./lib/evaluator');

/**
 * SWE-bench PoC Main Entry Point
 */
class SWEBenchPoC {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('swe-bench-poc')
      .description('SWE-bench Proof of Concept using Ollama API')
      .version('1.0.0');

    // Evaluate single problem
    this.program
      .command('evaluate')
      .description('Evaluate a single problem')
      .argument('<problem-file>', 'Path to problem JSON file')
      .option('-m, --model <model>', 'Ollama model to use', 'qwen:2.5-8b')
      .option('-o, --output <file>', 'Output report file', 'results/single-evaluation.json')
      .option('--timeout <ms>', 'Request timeout in milliseconds', '60000')
      .action(async (problemFile, options) => {
        await this.evaluateSingle(problemFile, options);
      });

    // Evaluate batch of problems
    this.program
      .command('batch')
      .description('Evaluate multiple problems from batch file')
      .argument('<batch-file>', 'Path to batch JSON file')
      .option('-m, --model <model>', 'Ollama model to use', 'qwen:2.5-8b')
      .option('-o, --output <file>', 'Output report file', 'results/batch-evaluation.json')
      .option('--timeout <ms>', 'Request timeout in milliseconds', '60000')
      .option('--limit <n>', 'Limit number of problems to evaluate')
      .action(async (batchFile, options) => {
        await this.evaluateBatch(batchFile, options);
      });

    // Test connection to Ollama
    this.program
      .command('test-connection')
      .description('Test connection to Ollama API')
      .option('-m, --model <model>', 'Ollama model to use', 'qwen:2.5-8b')
      .action(async (options) => {
        await this.testConnection(options);
      });

    // Create sample problems
    this.program
      .command('create-samples')
      .description('Create sample problem files')
      .option('-o, --output <dir>', 'Output directory', 'samples')
      .action(async (options) => {
        await this.createSamples(options);
      });
  }

  async evaluateSingle(problemFile, options) {
    try {
      console.log(chalk.blue('🚀 SWE-bench PoC - Single Problem Evaluation'));
      console.log(chalk.gray(`Problem file: ${problemFile}`));
      console.log(chalk.gray(`Model: ${options.model}`));

      // Initialize components
      const agent = new OllamaAgent({
        model: options.model,
        timeout: parseInt(options.timeout)
      });

      const loader = new ProblemLoader();
      const evaluator = new Evaluator(agent);

      // Test connection first
      console.log(chalk.yellow('🔗 Testing Ollama connection...'));
      const connected = await agent.testConnection();
      if (!connected) {
        throw new Error('Cannot connect to Ollama. Make sure it\'s running and the model is available.');
      }
      console.log(chalk.green('✅ Connected to Ollama'));

      // Load and evaluate problem
      const problem = await loader.loadProblem(problemFile);
      const result = await evaluator.evaluateProblem(problem);

      // Save report
      await this.ensureDirectory(path.dirname(options.output));
      await evaluator.saveReport(options.output, [result]);

      // Print summary
      this.printSummary([result]);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async evaluateBatch(batchFile, options) {
    try {
      console.log(chalk.blue('🚀 SWE-bench PoC - Batch Evaluation'));
      console.log(chalk.gray(`Batch file: ${batchFile}`));
      console.log(chalk.gray(`Model: ${options.model}`));

      // Initialize components
      const agent = new OllamaAgent({
        model: options.model,
        timeout: parseInt(options.timeout)
      });

      const loader = new ProblemLoader();
      const evaluator = new Evaluator(agent);

      // Test connection first
      console.log(chalk.yellow('🔗 Testing Ollama connection...'));
      const connected = await agent.testConnection();
      if (!connected) {
        throw new Error('Cannot connect to Ollama. Make sure it\'s running and the model is available.');
      }
      console.log(chalk.green('✅ Connected to Ollama'));

      // Load problems
      let problems = await loader.loadBatch(batchFile);
      
      // Apply limit if specified
      if (options.limit) {
        const limit = parseInt(options.limit);
        problems = problems.slice(0, limit);
        console.log(chalk.yellow(`⚠️  Limited to first ${limit} problems`));
      }

      // Show statistics
      const stats = loader.getStatistics(problems);
      console.log(chalk.cyan('\n📊 Problem Statistics:'));
      console.log(`  Total problems: ${stats.total}`);
      console.log(`  By difficulty: ${JSON.stringify(stats.by_difficulty)}`);
      console.log(`  With test cases: ${stats.with_tests}`);

      // Evaluate batch
      const results = await evaluator.evaluateBatch(problems);

      // Save report
      await this.ensureDirectory(path.dirname(options.output));
      await evaluator.saveReport(options.output, results);

      // Print summary
      this.printSummary(results);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async testConnection(options) {
    try {
      console.log(chalk.blue('🔗 Testing Ollama Connection'));
      console.log(chalk.gray(`Model: ${options.model}`));

      const agent = new OllamaAgent({ model: options.model });
      
      console.log(chalk.yellow('⏳ Connecting...'));
      const connected = await agent.testConnection();
      
      if (connected) {
        console.log(chalk.green('✅ Connection successful!'));
        
        // Test a simple generation
        console.log(chalk.yellow('⏳ Testing code generation...'));
        const testResponse = await agent.generate('Write a simple Python function that adds two numbers.');
        console.log(chalk.cyan('📝 Sample response:'));
        console.log(testResponse.substring(0, 200) + '...');
        
      } else {
        console.log(chalk.red('❌ Connection failed'));
        console.log(chalk.yellow('💡 Make sure:'));
        console.log('  1. Ollama is running (ollama serve)');
        console.log(`  2. Model ${options.model} is available (ollama pull ${options.model})`);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async createSamples(options) {
    try {
      console.log(chalk.blue('📝 Creating Sample Problems'));
      
      await this.ensureDirectory(options.output);
      
      const loader = new ProblemLoader();
      
      // Create individual problem files
      const problems = [
        loader.createProblem(
          'simple-div-zero',
          'Fix division by zero in calculate function',
          'def calculate(a, b):\n    return a / b',
          { 
            filename: 'calc.py',
            test_cases: ['assert calculate(10, 2) == 5.0'],
            difficulty: 'easy'
          }
        ),
        loader.createProblem(
          'null-pointer',
          'Handle None input in string function',
          'def process_string(s):\n    return s.upper()',
          {
            filename: 'string_proc.py', 
            test_cases: ['assert process_string("hello") == "HELLO"'],
            difficulty: 'easy'
          }
        )
      ];

      // Save individual files
      for (const problem of problems) {
        const filename = path.join(options.output, `${problem.id}.json`);
        await loader.saveProblem(problem, filename);
        console.log(chalk.green(`✅ Created: ${filename}`));
      }

      // Save batch file
      const batchFile = path.join(options.output, 'all-samples.json');
      await loader.saveBatch(problems, batchFile);
      console.log(chalk.green(`✅ Created batch: ${batchFile}`));

      console.log(chalk.cyan(`\n📁 Sample files created in: ${options.output}`));

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  printSummary(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0;

    console.log(chalk.cyan('\n📈 Evaluation Summary:'));
    console.log(`  Total problems: ${total}`);
    console.log(`  Successful: ${chalk.green(successful)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
    console.log(`  Success rate: ${chalk.blue(successRate + '%')}`);

    if (failed > 0) {
      console.log(chalk.yellow('\n⚠️  Failed problems:'));
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.problem_id}: ${r.error || 'Unknown error'}`);
      });
    }
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  run() {
    this.program.parse();
  }
}

// Run if called directly
if (require.main === module) {
  const app = new SWEBenchPoC();
  app.run();
}

module.exports = SWEBenchPoC;