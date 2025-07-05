import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface ClipdokiUser {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

interface ClipdokiAuthState {
  user: ClipdokiUser | null;
  isAuthenticated: boolean;
}

type ClipdokiAuthStorageType = BaseStorageType<ClipdokiAuthState> & {
  login: (user: Omit<ClipdokiUser, 'isLoggedIn'>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const storage = createStorage<ClipdokiAuthState>(
  'ClipdokiState',
  {
    user: null,
    isAuthenticated: false,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const ClipdokiAuthStorage: ClipdokiAuthStorageType = {
  ...storage,
  login: async (userData: Omit<ClipdokiUser, 'isLoggedIn'>) => {
    const user: ClipdokiUser = {
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

export { ClipdokiAuthStorage };
export type { ClipdokiUser, ClipdokiAuthState, ClipdokiAuthStorageType };
