import https from 'https';
import OpenAI from 'openai';
import Product from '../models/Product.js';

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const CLIENT_URL = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

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
  "intent": "search" | "question" | "purchase" | "greeting" | "other",
  "search_query": "хайлтын үг эсвэл null",
  "reply": "question/greeting/other/purchase бол Монголоор богино хариулт"
}
search: тодорхой бараа хайж байна (бараа нэр, төрөл, материал дурдсан)
question: үнэ, хүргэлт, буцаалт, харьцуулалт гэх мэт асуулт
purchase: "авмаар байна", "захиалмаар байна", "авна", "авч болох уу", "захиалах" гэх мэт худалдан авах хүсэл
greeting: мэндчилгээ
ЧУХАЛ: Өмнөх харилцааг ашиглан контекстыг ойлго. "авмаар байна" гэхэд search биш purchase.`,
      },
      ...history,
      { role: 'user', content: text },
    ],
  });

  const raw = resp.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

async function answerWithContext(text, history) {
  // Бодит бараа, үнийг DB-с авна
  const products = await Product.find({ stock: { $gt: 0 } })
    .select('name price salePrice saleActive tags description')
    .sort({ price: -1 })
    .limit(15)
    .lean();

  const productList = products
    .map(p => {
      const price = p.saleActive && p.salePrice ? `${p.salePrice.toLocaleString()}₮ (хямдарсан)` : `${p.price.toLocaleString()}₮`;
      return `- ${p.name}: ${price}`;
    })
    .join('\n');

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content: `Та Luna Jewelry үнэт эдлэлийн дэлгүүрийн AI туслах.
Манай дэлгүүрийн БОДИТ бараа болон үнэ (үнэтэйгээс хямдруу):
${productList}

Дэлгүүрийн сайт: ${CLIENT_URL}

ЧУХАЛ:
- Зөвхөн дээрх жагсаалтаас бодит үнийг ашигла
- Hallucinate хийхгүй, жагсаалтад байхгүй бол "тодорхойгүй" гэ
- Монголоор товч, тодорхой хариул
- Өмнөх ярианы контекстыг харгалз`,
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
      const reply = await answerWithContext(text, history);
      addHistory(senderId, 'assistant', reply);
      await sendText(senderId, reply);
      return;
    }

    if (intent.intent === 'purchase') {
      // History-с assistant-ын сүүлийн мессежэд дурдсан бараа нэрийг олно
      const assistantMsgs = history.filter(m => m.role === 'assistant');
      const lastAssistant = assistantMsgs[assistantMsgs.length - 1]?.content || '';

      // DB-с бүх бараа авж, хамгийн тохирохыг нэрээр хайна
      const allProducts = await Product.find({ stock: { $gt: 0 } })
        .select('name price salePrice saleActive _id')
        .lean();

      // Сүүлийн assistant мессежэд нэр нь орсон бараа
      const matched = allProducts.find(p =>
        lastAssistant.toLowerCase().includes(p.name.toLowerCase())
      );

      let reply;
      if (matched) {
        const price = matched.saleActive && matched.salePrice ? matched.salePrice : matched.price;
        reply = `${matched.name} авахын тулд дор хаяна сайтаар орж захиалаарай:\n${CLIENT_URL}/products/${matched._id}\n\nҮнэ: ${price.toLocaleString()}₮`;
      } else {
        reply = `Захиалгын тулд манай сайтаар орно уу:\n${CLIENT_URL}/shop/products`;
      }
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
