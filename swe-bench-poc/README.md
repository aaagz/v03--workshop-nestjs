# SWE-bench PoC with Ollama API

A simplified proof-of-concept implementation of the SWE-bench evaluation framework using local Ollama API with Qwen 2.5-8B model.

## Overview

This project demonstrates the core concepts of SWE-bench:
- Loading real-world software engineering problems
- Using LLMs to analyze and fix code issues  
- Applying generated patches and validating solutions
- Generating comprehensive evaluation reports

## Prerequisites

### 1. Install Ollama
```bash
# Download and install from https://ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama daemon
ollama serve
```

### 2. Pull Qwen 2.5-8B Model
```bash
ollama pull qwen:2.5-8b
```

### 3. System Requirements
- Node.js 18+
- Python 3.8+ (for syntax validation and test execution)
- ~8GB RAM available for Ollama model
- Internet connection (for initial model download)

## Quick Start

### 1. Setup Project
```bash
cd swe-bench-poc
npm install
npm run setup  # Creates results directory
```

### 2. Test Connection
```bash
node main.js test-connection
```

### 3. Run Sample Evaluation
```bash
# Evaluate predefined sample problems
node main.js batch samples/basic-problems.json --limit 3

# Evaluate single problem
node main.js evaluate samples/basic-problems.json
```

## Usage Guide

### Commands

#### Test Ollama Connection
```bash
node main.js test-connection [options]

Options:
  -m, --model <model>  Ollama model to use (default: qwen:2.5-8b)
```

#### Evaluate Single Problem  
```bash
node main.js evaluate <problem-file> [options]

Arguments:
  problem-file         Path to problem JSON file

Options:
  -m, --model <model>  Ollama model to use (default: qwen:2.5-8b)
  -o, --output <file>  Output report file (default: results/single-evaluation.json)
  --timeout <ms>       Request timeout in milliseconds (default: 60000)
```

#### Batch Evaluation
```bash
node main.js batch <batch-file> [options]

Arguments:
  batch-file           Path to batch JSON file

Options:
  -m, --model <model>  Ollama model to use (default: qwen:2.5-8b)
  -o, --output <file>  Output report file (default: results/batch-evaluation.json)
  --timeout <ms>       Request timeout in milliseconds (default: 60000)
  --limit <n>          Limit number of problems to evaluate
```

#### Create Sample Problems
```bash
node main.js create-samples [options]

Options:
  -o, --output <dir>   Output directory (default: samples)
```

### Example Workflows

#### Basic Evaluation
```bash
# 1. Test connection
node main.js test-connection

# 2. Evaluate sample problems (limit to 2 for quick test)
node main.js batch samples/basic-problems.json --limit 2 -o results/test-run.json

# 3. View results
cat results/test-run.json
```

#### Custom Problem Evaluation
```bash
# 1. Create custom problem file
cat > my-problem.json << 'EOF'
{
  "id": "custom-001",
  "repo": "my-repo/utils",
  "problem_statement": "Fix the function to handle None inputs",
  "base_code": "def process(data):\n    return data.strip()",
  "filename": "utils.py",
  "test_cases": [
    "assert process('  hello  ') == 'hello'",
    "assert process(None) is None"
  ]
}
EOF

# 2. Evaluate custom problem
node main.js evaluate my-problem.json -o results/custom-result.json
```

## Problem Format

### Single Problem Structure
```json
{
  "id": "unique-problem-id",
  "repo": "repository/name", 
  "problem_statement": "Description of the issue to fix",
  "base_code": "def buggy_function():\n    # code with issue",
  "filename": "file.py",
  "test_cases": [
    "assert buggy_function() == expected_result"
  ],
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"]
}
```

### Batch File Structure
```json
{
  "metadata": {
    "count": 5,
    "version": "1.0.0"
  },
  "tasks": [
    { "id": "problem-1", ... },
    { "id": "problem-2", ... }
  ]
}
```

## Output Format

