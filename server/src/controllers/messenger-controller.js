import https from 'https';
import OpenAI from 'openai';
import Product from '../models/Product.js';

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const CLIENT_URL = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Хэрэглэгч бүрийн харилцааны түүх (in-memory, 30 мин TTL) ──
const convHistory = new Map();
const HISTORY_TTL = 30 * 60 * 1000; // 30 минут

function getHistory(senderId) {
  const entry = convHistory.get(senderId);
  if (!entry || Date.now() - entry.ts > HISTORY_TTL) return [];
  return entry.msgs;
}

function addHistory(senderId, role, content) {
  const prev = getHistory(senderId);
  const msgs = [...prev, { role, content }].slice(-10); // сүүлийн 10 мессеж
  convHistory.set(senderId, { msgs, ts: Date.now() });
}

// ── Mongolian keyword → search terms ─────────────────────
const MN_DICT = {
  'бөгж':    ['бөгж', 'ring'],
  'зүүлт':  ['зүүлт', 'earring'],
  'бугуйвч':['бугуйвч', 'bracelet'],
  'гинж':   ['гинж', 'necklace', 'chain'],
  'зүүн':   ['зүүн', 'pendant'],
  'алт':    ['алт', 'алтан', 'gold'],
  'алтан':  ['алтан', 'алт', 'gold'],
  'мөнгө':  ['мөнгө', 'мөнгөн', 'silver'],
  'мөнгөн': ['мөнгөн', 'мөнгө', 'silver'],
  'хаш':    ['хаш', 'jade'],
  'чулуу':  ['чулуу', 'stone', 'gem'],
  'эрдэнэ': ['эрдэнэ', 'gem', 'stone'],
  'тэмдэг': ['тэмдэг', 'symbol'],
  'хосын':  ['хос', 'couple', 'pair'],
  'хос':    ['хос', 'couple', 'pair'],
  'нарийн': ['нарийн', 'thin', 'delicate'],
  'том':    ['том', 'big', 'large'],
  'жижиг':  ['жижиг', 'small', 'mini'],
  'эмэгтэй':['эмэгтэй', 'women', 'female'],
  'эрэгтэй':['эрэгтэй', 'men', 'male'],
  'хүүхэд': ['хүүхэд', 'kids', 'children'],
  'хямд':   ['хямд', 'sale', 'discount'],
  'шинэ':   ['шинэ', 'new'],
};

function expandKeywords(text) {
  const words = text.toLowerCase().split(/\s+/);
  const terms = new Set(words);
  for (const word of words) {
    for (const [mn, extras] of Object.entries(MN_DICT)) {
      if (word.includes(mn) || mn.includes(word)) {
        extras.forEach(e => terms.add(e));
      }
    }
  }
  return [...terms].filter(t => t.length > 1);
}

// ── AI: мессежийн төрлийг тодорхойлно ────────────────────
async function classifyIntent(text, history = []) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `Та үнэт эдлэлийн дэлгүүрийн AI туслах.
Өмнөх харилцааны контекстыг харгалзан хэрэглэгчийн мессежийг задлаад JSON буцаа:
{
  "intent": "search" | "question" | "greeting" | "other",
  "search_query": "хайлтын үг эсвэл null",
  "reply": "question/greeting/other бол Монголоор богино хариулт"
}
search: бараа хайж байна
question: үнэ, хүргэлт, буцаалт, харьцуулалт гэх мэт асуулт
greeting: мэндчилгээ
ЧУХАЛ: Өмнөх харилцааг ашиглан контекстоо ойлго. "аль нь үнэтэй" гэхэд өмнөх бараануудыг харгалз.`,
      },
      ...history,
      { role: 'user', content: text },
    ],
  });

  const raw = resp.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

async function answerWithContext(text, history) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `Та Luna Jewelry үнэт эдлэлийн дэлгүүрийн AI туслах.
Өмнөх харилцааны контекстыг ашиглан Монголоор товч, тодорхой хариул.
Үнэ, хүргэлт, харьцуулалт, зөвлөгөөний асуултад мэдлэгтэйгээр хариул.
CLIENT_URL: ${CLIENT_URL}`,
      },
      ...history,
      { role: 'user', content: text },
    ],
  });
  return resp.choices[0].message.content.trim();
}

// ── Search products in MongoDB ────────────────────────────
async function searchProducts(query) {
  const terms = expandKeywords(query);
  const conditions = terms.map(t => {
    const pat = { $regex: t, $options: 'i' };
    return { $or: [{ name: pat }, { tags: pat }, { description: pat }] };
  });

  return Product.find({ $or: conditions, stock: { $gt: 0 } })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
}

