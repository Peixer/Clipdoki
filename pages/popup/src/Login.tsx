import AllSet from './AllSet';
import { useAuth } from './context/AuthContext';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect } from 'react';

const Login = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { isLoggedIn, loading, handleLogin } = useAuth();

  useEffect(() => {
    // Check if window is narrow and user is not logged in
    if (!isLoggedIn && window.innerWidth <= 400) {
      const extensionUrl = `chrome-extension://${chrome.runtime?.id}/popup/index.html`;
      window.open(extensionUrl);
    }
  }, [isLoggedIn]);

  return (
    <div className={cn('flow-login w-full text-center', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      {!isLoggedIn ? (
        <div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: '#c5361b',
              color: '#ffedae',
              fontFamily: "'VT323', monospace",
              fontSize: '1rem',
              padding: '8px 16px',
              border: '2px solid #5c4435',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '4px 4px #5c4435',
              opacity: loading ? 0.6 : 1,
              marginTop: '24px',
            }}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <AllSet />
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Login, <LoadingSpinner />), ErrorDisplay);
