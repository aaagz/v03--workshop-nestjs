const http = require('http');

/**
 * OllamaAgent - Interface for communicating with local Ollama API
 */
class OllamaAgent {
  constructor(options = {}) {
    this.host = options.host || 'localhost';
    this.port = options.port || 11434;
    this.model = options.model || 'qwen:2.5-8b';
    this.timeout = options.timeout || 60000; // 60 seconds
  }

  /**
   * Send a prompt to Ollama and get response
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The model's response
   */
  async generate(prompt, options = {}) {
    const requestBody = {
      model: this.model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.1,
        top_p: options.top_p || 0.9,
        ...options.modelOptions
      }
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      
      const requestOptions = {
        hostname: this.host,
        port: this.port,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.timeout
      };

      const req = http.request(requestOptions, (res) => {
        let rawData = '';
        
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(rawData);
            if (response.error) {
              reject(new Error(`Ollama API error: ${response.error}`));
            } else {
              resolve(response.response || '');
            }
          } catch (e) {
            reject(new Error(`Failed to parse Ollama response: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Request failed: ${e.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Test connection to Ollama
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.generate('Hello', { temperature: 0 });
      return response.length > 0;
    } catch (error) {
      console.error('Ollama connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Analyze code and suggest fixes
   * @param {string} code - The code to analyze
   * @param {string} problem - Description of the problem
   * @returns {Promise<string>} - Analysis and suggested fix
   */
  async analyzeCode(code, problem) {
    const prompt = `
You are a software engineer tasked with analyzing and fixing code issues.

PROBLEM DESCRIPTION:
${problem}

CURRENT CODE:
\`\`\`python
${code}
\`\`\`

Please analyze the code and provide:
1. Explanation of the issue
2. The exact fixed code
3. Explanation of the fix

Format your response as:
ANALYSIS: [your analysis]
FIXED_CODE:
\`\`\`python
[corrected code here]
\`\`\`
EXPLANATION: [explanation of the fix]
`;

    return await this.generate(prompt, { temperature: 0.1 });
  }

  /**
   * Generate a code patch in unified diff format
   * @param {string} originalCode - Original code
   * @param {string} fixedCode - Fixed code
   * @param {string} filename - File name for the patch
   * @returns {Promise<string>} - Unified diff patch
   */
  async generatePatch(originalCode, fixedCode, filename = 'file.py') {
    const prompt = `
Generate a unified diff patch for the following code change:

ORIGINAL CODE:
\`\`\`python
${originalCode}
\`\`\`

FIXED CODE:
\`\`\`python
${fixedCode}
\`\`\`

Filename: ${filename}

Please provide ONLY the unified diff format patch, starting with:
--- a/${filename}
+++ b/${filename}
`;

    return await this.generate(prompt, { temperature: 0 });
  }
}

module.exports = OllamaAgent;