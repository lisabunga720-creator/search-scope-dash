import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Domain is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessId = Deno.env.get('MOZ_ACCESS_ID');
    const secretKey = Deno.env.get('MOZ_SECRET_KEY');

    if (!accessId || !secretKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Moz API keys" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const basicAuth = btoa(`${accessId}:${secretKey}`);

    const mozResponse = await fetch("https://lsapi.seomoz.com/v2/url_metrics", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targets: [domain]
      }),
    });

    if (!mozResponse.ok) {
      const errorText = await mozResponse.text();
      return new Response(
        JSON.stringify({ error: `Moz API error: ${errorText}` }),
        { status: mozResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mozData = await mozResponse.json();
    const resultItem = mozData.results?.[0] || {};
    const domainAuthority = resultItem.domain_authority ?? 0;

    return new Response(
      JSON.stringify({ domain, da: domainAuthority }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});