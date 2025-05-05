export default {
  async fetch(request, env, ctx) {
    // 允许的源
    const allowedOrigins = [
      'https://i2ilab.github.io',
      'http://localhost:3000',
      'http://127.0.0.1:5500'
    ];

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 从原始请求中获取必要的信息
    const url = new URL(request.url);
    const targetUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    // 创建新的请求
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    try {
      const response = await fetch(modifiedRequest);
      
      // 创建新的响应头
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');

      // 在处理响应时，将 reasoning_content 和实际内容分开
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedReasoning = '';
      let accumulatedContent = '';

      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.choices[0].delta.reasoning_content) {
                accumulatedReasoning += data.choices[0].delta.reasoning_content;
              }
              if (data.choices[0].delta.content) {
                accumulatedContent += data.choices[0].delta.content;
              }
            } catch (e) {
              console.error('JSON parsing error:', e);
            }
          }
        }
      }

      // 返回组合后的响应
      return new Response(JSON.stringify({
        reasoning_content: accumulatedReasoning,
        content: accumulatedContent
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}; 