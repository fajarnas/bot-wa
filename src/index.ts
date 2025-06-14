import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  proto,
} from '@whiskeysockets/baileys';
import * as dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import { pino } from 'pino';
import { transcribeAudio } from './lib/whisper';
import { saveAudioToFile } from './lib/utils';
import { checkAndAddMonthlyLimit } from './lib/limit';


dotenv.config();

import * as helpCommand from './commands/help';
import * as jokeCommand from './commands/joke';
import * as voiceCommand from './commands/voice';
import * as tagallCommand from './commands/tagall';
import * as aiCommand from './commands/ai';
import { askGroqWithContext } from './lib/groq';
import * as stickerCommand from './commands/sticker';
import * as profileCommand from './commands/profile';
import * as beritaCommand from './commands/berita';
import * as pdfCommand from './commands/pdf';


async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.clear();
      console.log('📱 Scan QR untuk masuk:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reason = (lastDisconnect?.error as any)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('🔁 Menghubungkan ulang...');
        startBot();
      } else {
        console.log('❌ Bot logout. Jalankan ulang untuk scan QR.');
      }
    }
    if (connection === 'open') console.log('✅ Bot terhubung ke WhatsApp.');
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    // Simpan pesan ke messageStore
    messageStore[msg.key.id!] = msg;

    const sender = msg.key.remoteJid!;
    const message = msg.message;
    const reuploadRequest = async (message: any) => message;

    // Limit global pesan per bulan
    const limit = checkAndAddMonthlyLimit(sender);
    if (!limit.allowed) {
      await sock.sendMessage(sender, {
        text: `⛔ Limit bulanan kamu sudah habis (5000 pesan/bulan). Silakan coba lagi bulan depan!`,
      });
      return;
    }

    try {
      // 🎙️ Pesan Suara → Kirim ke AI langsung
      if (message.audioMessage?.ptt) {
        console.log(`[${sender}] mengirim pesan suara`);

        try {
          if (!msg.message?.audioMessage?.mediaKey) {
            throw new Error('Media key tidak ditemukan, tidak bisa download audio');
          }
          const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino(), reuploadRequest });
          const oggPath = await saveAudioToFile(buffer, 'audio');

          const transcription = await transcribeAudio(oggPath);
          const aiReply = await askGroqWithContext(sender, transcription);

          await voiceCommand.execute(sock, sender, aiReply);

          await fs.promises.unlink(oggPath).catch(() => { });
        } catch (err) {
          console.error('❌ Gagal proses pesan suara:', err);
          await sock.sendMessage(sender, { text: '⚠️ Gagal memproses suara. Coba lagi.' });
        }

        return;
      }

      // 📩 Pesan Teks
      const text = message.conversation || message.extendedTextMessage?.text;
      if (text) {
        const lowerText = text.toLowerCase();
        if (lowerText === '!menu') {
          await helpCommand.execute(sock, sender);
          return;
        }

        if (lowerText === '!joke') {
          await jokeCommand.execute(sock, sender);
          return;
        }

        if (lowerText.startsWith('!voice ')) {
          const voiceText = text.slice(7).trim();
          await voiceCommand.execute(sock, sender, voiceText);
          return;
        }

        if (lowerText.startsWith('!tagall')) {
          await tagallCommand.execute(sock, sender, msg);
          return;
        }

        if (lowerText.startsWith('!ai ')) {
          await aiCommand.execute(sock, sender, text);
          return;
        }
        if (text.startsWith('!sticker')) {
          await stickerCommand.execute(sock, sender, text);
          return;
        }
        if (lowerText === '!profile') {
          await profileCommand.execute(sock, sender, msg);
          return;
        }
        if (lowerText.startsWith('!berita')) {
          await beritaCommand.execute(sock, sender, msg);
          return;
        }
        if (lowerText === '!limit') {
          await sock.sendMessage(sender, {
            text: `🔢 Sisa limit bulanan kamu: *${limit.sisa}* dari 5000 pesan.`,
          });
          return;
        }
        if (lowerText === '!pdf') {
          await pdfCommand.execute(sock, sender, msg);
          return;
        }
      

        // ❌ Perintah tidak dikenal (command diawali `!`)
        if (lowerText.startsWith('!')) {
          await sock.sendMessage(sender, {
            text: `❓ Perintah tidak dikenal.\nKetik *!menu* untuk melihat daftar perintah.`,
          });
          return;
        }

        // 🤖 Fallback balasan AI untuk teks biasa
        //const reply = await askGroqWithContext(sender, text);
        //await sock.sendMessage(sender, { text: reply });
        //return;
      }

      // 🎥 Media Lain
      if (message.documentMessage) {
        await sock.sendMessage(sender, { text: '📄 Terima kasih untuk dokumennya!' });
        return;
      }

      if (message.videoMessage) {
        console.log(`[${sender}] mengirim video`);
        await sock.sendMessage(sender, { text: '🎥 Terima kasih atas videonya!' });
        return;
      }

      if (message.imageMessage) {
        console.log(`[${sender}] mengirim gambar`);
        await sock.sendMessage(sender, { text: '📸 Terima kasih atas gambarnya!' });
        return;
      }

      if (message.stickerMessage) {
        console.log(`[${sender}] mengirim stiker`);
        await sock.sendMessage(sender, { text: '😄 Stikernya lucu!' });
        return;
      }

    } catch (err) {
      console.error('❌ Gagal memproses pesan:', err);
      await sock.sendMessage(sender, { text: '⚠️ Terjadi kesalahan saat memproses pesan.' });
    }
  });

  sock.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update && update.update.message === null) {
        const msgKey = update.key;
        const chatId = msgKey.remoteJid!;
        const sender = msgKey.participant || msgKey.remoteJid!;
        try {
          const originalMsg = messageStore[msgKey.id!];
          if (originalMsg && originalMsg.message) {
            let isiPesan = originalMsg.message.conversation ||
              originalMsg.message.extendedTextMessage?.text ||
              '[Pesan non-teks]';
            await sock.sendMessage(
              chatId,
              {
                text: `🚫 Pesan yang dihapus oleh @${sender.split('@')[0]}:\n\n${isiPesan}`,
                mentions: [sender]
              }
            );
          }
        } catch (e) {
          // Pesan tidak ditemukan atau error
        }
      }
    }
  });

  const messageStore: Record<string, proto.IWebMessageInfo> = {};
}
startBot();

