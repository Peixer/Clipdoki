import AllSet from './AllSet';
import { useAuth } from './context/AuthContext';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect } from 'react';

const Login = () => {
  const { isLoggedIn, loading, handleLogin } = useAuth();

  useEffect(() => {
    // Check if window is narrow and user is not logged in
    if (!isLoggedIn && window.innerWidth <= 400) {
      const extensionUrl = `chrome-extension://${chrome.runtime?.id}/popup/index.html`;
      window.open(extensionUrl);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Change body class when login is showing
    if (!isLoggedIn) {
      document.body.style.width = '100%';
    } else {
      document.body.style.width = '';
    }
  }, [isLoggedIn]);

  return (
    <div
      className={cn('flow-login w-full text-center')}
      style={{
        width: '100%',
        height: '100%',
      }}>
      {!isLoggedIn ? (
        <div>
          <div className="flex flex-col items-center">
            <img
              src={chrome.runtime.getURL('popup/avatar.png')}
              alt="Avatar"
              className="mb-4 h-16 w-16 rounded-full"
              style={{ marginTop: '20px' }}
            />
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
                marginTop: '20px',
              }}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      ) : (
        <AllSet />
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Login, <LoadingSpinner />), ErrorDisplay);
