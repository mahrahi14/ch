# M A Halim Rahi — Multi-page Spatial Portfolio

এটি একটি static, বহু-পৃষ্ঠার portfolio site। Home, Education, Skills এবং Work History আলাদা HTML page; পুরোনো portfolio-র বাকি বিভাগগুলোও তাদের নিজস্ব page-এ রাখা হয়েছে। GitHub Pages-এর জন্য deploy workflow যুক্ত আছে।

## Page map

- `index.html` — Home ও About
- `education.html` — Education
- `skills.html` — Skills
- `work-history.html` — Work History / Professional Experience
- `companies.html` — Companies
- `services.html` — Services
- `portfolio.html` — Portfolio
- `gallery.html` — Gallery
- `achievements.html` — Achievements
- `testimonials.html` — Testimonials
- `faq.html` — FAQs
- `contact.html` — Contact

সব page-এ একই navigation, visual style এবং chatbot আছে। Shared stylesheet ও scripts `assets/`-এ; প্রতিটি পেজ `index.html` থেকে স্বতন্ত্রভাবে খোলে।

## GitHub Pages চালু করা

1. GitHub-এ repository তৈরি করে এই folder-এর সব ফাইল commit/push করুন। Workflow file-সহ `main` branch-এ push করুন।
2. Repository → **Settings → Pages** খুলে **Source: GitHub Actions** নির্বাচন করুন। **Actions** tab-এ deployment সফল হওয়া পর্যন্ত অপেক্ষা করুন। Workflow সব HTML page এবং shared `assets/` upload করে।
3. **Settings → Pages → Custom domain**-এ `rahi.bro.bd` লিখুন। HTTPS certificate প্রস্তুত হলে **Enforce HTTPS** চালু করুন। নিয়মগুলো [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)-এ আছে।
4. DNS provider-এ `rahi` host/name-এর জন্য CNAME record তৈরি করে target হিসেবে আপনার GitHub account-এর `<YOUR-USERNAME>.github.io` দিন—repository-র নাম যোগ করবেন না। GitHub-এর [subdomain DNS guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) অনুযায়ী subdomain CNAME-কে account/org-এর `.github.io` address-এ point করতে হয়।

**`rahi.bro.bd` যদি বর্তমানে অন্য hosting-এ live থাকে, DNS record বদলালে ওই hostname-এর traffic GitHub Pages-এ চলে যাবে।** আগে GitHub deployment ও সব page যাচাই করুন, তারপর DNS পরিবর্তনের সময় পরিকল্পনা করুন। এই package DNS record বদলায়নি।

## Chatbot

“Ask Rahi” widget-এর local FAQ mode সঙ্গে সঙ্গে কাজ করে; API key বা server লাগে না। এটি পোর্টফোলিওর প্রকাশিত তথ্য থেকে বাংলা/English উত্তর দেয় এবং ব্যক্তিগত case-এর জন্য WhatsApp-এ পাঠায়। Local mode-এ chat history browser refresh হলে মুছে যায়।

ঐচ্ছিক AI উত্তর চালাতে Gemini API key এবং Cloudflare Worker deploy করুন। Gemini API-র বর্তমান মূল্যতথ্যে `gemini-2.5-flash-lite`-এর input/output free tier দেখানো আছে; quota model ও project অনুযায়ী বদলায়: [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) এবং [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Google-এর free tier-এ prompt product improvement-এ ব্যবহার হতে পারে, তাই visitor-কে sensitive information না দিতে সতর্ক করা হয়।

1. [Google AI Studio](https://aistudio.google.com/) থেকে API key নিন। Key কোনো HTML, JavaScript বা GitHub file-এ বসাবেন না।
2. Cloudflare Workers-এ `chat-worker/` deploy করুন। Wrangler ব্যবহার করে:

   ```bash
   cd chat-worker
   npx wrangler login
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler deploy
   ```

   Secret prompt-এ key দিন। `chat-worker/wrangler.toml`-এর `ALLOWED_ORIGINS`-এ আপনার site-এর exact origin (`https://rahi.bro.bd`) রাখুন।
3. Deploy শেষে পাওয়া Worker URL `assets/js/config.js`-এ `window.RAHI_CHAT_API = "";`-এর জায়গায় বসান, যেমন `https://rahi-portfolio-chat.<account>.workers.dev`। `/chat` যোগ করবেন না। File commit/push করুন।
4. `https://<YOUR-WORKER>.workers.dev/health` খুলে Worker সচল কি না দেখুন। `{ "ok": true }` এলে configured website থেকে chat পরীক্ষা করুন।

Cloudflare-এর Free Workers plan-এ বর্তমানে 100,000 request/day limit আছে। Worker-এর in-memory IP throttle best-effort, পূর্ণাঙ্গ abuse protection নয়। Public usage বাড়লে Turnstile ও durable rate-limit store যোগ করুন: [Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/).

## দরকারি কথা

AI assistant সাধারণ portfolio guide; এটি legal/immigration advice নয় এবং visa/job approval নিশ্চিত করে না। AI mode চালু হলে প্রশ্ন Cloudflare Worker হয়ে Google Gemini-তে যায়। Passport, bank details, password বা sensitive case document chat-এ দেবেন না। GitHub Pages static site host করে; Gemini proxy Cloudflare Worker-এ চলে। Portfolio-র মূল ছবি ও Google Fonts মূল source-এর external URLs থেকে লোড হয়।
