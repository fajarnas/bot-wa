import axios from 'axios';
import { Readable } from 'stream';
import { File, FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';
import fetch from 'node-fetch';

const API_BASE = 'https://api.cloudconvert.com/v2';

export async function convertToPDF(buffer: Buffer, filename: string, mimetype: string): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) throw new Error('API Key CloudConvert tidak ditemukan.');

  // 1. Buat job dengan 3 task: import-upload, convert, export-url
  const jobRes = await axios.post(`${API_BASE}/jobs`, {
    tasks: {
      'import-my-file': {
        operation: 'import/upload',
      },
      'convert-my-file': {
        operation: 'convert',
        input: 'import-my-file',
        output_format: 'pdf',
      },
      'export-my-file': {
        operation: 'export/url',
        input: 'convert-my-file',
      },
    },
  }, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const job = jobRes.data.data;
  const importTask = job.tasks.find((task: any) => task.name === 'import-my-file');

  if (!importTask?.result?.form) {
    throw new Error('Gagal mendapatkan form upload.');
  }

  const uploadUrl = importTask.result.form.url;
  const formFields = importTask.result.form.parameters;

  // 2. Upload file ke CloudConvert
  const form = new FormData();
  for (const [key, value] of Object.entries(formFields)) {
    form.set(key, value as string);
  }
  form.set('file', new File([buffer], filename, { type: mimetype }));

  const encoder = new FormDataEncoder(form);
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: encoder.headers,
    body: Readable.from(encoder.encode()),
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Upload gagal: ${errorText}`);
  }

  console.log('📤 File berhasil diupload ke CloudConvert');

  // 3. Polling hingga job selesai
  let fileUrl = '';
  while (true) {
    const statusRes = await axios.get(`${API_BASE}/jobs/${job.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const updatedJob = statusRes.data.data;
    const exportTask = updatedJob.tasks.find(
      (t: any) => t.name === 'export-my-file' && t.status === 'finished'
    );

    if (exportTask?.result?.files?.[0]?.url) {
      fileUrl = exportTask.result.files[0].url;
      break;
    }

    // Tunggu 2 detik sebelum polling ulang
    await new Promise(res => setTimeout(res, 2000));
  }

  // 4. Download hasil PDF
  const pdfRes = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
  });

  const pdfBuffer = Buffer.from(pdfRes.data);
  if (pdfBuffer.length === 0) throw new Error('File hasil PDF kosong.');

  console.log('📄 PDF berhasil didapatkan!');
  return pdfBuffer;
}
