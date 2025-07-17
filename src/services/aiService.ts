
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

export const aiService = {
  async loadConversation(sessionId: string): Promise<ChatMessage[]> {
    // Mock implementation
    return [];
  },

  async saveConversation(sessionId: string, messages: ChatMessage[]): Promise<void> {
    // Mock implementation
    console.log('Saving conversation:', sessionId, messages);
  },

  async* generateWorkflowStream(request: AIWorkflowRequest) {
    // Mock implementation
    yield { type: 'text', content: 'Generating workflow...' };
    yield { type: 'workflow', content: { name: 'Test Workflow', nodes: [] } };
  }
};