// ── Format price ──────────────────────────────────────────
function fmtPrice(p) {
  return p.toLocaleString('mn-MN') + '₮';
}

// ── Build Messenger Generic Template elements ─────────────
function buildElements(products) {
  return products.slice(0, 5).map(p => {
    const subtitle = p.saleActive && p.salePrice
      ? `${fmtPrice(p.salePrice)} (${fmtPrice(p.price)}-с хямдарсан)`
      : fmtPrice(p.price);

    return {
      title: p.name,
      subtitle,
      image_url: p.images?.[0] || '',
      default_action: {
        type: 'web_url',
        url: `${CLIENT_URL}/products/${p._id}`,
        webview_height_ratio: 'tall',
      },
      buttons: [
        {
          type: 'web_url',
          url: `${CLIENT_URL}/products/${p._id}`,
          title: 'Дэлгэрэнгүй харах',
        },
      ],
    };
  });
}

// ── Send message via Graph API ────────────────────────────
function callGraphAPI(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, res => {
      let buf = '';
      res.on('data', c => (buf += c));
      res.on('end', () => resolve(JSON.parse(buf)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendText(recipientId, text) {
  return callGraphAPI({ recipient: { id: recipientId }, message: { text } });
}

async function sendProductCards(recipientId, products) {
  const elements = buildElements(products);
  if (!elements.length) return;
  return callGraphAPI({
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: 'template',
        payload: { template_type: 'generic', elements },
      },
    },
  });
}

// ── Handle one incoming message ───────────────────────────
async function handleMessage(senderId, messageText) {
  if (!messageText?.trim()) return;
  const text = messageText.trim();

  // Түүхийг ачаална
  const history = getHistory(senderId);
  addHistory(senderId, 'user', text);

  try {
    const intent = await classifyIntent(text, history);
    console.log(`[AI] intent: ${intent.intent} | query: ${intent.search_query}`);

    if (intent.intent === 'greeting') {
      const reply = 'Сайн байна уу! Luna Jewelry-д тавтай морилно уу.\n\nХайж буй бараагаа бичнэ үү:\n• "алтан бөгж"\n• "мөнгөн зүүлт"\n• "хос бугуйвч"';
      addHistory(senderId, 'assistant', reply);
      await sendText(senderId, reply);
      return;
    }

    if (intent.intent === 'question') {
      // Контекстыг харгалзан AI-аар хариулт үүсгэнэ
      const reply = await answerWithContext(text, history);
      addHistory(senderId, 'assistant', reply);
      await sendText(senderId, reply);
      return;
    }

    // search эсвэл other → бараа хайна
    const query = intent.search_query || text;
    await sendText(senderId, `"${query}" хайж байна...`);

    const products = await searchProducts(query);

    if (!products.length) {
      const reply = `"${query}" бараа олдсонгүй.\n\nӨөр үгээр хайж үзнэ үү.\nБүх бараа: ${CLIENT_URL}`;
      addHistory(senderId, 'assistant', reply);
      await sendText(senderId, reply);
      return;
    }

    const foundMsg = `${products.length} бараа олдлоо:`;
    addHistory(senderId, 'assistant', foundMsg + ' ' + products.map(p => p.name).join(', '));
    await sendText(senderId, foundMsg);
    await sendProductCards(senderId, products);

  } catch (err) {
    console.error('[Messenger] error:', err.message);
    // AI алдаартай бол keyword search-рүү буцна
    try {
      const products = await searchProducts(text);
      if (products.length) {
        await sendText(senderId, `${products.length} бараа олдлоо:`);
        await sendProductCards(senderId, products);
      } else {
        await sendText(senderId, 'Түр алдаа гарлаа. Дахин оролдоно уу.');
      }
    } catch {
      await sendText(senderId, 'Түр алдаа гарлаа. Дахин оролдоно уу.');
    }
  }
}

// ── Webhook verification (GET) ────────────────────────────
export function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    console.log('[Messenger] Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
}

// ── Webhook event handler (POST) ─────────────────────────
export async function handleWebhook(req, res) {
  const body = req.body;
  if (body.object !== 'page') return res.sendStatus(404);

  res.sendStatus(200);

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;
      if (!senderId) continue;

      if (event.message && !event.message.is_echo) {
        console.log(`[Messenger] From ${senderId}: ${event.message.text}`);
        await handleMessage(senderId, event.message.text);
      }

      if (event.postback) {
        await handleMessage(senderId, event.postback.payload);
      }
    }
  }
}
