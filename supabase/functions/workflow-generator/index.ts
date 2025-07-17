
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Gemini API configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Available Gemini models in order of preference
const GEMINI_MODELS = [
  'gemini-1.5-pro-002',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-8b',
  'gemini-1.0-pro'
];

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  try {
    // Initialize Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      console.error('Invalid authorization:', authError?.message);
      return new Response(JSON.stringify({
        error: 'Invalid authorization'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return new Response(JSON.stringify({
        error: 'AI service not properly configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { message, chatHistory = [], selectedWorkflow, action, workflowContext } = requestBody;
    
    if (!message) {
      return new Response(JSON.stringify({
        error: 'Message is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Build enhanced prompt
    const systemPrompt = buildSystemPrompt(action, selectedWorkflow, workflowContext);
    const userPrompt = buildUserPrompt(message, action, selectedWorkflow);
    
    // Prepare messages for Gemini
    const messages = [
      ...chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }
    ];
    
    console.log('Calling Gemini API with model fallback');
    
    // Try models with fallback
    let response = null;
    let currentModelIndex = 0;
    
    while (currentModelIndex < GEMINI_MODELS.length && !response) {
      const currentModel = GEMINI_MODELS[currentModelIndex];
      console.log(`Trying model: ${currentModel}`);
      
      try {
        const geminiResponse = await fetch(`${GEMINI_API_URL}/${currentModel}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8000,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          })
        });
        
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          console.log(`Successfully connected with model: ${currentModel}`);
          console.log('Gemini response:', JSON.stringify(geminiData, null, 2));
          
          // Extract content from Gemini response
          let content = '';
          if (geminiData.candidates && geminiData.candidates.length > 0) {
            const candidate = geminiData.candidates[0];
            if (candidate.content && candidate.content.parts) {
              content = candidate.content.parts.map(part => part.text || '').join('');
            }
          }
          
          if (!content) {
            console.log('No content in response, trying next model...');
            currentModelIndex++;
            continue;
          }
          
          // Extract workflow from content if available
          const workflowData = extractWorkflowFromContent(content);
          
          response = {
            content: content,
            workflow: workflowData,
            explanation: content,
            estimatedComplexity: workflowData ? 'medium' : 'low'
          };
          
          break;
        } else if (geminiResponse.status === 429 || geminiResponse.status === 503) {
          console.log(`Model ${currentModel} is overloaded, trying next model...`);
          currentModelIndex++;
        } else {
          const errorText = await geminiResponse.text();
          console.error(`Gemini API error for model ${currentModel}:`, geminiResponse.status, errorText);
          currentModelIndex++;
        }
      } catch (error) {
        console.error(`Error with model ${currentModel}:`, error);
        currentModelIndex++;
      }
    }
    
    if (!response) {
      throw new Error('All Gemini models are currently unavailable');
    }
    
    console.log('Returning response:', JSON.stringify(response, null, 2));
    
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in AI workflow generator:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error occurred',
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      workflow: null,
      explanation: 'Error occurred during processing',
      estimatedComplexity: 'low'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

function buildSystemPrompt(action, selectedWorkflow, workflowContext) {
  const basePrompt = `You are WorkFlow AI, an expert n8n automation engineer. Your primary goal is to ALWAYS create working workflows.

# CORE BEHAVIOR:
- ALWAYS say "Yes, I can create that workflow" and build it
- Generate working n8n JSON immediately when requested
- Use reasonable assumptions for missing details
- Be solution-focused, not limitation-focused
- Only mention constraints AFTER providing a working solution

# WORKFLOW CREATION PHILOSOPHY:
- Every request can be automated somehow
- Use HTTP Request nodes for any API integrations
- Implement webhooks for triggers
- Add proper error handling and retries
- Use placeholder values for missing configuration

# N8N WORKFLOW STRUCTURE:
When generating workflows, use this structure:

\`\`\`json
{
  "name": "Clear Workflow Name",
  "nodes": [
    {
      "parameters": {
        // Node-specific configuration with reasonable defaults
      },
      "id": "node-1",
      "name": "Descriptive Node Name", 
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [300, 300],
      "continueOnFail": false,
      "retryOnFail": true,
      "maxTries": 3
    }
  ],
  "connections": {
    "Node Name": {
      "main": [[{"node": "Next Node", "type": "main", "index": 0}]]
    }
  },
  "active": false,
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "executionOrder": "v1"
  },
  "staticData": {},
  "tags": ["automation", "ai-generated"]
}
\`\`\`

# COMMON NODE TYPES:
- webhook: n8n-nodes-base.webhook
- http: n8n-nodes-base.httpRequest  
- function: n8n-nodes-base.function
- slack: n8n-nodes-base.slack
- gmail: n8n-nodes-base.gmail
- googleSheets: n8n-nodes-base.googleSheets
- telegram: n8n-nodes-base.telegram
- youtube: n8n-nodes-base.youtube
- scheduler: n8n-nodes-base.cron

# SOLUTION-FIRST APPROACH:
- Build first, explain later
- Use HTTP Request nodes for any external service
- Create functional workflows with placeholder credentials
- Provide implementation steps after the workflow
- Suggest enhancements and alternatives`;

  switch(action) {
    case 'generate':
      return basePrompt + `

# CURRENT TASK: CREATE WORKFLOW
Your response MUST include:
1. "Absolutely! I'll create that workflow for you."
2. Complete working n8n workflow JSON
3. Brief explanation of how it works
4. Implementation steps

NEVER say you "cannot" create something - find a way to make it work!`;

    case 'analyze':
      return basePrompt + `

# CURRENT TASK: ANALYZE WORKFLOW
Analyze this workflow and provide insights:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Focus on functionality and optimization opportunities.`;

    case 'edit':
      return basePrompt + `

# CURRENT TASK: MODIFY WORKFLOW
Modify this workflow based on user request:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Return the complete modified workflow JSON.`;

    default:
      return basePrompt + `

# CURRENT TASK: GENERAL ASSISTANCE
Help with n8n automation questions. Always be solution-focused.
Generate workflow JSON when specifically requested.`;
  }
}

function buildUserPrompt(message, action, selectedWorkflow) {
  switch(action) {
    case 'generate':
      return `Create a complete, working n8n workflow for: "${message}"

Requirements:
- Provide a functional workflow JSON that addresses the request
- Use reasonable assumptions for any missing details
- Include proper error handling and retry logic
- Add clear node names and descriptions
- Start your response with "Absolutely! I'll create that workflow for you."`;
    
    case 'analyze':
      return `Analyze this workflow and explain: ${message}`;
    
    case 'edit':
      return `Modify the workflow to: ${message}`;
    
    default:
      return message;
  }
}

function extractWorkflowFromContent(content) {
  try {
    console.log('Extracting workflow from content, length:', content.length);
    
    // Look for JSON code blocks
    const jsonMatches = content.match(/```json\s*([\s\S]*?)\s*```/g);
    
    if (jsonMatches) {
      console.log('Found', jsonMatches.length, 'JSON code blocks');
      
      for (const match of jsonMatches) {
        let jsonStr = match.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
        
        // Remove JavaScript-style comments from JSON
        jsonStr = jsonStr.replace(/\/\/.*$/gm, ''); // Remove single-line comments
        jsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
        
        // Clean up trailing commas and extra whitespace
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        jsonStr = jsonStr.replace(/\s+/g, ' ').trim(); // Normalize whitespace
        
        try {
          const parsed = JSON.parse(jsonStr);
          
          // Validate n8n workflow structure
          if (isValidN8nWorkflow(parsed)) {
            console.log('Found valid workflow with', parsed.nodes?.length || 0, 'nodes');
            return enhanceWorkflow(parsed);
          }
        } catch (e) {
          console.error('Error parsing JSON block:', e);
          console.log('Problematic JSON string:', jsonStr.substring(0, 500) + '...');
        }
      }
    }
    
    console.log('No valid workflow found in content');
    return null;
  } catch (e) {
    console.error('Error extracting workflow:', e);
    return null;
  }
}

function isValidN8nWorkflow(workflow) {
  return workflow &&
         workflow.nodes &&
         Array.isArray(workflow.nodes) &&
         workflow.nodes.length > 0 &&
         workflow.nodes.every(node => 
           node.type && 
           node.name && 
           node.id &&
           node.parameters !== undefined
         );
}

function enhanceWorkflow(workflow) {
  return {
    name: workflow.name || 'AI Generated Automation',
    nodes: workflow.nodes.map((node, index) => ({
      ...node,
      id: node.id || `node-${index + 1}`,
      position: node.position || [300 + (index * 200), 300],
      continueOnFail: node.continueOnFail ?? false,
      retryOnFail: node.retryOnFail ?? true,
      maxTries: node.maxTries ?? 3,
      typeVersion: node.typeVersion || 1
    })),
    connections: workflow.connections || {},
    active: false,
    settings: {
      saveExecutionProgress: true,
      saveManualExecutions: true,
      executionOrder: 'v1',
      ...workflow.settings
    },
    staticData: workflow.staticData || {},
    tags: workflow.tags || ['automation', 'ai-generated']
  };
}
