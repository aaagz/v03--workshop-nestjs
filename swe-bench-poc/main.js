#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const AgentFactory = require('./lib/agent-factory');
const ProblemLoader = require('./lib/problem-loader');
const Evaluator = require('./lib/evaluator');

/**
 * SWE-bench PoC Main Entry Point with Multi-Provider Support
 */
class SWEBenchPoC {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('swe-bench-poc')
      .description('SWE-bench Proof of Concept with Multi-Provider LLM Support')
      .version('2.0.0');

    // List providers command
    this.program
      .command('list-providers')
      .description('List all supported LLM providers and their models')
      .action(() => {
        this.listProviders();
      });

    // Evaluate single problem
    this.program
      .command('evaluate')
      .description('Evaluate a single problem')
      .argument('<problem-file>', 'Path to problem JSON file')
      .option('-p, --provider <provider>', 'LLM provider (ollama, openai, gemini, claude)', 'ollama')
      .option('-m, --model <model>', 'Model to use (auto-detected from provider if not specified)')
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
      .option('-p, --provider <provider>', 'LLM provider (ollama, openai, gemini, claude)', 'ollama')
      .option('-m, --model <model>', 'Model to use (auto-detected from provider if not specified)')
      .option('-o, --output <file>', 'Output report file', 'results/batch-evaluation.json')
      .option('--timeout <ms>', 'Request timeout in milliseconds', '60000')
      .option('--limit <n>', 'Limit number of problems to evaluate')
      .action(async (batchFile, options) => {
        await this.evaluateBatch(batchFile, options);
      });

    // Test connection to any provider
    this.program
      .command('test-connection')
      .description('Test connection to LLM provider')
      .option('-p, --provider <provider>', 'LLM provider (ollama, openai, gemini, claude)', 'ollama')
      .option('-m, --model <model>', 'Model to use (auto-detected from provider if not specified)')
      .action(async (options) => {
        await this.testConnection(options);
      });

