import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface ClippyDokiUser {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

interface ClippyDokiAuthState {
  user: ClippyDokiUser | null;
  isAuthenticated: boolean;
}

type ClippyDokiAuthStorageType = BaseStorageType<ClippyDokiAuthState> & {
  login: (user: Omit<ClippyDokiUser, 'isLoggedIn'>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const storage = createStorage<ClippyDokiAuthState>(
  'ClippyDokiState',
  {
    user: null,
    isAuthenticated: false,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const ClippyDokiAuthStorage: ClippyDokiAuthStorageType = {
  ...storage,
  login: async (userData: Omit<ClippyDokiUser, 'isLoggedIn'>) => {
    const user: ClippyDokiUser = {
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

export { ClippyDokiAuthStorage };
export type { ClippyDokiUser, ClippyDokiAuthState, ClippyDokiAuthStorageType };
