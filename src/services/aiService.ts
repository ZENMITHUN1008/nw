
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIWorkflowRequest {
  message: string;
  chatHistory: ChatMessage[];
  action: string;
}

class AIService {
  async loadConversation(): Promise<ChatMessage[]> {
    // Mock implementation - return empty array for now
    return [];
  }

  async saveConversation(sessionId: string, messages: ChatMessage[]): Promise<void> {
    // Mock implementation
    console.log('Saving conversation:', sessionId, messages.length);
  }

  async *generateWorkflowStream(): AsyncGenerator<{ type: string; content: any }, void, unknown> {
    // Mock implementation
    yield { type: 'text', content: 'Generating workflow...' };
    yield { 
      type: 'workflow', 
      content: { 
        name: 'Generated Workflow',
        nodes: []
      }
    };
  }
}

export const aiService = new AIService();
