export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cautious-dollop-rwwq5vgpxx6369g-8080.app.github.dev';

export const SERVICES = {
  AUTH: {
    url: `${API_BASE_URL}/auth`
  },
  DOCUMENT:{
    url: `${API_BASE_URL}/documents`
  }
};``