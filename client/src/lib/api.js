// src/lib/api.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://codealchemy.onrender.com';

async function parseAxiosError(err) {
  if (err.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      return JSON.parse(text).error || 'Something went wrong.';
    } catch { return 'Something went wrong.'; }
  }
  return err.response?.data?.error || err.message || 'Something went wrong.';
}

export async function generateFiles(text, token) {
  try {
    const response = await axios.post(
      `${BASE}/api/files/upload`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
      // NOTE: no responseType: 'blob' anymore — we get JSON now
    );

    const { files, zip, used, remaining } = response.data;

    // Convert base64 ZIP → blob URL for download
    const binaryStr = atob(zip);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);

    return { url, files, used, remaining, error: null };

  } catch (err) {
    const errorMsg = await parseAxiosError(err);
    const limitReached = err.response?.status === 403;
    return { url: null, files: null, error: errorMsg, limitReached };
  }
}

export async function fetchStats(token) {
  try {
    const response = await axios.get(`${BASE}/api/files/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}