import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface PomodokiUser {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

interface PomodokiAuthState {
  user: PomodokiUser | null;
  isAuthenticated: boolean;
}

type PomodokiAuthStorageType = BaseStorageType<PomodokiAuthState> & {
  login: (user: Omit<PomodokiUser, 'isLoggedIn'>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const storage = createStorage<PomodokiAuthState>(
  'pomodokiState',
  {
    user: null,
    isAuthenticated: false,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const pomodokiAuthStorage: PomodokiAuthStorageType = {
  ...storage,
  login: async (userData: Omit<PomodokiUser, 'isLoggedIn'>) => {
    const user: PomodokiUser = {
      ...userData,
      isLoggedIn: true,
    };

    await storage.set({
      user,
      isAuthenticated: true,
    });
  },
  logout: async () => {
    await storage.set({
      user: null,
      isAuthenticated: false,
    });
  },
  checkAuth: async () => {
    const state = await storage.get();
    return state.isAuthenticated && state.user?.isLoggedIn === true;
  },
};

export { pomodokiAuthStorage };
export type { PomodokiUser, PomodokiAuthState, PomodokiAuthStorageType };
