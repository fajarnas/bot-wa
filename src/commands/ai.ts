import { askGroqWithContext } from '../lib/groq';

export async function execute(sock: any, sender: string, text: string) {
  const prompt = text.trim();
  if (!prompt) {
    await sock.sendMessage(sender, { text: '❗ Contoh: !ai Apa itu AI?' });
    return;
  }

  const reply = await askGroqWithContext(sender, prompt);
  await sock.sendMessage(sender, { text: reply });
}
