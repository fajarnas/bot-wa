import fs from 'fs/promises';
import path from 'path';

export async function saveAudioToFile(buffer: Buffer, prefix: string): Promise<string> {
  const filename = `${prefix}-${Date.now()}.ogg`;
  const filepath = path.join('./tmp', filename);
  await fs.writeFile(filepath, buffer);
  return filepath;
}
