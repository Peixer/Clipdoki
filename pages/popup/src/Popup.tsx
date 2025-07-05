import '@src/Popup.css';
import AllSet from './AllSet';
import { useAuth } from './context/AuthContext';
import Login from './Login';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useState, useEffect } from 'react';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const PopupContent = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { isLoggedIn, currentUser, loading, handleLogout } = useAuth();
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 400);
    };

    // Check initial size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show login component if not authenticated
  if (!isLoggedIn) {
    return <Login />;
  }

  // Show AllSet component for large screens when authenticated
  if (isLargeScreen) {
    return <AllSet />;
  }

  // Show main popup content if authenticated
  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>

        {/* Welcome message with user info */}
        <div className="mb-4 text-center">
          <p className="text-lg font-semibold">{t('welcomeUser', [currentUser?.name || 'User'])}</p>
          <p className="text-sm opacity-75">{currentUser?.email}</p>
          <button
            className={cn(
              'mt-2 rounded px-3 py-1 text-sm font-medium shadow hover:scale-105',
              isLight ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-red-700 text-white hover:bg-red-600',
            )}
            onClick={handleLogout}>
            {t('logout')}
          </button>
        </div>

        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
          )}
          onClick={injectContentScript}>
          {t('injectButton')}
        </button>

        <div className="mt-4 flex gap-2">
          <ToggleButton>{t('toggleTheme')}</ToggleButton>
        </div>
      </header>
    </div>
  );
};

const Popup = withErrorBoundary(withSuspense(PopupContent, <LoadingSpinner />), ErrorDisplay);

export default Popup;
