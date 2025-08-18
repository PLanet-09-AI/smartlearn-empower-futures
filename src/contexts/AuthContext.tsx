import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/database';
import { dbSeeder } from '@/lib/seeder';

interface UserProfile {
  id: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  firstName?: string;
  lastName?: string;
  password?: string; // Hashed password (in production, this should be properly hashed)
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'lecturer' | 'admin', firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt_key_123'); // Base64 encoding with salt
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const sessionData = localStorage.getItem('auth_session');
        if (sessionData) {
          const { userId, timestamp } = JSON.parse(sessionData);
          
          // Check if session is still valid (24 hours)
          const now = new Date().getTime();
          const sessionAge = now - timestamp;
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (sessionAge < twentyFourHours) {
            const user = await db.get('users', userId);
            if (user) {
              // Update last login
              await db.update('users', {
                ...user,
                lastLogin: new Date().toISOString()
              });
              setCurrentUser(user);
            } else {
              // User not found, clear session
              localStorage.removeItem('auth_session');
            }
          } else {
            // Session expired
            localStorage.removeItem('auth_session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('auth_session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signup = async (
    email: string, 
    password: string, 
    role: 'student' | 'lecturer' | 'admin',
    firstName?: string,
    lastName?: string
  ) => {
    try {
      // Check if user already exists
      const existingUsers = await db.query('users', (user: any) => user.email === email);
      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = hashPassword(password);
      
      const newUser: UserProfile = {
        id: userId,
        email,
        role,
        firstName,
        lastName,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      await db.add('users', newUser);
      
      // Create session
      localStorage.setItem('auth_session', JSON.stringify({
        userId,
        timestamp: new Date().getTime()
      }));

      // Remove password from user object for state
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Find user by email
      const users = await db.query('users', (user: any) => user.email === email);
      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];
      
      // Verify password
      if (!user.password || !verifyPassword(password, user.password)) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      await db.update('users', updatedUser);

      // Create session
      localStorage.setItem('auth_session', JSON.stringify({
        userId: user.id,
        timestamp: new Date().getTime()
      }));

      // Remove password from user object for state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setCurrentUser(userWithoutPassword);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear session
      localStorage.removeItem('auth_session');
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = { ...currentUser, ...updates };
      await db.update('users', updatedUser);
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Initialize with default admin user if no users exist
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Seed the database if empty
        await dbSeeder.checkAndSeedDatabase();
        
        const users = await db.getAll('users');
        if (users.length === 0) {
          console.log('No users found, creating default admin user');
          await signup(
            'admin@smartlearn.com',
            'admin123',
            'admin',
            'Default',
            'Admin'
          );
          console.log('Default admin user created: admin@smartlearn.com / admin123');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    // Only run after initial loading is complete
    if (!loading && !currentUser) {
      initializeDatabase();
    }
  }, [loading, currentUser]);

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
