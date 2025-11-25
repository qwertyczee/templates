import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isProtectedRoute: boolean;
  setIsProtectedRoute: (isProtected: boolean) => void;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProtectedRoute, setIsProtectedRoute] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isLoggingOut = urlParams.get('logout') === 'true';

    if (isLoggingOut) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      setUser(null);
      setLoading(false);
      return;
    }

    if (isProtectedRoute) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          let response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
          });

          if (response.status === 401) {
            // Try refreshing
            const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (refreshResponse.ok) {
              // Retry me
              response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
              });
            }
          }

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [isProtectedRoute]);

  const sendMagicLink = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send magic link');
    }
  };

  const verifyMagicLink = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/magic-link/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify magic link');
    }

    const data = await response.json();
    setUser(data.user);
    window.location.href = '/dashboard';
  };

  const loginWithGoogle = async () => {
    const response = await fetch(`${API_URL}/auth/google`);
    if (!response.ok) {
      throw new Error('Failed to connect to Google');
    }
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      window.location.href = '/?logout=true';
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
      window.location.href = '/?logout=true';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isProtectedRoute, setIsProtectedRoute, sendMagicLink, verifyMagicLink, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
