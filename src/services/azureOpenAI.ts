
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}


const OLLAMA_URL = "http://localhost:11434/api/generate";

class OllamaService {
  async generateText(messages: Message[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const payload = {
      model: "gpt-oss:20b",
      prompt: lastMessage,
      stream: false
    };
    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data["response"];
    } catch (error: any) {
      console.error("Error querying Ollama:", error);
      return "Error: Unable to get response from Ollama.";
    }
  }
}

export const azureOpenAIService = new OllamaService();
