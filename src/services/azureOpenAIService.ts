// Message interface for Azure OpenAI API
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AzureOpenAIService {
  private apiKey: string;
  private endpoint: string;
  private deploymentName: string;
  private apiVersion: string;
  private isConfigured: boolean = false;

  constructor() {
    // Get values from environment variables using Vite's import.meta.env
    this.apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY || '';
    this.endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '';
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini';
    this.apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2023-05-15';
    // Validate configuration
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (!this.apiKey || !this.endpoint) {
      console.warn('⚠️ Azure OpenAI credentials not configured.');
      console.warn('Please set the following environment variables:');
      console.warn('- VITE_AZURE_OPENAI_API_KEY: Your Azure OpenAI API key');
      console.warn('- VITE_AZURE_OPENAI_ENDPOINT: Your Azure OpenAI endpoint URL');
      console.warn('- VITE_AZURE_OPENAI_DEPLOYMENT_NAME: Your deployment name (optional, defaults to gpt-4o-mini)');
      this.isConfigured = false;
      return;
    }

    // Validate endpoint format
    if (!this.endpoint.startsWith('https://') || !this.endpoint.includes('.openai.azure.com')) {
      console.error('❌ Invalid Azure OpenAI endpoint format. Expected: https://your-resource-name.openai.azure.com/');
      this.isConfigured = false;
      return;
    }

    // Remove trailing slash from endpoint if present
    this.endpoint = this.endpoint.replace(/\/$/, '');
    
    console.log('✅ Azure OpenAI configuration validated successfully');
    console.log(`🚀 Using deployment: ${this.deploymentName}`);
    console.log(`🔗 Endpoint: ${this.endpoint}`);
    this.isConfigured = true;
  }

  /**
   * Generate text using Azure OpenAI
   * @param messages Array of messages in the conversation
   * @returns Generated text response
   */
  async generateText(messages: Message[]): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Azure OpenAI not configured.');
    }

    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
    console.log('🤖 Calling Azure OpenAI API...');
    console.log(`📍 Endpoint: ${url}`);
    console.log(`💬 Messages: ${messages.length} message(s)`);
    // You must implement the rest of the function or remove this file if not used.
    return '';
  }
}

export const azureOpenAIService = new AzureOpenAIService();
