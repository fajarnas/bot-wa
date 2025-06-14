import { WASocket, proto } from '@whiskeysockets/baileys';
import { getUserProfile, upsertUserProfile } from '../lib/profile';

export async function execute(sock: WASocket, jid: string, msg: proto.IWebMessageInfo) {
  const name = msg.pushName || jid.split('@')[0];

  await upsertUserProfile(jid, {
    name,
    location: 'Jakarta, Indonesia',
    timezone: 'Asia/Jakarta',
  });

  const profile = await getUserProfile(jid);

  const formatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: profile?.timezone || 'Asia/Jakarta',
  });

  const waktuSekarang = formatter.format(new Date());

  const msgText = `
👤 *Profil Anda*
───────────────
📱 ID: ${profile?.id}
📛 Nama: ${profile?.name}
📍 Lokasi: ${profile?.location || 'Tidak diketahui'}
🕒 Waktu Sekarang: ${waktuSekarang}
🌐 Zona Waktu: ${profile?.timezone || 'Asia/Jakarta'}
📅 Daftar: ${new Date(profile!.registeredAt).toLocaleString('id-ID')}
`;

  await sock.sendMessage(jid, { text: msgText });
}
