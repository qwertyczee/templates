import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  workosId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/me', {
            // Include credentials to send cookies
            credentials: 'include',
        });
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

  const login = async () => {
    try {
        const response = await fetch('http://localhost:8080/auth/login');
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        }
    } catch (error) {
        console.error("Login failed", error);
    }
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
