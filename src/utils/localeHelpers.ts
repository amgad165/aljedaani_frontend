import i18n from '../i18n/config';

/**
 * Get API headers with locale
 */
export const getApiHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': i18n.language || 'en',
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Add locale parameter to URL
 */
export const addLocaleToUrl = (url: string): string => {
  const locale = i18n.language || 'en';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lang=${locale}`;
};

/**
 * Fetch wrapper with locale support
 */
export const fetchWithLocale = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = {
    ...getApiHeaders(),
    ...(options.headers || {}),
  };

  const urlWithLocale = addLocaleToUrl(url);

  return fetch(urlWithLocale, {
    ...options,
    headers,
  });
};

/**
 * Handle translation field - return localized value or fallback
 */
export const getTranslatedField = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value !== null) {
    const locale = i18n.language || 'en';
    return value[locale] || value['en'] || value[Object.keys(value)[0]] || fallback;
  }
  
  return fallback;
};
