import { supabase } from '../lib/supabase';

export interface AIWorkflowRequest {
  message: string;
  chatHistory?: Array<{ role: string; content: string }>;
  selectedWorkflow?: any;
  action: 'generate' | 'analyze' | 'edit' | 'chat';
  workflowContext?: any;
  credentials?: { [key: string]: any };
}

export interface AIStreamResponse {
  type: 'text' | 'workflow' | 'error' | 'tool_start' | 'tool_input' | 'tool_result';
  content: string | any;
}

class AIService {
  private validateEnvironment(): void {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not set in environment variables');
    }
    
    if (!supabaseKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
    }
    
    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}`);
    }
  }

  private constructEdgeFunctionUrl(functionName: string): string {
    this.validateEnvironment();
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, ''); // Remove trailing slash
    return `${baseUrl}/functions/v1/${functionName}`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      throw new Error('Not authenticated. Please sign in to use AI features.');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  private async getBasicHeaders(): Promise<Record<string, string>> {
    this.validateEnvironment();
    
    return {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async *generateWorkflowStream(request: AIWorkflowRequest): AsyncGenerator<AIStreamResponse, void, unknown> {
    try {
      console.log('Starting enhanced AI workflow generation with request:', request);
      
      const headers = await this.getAuthHeaders();
      const url = this.constructEdgeFunctionUrl('ai-workflow-generator');
      
      console.log('Calling enhanced AI service at:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      console.log('AI service response status:', response.status);
      console.log('AI service response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI service error response:', errorText);
        
        // Check if we got HTML instead of JSON (common error)
        if (errorText.includes('<!doctype') || errorText.includes('<html')) {
          throw new Error('AI service returned an HTML error page. The service may not be properly deployed or configured.');
        }
        
        throw new Error(`AI service error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        const responseText = await response.text();
        console.error('Expected event stream but got:', contentType, responseText);
        throw new Error('Invalid response format from AI service. Expected event stream.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Enhanced AI stream completed');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('Received enhanced AI response chunk:', data);
                yield data as AIStreamResponse;
              } catch (e) {
                console.error('Error parsing AI response line:', line, e);
                // Don't throw here, just log and continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Enhanced AI service error:', error);
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error occurred while communicating with AI service'
      };
    }
  }

  async generateWorkflow(request: AIWorkflowRequest): Promise<any> {
    const responses: string[] = [];
    let workflowData: any = null;

    for await (const response of this.generateWorkflowStream(request)) {
      if (response.type === 'text') {
        responses.push(response.content as string);
      } else if (response.type === 'workflow') {
        workflowData = response.content;
      } else if (response.type === 'error') {
        throw new Error(response.content as string);
      }
    }

    return {
      content: responses.join(''),
      workflow: workflowData
    };
  }

  // Quick non-streaming method for simple requests
  async chatWithAI(message: string, chatHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    const request: AIWorkflowRequest = {
      message,
      chatHistory,
      action: 'chat'
    };

    const responses: string[] = [];

    for await (const response of this.generateWorkflowStream(request)) {
      if (response.type === 'text') {
        responses.push(response.content as string);
      } else if (response.type === 'error') {
        throw new Error(response.content as string);
      }
    }

    return responses.join('');
  }

  // Test connection to AI service with better error handling
  async testConnection(): Promise<boolean> {
    try {
      // First validate environment
      this.validateEnvironment();
      
      const url = this.constructEdgeFunctionUrl('ai-workflow-generator');
      console.log('Testing AI service connection at:', url);
      
      let headers: Record<string, string>;
      
      try {
        // Try with auth headers first
        headers = await this.getAuthHeaders();
        console.log('Using authenticated headers for test');
      } catch (authError) {
        console.log('Auth failed, using basic headers:', authError);
        // Fall back to basic headers if auth fails
        headers = await this.getBasicHeaders();
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'test',
          action: 'chat'
        }),
      });

      console.log('Test connection response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test connection failed with response:', errorText);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('AI service connection test failed:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This is likely a network connectivity issue or the edge function is not deployed');
      }
      
      return false;
    }
  }

  // Simple connectivity test without authentication
  async testBasicConnectivity(): Promise<{ success: boolean; error?: string }> {
    try {
      this.validateEnvironment();
      
      const url = this.constructEdgeFunctionUrl('ai-workflow-generator');
      console.log('Testing basic connectivity to:', url);
      
      const headers = await this.getBasicHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'connectivity-test',
          action: 'chat'
        }),
      });

      return {
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Basic connectivity test failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Generate workflow with credentials for testing
  async generateWorkflowWithCredentials(
    message: string, 
    credentials: { [key: string]: any },
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<any> {
    const request: AIWorkflowRequest = {
      message,
      chatHistory,
      action: 'generate',
      credentials
    };

    return this.generateWorkflow(request);
  }

  // Analyze workflow with enhanced capabilities
  async analyzeWorkflowAdvanced(
    workflow: any,
    question: string = "Analyze this workflow comprehensively",
    credentials?: { [key: string]: any }
  ): Promise<any> {
    const request: AIWorkflowRequest = {
      message: question,
      selectedWorkflow: workflow,
      action: 'analyze',
      credentials
    };

    return this.generateWorkflow(request);
  }
}

export const aiService = new AIService();