    // Compare providers
    this.program
      .command('compare')
      .description('Compare multiple providers on the same problem set')
      .argument('<batch-file>', 'Path to batch JSON file')
      .option('-p, --providers <providers>', 'Comma-separated list of providers to compare', 'ollama,openai')
      .option('--limit <n>', 'Limit number of problems to evaluate', '3')
      .option('-o, --output <file>', 'Output comparison report', 'results/provider-comparison.json')
      .action(async (batchFile, options) => {
        await this.compareProviders(batchFile, options);
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

  listProviders() {
    console.log(chalk.blue('🤖 Supported LLM Providers\n'));

    const providers = AgentFactory.getSupportedProviders();
    const defaultModels = AgentFactory.getDefaultModels();
    const availableModels = AgentFactory.getAvailableModels();

    for (const provider of providers) {
      const info = AgentFactory.getProviderInfo(provider);
      const envCheck = AgentFactory.validateEnvironment(provider);

      console.log(chalk.cyan(`📡 ${info.name} (${provider})`));
      console.log(`   ${info.description}`);
      console.log(`   Website: ${info.website}`);
      console.log(`   Setup: ${info.setup}`);
      console.log(`   Default model: ${defaultModels[provider]}`);
      console.log(`   Environment: ${envCheck.valid ? chalk.green('✅ Ready') : chalk.red('❌ ' + envCheck.error)}`);
      console.log(`   Available models:`);
      availableModels[provider].forEach(model => {
        const isDefault = model === defaultModels[provider];
        console.log(`     ${isDefault ? '→' : ' '} ${model}${isDefault ? ' (default)' : ''}`);
      });
      console.log();
    }

    console.log(chalk.yellow('💡 Usage Examples:'));
    console.log('   node main.js test-connection --provider openai');
    console.log('   node main.js evaluate problem.json --provider gemini --model gemini-1.5-pro');
    console.log('   node main.js batch problems.json --provider claude --limit 5');
    console.log('   node main.js compare problems.json --providers "ollama,openai,claude"');
  }

  async evaluateSingle(problemFile, options) {
    try {
      console.log(chalk.blue('🚀 SWE-bench PoC - Single Problem Evaluation'));
      console.log(chalk.gray(`Problem file: ${problemFile}`));
      console.log(chalk.gray(`Provider: ${options.provider}`));
      console.log(chalk.gray(`Model: ${options.model || 'auto-detect'}`));

      // Create agent using factory
      const agent = AgentFactory.createValidatedAgent(options.provider, {
        model: options.model,
        timeout: parseInt(options.timeout)
      });

      const loader = new ProblemLoader();
      const evaluator = new Evaluator(agent);

      // Test connection first
      console.log(chalk.yellow('🔗 Testing connection...'));
      const connected = await agent.testConnection();
      if (!connected) {
        throw new Error(`Cannot connect to ${options.provider}. Check your configuration.`);
      }
      console.log(chalk.green(`✅ Connected to ${options.provider}`));

      // Load and evaluate problem
      const problem = await loader.loadProblem(problemFile);
      const result = await evaluator.evaluateProblem(problem);

      // Save report
      await this.ensureDirectory(path.dirname(options.output));
      await evaluator.saveReport(options.output, [result]);

      // Print summary
      this.printSummary([result], options.provider);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async evaluateBatch(batchFile, options) {
    try {
      console.log(chalk.blue('🚀 SWE-bench PoC - Batch Evaluation'));
      console.log(chalk.gray(`Batch file: ${batchFile}`));
      console.log(chalk.gray(`Provider: ${options.provider}`));
      console.log(chalk.gray(`Model: ${options.model || 'auto-detect'}`));

      // Create agent using factory
      const agent = AgentFactory.createValidatedAgent(options.provider, {
        model: options.model,
        timeout: parseInt(options.timeout)
      });

      const loader = new ProblemLoader();
      const evaluator = new Evaluator(agent);

      // Test connection first
      console.log(chalk.yellow('🔗 Testing connection...'));
      const connected = await agent.testConnection();
      if (!connected) {
        throw new Error(`Cannot connect to ${options.provider}. Check your configuration.`);
      }
      console.log(chalk.green(`✅ Connected to ${options.provider}`));

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
      this.printSummary(results, options.provider);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  async testConnection(options) {
    try {
      console.log(chalk.blue(`🔗 Testing ${options.provider.toUpperCase()} Connection`));
      console.log(chalk.gray(`Model: ${options.model || 'default'}`));

      const agent = AgentFactory.createValidatedAgent(options.provider, {
        model: options.model
      });
      
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
        const info = AgentFactory.getProviderInfo(options.provider);
        console.log(chalk.yellow('💡 Setup instructions:'));
        console.log(`  ${info.setup}`);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      
      if (error.message.includes('Missing environment variables')) {
        const info = AgentFactory.getProviderInfo(options.provider);
        console.log(chalk.yellow('\n💡 Setup instructions:'));
        console.log(`  ${info.setup}`);
        console.log(`  Visit: ${info.website}`);
      }
      
      process.exit(1);
    }
  }

  async compareProviders(batchFile, options) {
    try {
      console.log(chalk.blue('🏁 Provider Comparison'));
      
      const providers = options.providers.split(',').map(p => p.trim());
      const limit = parseInt(options.limit);
      
      console.log(chalk.cyan(`Comparing providers: ${providers.join(', ')}`));
      console.log(chalk.cyan(`Problem limit: ${limit}`));

      const loader = new ProblemLoader();
      let problems = await loader.loadBatch(batchFile);
      problems = problems.slice(0, limit);

      const comparisonResults = {
        metadata: {
          providers,
          total_problems: problems.length,
          timestamp: new Date().toISOString()
        },
        provider_results: {},
        comparison_summary: {}
      };

      // Evaluate each provider
      for (const provider of providers) {
        console.log(chalk.blue(`\n🔄 Evaluating with ${provider}...`));
        
        try {
          const agent = AgentFactory.createValidatedAgent(provider);
          const evaluator = new Evaluator(agent);
          
          const connected = await agent.testConnection();
          if (!connected) {
            throw new Error(`Cannot connect to ${provider}`);
          }

          const results = await evaluator.evaluateBatch(problems);
          const report = evaluator.generateReport(results);
          
          comparisonResults.provider_results[provider] = report;
          
          console.log(chalk.green(`✅ ${provider}: ${report.summary.success_rate} success rate`));
          
        } catch (error) {
          console.log(chalk.red(`❌ ${provider}: ${error.message}`));
          comparisonResults.provider_results[provider] = {
            error: error.message,
            summary: { success_rate: '0%' }
          };
        }
      }

      // Generate comparison summary
      comparisonResults.comparison_summary = this.generateComparisonSummary(comparisonResults.provider_results);

      // Save report
      await this.ensureDirectory(path.dirname(options.output));
      const content = JSON.stringify(comparisonResults, null, 2);
      await fs.writeFile(options.output, content, 'utf8');

      // Print comparison results
      this.printComparisonSummary(comparisonResults);

    } catch (error) {
      console.error(chalk.red('❌ Comparison error:'), error.message);
      process.exit(1);
    }
  }

  generateComparisonSummary(providerResults) {
    const summary = {
      best_performer: null,
      performance_ranking: [],
      average_success_rate: 0
    };

    const validResults = Object.entries(providerResults)
      .filter(([_, result]) => !result.error)
      .map(([provider, result]) => ({
        provider,
        success_rate: parseFloat(result.summary.success_rate.replace('%', ''))
      }))
      .sort((a, b) => b.success_rate - a.success_rate);

    if (validResults.length > 0) {
      summary.best_performer = validResults[0].provider;
      summary.performance_ranking = validResults.map(r => ({
        provider: r.provider,
        success_rate: r.success_rate + '%'
      }));
      summary.average_success_rate = (validResults.reduce((sum, r) => sum + r.success_rate, 0) / validResults.length).toFixed(1) + '%';
    }

    return summary;
  }

  printComparisonSummary(comparisonResults) {
    console.log(chalk.cyan('\n🏆 Comparison Results:'));
    
    const summary = comparisonResults.comparison_summary;
    if (summary.best_performer) {
      console.log(`  Best performer: ${chalk.green(summary.best_performer)}`);
      console.log(`  Average success rate: ${summary.average_success_rate}`);
      
      console.log('\n📊 Rankings:');
      summary.performance_ranking.forEach((result, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        console.log(`  ${medal} ${result.provider}: ${result.success_rate}`);
      });
    }
    
    console.log(chalk.cyan(`\n📄 Detailed report saved to: ${options.output || 'results/provider-comparison.json'}`));
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

  printSummary(results, provider) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0;

    console.log(chalk.cyan('\n📈 Evaluation Summary:'));
    console.log(`  Provider: ${chalk.blue(provider)}`);
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