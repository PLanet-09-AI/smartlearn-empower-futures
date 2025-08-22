
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const OLLAMA_URL = "http://localhost:11434/api/generate";

class OllamaService {
  private selectedModel: string = 'gpt-oss:20b';

  setModel(model: string) {
    this.selectedModel = model;
  }

  getModel(): string {
    return this.selectedModel;
  }

  async generateText(messages: Message[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const payload = {
      model: this.selectedModel,
      prompt: lastMessage,
      stream: false
    };
    
    try {
      console.log(`🤖 Using Ollama model: ${this.selectedModel}`);
      console.log(`📝 Prompt length: ${lastMessage.length} characters`);
      
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`📊 Response stats:`, {
        model: data.model,
        done: data.done,
        total_duration: data.total_duration ? `${(data.total_duration / 1000000000).toFixed(2)}s` : 'N/A',
        eval_count: data.eval_count || 'N/A'
      });
      
      const responseText = data["response"];
      
      if (!responseText || responseText.trim().length === 0) {
        console.error(`❌ Empty response from model ${this.selectedModel}`);
        throw new Error(`Model ${this.selectedModel} returned an empty response`);
      }
      
      console.log(`✅ Received response (${responseText.length} chars)`);
      return responseText;
      
    } catch (error: any) {
      console.error(`❌ Error querying Ollama with model ${this.selectedModel}:`, error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return `Error: Cannot connect to Ollama server at ${OLLAMA_URL}. Please ensure Ollama is running.`;
      }
      
      if (error.message.includes('404')) {
        return `Error: Model "${this.selectedModel}" not found. Please ensure this model is installed in Ollama.`;
      }
      
      return `Error: Unable to get response from Ollama using model ${this.selectedModel}. ${error.message}`;
    }
  }

  /**
   * Test if a specific model is working properly
   */
  async testModel(modelName: string): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = Date.now();
    const testPayload = {
      model: modelName,
      prompt: "Hello, please respond with just 'OK'",
      stream: false
    };
    
    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${errorText}` 
        };
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      if (data.response && data.response.trim().length > 0) {
        return { 
          success: true, 
          responseTime 
        };
      } else {
        return { 
          success: false, 
          error: "Model returned empty response" 
        };
      }
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export const azureOpenAIService = new OllamaService();
