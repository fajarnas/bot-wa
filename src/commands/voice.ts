import { getAllAudioUrls } from 'google-tts-api';
import fs from 'fs';
import fetch from 'node-fetch';
import { writeFile, unlink } from 'fs/promises';
import { proto, WASocket } from '@whiskeysockets/baileys';
import path from 'path';

const TMP_DIR = './tmp';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

export async function execute(sock: WASocket, jid: string, text: string) {
  try {
    const urls = await getAllAudioUrls(text, {
      lang: 'id',
      slow: false,
      host: 'https://translate.google.com',
    });

    const buffers = await Promise.all(
      urls.map(async (item) => {
        const res = await fetch(item.url);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );
    const combinedBuffer = Buffer.concat(buffers);

    const filePath = path.join(TMP_DIR, `tts-${Date.now()}.mp3`);
    await writeFile(filePath, combinedBuffer);

    await sock.sendMessage(jid, {
      audio: { url: filePath },
      mimetype: 'audio/mpeg',
      ptt: true,
    });

    await unlink(filePath);
  } catch (err) {
    console.error('❌ Gagal kirim suara:', err);
    await sock.sendMessage(jid, { text: '⚠️ Gagal mengirim suara.' });
  }
}

