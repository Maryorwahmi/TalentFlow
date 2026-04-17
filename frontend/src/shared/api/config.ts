const DEFAULT_API_BASE_URL = '/api/v1';

const normalizeApiBaseUrl = (value?: string) => {
  const rawValue = value?.trim();

  if (!rawValue) {
    return DEFAULT_API_BASE_URL;
  }

  const sanitized = rawValue.replace(/\/+$/, '');

  if (/\/api\/v1$/i.test(sanitized)) {
    return sanitized;
  }

  if (/\/api$/i.test(sanitized)) {
    return `${sanitized}/v1`;
  }

  return `${sanitized}/api/v1`;
};

const isDev = Boolean(import.meta.env.DEV);

export const API_BASE_URL = isDev
  ? DEFAULT_API_BASE_URL
  : normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/i, '');
