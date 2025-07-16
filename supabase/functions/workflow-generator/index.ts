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

// Available Gemini models in order of preference (fallback)
const GEMINI_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.0-pro'
];

// n8n node templates for different services
const nodeTemplates = {
  webhook: {
    type: "n8n-nodes-base.webhook",
    name: "Webhook",
    parameters: {
      httpMethod: "POST",
      path: "",
      options: {}
    }
  },
  http: {
    type: "n8n-nodes-base.httpRequest",
    name: "HTTP Request",
    parameters: {
      url: "",
      requestMethod: "GET",
      options: {}
    }
  },
  function: {
    type: "n8n-nodes-base.function",
    name: "Function",
    parameters: {
      functionCode: `// Add your JavaScript code here
return items.map(item => {
  return {
    json: {
      ...item.json,
      processed: true,
      timestamp: new Date().toISOString()
    }
  };
});`
    }
  },
  slack: {
    type: "n8n-nodes-base.slack",
    name: "Slack",
    parameters: {
      channel: "#general",
      text: "",
      username: "n8n-bot"
    }
  },
  gmail: {
    type: "n8n-nodes-base.gmail",
    name: "Gmail",
    parameters: {
      operation: "send",
      email: "",
      subject: "",
      message: ""
    }
  },
  googleSheets: {
    type: "n8n-nodes-base.googleSheets",
    name: "Google Sheets",
    parameters: {
      operation: "read",
      sheetId: "",
      range: "A1:Z1000"
    }
  },
  hubspot: {
    type: "n8n-nodes-base.hubspot",
    name: "HubSpot",
    parameters: {
      resource: "contact",
      operation: "get"
    }
  },
  airtable: {
    type: "n8n-nodes-base.airtable",
    name: "Airtable",
    parameters: {
      operation: "list",
      application: "",
      table: ""
    }
  },
  stripe: {
    type: "n8n-nodes-base.stripe",
    name: "Stripe",
    parameters: {
      resource: "charge",
      operation: "getAll"
    }
  }
};

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
    console.log('Request body:', requestBody);
    
    const { message, chatHistory = [], selectedWorkflow, action, workflowContext, credentials } = requestBody;
    
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
    
    // Fetch user's MCP servers
    const { data: mcpServers, error: mcpError } = await supabaseClient
      .from('mcp_servers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (mcpError) {
      console.error('Error fetching MCP servers:', mcpError);
    }

    // Build the enhanced prompt based on action type (keeping Claude prompts)
    const systemPrompt = buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials);
    const userPrompt = buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials);
    
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
    let geminiResponse = null;
    let currentModelIndex = 0;
    
    while (currentModelIndex < GEMINI_MODELS.length && !geminiResponse) {
      const currentModel = GEMINI_MODELS[currentModelIndex];
      console.log(`Trying model: ${currentModel}`);
      
      try {
        const response = await fetch(`${GEMINI_API_URL}/${currentModel}:streamGenerateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8000,
            }
          })
        });
        
        if (response.ok) {
          geminiResponse = response;
          console.log(`Successfully connected with model: ${currentModel}`);
          break;
        } else if (response.status === 429 || response.status === 503) {
          console.log(`Model ${currentModel} is overloaded, trying next model...`);
          currentModelIndex++;
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error with model ${currentModel}:`, error);
        currentModelIndex++;
      }
    }
    
    if (!geminiResponse) {
      throw new Error('All Gemini models are currently unavailable');
    }
    
    console.log('Gemini API response received, processing stream');
    
    // Read the complete response from Gemini
    const reader = geminiResponse.body?.getReader();
    if (!reader) {
      throw new Error('No reader available from Gemini response');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              
              // Handle Gemini response format
              if (parsed.candidates && parsed.candidates[0]?.content?.parts) {
                const textContent = parsed.candidates[0].content.parts[0]?.text || '';
                if (textContent) {
                  fullContent += textContent;
                }
              }
            } catch (e) {
              console.error('Error parsing Gemini response chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log('Gemini stream finished, full content length:', fullContent.length);
    
    // Extract workflow from content if available
    const workflowData = extractWorkflowFromContent(fullContent);
    
    // Return response in format expected by AI service
    return new Response(JSON.stringify({
      content: fullContent || 'I apologize, but I couldn\'t generate a response. Please try again with a more specific request.',
      workflow: workflowData,
      explanation: fullContent ? 'Response generated successfully' : 'No content generated',
      estimatedComplexity: workflowData ? 'medium' : 'low'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in AI workflow generator:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

function buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials) {
  const basePrompt = `You are WorkFlow AI, an expert n8n automation engineer. Your job is to create production-ready workflows FAST.

# CORE BEHAVIOR:
- Generate working n8n JSON immediately - NO explanations unless asked
- Start responses with "Here's your automation:" then provide JSON
- Use web search ONLY when you need current API docs or integration details
- Be direct, efficient, focused on delivery

# RESPONSE FORMAT:
Always respond with:
"Here's your automation:

\`\`\`json
{your workflow JSON here}
\`\`\`"

Only add explanations if user explicitly asks "explain" or "how does this work"

# N8N WORKFLOW STRUCTURE:
Generate complete JSON with this exact structure:

\`\`\`json
{
  "name": "Clear Workflow Name",
  "nodes": [
    {
      "parameters": {
        // Node-specific configuration
      },
      "id": "node-1",
      "name": "Descriptive Node Name", 
      "type": "n8n-nodes-base.webhook|httpRequest|function|slack|gmail|googleSheets|etc",
      "typeVersion": 1,
      "position": [x, y],
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

# OPTIMIZATION RULES:
1. **Credentials**: Use \`\{\{$credentials.CredentialName\}\}\` format
2. **Environment Variables**: Use \`\{\{$env.VARIABLE_NAME\}\}\`
3. **Node IDs**: Sequential (node-1, node-2, etc.)
4. **Positions**: Logical flow (start at [300, 300], space by [200, 0])
5. **Error Handling**: Always include retryOnFail: true, maxTries: 3
6. **Connections**: Proper main connections between nodes

# COMMON NODE PATTERNS:

**Webhook Trigger:**
\`\`\`json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "webhook-path",
    "responseMode": "onReceived"
  },
  "type": "n8n-nodes-base.webhook"
}
\`\`\`

**HTTP Request:**
\`\`\`json
{
  "parameters": {
    "url": "https://api.example.com/endpoint",
    "requestMethod": "GET",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest"
}
\`\`\`

**Function Node:**
\`\`\`json
{
  "parameters": {
    "functionCode": "return items.map(item => ({\\n  json: {\\n    ...item.json,\\n    processed: true\\n  }\\n}));"
  },
  "type": "n8n-nodes-base.function"
}
\`\`\`

**Slack:**
\`\`\`json
{
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#general",
    "text": "Alert: {{$json.message}}",
    "username": "n8n-alert"
  },
  "type": "n8n-nodes-base.slack"
}
\`\`\`

**Gmail:**
\`\`\`json
{
  "parameters": {
    "operation": "send",
    "email": "{{$json.recipient}}",
    "subject": "{{$json.subject}}",
    "message": "{{$json.body}}"
  },
  "type": "n8n-nodes-base.gmail"
}
\`\`\`

# WHEN TO SEARCH:
Use web search if user mentions:
- "latest API", "current documentation"  
- "new integration", "updated method"
- "best practices", "recommended approach"
- Specific service APIs you're uncertain about

${credentials ? `# AVAILABLE CREDENTIALS:
${Object.keys(credentials).map(key => `- ${key}: Ready to use`).join('\n')}` : ''}

# TASK-SPECIFIC BEHAVIOR:`;

  switch(action) {
    case 'generate':
      return basePrompt + `
Generate n8n workflow JSON for the user's automation request.
- Search for current docs if needed for APIs/integrations
- Respond: "Here's your automation:" + JSON
- No explanations unless user asks`;

    case 'analyze':
      return basePrompt + `
Analyze this workflow and provide concise insights:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Focus on:
- Performance optimization opportunities  
- Error handling improvements
- Missing connections or logic
- Security considerations`;

    case 'edit':
      return basePrompt + `
Modify this workflow based on user request:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Return complete modified workflow JSON with "Here's your updated automation:"`;

    default:
      return basePrompt + `
Help with n8n automation. Generate working JSON workflows immediately.`;
  }
}

// Enhanced user prompt builder
function buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials) {
  const credentialHint = credentials && Object.keys(credentials).length > 0 
    ? `\n\n[Available credentials: ${Object.keys(credentials).join(', ')}]` 
    : '';
  
  switch(action) {
    case 'generate':
      return `Build n8n automation: ${message}${credentialHint}`;
    
    case 'analyze':
      return `Analyze this workflow: ${message}${credentialHint}`;
    
    case 'edit':
      return `Modify workflow: ${message}${credentialHint}`;
    
    default:
      return `${message}${credentialHint}`;
  }
}

// Improved web search detection
function shouldUseWebSearch(message, action) {
  const searchTriggers = [
    // API/Documentation related
    'api documentation', 'api docs', 'latest api', 'current api',
    'integration guide', 'webhook setup', 'authentication method',
    
    // Version/Updates
    'latest version', 'new features', 'recent updates', 'current version',
    'deprecated', 'changelog',
    
    // Best practices
    'best practice', 'recommended way', 'optimal setup', 'proper configuration',
    
    // Specific integrations (when uncertain)
    'how to connect', 'integration steps', 'setup guide',
    
    // Comparison/Options
    'alternatives', 'comparison', 'which is better', 'options available'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // More targeted search triggers
  return searchTriggers.some(trigger => lowerMessage.includes(trigger)) ||
         (action === 'generate' && (
           lowerMessage.includes('latest') || 
           lowerMessage.includes('current') ||
           lowerMessage.includes('new integration') ||
           lowerMessage.includes('api endpoint')
         ));
}

// Enhanced workflow extraction with validation
function extractWorkflowFromContent(content) {
  try {
    console.log('Extracting workflow from content, length:', content.length);
    
    // Look for JSON code blocks
    const jsonMatches = content.match(/```json\s*([\s\S]*?)\s*```/g);
    
    if (jsonMatches) {
      console.log('Found', jsonMatches.length, 'JSON code blocks');
      
      for (const match of jsonMatches) {
        const jsonStr = match.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
        
        try {
          const parsed = JSON.parse(jsonStr);
          
          // Validate n8n workflow structure
          if (isValidN8nWorkflow(parsed)) {
            console.log('Found valid workflow with', parsed.nodes.length, 'nodes');
            
            // Enhance workflow with required fields
            return enhanceWorkflow(parsed);
          }
        } catch (e) {
          console.error('Error parsing JSON block:', e);
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

// Validate n8n workflow structure
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

// Enhance workflow with required fields
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
