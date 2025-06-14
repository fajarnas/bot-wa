import { WASocket, proto } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';

const categories: Record<string, string> = {
  dunia: 'general',
  teknologi: 'technology',
  olahraga: 'sports',
  bisnis: 'business',
  hiburan: 'entertainment',
  kesehatan: 'health',
};

type GNewsArticle = {
  title: string;
  url: string;
  image: string;
  source: { name: string };
};

type GNewsResponse = {
  articles: GNewsArticle[];
};

function formatArticle(article: GNewsArticle, index: number): string {
  return `*${index + 1}. ${article.title}*\n📌 Sumber: ${article.source.name}\n🔗 [Baca Selengkapnya](${article.url})\n`;
}

function getCategoryList(): string {
  return Object.keys(categories)
    .map((cat) => `• !berita ${cat}`)
    .join('\n');
}

export async function execute(sock: WASocket, jid: string, msg: proto.IWebMessageInfo) {
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    '';
  const inputCategory = text.split(' ')[1]?.toLowerCase() || 'dunia';
  const selected = categories[inputCategory] || 'general';

  try {
    if (!GNEWS_API_KEY) {
      await sock.sendMessage(
        jid,
        { text: '⚠️ API key GNews belum diatur. Silakan atur variabel GNEWS_API_KEY di file .env.' },
        { quoted: msg }
      );
      return;
    }

    const url = `https://gnews.io/api/v4/top-headlines?topic=${selected}&lang=id=id&max=3&token=${GNEWS_API_KEY}`;
    const res = await fetch(url);
    const raw = await res.text();
    console.log('🟨 Raw response from GNews:', raw);

    let data: GNewsResponse;
    try {
      data = JSON.parse(raw) as GNewsResponse;
    } catch {
      await sock.sendMessage(
        jid,
        { text: '⚠️ Format data berita tidak valid dari server.' },
        { quoted: msg }
      );
      return;
    }

    // Cek jika ada error dari API
    if ((data as any).error || (data as any).errors) {
      await sock.sendMessage(
        jid,
        { text: `⚠️ Error dari GNews: ${(data as any).error || (data as any).errors}` },
        { quoted: msg }
      );
      return;
    }

    if (!Array.isArray(data.articles) || data.articles.length === 0) {
      await sock.sendMessage(
        jid,
        { text: '⚠️ Tidak ada berita ditemukan untuk kategori ini.' },
        { quoted: msg }
      );
      return;
    }

    // Selalu kirim berita sebagai teks saja (tanpa gambar)
    const newsList = data.articles.map(formatArticle).join('\n');
    await sock.sendMessage(
      jid,
      {
        text: `📰 *Berita Terbaru (${inputCategory.toUpperCase()})*\n\n${newsList}`,
      },
      { quoted: msg }
    );

    // Tampilkan tombol kategori
    const categoryButtons = [
      { buttonId: '!berita dunia', buttonText: { displayText: '🌍 Dunia' }, type: 1 },
      { buttonId: '!berita teknologi', buttonText: { displayText: '💻 Teknologi' }, type: 1 },
      { buttonId: '!berita olahraga', buttonText: { displayText: '⚽ Olahraga' }, type: 1 },
      { buttonId: '!berita bisnis', buttonText: { displayText: '💼 Bisnis' }, type: 1 },
      { buttonId: '!berita hiburan', buttonText: { displayText: '🎭 Hiburan' }, type: 1 },
      { buttonId: '!berita kesehatan', buttonText: { displayText: '🩺 Kesehatan' }, type: 1 },
    ];

    await sock.sendMessage(
      jid,
      {
        text:
          '🔖 *Pilih kategori berita lainnya:*\n' +
          getCategoryList(),
        footer: 'Update berita terbaru by GNews',
        buttons: categoryButtons,
        headerType: 1,
      } as any,
      { quoted: msg }
    );
  } catch (err) {
    console.error(
      '[ERROR] Gagal mengambil berita:',
      err
    );
    await sock.sendMessage(
      jid,
      { text: '⚠️ Gagal mengambil berita. Silakan coba lagi nanti.' },
      { quoted: msg }
    );
  }
}