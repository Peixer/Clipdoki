import { ClipdokiAuthStorage } from '@extension/storage';
import { Magic } from 'magic-sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ClipdokiUser } from '@extension/storage';
import type { ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: ClipdokiUser | null;
  loading: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  magic: Magic | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<ClipdokiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [magic, setMagic] = useState<Magic | null>(null);

  // Initialize Magic
  useEffect(() => {
    const initializeMagic = async () => {
      try {
        // You'll need to add your Magic publishable key to the environment
        const magicInstance = new Magic(process.env.CEB_MAGIC_PUBLISHABLE_KEY || '');
        setMagic(magicInstance);

        // Check if user is already logged in
        const isLoggedIn = await magicInstance.user.isLoggedIn();
        if (isLoggedIn) {
          const userInfo = await magicInstance.user.getInfo();
          console.log('userInfo', userInfo);
          const user: ClipdokiUser = {
            id: userInfo.publicAddress || '1',
            email: userInfo.email || '',
            name: userInfo.email?.split('@')[0] || 'User',
            isLoggedIn: true,
          };

          await ClipdokiAuthStorage.login(user);
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error initializing Magic:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMagic();
  }, []);

  // Subscribe to auth changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = await ClipdokiAuthStorage.get();
        setIsLoggedIn(authState.isAuthenticated);
        setCurrentUser(authState.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    const unsubscribe = ClipdokiAuthStorage.subscribe(() => {
      checkAuth();
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!magic) {
      console.error('Magic not initialized');
      return;
    }

    try {
      setLoading(true);
      await magic.wallet.connectWithUI();
      const userInfo = await magic.user.getInfo();
      console.log('userInfo', userInfo);

      const user: ClipdokiUser = {
        id: userInfo.publicAddress || '1',
        email: userInfo.email || '',
        name: userInfo.email?.split('@')[0] || 'User',
        isLoggedIn: true,
      };

      await ClipdokiAuthStorage.login(user);
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!magic) {
      console.error('Magic not initialized');
      return;
    }

    try {
      setLoading(true);
      await magic.user.logout();
      await ClipdokiAuthStorage.logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    currentUser,
    loading,
    handleLogin,
    handleLogout,
    magic,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
