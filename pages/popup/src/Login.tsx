import { useAuth } from './context/AuthContext';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Login = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { isLoggedIn, currentUser, loading, handleLogin, handleLogout } = useAuth();

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
        <div
          style={{
            color: '#5c4435',
            fontSize: '0.9rem',
            fontFamily: "'VT323', monospace",
          }}>
          <p style={{ textAlign: 'center', fontSize: '1.15rem' }}>Connected as: {currentUser?.name || 'User'}</p>
          <button
            onClick={handleLogout}
            disabled={loading}
            style={{
              marginTop: '20px',
              backgroundColor: '#fed35c',
              color: '#5c4435',
              fontFamily: "'VT323', monospace",
              fontSize: '1.25rem',
              padding: '10px 24px',
              border: '2px solid #5c4435',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              boxShadow: '4px 4px #5c4435',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Login, <LoadingSpinner />), ErrorDisplay);
