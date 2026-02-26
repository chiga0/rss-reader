export async function handler(event) {
  // 仅允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { userMessage, systemPrompt, stream = true } = JSON.parse(event.body);
    
    // 1. 组装消息体（在服务器端注入系统提示词，更安全）
    const messages = [
      { role: 'system', content: systemPrompt || '你是一个有用的助手。' },
      { role: 'user', content: userMessage }
    ];

    // 2. 调用大模型 API (以 OpenAI 兼容接口为例)
    const upstreamResponse = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'qwen3.5-plus',
        messages: messages,
        stream: stream, // 开启流式
      }),
    });

    // 3. 检查上游是否成功
    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return new Response(errorText, { 
        status: upstreamResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 返回流式响应 (关键：直接返回 Response 对象以启用 Netlify 流式支持)
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // 允许跨域
        'Access-Control-Allow-Origin': '*', 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}