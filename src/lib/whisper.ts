import fetch from 'node-fetch';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import ffmpeg from 'fluent-ffmpeg';

export async function transcribeAudio(filePath: string): Promise<string> {
  const mp3Path = filePath.replace('.ogg', '.mp3');

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .toFormat('mp3')
      .on('end', () => resolve())
      .on('error', reject)
      .save(mp3Path);
  });

  const formData = new FormData();
  formData.set('file', await fileFromPath(mp3Path));
  formData.set('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: formData as any,
  });

  const result = (await response.json()) as { text?: string };
  return result.text || '[Transkripsi tidak ditemukan]';
}
