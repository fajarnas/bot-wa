import type { WASocket } from '@whiskeysockets/baileys';

const jokes = [
  'Kenapa komputer nggak pernah lapar? Karena selalu ada *byte*! 🤖',
  'Kenapa JavaScript suka liburan? Karena suka async! 😂',
  'Kenapa programmer susah move on? Karena masih di dalam loop... 🔁',
  'Apa yang dikatakan server ke klien? "Kamu request, aku response!" 💻',
  'Kenapa database nggak pernah kesepian? Karena selalu ada *join*! 🗃️',
  'Kenapa kode suka berantakan? Karena nggak pernah di-*debug*! 🐛',
  'Kenapa HTML nggak pernah kesepian? Karena selalu ada *tag* yang menemani! 🏷️',
  'Kenapa CSS selalu bahagia? Karena selalu *styled*! 🎨',
  'Kenapa programmer suka kopi? Karena butuh *Java*! ☕',
  'Kenapa bug nggak suka cuaca panas? Karena mereka lebih suka *debugging*! 🐞',
  'Kenapa server suka tidur siang? Karena butuh *rest*! 💤',
  'Kenapa programmer nggak suka berolahraga? Karena mereka lebih suka *running code*! 🏃‍♂️',
  'Kenapa website suka berlibur? Karena butuh *refresh*! 🌐',
  'Kenapa programmer suka matematika? Karena mereka suka *algoritma*! 📊',
  'Kenapa kode suka bersembunyi? Karena takut di-*expose*! 🔍',
  'Kenapa programmer suka musik? Karena mereka suka *looping*! 🎶',
  'Kenapa komputer nggak suka berdebat? Karena selalu ada *argument* yang salah! 💬',
  'Kenapa programmer suka makan pizza? Karena mereka suka *slice*! 🍕',
  'Kenapa kode suka berlari? Karena butuh *performance*! 🏃‍♀️',
  'Kenapa programmer suka film horor? Karena mereka suka *debugging* yang menegangkan! 👻',
];

export async function execute(sock: WASocket, jid: string) {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(jid, { text: joke });
}
