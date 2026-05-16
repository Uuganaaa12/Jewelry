import OpenAI from 'openai';
import Product from '../models/Product.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_BASE = `Чи бол Luna Jewelry үнэт эдлэлийн дэлгүүрийн AI туслах.
Алт, мөнгө, эрдэнэ чулуу, үнэт эдлэл, бэлэг сэлт, арчилгаа зэрэг бүх асуултад хариулна.
Монгол хэлээр товч, найрсаг байдлаар хариулна.

ДЭЛГҮҮРИЙН МЭДЭЭЛЭЛ:
- Ажлын цаг: Даваа-Баасан 09:00-18:00, Бямба 10:00-16:00, Ням амарна
- Хаяг: Улаанбаатар хот
- Хүргэлт: Улаанбаатар дотор хийдэг
- Буцаалт: Худалдан авснаас хойш 7 хоногийн дотор буцааж болно
- Facebook: https://www.facebook.com/profile.php?id=61589657196447

ЧУХАЛ ДҮРМҮҮД:
- "найз охин", "охин", "эмэгтэй", "охид" гэвэл эмэгтэйд тохирох бараа санал болго
- "найз залуу", "залуу", "эрэгтэй", "хүү" гэвэл эрэгтэйд тохирох бараа санал болго
- Хэрэглэгчийн контекстыг анхааралтай уншиж, хүйсийг зөв тодорхойл
- Бараануудын жагсаалтаас tags болон description-ыг ашиглан хамгийн тохирохыг санал болго`;

async function getProducts() {
  const products = await Product.find({ stock: { $gt: 0 } })
    .select('name price salePrice saleActive tags description images _id')
    .limit(20)
    .lean();
  return products;
}

function matchProducts(products, reply) {
  const lower = reply.toLowerCase();
  return products
    .filter(
      p =>
        lower.includes(p.name.toLowerCase()) ||
        (p.tags || []).some(t => lower.includes(t.toLowerCase())),
    )
    .slice(0, 5);
}

function buildPrompt(message, mode, history) {
  const msgs = [];

  if (mode === 'zero_shot') {
    msgs.push({
      role: 'system',
      content: SYSTEM_BASE + '\nГОРИМ: ZERO-SHOT — жишээгүйгээр шууд хариул.',
    });
  } else if (mode === 'few_shot') {
    msgs.push({
      role: 'system',
      content:
        SYSTEM_BASE +
        `\nГОРИМ: FEW-SHOT — дараах жишээтэй адил хариул:

Жишээ 1:
Хэрэглэгч: алтан бөгжний үнэ хэд вэ?
AI: Манай алтан бөгжнүүд 150,000₮-с эхэлдэг. Загвар, жинд тохируулан үнэ өөрчлөгдөнө.

Жишээ 2:
Хэрэглэгч: мөнгөн зүүлт хэр удаан эдэлнэ?
AI: Зөв арчилбал 10+ жил эдэлнэ. Усанд орохоосоо өмнө тайлж, зөөлөн даавуугаар арчина уу.`,
    });
  } else if (mode === 'cot') {
    msgs.push({
      role: 'system',
      content:
        SYSTEM_BASE +
        `\nГОРИМ: CHAIN-OF-THOUGHT — алхам алхмаар бод:
1. Асуултыг ойлго
2. Холбогдох мэдлэгээ нэгтгэ
3. Дүгнэлт гарга
4. Товч хариулт өг`,
    });
  } else if (mode === 'role_based') {
    msgs.push({
      role: 'system',
      content: `Чи бол 20 жилийн туршлагатай үнэт эдлэлийн мэргэжилтэн Д.Нарантуяа.
Luna Jewelry-д ажилладаг бөгөөд алт, мөнгө, эрдэнэ чулуун бүтээлүүдийн талаар гүн мэдлэгтэй.
Хэрэглэгчдэд мэргэжлийн, дулаан зөвлөгөө өгдөг.`,
    });
  }

  // Өмнөх харилцааны түүх
  history.forEach(m => msgs.push({ role: m.role, content: m.content }));
  msgs.push({ role: 'user', content: message });

  return msgs;
}

export async function chat(req, res) {
  const { message, mode = 'zero_shot', history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Мессеж хоосон байна' });
  }

  try {
    const allProducts = await getProducts();
    const productList = allProducts
      .map(p => `${p.name} — ${p.price}₮ ${(p.tags || []).join(', ')}`)
      .join('\n');
    const messages = buildPrompt(message, mode, history);
    messages[0].content += `\n\nМанай бараануудын жагсаалт:\n${productList}`;

    const resp = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = resp.choices[0].message.content.trim();
    const products = matchProducts(allProducts, reply);
    res.json({ reply, products });
  } catch (err) {
    console.error('[Chat]', err.message);
    res.status(500).json({ error: 'Түр алдаа гарлаа' });
  }
}
