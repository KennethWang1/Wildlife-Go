
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    // In a real app, this would validate credentials with a backend
    // For now, we'll just store the email
    if (email && password) {
      setUser({ email });
      localStorage.setItem('user', JSON.stringify({ email }));
    } else {
      throw new Error('Email and password required');
    }
  };
  
  const signup = async (email: string, password: string) => {
    // In a real app, this would create a new user in the backend
    // For now, we'll just store the email like login does
    if (email && password) {
      setUser({ email });
      localStorage.setItem('user', JSON.stringify({ email }));
    } else {
      throw new Error('Email and password required');
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
