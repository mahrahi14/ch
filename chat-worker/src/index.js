const minuteBuckets = new Map();

const json = (body, status, origin, allowed) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin'
  };
  if (origin && allowed) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return new Response(JSON.stringify(body), { status, headers });
};

function originAllowed(origin, env) {
  if (!origin) return false;
  const list = String(env.ALLOWED_ORIGINS || 'https://rahi.bro.bd')
    .split(',').map((item) => item.trim()).filter(Boolean);
  return list.includes(origin);
}

function allowRequest(ip) {
  const now = Date.now();
  const key = ip || 'unknown';
  const existing = minuteBuckets.get(key);
  if (!existing || now - existing.start >= 60_000) {
    minuteBuckets.set(key, { start: now, count: 1 });
  } else if (existing.count >= 12) {
    return false;
  } else {
    existing.count += 1;
  }
  if (minuteBuckets.size > 3000) {
    for (const [client, bucket] of minuteBuckets) {
      if (now - bucket.start > 120_000) minuteBuckets.delete(client);
    }
  }
  return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = originAllowed(origin, env);
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      }});
    }
    if (!allowed) return json({ error: 'Origin not allowed' }, 403, null, false);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'rahi-portfolio-chat' }, 200, origin, true);
    }
    if (url.pathname !== '/chat' || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, origin, true);
    }
    if (!env.GEMINI_API_KEY) return json({ error: 'Chat service is not configured' }, 503, origin, true);
    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > 12_000) return json({ error: 'Message is too large' }, 413, origin, true);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!allowRequest(ip)) return json({ error: 'Too many requests. Please try again shortly.' }, 429, origin, true);

    let payload;
    try { payload = await request.json(); }
    catch { return json({ error: 'Invalid JSON' }, 400, origin, true); }
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message || message.length > 1000) return json({ error: 'Message must be 1–1000 characters' }, 400, origin, true);

    const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
    const contents = [];
    for (const item of history) {
      if (!item || !['user', 'assistant'].includes(item.role) || typeof item.text !== 'string') continue;
      const text = item.text.trim().slice(0, 700);
      if (text) contents.push({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text }] });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const systemInstruction = `You are the portfolio guide for M A Halim Rahi. Reply in the language the visitor uses, English or Bengali. Be concise, friendly, and factual. Use only this verified portfolio context: Rahi is a Sylhet-based visa and immigration consultant and founder of Success Incorporation. Services include visa processing, immigration consultancy, student consultancy, work permit guidance, business consultancy, digital services, and corporate travel. Listed destinations include the UK, Schengen countries, UAE, Malaysia, Turkey, Saudi Arabia, and Qatar. Contact: phone +8801799072987, email mahrahi774@gmail.com, WhatsApp https://wa.me/8801799072987. Do not invent prices, timelines, credentials, legal conclusions, or success guarantees. Visa decisions belong to government authorities; never promise approval or employment. For personal case assessment, direct visitors to WhatsApp or email. Never ask them to provide passport numbers, bank details, passwords, or sensitive documents in chat. If asked about a fact not in this context, say you do not have that information and suggest contacting Rahi.`;

    const model = String(env.GEMINI_MODEL || 'gemini-2.5-flash-lite');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
    let upstream;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.35, maxOutputTokens: 420 }
        })
      });
    } catch {
      return json({ error: 'AI provider is temporarily unavailable' }, 502, origin, true);
    }
    if (!upstream.ok) return json({ error: 'AI provider is temporarily unavailable' }, 502, origin, true);
    let result;
    try { result = await upstream.json(); }
    catch { return json({ error: 'Invalid response from AI provider' }, 502, origin, true); }
    const reply = result?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!reply) return json({ error: 'No reply generated' }, 502, origin, true);
    return json({ reply: reply.slice(0, 4000) }, 200, origin, true);
  }
};
