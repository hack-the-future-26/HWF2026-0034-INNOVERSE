export const APP_TITLE = 'Smart Queue Management';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export const ROUTES = {
  HOME: '/',
  QUEUES: '/queues',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
};
