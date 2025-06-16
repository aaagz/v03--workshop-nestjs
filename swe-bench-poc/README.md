# SWE-bench PoC with Multi-Provider LLM Support

A comprehensive **Proof of Concept (PoC)** implementation of the SWE-bench evaluation framework supporting **multiple LLM providers**: Ollama (local), OpenAI, Google Gemini, and Anthropic Claude.

## 🎯 Overview

This project demonstrates the core concepts of SWE-bench with support for multiple LLM providers:
- Loading real-world software engineering problems
- Using different LLMs to analyze and fix code issues  
- Applying generated patches and validating solutions
- Comparing performance across different providers
- Generating comprehensive evaluation reports

## 🤖 Supported Providers

| Provider | Description | Models | Setup Required |
|----------|-------------|---------|----------------|
| **Ollama** | Local LLM server | Qwen 2.5, CodeLlama, DeepSeek Coder | Install Ollama locally |
| **OpenAI** | OpenAI GPT models | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo | API Key required |
| **Gemini** | Google AI models | Gemini Pro, Gemini 1.5 Pro/Flash | API Key required |
| **Claude** | Anthropic AI models | Claude 3 Sonnet/Opus/Haiku | API Key required |

## 📋 Prerequisites

### 1. System Requirements
- Node.js 18+
- Python 3.8+ (for syntax validation and test execution)
- Internet connection (for API-based providers)

### 2. Provider Setup

#### Ollama (Local)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama daemon
ollama serve

# Pull a model
ollama pull qwen:2.5-8b
```

#### OpenAI
```bash
# Set API key
export OPENAI_API_KEY="your-api-key-here"
```

#### Google Gemini
```bash
# Get API key from https://ai.google.dev
export GEMINI_API_KEY="your-api-key-here"
```

#### Anthropic Claude
```bash
# Get API key from https://console.anthropic.com
export ANTHROPIC_API_KEY="your-api-key-here"
```

## 🚀 Quick Start

### 1. Setup Project
```bash
cd swe-bench-poc
npm install
npm run setup  # Creates results directory
```

### 2. List Available Providers
```bash
node main.js list-providers
```

### 3. Test Provider Connections
```bash
# Test Ollama (local)
node main.js test-connection --provider ollama

# Test OpenAI
node main.js test-connection --provider openai

# Test Gemini
node main.js test-connection --provider gemini --model gemini-1.5-pro

# Test Claude
node main.js test-connection --provider claude
```

### 4. Run Evaluations
```bash
# Single problem with different providers
node main.js evaluate samples/basic-problems.json --provider ollama
node main.js evaluate samples/basic-problems.json --provider openai --model gpt-4
node main.js evaluate samples/basic-problems.json --provider gemini

# Batch evaluation
node main.js batch samples/basic-problems.json --provider claude --limit 3

# Compare providers
node main.js compare samples/basic-problems.json --providers "ollama,openai,gemini"
```

## 📖 Usage Guide

### Commands

#### List Providers and Models
```bash
node main.js list-providers
```
Shows all supported providers, their models, setup status, and usage examples.

#### Test Provider Connection
```bash
node main.js test-connection [options]

Options:
  -p, --provider <provider>  LLM provider (ollama, openai, gemini, claude)
  -m, --model <model>        Model to use (auto-detected if not specified)
```

#### Evaluate Single Problem  
```bash
node main.js evaluate <problem-file> [options]

Arguments:
  problem-file               Path to problem JSON file

Options:
  -p, --provider <provider>  LLM provider (default: ollama)
  -m, --model <model>        Model to use (auto-detected from provider)
  -o, --output <file>        Output report file
  --timeout <ms>             Request timeout in milliseconds
```

#### Batch Evaluation
```bash
node main.js batch <batch-file> [options]

Arguments:
  batch-file                 Path to batch JSON file

Options:
  -p, --provider <provider>  LLM provider (default: ollama)
  -m, --model <model>        Model to use (auto-detected from provider)
  -o, --output <file>        Output report file
  --timeout <ms>             Request timeout in milliseconds
  --limit <n>                Limit number of problems to evaluate
```

#### Compare Providers
```bash
node main.js compare <batch-file> [options]

Arguments:
  batch-file                 Path to batch JSON file

Options:
  -p, --providers <list>     Comma-separated list of providers to compare
  --limit <n>                Limit number of problems to evaluate
  -o, --output <file>        Output comparison report
```

### Example Workflows

#### Basic Provider Testing
```bash
# Test all available providers
node main.js test-connection --provider ollama
node main.js test-connection --provider openai
node main.js test-connection --provider gemini
node main.js test-connection --provider claude
```

#### Single Problem Evaluation with Different Models
```bash
# Using Ollama with different models
node main.js evaluate problem.json --provider ollama --model qwen:2.5-8b
node main.js evaluate problem.json --provider ollama --model codellama:13b

# Using OpenAI with different models
node main.js evaluate problem.json --provider openai --model gpt-4
node main.js evaluate problem.json --provider openai --model gpt-3.5-turbo

# Using Gemini
node main.js evaluate problem.json --provider gemini --model gemini-1.5-pro
```

#### Provider Performance Comparison
```bash
# Compare multiple providers on same problem set
node main.js compare samples/basic-problems.json \
  --providers "ollama,openai,gemini,claude" \
  --limit 5 \
  -o results/provider-comparison.json

# View comparison results
cat results/provider-comparison.json | jq '.comparison_summary'
```

#### Batch Processing with Different Providers
```bash
# Process problems with Ollama (local, free)
node main.js batch samples/basic-problems.json --provider ollama --limit 5

