const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const SERVICES = {
  AUTH: {
    url: `${API_BASE_URL}/auth`
  },
  DOCUMENT:{
    url: `${API_BASE_URL}/api/documents`
  }
};