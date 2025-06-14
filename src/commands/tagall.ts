import { WASocket, proto } from '@whiskeysockets/baileys';

export async function execute(sock: WASocket, jid: string, msg: proto.IWebMessageInfo) {
  if (!jid.endsWith('@g.us')) {
    await sock.sendMessage(jid, { text: '❌ Perintah ini hanya bisa digunakan di dalam grup.' });
    return;
  }

  const groupMetadata = await sock.groupMetadata(jid);
  const participants = groupMetadata.participants || [];

  // Ambil ID pengirim
  const senderId = msg.key.participant || msg.key.remoteJid;

  // Cek apakah pengirim adalah admin
  const isAdmin = participants.find(p => p.id === senderId)?.admin !== undefined;

  // ✅ Tambahkan pengecualian: jika pengirim adalah bot sendiri
  const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

  if (!isAdmin && senderId !== botNumber) {
    await sock.sendMessage(jid, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini.' });
    return;
  }

  const messageText =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    '';

  const content = messageText.replace(/^!tagall/i, '').trim() || '📢 Tag semua member:';
  const mentionIds = participants.map((p) => p.id);

  await sock.sendMessage(jid, {
    text: content + '\n\n' + mentionIds.map((id) => `@${id.split('@')[0]}`).join(' '),
    mentions: mentionIds,
  });
}

