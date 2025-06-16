# SWE-bench PoC with Ollama API - Implementation Plan

## Overview
This PoC demonstrates a simplified SWE-bench evaluation system using Ollama's local API with Qwen 2.5-8B model. The system will simulate the core SWE-bench workflow: problem understanding, code analysis, patch generation, and basic validation.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Problem       │    │    Ollama        │    │   Evaluation    │
│   Loader        │───▶│    Agent         │───▶│   Engine        │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Sample Tasks   │    │  Code Analysis   │    │  Test Runner    │
│  (JSON)         │    │  & Patch Gen     │    │  & Validator    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Components

### 1. Problem Loader (`problem-loader.js`)
- Load sample SWE-bench-style problems from JSON
- Parse problem statements, repository context, and test requirements
- Format data for agent consumption

### 2. Ollama Agent (`ollama-agent.js`) 
- Interface with local Ollama API
- Implement prompt engineering for code understanding and patch generation
- Handle streaming/non-streaming responses
- Retry logic and error handling

### 3. Code Analyzer (`code-analyzer.js`)
- Parse existing codebase context
- Identify relevant files and functions
- Extract dependencies and imports

### 4. Patch Generator (`patch-generator.js`)
- Generate code patches based on agent responses
- Format patches in unified diff format
- Validate patch syntax

### 5. Evaluation Engine (`evaluator.js`)
- Apply patches to test environment
- Run basic syntax/import validation
- Compare against expected outcomes
- Generate evaluation reports

### 6. Test Runner (`test-runner.js`)
- Execute simplified test cases
- Mock test environment without full Docker
- Report pass/fail status

## Sample Problems Structure

```json
{
  "tasks": [
    {
      "id": "simple-001",
      "repo": "example/math-utils",
      "problem_statement": "Fix the division by zero error in calculate_average function",
      "base_code": "def calculate_average(numbers):\n    return sum(numbers) / len(numbers)",
      "expected_fix": "Add check for empty list",
      "test_case": "assert calculate_average([]) raises appropriate error"
    }
  ]
}
```

## Implementation Phases

### Phase 1: Basic Infrastructure
1. ✅ Setup project structure
2. ✅ Create sample problem dataset
3. ✅ Implement Ollama API client
4. ✅ Basic problem loading

### Phase 2: Core Logic
1. ✅ Implement code analysis prompts
2. ✅ Patch generation logic
3. ✅ Basic validation
4. ✅ Simple test execution

### Phase 3: Evaluation
1. ✅ End-to-end workflow
2. ✅ Performance metrics
3. ✅ Results reporting
4. ✅ Error analysis

### Phase 4: Enhancement
1. ⏳ Streaming responses
2. ⏳ Multi-step reasoning
3. ⏳ Advanced prompting techniques
4. ⏳ Integration with real repositories

## Technical Requirements

### Dependencies
- Node.js 18+
- Local Ollama installation
- Qwen 2.5-8B model pulled
- Basic file system utilities

### Performance Targets
- Process simple problems in < 30 seconds
- 70%+ success rate on basic syntax fixes
- Clear error reporting for failures

### Limitations (PoC Scope)
- No Docker containerization
- Simplified test execution
- Limited to Python code examples
- No real repository integration
- Basic diff validation only

## Success Metrics

1. **Functional Completeness**: All components working together
2. **Problem Solving**: Successfully fix at least 3/5 sample problems  
3. **Performance**: Reasonable response times
4. **Extensibility**: Clean code structure for future enhancements
5. **Documentation**: Clear usage instructions and examples

## Usage Workflow

```bash
# 1. Setup
cd swe-bench-poc
npm install

# 2. Ensure Ollama is running
ollama serve

# 3. Run evaluation
node main.js --problem samples/basic-001.json
node main.js --batch samples/all-problems.json

# 4. View results
cat results/evaluation-report.json
```

## File Structure

```
swe-bench-poc/
├── PLAN.md                 # This plan
├── README.md              # Usage instructions  
├── package.json           # Dependencies
├── main.js                # Entry point
├── lib/
│   ├── problem-loader.js  # Load and parse problems
│   ├── ollama-agent.js    # Ollama API interface
│   ├── code-analyzer.js   # Code understanding
│   ├── patch-generator.js # Generate patches
│   ├── evaluator.js       # Run evaluation
│   └── test-runner.js     # Execute tests
├── samples/               # Sample problems
│   ├── basic-001.json
│   ├── basic-002.json
│   └── all-problems.json
├── prompts/               # Prompt templates
│   ├── analyze-code.txt
│   ├── generate-patch.txt
│   └── explain-fix.txt
└── results/               # Output directory
    └── evaluation-report.json
```

This plan provides a roadmap for creating a functional SWE-bench PoC that demonstrates the core concepts while remaining manageable in scope.