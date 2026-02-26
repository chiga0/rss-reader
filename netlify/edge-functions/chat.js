/**
 * Netlify Edge Function – AI Chat Proxy
 *
 * 为什么用 Edge Function 而不是普通 Function：
 * - 普通 Function 免费计划超时 10s，完全不够 AI 流式响应
 * - Edge Function 免费计划支持（每月 300 万次），流式响应无严格超时
 * - 基于 Deno 运行，原生支持 Web Streams API
 *
 * 路由: /api/chat（在 netlify.toml 中配置）
 */

export default async function handler(req) {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders(),
    });
  }

  try {
    const { userMessage, systemPrompt, stream = true } = await req.json();

    const aiBaseUrl = (Deno.env.get('AI_BASE_URL') || 'https://api.openai.com/v1').replace(/\/$/, '');
    const aiApiKey = Deno.env.get('AI_API_KEY');
    const aiModel = Deno.env.get('AI_MODEL') || 'gpt-4o-mini';

    if (!aiApiKey) {
      return jsonResponse({ error: 'AI_API_KEY is not configured on the server' }, 500);
    }

    // 在服务器端组装消息体，API Key 不暴露给客户端
    const messages = [
      { role: 'system', content: systemPrompt || '你是一个有用的助手。' },
      { role: 'user', content: userMessage },
    ];

    const upstreamResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        stream,
      }),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return new Response(errorText, {
        status: upstreamResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // 直接将上游响应体透传给客户端
    // Edge Function 流式响应没有严格超时 —— 只要数据持续流动，连接就不会断开
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        'Content-Type': stream ? 'text/event-stream' : 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: message }, 500);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