# Process with OpenAI (cloud, paid)
node main.js batch samples/basic-problems.json --provider openai --limit 3

# Process with Claude (cloud, paid)  
node main.js batch samples/basic-problems.json --provider claude --limit 3
```

## 🛠️ Configuration

### Environment Variables

```bash
# Required for API-based providers
export OPENAI_API_KEY="sk-..."           # OpenAI API key
export GEMINI_API_KEY="AI..."            # Google AI Studio API key  
export ANTHROPIC_API_KEY="sk-ant-..."    # Anthropic API key

# Optional configurations
export OLLAMA_HOST="localhost"           # Ollama server host
export OLLAMA_PORT="11434"               # Ollama server port
```

### Model Selection

Each provider has a default model, but you can specify others:

```bash
# Ollama models (local)
--model qwen:2.5-8b           # Default, good balance
--model qwen:2.5-14b          # Larger, more capable
--model codellama:13b         # Code-focused
--model deepseek-coder:6.7b   # Fast code model

# OpenAI models
--model gpt-4                 # Default, most capable
--model gpt-4-turbo           # Faster, cheaper
--model gpt-3.5-turbo         # Fastest, cheapest

# Gemini models  
--model gemini-pro            # Default
--model gemini-1.5-pro        # Latest, most capable
--model gemini-1.5-flash      # Faster, cheaper

# Claude models
--model claude-3-sonnet-20240229    # Default, balanced
--model claude-3-opus-20240229      # Most capable
--model claude-3-haiku-20240307     # Fastest
```

## 📊 Output Examples

### Provider Comparison Report
```json
{
  "metadata": {
    "providers": ["ollama", "openai", "gemini"],
    "total_problems": 3,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "provider_results": {
    "ollama": {
      "summary": {
        "success_rate": "66.7%",
        "average_time_ms": 2500
      }
    },
    "openai": {
      "summary": {
        "success_rate": "100.0%", 
        "average_time_ms": 1800
      }
    },
    "gemini": {
      "summary": {
        "success_rate": "100.0%",
        "average_time_ms": 2100
      }
    }
  },
  "comparison_summary": {
    "best_performer": "openai",
    "performance_ranking": [
      {"provider": "openai", "success_rate": "100.0%"},
      {"provider": "gemini", "success_rate": "100.0%"},
      {"provider": "ollama", "success_rate": "66.7%"}
    ],
    "average_success_rate": "88.9%"
  }
}
```

## 🎯 Performance Considerations

### Provider Characteristics

| Provider | Speed | Cost | Quality | Privacy | Offline |
|----------|-------|------|---------|---------|---------|
| **Ollama** | Medium | Free | Good | 100% | ✅ |
| **OpenAI** | Fast | $$ | Excellent | Cloud | ❌ |
| **Gemini** | Fast | $ | Very Good | Cloud | ❌ |
| **Claude** | Medium | $$ | Excellent | Cloud | ❌ |

### Recommendations

- **Development/Testing**: Use Ollama for free, local development
- **Production/Research**: Use OpenAI GPT-4 or Claude for best results
- **Budget-Conscious**: Use Gemini Flash or OpenAI GPT-3.5 Turbo
- **Privacy-Sensitive**: Use Ollama exclusively (local processing)

## 🚀 Advanced Usage

### Custom Agent Configuration
```javascript
// Using the agent factory directly
const AgentFactory = require('./lib/agent-factory');

// Create agents with custom options
const ollamaAgent = AgentFactory.createAgent('ollama', {
  model: 'codellama:13b',
  timeout: 120000
});

const openaiAgent = AgentFactory.createAgent('openai', {
  model: 'gpt-4-turbo',
  apiKey: 'custom-key',
  timeout: 30000
});
```

### Batch Provider Testing
```bash
# Test all providers and save results
for provider in ollama openai gemini claude; do
  echo "Testing $provider..."
  node main.js test-connection --provider $provider > "test-$provider.log" 2>&1
done
```

### Automated Benchmarking
```bash
# Run comprehensive comparison
node main.js compare samples/basic-problems.json \
  --providers "ollama,openai,gemini,claude" \
  --limit 10 \
  -o "benchmark-$(date +%Y%m%d).json"
```

## 🔧 Troubleshooting

### Common Issues

#### Provider Not Available
```bash
# Check provider status
node main.js list-providers

# Test specific provider
node main.js test-connection --provider openai
```

#### API Key Issues
```bash
# Verify environment variables
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY
echo $ANTHROPIC_API_KEY

# Test with explicit model
node main.js test-connection --provider openai --model gpt-3.5-turbo
```

#### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama daemon
ollama serve

# Pull required model
ollama pull qwen:2.5-8b
```

### Error Messages

- **"Missing environment variables"**: Set required API keys
- **"Cannot connect to provider"**: Check network/service status
- **"Invalid model for provider"**: Use `list-providers` to see available models
- **"Request timeout"**: Increase timeout or try smaller problems

## 🔮 Future Enhancements

- Support for more providers (Hugging Face, Cohere, etc.)
- Advanced prompt engineering per provider
- Cost tracking and optimization
- Parallel provider evaluation
- Web interface for provider management
- Integration with continuous integration systems

## 📝 Conclusion

This enhanced SWE-bench PoC demonstrates that multiple LLM providers can be seamlessly integrated for automated code fixing tasks. The modular architecture allows for easy comparison of different models and providers, enabling researchers and practitioners to choose the best option for their specific needs, whether prioritizing cost, performance, privacy, or offline capability.

The project serves as a comprehensive foundation for AI-assisted software engineering research and development across multiple LLM ecosystems.