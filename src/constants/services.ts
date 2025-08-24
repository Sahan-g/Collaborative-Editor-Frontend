export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://organic-meme-xjrggqq9vj539v6p-8080.app.github.dev';

export const SERVICES = {
  AUTH: {
    url: `${API_BASE_URL}/auth`
  },
  DOCUMENT:{
    url: `${API_BASE_URL}/documents`
  }
};``