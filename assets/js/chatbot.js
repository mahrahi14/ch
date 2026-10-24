/* The public page contains no provider key. Set RAHI_CHAT_API to a deployed Worker URL to enable optional Gemini replies. */
(() => {
  const apiBase = String(window.RAHI_CHAT_API || '').trim().replace(/\/+$/, '');
  const launch = document.getElementById('rchat-launch');
  const panel = document.getElementById('rchat-panel');
  const close = document.getElementById('rchat-close');
  const form = document.getElementById('rchat-form');
  const input = document.getElementById('rchat-input');
  const messages = document.getElementById('rchat-messages');
  const typing = document.getElementById('rchat-typing');
  const suggestions = document.getElementById('rchat-suggestions');
  if (!launch || !panel || !form) return;
  const history = [];
  const wa = 'https://wa.me/8801799072987?text=' + encodeURIComponent('Hello, I found you through your portfolio and would like to discuss a consultation.');
  const isBn = (text) => /[\u0980-\u09ff]/.test(text);

  function addMessage(text, who, actionLabel) {
    const row = document.createElement('div');
    row.className = 'rchat-row ' + who;
    const bubble = document.createElement('div');
    bubble.className = 'rchat-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    if (actionLabel) {
      const link = document.createElement('a');
      link.className = 'rchat-action'; link.href = wa; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = actionLabel; row.appendChild(link);
    }
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  function localAnswer(text) {
    const q = text.toLowerCase();
    const bn = isBn(text);
    const includesAny = (words) => words.some((word) => q.includes(word));
    if (includesAny(['price','pricing','fee','cost','charge','ফি','খরচ','মূল্য','চার্জ'])) return {
      text: bn ? 'এই পোর্টফোলিওতে নির্দিষ্ট ফি প্রকাশ করা নেই। গন্তব্য দেশ ও সেবার ধরন অনুযায়ী খরচ বদলাতে পারে—আপনার প্রয়োজন জানালে রাহির সঙ্গে সরাসরি আলোচনা করতে পারবেন।' : 'Specific fees are not published on this portfolio. Costs can vary by destination and service, so please contact Rahi to discuss your case.', action: true
    };
    if (includesAny(['contact','phone','email','whatsapp','appointment','consult','যোগাযোগ','ফোন','ইমেইল','হোয়াটসঅ্যাপ','হোয়াটসঅ্যাপ','অ্যাপয়েন্টমেন্ট','কথা বল','পরামর্শ'])) return {
      text: bn ? 'রাহির সঙ্গে ফোন, ইমেইল বা WhatsApp-এ যোগাযোগ করতে পারেন। ফোন: +880 1799-072987 · ইমেইল: mahrahi774@gmail.com।' : 'You can reach Rahi by phone, email or WhatsApp. Phone: +880 1799-072987 · Email: mahrahi774@gmail.com.', action: true
    };
    if (includesAny(['country','countries','destination','uk','schengen','malaysia','turkey','uae','কোন দেশ','দেশ','গন্তব্য'])) return {
      text: bn ? 'সাইটে UK, Schengen দেশগুলো, UAE, Malaysia, Turkey, Saudi Arabia, Qatar এবং অন্যান্য গন্তব্যের ভিসা পরামর্শের কথা বলা আছে। নির্দিষ্ট দেশের নিয়ম ও যোগ্যতা যাচাই করতে রাহির সঙ্গে যোগাযোগ করুন।' : 'The portfolio lists support for the UK, Schengen countries, UAE, Malaysia, Turkey, Saudi Arabia, Qatar and other destinations. Contact Rahi to check requirements for your specific case.', action: true
    };
    if (includesAny(['student','study','university','admission','education','স্টুডেন্ট','শিক্ষা','পড়াশোনা','পড়াশোনা','বিশ্ববিদ্যালয়','বিশ্ববিদ্যালয়','ভর্তি'])) return {
      text: bn ? 'শিক্ষার্থী পরামর্শে বিশ্ববিদ্যালয় নির্বাচন, ভর্তি-সংক্রান্ত সহায়তা, student visa processing এবং যাত্রার আগে প্রস্তুতির সহায়তা রয়েছে।' : 'Student support includes university selection, admission guidance, student visa processing and pre-departure planning.', action: true
    };
    if (includesAny(['work permit','work visa','job','employment','relocation','কাজের','ওয়ার্ক','ওয়ার্ক','চাকরি','কর্ম'])) return {
      text: bn ? 'Work permit সেবা আবেদনের সহায়তা, employer sponsorship-এর প্রয়োজনীয়তা এবং relocation planning নিয়ে। চাকরি বা ভিসা অনুমোদনের নিশ্চয়তা দেওয়া হয় না।' : 'Work-permit support covers application guidance, employer-sponsorship requirements and relocation planning. No job or visa approval is guaranteed.', action: true
    };
    if (includesAny(['success rate','approval','guarantee','approved','সফলতার হার','অনুমোদন','গ্যারান্টি','নিশ্চিত'])) return {
      text: bn ? 'ভিসা অনুমোদন কোনো কনসালট্যান্ট নিশ্চিত করতে পারেন না; সিদ্ধান্ত সংশ্লিষ্ট কর্তৃপক্ষের। আবেদন প্রস্তুতি ও যোগ্যতা নিয়ে নির্দিষ্ট পরামর্শের জন্য সরাসরি যোগাযোগ করুন।' : 'No consultant can guarantee a visa decision; the relevant authority makes that decision. Contact Rahi for guidance on preparing your specific application.', action: true
    };
    if (includesAny(['service','services','visa','immigration','consultancy','সেবা','ভিসা','ইমিগ্রেশন','পরামর্শ'])) return {
      text: bn ? 'পোর্টফোলিওতে visa processing, immigration consultancy, student consultancy, work permit guidance, business consultancy ও digital services উল্লেখ আছে। কোনটি আপনার দরকার?' : 'The portfolio lists visa processing, immigration consultancy, student consultancy, work-permit guidance, business consultancy and digital services. Which one are you looking for?', action: true
    };
    if (includesAny(['about','who','rahi','halim','founder','কী করেন','কে','পরিচয়','পরিচয়'])) return {
      text: bn ? 'M A Halim Rahi সিলেটভিত্তিক visa ও immigration consultant এবং Success Incorporation-এর founder। পোর্টফোলিওতে corporate travel ও business consultancy-ও তুলে ধরা হয়েছে।' : 'M A Halim Rahi is a Sylhet-based visa and immigration consultant and the founder of Success Incorporation. His portfolio also covers corporate travel and business consultancy.', action: true
    };
    return {
      text: bn ? 'আমি ভিসা ও ইমিগ্রেশন সেবা, student application, work permit, ফি-সংক্রান্ত তথ্য এবং যোগাযোগের উপায় জানাতে পারি। আপনার কেসের বিস্তারিত WhatsApp-এ আলোচনা করুন—সংবেদনশীল নথি এখানে পাঠাবেন না।' : 'I can help with visa and immigration services, student applications, work permits, fee enquiries and contact details. For case-specific guidance, use WhatsApp; please do not share sensitive documents here.', action: true
    };
  }

  async function askRemote(text) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(apiBase + '/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-8) }), signal: controller.signal
      });
      if (!response.ok) throw new Error('AI endpoint unavailable');
      const data = await response.json();
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty AI reply');
      return data.reply.trim();
    } finally { clearTimeout(timeout); }
  }

  async function send(text) {
    const clean = String(text || '').trim().slice(0, 1000);
    if (!clean) return;
    addMessage(clean, 'user');
    if (suggestions) suggestions.remove();
    input.value = ''; input.disabled = true;
    typing.hidden = false;
    let reply, action = false;
    try {
      if (apiBase) reply = await askRemote(clean);
      else { const local = localAnswer(clean); reply = local.text; action = local.action; }
    } catch (error) {
      const local = localAnswer(clean); reply = local.text; action = true;
      if (apiBase) reply += isBn(clean) ? '\n\nAI সেবা সাময়িকভাবে পাওয়া যাচ্ছে না—এখন সাধারণ তথ্য দেখানো হলো।' : '\n\nAI is temporarily unavailable, so here is the standard portfolio guidance.';
    } finally {
      typing.hidden = true; input.disabled = false; input.focus();
    }
    addMessage(reply, 'bot', action ? (isBn(clean) ? 'WhatsApp-এ যোগাযোগ' : 'Continue on WhatsApp') : '');
    history.push({ role: 'user', text: clean }, { role: 'assistant', text: reply });
    if (history.length > 16) history.splice(0, history.length - 16);
  }

  function openPanel() { panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); launch.setAttribute('aria-label', 'Close chat assistant'); setTimeout(() => input.focus(), 80); }
  function closePanel() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-label', 'Open chat assistant'); launch.focus(); }
  launch.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  close.addEventListener('click', closePanel);
  form.addEventListener('submit', (event) => { event.preventDefault(); send(input.value); });
  document.querySelectorAll('.rchat-suggestions [data-question]').forEach((button) => button.addEventListener('click', () => send(button.dataset.question)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) closePanel(); });
})();
