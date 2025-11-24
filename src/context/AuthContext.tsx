import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let response = await fetch('http://localhost:8080/auth/me', {
            credentials: 'include',
        });

        if (response.status === 401) {
            // Try refreshing
            const refreshResponse = await fetch('http://localhost:8080/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            if (refreshResponse.ok) {
                // Retry me
                response = await fetch('http://localhost:8080/auth/me', {
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
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    window.location.href = '/dashboard';
  };

  const register = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setUser(data.user);
    window.location.href = '/dashboard';
  };

  const loginWithGoogle = async () => {
    const response = await fetch('http://localhost:8080/auth/google');
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  const loginWithGithub = async () => {
    const response = await fetch('http://localhost:8080/auth/github');
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, loginWithGithub, logout }}>
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
