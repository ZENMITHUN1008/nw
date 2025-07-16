
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  path: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle different request types
    const url = new URL(req.url)
    const path = url.pathname

    if (path === '/connections') {
      // Get user's n8n connections
      const { data: connections, error } = await supabase
        .from('n8n_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        throw error
      }

      return new Response(JSON.stringify(connections), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // For proxy requests, parse the request body
    const requestData: RequestBody = await req.json()
    console.log('Request details:', { 
      path: requestData.path, 
      method: requestData.method, 
      hasBody: !!requestData.body 
    })

    // Get active n8n connection for user
    const { data: connections, error: connError } = await supabase
      .from('n8n_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (connError || !connections || connections.length === 0) {
      return new Response(JSON.stringify({ error: 'No active n8n connection found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const connection = connections[0]
    const baseUrl = connection.base_url.replace(/\/$/, '') // Remove trailing slash
    const apiKey = connection.api_key

    // Build the target URL
    let targetPath = requestData.path
    if (targetPath.startsWith('/proxy/')) {
      targetPath = targetPath.replace('/proxy', '')
    }
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath
    }

    const targetUrl = `${baseUrl}/api/v1${targetPath}`
    console.log(`Proxying ${requestData.method} request to: ${targetUrl}`)

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
      ...requestData.headers
    }

    // Make the request to n8n
    const fetchOptions: RequestInit = {
      method: requestData.method,
      headers,
    }

    if (requestData.body && ['POST', 'PUT', 'PATCH'].includes(requestData.method)) {
      fetchOptions.body = JSON.stringify(requestData.body)
    }

    const response = await fetch(targetUrl, fetchOptions)
    console.log(`N8N API response status: ${response.status}`)

    const responseText = await response.text()
    let responseData
    
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { message: responseText }
    }

    if (!response.ok) {
      console.error('N8N API error:', responseData)
      return new Response(JSON.stringify({ 
        error: `N8N API error: ${response.status}`, 
        details: responseData 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
