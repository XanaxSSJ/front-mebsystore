export function ensureHttps(url) {
    if (url == null || typeof url !== 'string') return url;
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && url.startsWith('http://')) {
        return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
}
