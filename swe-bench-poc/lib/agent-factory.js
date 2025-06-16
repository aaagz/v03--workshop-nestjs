const OllamaAgent = require('./ollama-agent');
const OpenAIAgent = require('./openai-agent');
const GeminiAgent = require('./gemini-agent');
const ClaudeAgent = require('./claude-agent');

/**
 * AgentFactory - Creates agents for different LLM providers
 */
class AgentFactory {
  /**
   * Create an agent instance based on provider type
   * @param {string} provider - Provider type ('ollama', 'openai', 'gemini', 'claude')
   * @param {Object} options - Configuration options for the agent
   * @returns {Object} - Agent instance
   */
  static createAgent(provider, options = {}) {
    const normalizedProvider = provider.toLowerCase();

    switch (normalizedProvider) {
      case 'ollama':
        return new OllamaAgent(options);
      
      case 'openai':
        return new OpenAIAgent(options);
      
      case 'gemini':
        return new GeminiAgent(options);
      
      case 'claude':
        return new ClaudeAgent(options);
      
      default:
        throw new Error(`Unsupported provider: ${provider}. Supported providers: ollama, openai, gemini, claude`);
    }
  }

  /**
   * Get default models for each provider
   * @returns {Object} - Map of provider to default model
   */
  static getDefaultModels() {
    return {
      ollama: 'qwen:2.5-8b',
      openai: 'gpt-4',
      gemini: 'gemini-pro',
      claude: 'claude-3-sonnet-20240229'
    };
  }

  /**
   * Get available models for each provider
   * @returns {Object} - Map of provider to available models
   */
  static getAvailableModels() {
    return {
      ollama: [
        'qwen:2.5-8b',
        'qwen:2.5-14b',
        'codellama:13b',
        'codellama:34b',
        'deepseek-coder:6.7b',
        'deepseek-coder:33b',
        'llama3:8b',
        'llama3:70b'
      ],
      openai: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-4o',
        'gpt-4o-mini'
      ],
      gemini: [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ],
      claude: [
        'claude-3-sonnet-20240229',
        'claude-3-opus-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20241022'
      ]
    };
  }

  /**
   * Validate provider and model combination
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @returns {boolean} - True if valid combination
   */
  static isValidProviderModel(provider, model) {
    const availableModels = this.getAvailableModels();
    const normalizedProvider = provider.toLowerCase();
    
    if (!availableModels[normalizedProvider]) {
      return false;
    }
    
    return availableModels[normalizedProvider].includes(model);
  }

  /**
   * Get required environment variables for each provider
   * @returns {Object} - Map of provider to required env vars
   */
  static getRequiredEnvVars() {
    return {
      ollama: [], // No API key required for local Ollama
      openai: ['OPENAI_API_KEY'],
      gemini: ['GEMINI_API_KEY'],
      claude: ['ANTHROPIC_API_KEY']
    };
  }

  /**
   * Check if all required environment variables are set for a provider
   * @param {string} provider - Provider name
   * @returns {Object} - {valid: boolean, missing: [string]} 
   */
  static validateEnvironment(provider) {
    const normalizedProvider = provider.toLowerCase();
    const requiredVars = this.getRequiredEnvVars()[normalizedProvider];
    
    if (!requiredVars) {
      return { valid: false, missing: [], error: `Unknown provider: ${provider}` };
    }

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      valid: missing.length === 0,
      missing,
      error: missing.length > 0 ? `Missing environment variables: ${missing.join(', ')}` : null
    };
  }

  /**
   * Create agent with validation
   * @param {string} provider - Provider type
   * @param {Object} options - Configuration options
   * @returns {Object} - Agent instance or throws error
   */
  static createValidatedAgent(provider, options = {}) {
    // Validate environment
    const envCheck = this.validateEnvironment(provider);
    if (!envCheck.valid) {
      throw new Error(envCheck.error);
    }

    // Set default model if not specified
    if (!options.model) {
      const defaultModels = this.getDefaultModels();
      options.model = defaultModels[provider.toLowerCase()];
    }

    // Validate model
    if (!this.isValidProviderModel(provider, options.model)) {
      const availableModels = this.getAvailableModels()[provider.toLowerCase()];
      throw new Error(`Invalid model ${options.model} for provider ${provider}. Available models: ${availableModels.join(', ')}`);
    }

    return this.createAgent(provider, options);
  }

  /**
   * Get provider configuration info
   * @param {string} provider - Provider name
   * @returns {Object} - Configuration information
   */
  static getProviderInfo(provider) {
    const normalizedProvider = provider.toLowerCase();
    const info = {
      ollama: {
        name: 'Ollama',
        description: 'Local LLM server',
        requiresApiKey: false,
        website: 'https://ollama.ai',
        setup: 'Install Ollama locally and run: ollama serve'
      },
      openai: {
        name: 'OpenAI',
        description: 'OpenAI GPT models',
        requiresApiKey: true,
        website: 'https://platform.openai.com',
        setup: 'Set OPENAI_API_KEY environment variable'
      },
      gemini: {
        name: 'Google Gemini',
        description: 'Google AI models',
        requiresApiKey: true,
        website: 'https://ai.google.dev',
        setup: 'Set GEMINI_API_KEY environment variable'
      },
      claude: {
        name: 'Anthropic Claude',
        description: 'Anthropic AI models',
        requiresApiKey: true,
        website: 'https://console.anthropic.com',
        setup: 'Set ANTHROPIC_API_KEY environment variable'
      }
    };

    return info[normalizedProvider] || null;
  }

  /**
   * List all supported providers
   * @returns {Array} - Array of supported provider names
   */
  static getSupportedProviders() {
    return ['ollama', 'openai', 'gemini', 'claude'];
  }
}

module.exports = AgentFactory;