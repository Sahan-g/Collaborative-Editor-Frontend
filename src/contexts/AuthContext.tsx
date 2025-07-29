import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // Verify token with backend
      verifyToken(storedToken);
    } else {
      // Add a small delay to prevent flash of content
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8081/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // For now, we'll use the email from response or create a simple user object
        setToken(token);
        setUser({ email: "user@example.com" }); // You can extract email from JWT or API response
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoading(false); // Ensure loading is false after logout
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
