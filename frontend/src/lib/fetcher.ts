export const fetcher = (url: string) => fetch(url).then((res) => res.json());

// API Base URL (Localhost geliştirme ortamı için)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
