import { serve } from 'std/server'
import axios from 'axios'

// Supabase Edge Function to proxy Pudo shipping quotes securely.
// Deploy this function in your Supabase project and set PUDO_API_KEY as a
// project secret (not exposed to the browser).

serve(async (req) => {
  try {
    const body = await req.json();
    const PUDO_API_KEY = Deno.env.get('PUDO_API_KEY');
    const PUDO_API_URL = 'https://api.pudo.co.za/api/quote';

    if (!PUDO_API_KEY) {
      return new Response(JSON.stringify({ error: 'PUDO API key not configured on server' }), { status: 500 });
    }

    const response = await axios.post(PUDO_API_URL, body, {
      headers: {
        Authorization: `Bearer ${PUDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (err: any) {
    console.error('Edge function error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), { status: 502 });
  }
});
