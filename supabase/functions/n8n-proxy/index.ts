
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    await logToSystem('info', 'n8n-proxy', 'Request received', { 
      method: req.method,
      url: req.url 
    });

    const { baseUrl, apiKey, endpoint, method = 'GET', body } = await req.json();

    if (!baseUrl || !apiKey || !endpoint) {
      await logToSystem('warn', 'n8n-proxy', 'Missing required parameters', { 
        hasBaseUrl: !!baseUrl,
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint 
      });
      
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: baseUrl, apiKey, and endpoint are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct the full URL
    const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    await logToSystem('info', 'n8n-proxy', 'Making request to n8n instance', { 
      url,
      method 
    });

    const requestOptions: RequestInit = {
      method,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    requestOptions.signal = controller.signal;

    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            await logToSystem('error', 'n8n-proxy', 'Request timeout', { 
              url,
              retryCount 
            });
            return new Response(
              JSON.stringify({ error: 'Request timeout - n8n instance may be unreachable' }),
              { 
                status: 408, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          await logToSystem('error', 'n8n-proxy', 'Connection failed after retries', { 
            url,
            error: error.message,
            retryCount 
          });
          
          return new Response(
            JSON.stringify({ 
              error: 'Failed to connect to n8n instance',
              details: 'Please check your n8n instance URL and API key'
            }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      await logToSystem('error', 'n8n-proxy', 'n8n API error', { 
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url 
      });

      let errorMessage = 'Request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid API key or authentication failed';
      } else if (response.status === 404) {
        errorMessage = 'Endpoint not found - check your n8n instance URL';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden - check API key permissions';
      } else if (response.status >= 500) {
        errorMessage = 'n8n instance server error';
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: response.status,
          details: errorText || response.statusText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      await logToSystem('warn', 'n8n-proxy', 'Failed to parse response as JSON', { 
        response: responseText.slice(0, 200) 
      });
      responseData = { data: responseText };
    }

    await logToSystem('info', 'n8n-proxy', 'Request completed successfully', { 
      status: response.status,
      url 
    });

    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    await logToSystem('error', 'n8n-proxy', 'Unexpected error', { 
      error: error.message,
      stack: error.stack 
    });
    
    console.error('Error in n8n-proxy function:', error);
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
