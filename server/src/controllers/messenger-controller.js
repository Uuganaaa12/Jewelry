import https from 'https';
import OpenAI from 'openai';
import Product from '../models/Product.js';

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const CLIENT_URL = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
async function classifyIntent(text) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `Та үнэт эдлэлийн дэлгүүрийн AI туслах.
Хэрэглэгчийн мессежийг задлаад JSON буцаа:
{
  "intent": "search" | "question" | "greeting" | "other",
  "search_query": "хайлтын үг эсвэл null",
  "reply": "question/greeting/other бол Монголоор богино хариулт"
}
search: бараа хайж байна
question: үнэ, хүргэлт, буцаалт гэх мэт асуулт
greeting: мэндчилгээ`,
      },
      { role: 'user', content: text },
    ],
  });

  const raw = resp.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
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

  try {
    const intent = await classifyIntent(text);
    console.log(`[AI] intent: ${intent.intent} | query: ${intent.search_query}`);

    if (intent.intent === 'greeting') {
      await sendText(
        senderId,
        'Сайн байна уу! Luna Jewelry-д тавтай морилно уу.\n\n' +
        'Хайж буй бараагаа бичнэ үү:\n' +
        '• "алтан бөгж"\n• "мөнгөн зүүлт"\n• "хос бугуйвч"'
      );
      return;
    }

    if (intent.intent === 'question' && intent.reply) {
      await sendText(senderId, intent.reply);
      return;
    }

    // search эсвэл other → бараа хайна
    const query = intent.search_query || text;
    await sendText(senderId, `"${query}" хайж байна...`);

    const products = await searchProducts(query);

    if (!products.length) {
      await sendText(
        senderId,
        `"${query}" бараа олдсонгүй.\n\nӨөр үгээр хайж үзнэ үү.\nБүх бараа: ${CLIENT_URL}`
      );
      return;
    }

    await sendText(senderId, `${products.length} бараа олдлоо:`);
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
