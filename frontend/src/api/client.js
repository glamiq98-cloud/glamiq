/**
 * Axios API client with JWT interceptor.
 * - Access token is attached to every request via Authorization header.
 * - On 401, automatically attempts token refresh via httpOnly cookie.
 */

import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for httpOnly cookie (refresh token)
});

// ── Token management (in-memory only) ───────────────────────
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// ── Request interceptor: attach access token ────────────────
client.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Cold-start auto-retry ──────────────────────────────────────
// Render free tier sleeps after ~15 min idle; the first request after
// sleep can fail while the backend boots (connection refused / 502 /
// timeout). Retry transient failures so users see a slightly slower
// first load instead of an error. GETs retry up to 3 times (covers the
// ~30-60s boot window); other methods retry up to 2 times and only on
// pure network errors (no response), where the server most likely
// never saw the request. Auth flows keep their own refresh logic and
// are excluded here.
const RETRY_DELAYS = [4000, 10000, 20000]; // ms between attempts
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const shouldColdStartRetry = (error) => {
  const config = error.config;
  if (!config) return false;
  const attempts = config.__coldStartRetried || 0;
  if (attempts >= RETRY_DELAYS.length) return false;
  if (config.url.includes('/auth/refresh') || config.url.includes('/auth/login')) return false;
  const isGet = (config.method || 'get').toLowerCase() === 'get';
  // Network error (no response at all): retry — GETs fully, others twice.
  if (!error.response) return isGet || attempts < 2;
  // GETs also retry on gateway/server errors during boot.
  if (isGet && [502, 503, 504].includes(error.response.status)) return true;
  return false;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Cold-start retry first, before any other error handling.
    if (shouldColdStartRetry(error)) {
      const config = error.config;
      const attempt = config.__coldStartRetried || 0;
      config.__coldStartRetried = attempt + 1;
      await sleep(RETRY_DELAYS[attempt]);
      return client(config);
    }

    const originalRequest = error.config;

    // Don't retry refresh or login requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await client.post('/auth/refresh');
        setAccessToken(data.access_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
