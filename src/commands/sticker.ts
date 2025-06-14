import { createCanvas, loadImage } from 'canvas';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { WASocket } from '@whiskeysockets/baileys';

export async function execute(sock: WASocket, sender: string, text: string) {
  const content = text.replace(/^!sticker\s+/, '').trim();

  if (!content) {
    await sock.sendMessage(sender, { text: '❗ Contoh: !sticker Halo dunia!' });
    return;
  }

  // Buat gambar dari teks
  const canvas = createCanvas(562, 562);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(content, canvas.width / 2, canvas.height / 2);

  const buffer = canvas.toBuffer();

  // Buat stiker dari buffer
  const sticker = new Sticker(buffer, {
    pack: 'Teks ke Stiker',
    author: 'Bot WhatsApp',
    type: StickerTypes.CROPPED,
    categories: ['😂', '🤣'],
  });

  const stickerBuffer = await sticker.toBuffer();
  await sock.sendMessage(sender, { sticker: stickerBuffer });
}
