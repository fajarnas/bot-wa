import type { WASocket } from '@whiskeysockets/baileys';

export async function execute(sock: WASocket, jid: string) {
  const menuText = `📋 *Menu Bot WhatsApp:*

🔹 *!menu* - Lihat daftar perintah
🔹 *!tagall [teks]* - Untuk tagg anggota group
🔹 *!joke* - Kirim candaan lucu
🔹 *!voice [teks]* - Kirim teks menjadi suara 
🔹 *!ai [teks]* - Kirim pertanyaan ke AI
🔹 *!sticker [teks]* - mengubah teks menjadi sticker
🔹 *!profile* - Lihat profil pengguna
🔹 *!berita* - Lihat berita terkini
🔹 *!PDF* - Mengubah jenis file menjadi pdf
🔹 *!limit* - Lihat limit menggunakan bot
🎙️ Kirim pesan suara - Akan ditranskrip & dibalas dengan suara`;


  await sock.sendMessage(jid, { text: menuText });
}
