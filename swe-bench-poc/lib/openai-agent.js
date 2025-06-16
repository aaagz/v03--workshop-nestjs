const https = require('https');

/**
 * OpenAIAgent - Interface for communicating with OpenAI API
 */
class OpenAIAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.model = options.model || 'gpt-4';
    this.timeout = options.timeout || 60000;
    this.baseUrl = 'api.openai.com';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key required. Set OPENAI_API_KEY environment variable or pass apiKey option.');
    }
  }

  /**
   * Send a prompt to OpenAI and get response
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The model's response
   */
  async generate(prompt, options = {}) {
    const requestBody = {
      model: this.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: options.temperature || 0.1,
      top_p: options.top_p || 0.9,
      max_tokens: options.max_tokens || 2048,
      stream: false,
      ...options.modelOptions
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      
      const requestOptions = {
        hostname: this.baseUrl,
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.timeout
      };

      const req = https.request(requestOptions, (res) => {
        let rawData = '';
        
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(rawData);
            
            if (response.error) {
              reject(new Error(`OpenAI API error: ${response.error.message}`));
            } else if (response.choices && response.choices[0] && response.choices[0].message) {
              const text = response.choices[0].message.content;
              resolve(text || '');
            } else {
              reject(new Error('Invalid response format from OpenAI API'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse OpenAI response: ${e.message}`));
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
   * Test connection to OpenAI
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.generate('Hello', { temperature: 0, max_tokens: 10 });
      return response.length > 0;
    } catch (error) {
      console.error('OpenAI connection test failed:', error.message);
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

module.exports = OpenAIAgent;