### Evaluation Report Structure
```json
{
  "summary": {
    "total_problems": 5,
    "successful_solutions": 3,
    "failed_solutions": 2, 
    "success_rate": "60.0%",
    "average_time_ms": 15000
  },
  "error_analysis": {
    "Syntax Error": 1,
    "Timeout": 1
  },
  "detailed_results": [
    {
      "problem_id": "div-by-zero-001",
      "success": true,
      "analysis": "ANALYSIS: The function has a division by zero issue...",
      "generated_fix": "def calculate_average(numbers):\n    if not numbers:\n        raise ValueError('Empty list')\n    return sum(numbers) / len(numbers)",
      "patch": "--- a/math_utils.py\n+++ b/math_utils.py\n@@ -1,2 +1,4 @@\n def calculate_average(numbers):\n+    if not numbers:\n+        raise ValueError('Empty list')\n     return sum(numbers) / len(numbers)",
      "test_results": [
        {"test_id": 0, "passed": true, "test_case": "..."},
        {"test_id": 1, "passed": true, "test_case": "..."}
      ],
      "execution_time": 12000,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Architecture

### Core Components

1. **OllamaAgent** (`lib/ollama-agent.js`)
   - HTTP client for Ollama API
   - Prompt engineering for code analysis
   - Response parsing and error handling

2. **ProblemLoader** (`lib/problem-loader.js`)
   - JSON problem file parsing
   - Validation and statistics
   - Batch processing support

3. **Evaluator** (`lib/evaluator.js`)
   - End-to-end problem evaluation
   - Code syntax validation
   - Test case execution
   - Report generation

### Evaluation Workflow

```
Problem Loading → Code Analysis → Patch Generation → Syntax Validation → Test Execution → Result Recording
```

## Limitations (PoC Scope)

- **Simplified Environment**: No Docker containerization
- **Basic Tests**: Simple assertion-based test cases only  
- **Python Only**: Limited to Python code examples
- **Local Execution**: No sandboxing or security isolation
- **Limited Metrics**: Basic success/failure tracking

## Performance Tips

### Ollama Optimization
```bash
# Increase context window for complex problems
export OLLAMA_NUM_CTX=8192

# Use GPU acceleration if available
export OLLAMA_GPU=1

# Adjust model parameters
export OLLAMA_TEMPERATURE=0.1
```

### Batch Processing
```bash
# Process problems in smaller batches to avoid timeouts
node main.js batch problems.json --limit 10

# Increase timeout for complex problems
node main.js batch problems.json --timeout 120000
```

## Troubleshooting

### Common Issues

#### Ollama Connection Failed
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama daemon
ollama serve

# Verify model is available
ollama list
```

#### Model Not Found
```bash
# Pull the required model
ollama pull qwen:2.5-8b

# Check available models
ollama list
```

#### Syntax Validation Errors
```bash
# Ensure Python 3 is available
python3 --version

# Install required Python packages if needed
pip3 install ast
```

#### Test Execution Failures
- Check `/tmp` directory permissions
- Verify Python path is correct
- Review test case syntax in problem definitions

### Performance Issues

#### Slow Response Times
- Reduce batch size with `--limit`
- Increase timeout with `--timeout`
- Use a more powerful model or hardware

#### Memory Issues
- Close other applications
- Reduce Ollama context window
- Process problems sequentially instead of in batch

## Extending the PoC

### Adding New Models
```javascript
// In lib/ollama-agent.js
const agent = new OllamaAgent({
  model: 'codellama:13b',  // or other code-focused models
  timeout: 90000
});
```

### Custom Prompt Templates
```javascript
// Create prompts/custom-analyze.txt
const customPrompt = `
You are an expert software engineer...
[custom prompt content]
`;
```

### Additional Languages
```javascript
// Extend evaluator for other languages
async validateSyntax(code, language = 'python') {
  switch(language) {
    case 'javascript':
      return await this.validateJavaScript(code);
    case 'python':
      return await this.validatePython(code);
    // Add more languages
  }
}
```

## Contributing

This is a proof-of-concept project. To extend functionality:

1. Fork the repository
2. Create feature branches
3. Add comprehensive tests
4. Update documentation
5. Submit pull requests

## License

MIT License - see LICENSE file for details.