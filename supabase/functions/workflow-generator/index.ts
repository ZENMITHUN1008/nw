
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API');

// Create Supabase client for logging
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function logToSystem(level: string, component: string, message: string, metadata: any = {}) {
  try {
    await supabase.from('system_logs').insert({
      log_level: level,
      component,
      message,
      metadata
    });
  } catch (error) {
    console.error('Failed to log to system:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logToSystem('info', 'workflow-generator', 'Request received', { 
      method: req.method,
      url: req.url 
    });

    if (!geminiApiKey) {
      await logToSystem('error', 'workflow-generator', 'GEMINI_API key not configured');
      return new Response(
        JSON.stringify({ error: 'GEMINI_API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { prompt, userContext } = await req.json();

    if (!prompt) {
      await logToSystem('warn', 'workflow-generator', 'Missing prompt in request');
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are an expert n8n workflow designer. Create detailed n8n workflows based on user requirements.

Important guidelines:
1. Always respond with valid JSON containing a workflow object
2. Include proper node configurations with realistic settings
3. Use appropriate n8n node types and connections
4. Provide clear descriptions and documentation
5. Ensure workflows are production-ready

User Context: ${JSON.stringify(userContext || {})}

Create a comprehensive n8n workflow for: ${prompt}

Respond ONLY with valid JSON in this format:
{
  "workflow": {
    "name": "Workflow Name",
    "description": "Detailed description",
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  },
  "explanation": "Step by step explanation of how the workflow works"
}`;

    await logToSystem('info', 'workflow-generator', 'Sending request to Gemini API', { 
      promptLength: prompt.length 
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: systemPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        await logToSystem('error', 'workflow-generator', 'Gemini API error', { 
          status: response.status,
          error: errorText 
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate workflow',
            details: `API responded with status ${response.status}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        await logToSystem('error', 'workflow-generator', 'Invalid response from Gemini API', { data });
        return new Response(
          JSON.stringify({ error: 'Invalid response from AI service' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Try to parse the JSON response
      let workflowData;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          workflowData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        await logToSystem('warn', 'workflow-generator', 'Failed to parse AI response as JSON', { 
          error: parseError.message,
          response: generatedText 
        });
        
        // Return a structured response even if parsing fails
        workflowData = {
          workflow: {
            name: "Generated Workflow",
            description: "AI-generated workflow based on your requirements",
            nodes: [],
            connections: {},
            settings: {}
          },
          explanation: generatedText
        };
      }

      await logToSystem('info', 'workflow-generator', 'Workflow generated successfully', { 
        workflowName: workflowData.workflow?.name || 'Unknown' 
      });

      return new Response(
        JSON.stringify(workflowData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        await logToSystem('error', 'workflow-generator', 'Request timeout');
        return new Response(
          JSON.stringify({ error: 'Request timeout - please try again' }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      await logToSystem('error', 'workflow-generator', 'Network error', { 
        error: fetchError.message 
      });
      
      return new Response(
        JSON.stringify({ error: 'Network error - please check your connection' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    await logToSystem('error', 'workflow-generator', 'Unexpected error', { 
      error: error.message,
      stack: error.stack 
    });
    
    console.error('Error in workflow-generator function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
