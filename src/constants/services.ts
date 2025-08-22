export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ominous-barnacle-5wv77pp4765f76xw-8080.app.github.dev';

export const SERVICES = {
  AUTH: {
    url: `${API_BASE_URL}/auth`
  },
  DOCUMENT:{
    url: `${API_BASE_URL}/documents`
  }
};