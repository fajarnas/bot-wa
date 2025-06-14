import { convertToPDF } from '../lib/cloudconvert'; 
import mime from 'mime-types';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';

const logger = pino({ level: 'silent' });

export async function execute(sock: any, sender: string, msg: any) {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quoted?.quotedMessage;
    const quotedParticipant = quoted?.participant;
    const quotedStanzaId = quoted?.stanzaId;

    const docMessage = quotedMsg?.documentMessage;
    if (!docMessage || !quotedParticipant || !quotedStanzaId) {
      await sock.sendMessage(sender, {
        text: '⚠️ Kirim file dokumen (Word, Excel, PPT, dll), lalu *balas* dengan perintah *!pdf*.',
      });
      return;
    }

    await sock.sendMessage(sender, { text: '⏳ Mengunduh dokumen...' });

    const fullQuotedMessage = {
      key: {
        remoteJid: sender,
        fromMe: false,
        id: quotedStanzaId,
        participant: quotedParticipant,
      },
      message: quotedMsg,
    };

    const buffer = await downloadMediaMessage(fullQuotedMessage, 'buffer', {}, {
      logger,
      reuploadRequest: async () => fullQuotedMessage,
    });

    if (!buffer || buffer.length === 0) {
      await sock.sendMessage(sender, { text: '⚠️ Gagal mengunduh file. Coba ulangi.' });
      return;
    }

    const ext = mime.extension(docMessage.mimetype || '') || 'bin';
    const fileName = docMessage.fileName || `file.${ext}`;

    await sock.sendMessage(sender, { text: '🔄 Mengonversi ke PDF via CloudConvert...' });

    const pdfBuffer = await convertToPDF(buffer, fileName, docMessage.mimetype);

    await sock.sendMessage(sender, {
      document: pdfBuffer,
      mimetype: 'application/pdf',
      fileName: fileName.replace(/\.[^.]+$/, '.pdf'),
    });

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    await sock.sendMessage(sender, {
      text: `❌ Gagal mengonversi ke PDF: ${err.message}`,
    });
  }
}
