import axios from 'axios';

const LOCAL_API_URL = 'http://127.0.0.1:5000';
const PRODUCTION_API_URL = 'https://ai-mystery-room.enzonic.dev';
const configuredUrl = (import.meta.env.VITE_API_URL || '').trim();

function isLoopbackUrl(value) {
  try {
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

const fallbackUrl = import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
const selectedUrl = !configuredUrl || (import.meta.env.PROD && isLoopbackUrl(configuredUrl))
  ? fallbackUrl
  : configuredUrl;
const configuredApiUrl = selectedUrl.replace(/\/$/, '');
const baseURL = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`;

const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90_000,
});

export const caseApi = {
  async createCase(payload) {
    const { data } = await http.post('/cases', payload, { timeout: 165_000 });
    return data.case;
  },
  async getCase(caseId) {
    const { data } = await http.get(`/cases/${caseId}`);
    return data.case;
  },
  async discoverClue(caseId, clueId) {
    const { data } = await http.post(`/cases/${caseId}/clues/${clueId}/discover`);
    return data;
  },
  async requestHint(caseId) {
    const { data } = await http.post(`/cases/${caseId}/hints`);
    return data;
  },
  async accuse(caseId, suspectId) {
    const { data } = await http.post(`/cases/${caseId}/accuse`, { suspectId });
    return data.result;
  },
  async getResult(caseId) {
    const { data } = await http.get(`/cases/${caseId}/result`);
    return data.result;
  },
};

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.error?.message) return error.response.data.error.message;
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (error?.request || error?.message === 'Network Error') return 'Could not reach the case server. Check your connection and try again.';
  return fallback;
}
