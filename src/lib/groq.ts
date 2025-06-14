import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const userConversations = new Map<string, { role: 'user' | 'assistant' | 'system'; content: string }[]>();
const MAX_HISTORY = 10;

export async function askGroqWithContext(jid: string, userMessage: string): Promise<string> {
  let history = userConversations.get(jid) || [];

  if (!history.some(msg => msg.role === 'system')) {
    history.unshift({
      role: 'system',
      content: 'Kamu adalah asisten pintar yang menjawab dalam bahasa Indonesia dengan sopan dan informatif.',
    });
  }

  history.push({ role: 'user', content: userMessage });

  if (history.length > MAX_HISTORY) {
    history = [history[0], ...history.slice(-MAX_HISTORY)];
  }

  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: history,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = res.data.choices[0].message.content.trim();
    history.push({ role: 'assistant', content: reply });
    userConversations.set(jid, history);
    return reply;
  } catch (err: any) {
    console.error('GROQ API Error:', err.response?.data || err.message);
    return '❌ Terjadi kesalahan saat menghubungi AI.';
  }
}
