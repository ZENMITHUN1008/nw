import { supabase } from '../integrations/supabase/client';
import { N8nService } from './n8nService';

export interface AIWorkflowRequest {
  description: string;
  userId: string;
  connectionId?: string;
}

export interface AIWorkflowResponse {
  success: boolean;
  workflow?: any;
  error?: string;
  suggestions?: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  connections: any[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export class AIService {
  private openaiApiKey: string;
  private n8nService: N8nService;

  constructor(openaiApiKey: string = '') {
    this.openaiApiKey = openaiApiKey || process.env.VITE_OPENAI_API_KEY || '';
    this.n8nService = new N8nService('', '');
  }

  async generateWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResponse> {
    try {
      // For now, return a mock response since we don't have OpenAI integration yet
      const mockWorkflow = {
        id: `workflow_${Date.now()}`,
        name: `AI Generated: ${request.description.slice(0, 50)}...`,
        description: request.description,
        nodes: [
          {
            id: 'trigger',
            type: 'webhook',
            name: 'Webhook Trigger',
            position: [100, 100],
            parameters: {
              httpMethod: 'POST',
              path: 'webhook'
            }
          },
          {
            id: 'process',
            type: 'function',
            name: 'Process Data',
            position: [300, 100],
            parameters: {
              functionCode: `
                // Process the incoming data
                const data = $input.all();
                return data.map(item => ({
                  ...item.json,
                  processed: true,
                  timestamp: new Date().toISOString()
                }));
              `
            }
          }
        ],
        connections: {
          trigger: {
            main: [
              [
                {
                  node: 'process',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        },
        active: false,
        tags: ['ai-generated'],
        settings: {
          executionOrder: 'v1'
        }
      };

      return {
        success: true,
        workflow: mockWorkflow,
        suggestions: [
          'Consider adding error handling nodes',
          'Add data validation before processing',
          'Include logging for debugging purposes'
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate workflow'
      };
    }
  }

  async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    try {
      // Mock templates for now
      const templates: WorkflowTemplate[] = [
        {
          id: 'email-automation',
          name: 'Email Automation',
          description: 'Automatically send emails based on triggers',
          category: 'communication',
          nodes: [],
          connections: [],
          tags: ['email', 'automation', 'communication'],
          difficulty: 'beginner',
          estimatedTime: '15 minutes'
        },
        {
          id: 'data-sync',
          name: 'Data Synchronization',
          description: 'Sync data between different platforms',
          category: 'data',
          nodes: [],
          connections: [],
          tags: ['sync', 'data', 'integration'],
          difficulty: 'intermediate',
          estimatedTime: '30 minutes'
        },
        {
          id: 'social-media-posting',
          name: 'Social Media Posting',
          description: 'Automatically post to multiple social media platforms',
          category: 'social',
          nodes: [],
          connections: [],
          tags: ['social', 'posting', 'automation'],
          difficulty: 'beginner',
          estimatedTime: '20 minutes'
        }
      ];

      if (category) {
        return templates.filter(template => template.category === category);
      }

      return templates;
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      return [];
    }
  }

  async analyzeWorkflow(workflow: any): Promise<{
    suggestions: string[];
    optimizations: string[];
    issues: string[];
  }> {
    try {
      // Mock analysis for now
      return {
        suggestions: [
          'Add error handling to prevent workflow failures',
          'Consider adding data validation nodes',
          'Include logging for better debugging'
        ],
        optimizations: [
          'Combine similar operations to reduce execution time',
          'Use batch processing for large datasets',
          'Cache frequently accessed data'
        ],
        issues: [
          'Missing error handling in critical nodes',
          'Potential infinite loop detected',
          'High memory usage in data processing node'
        ]
      };
    } catch (error) {
      console.error('Error analyzing workflow:', error);
      return {
        suggestions: [],
        optimizations: [],
        issues: []
      };
    }
  }

  async saveWorkflowToDatabase(workflow: any, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ai_generated_workflows')
        .insert([{
          user_id: userId,
          workflow_data: workflow,
          name: workflow.name,
          description: workflow.description,
          tags: workflow.tags || [],
          created_at: new Date().toISOString()
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save workflow'
      };
    }
  }

  async getUserWorkflows(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_generated_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user workflows:', error);
      return [];
    }
  }

  async improveWorkflowDescription(description: string): Promise<{
    improved: string;
    suggestions: string[];
  }> {
    try {
      // Mock improvement for now
      const improved = `Enhanced: ${description}. This workflow will include proper error handling, data validation, and logging capabilities for optimal performance and reliability.`;
      
      return {
        improved,
        suggestions: [
          'Be more specific about data sources and destinations',
          'Include error handling requirements',
          'Specify expected data formats and volumes',
          'Mention any security or compliance requirements'
        ]
      };
    } catch (error) {
      return {
        improved: description,
        suggestions: []
      };
    }
  }

  async validateWorkflow(workflow: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!workflow.nodes || workflow.nodes.length === 0) {
        errors.push('Workflow must contain at least one node');
      }

      if (!workflow.name || workflow.name.trim() === '') {
        errors.push('Workflow must have a name');
      }

      // Check for orphaned nodes
      const connectedNodes = new Set();
      if (workflow.connections) {
        Object.values(workflow.connections).forEach((connections: any) => {
          if (connections.main) {
            connections.main.forEach((mainConnections: any[]) => {
              mainConnections.forEach((connection: any) => {
                connectedNodes.add(connection.node);
              });
            });
          }
        });
      }

      const orphanedNodes = workflow.nodes.filter((node: any) => 
        node.type !== 'trigger' && !connectedNodes.has(node.id)
      );

      if (orphanedNodes.length > 0) {
        warnings.push(`Found ${orphanedNodes.length} orphaned node(s) that are not connected`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate workflow'],
        warnings: []
      };
    }
  }
}

export const aiService = new AIService();
