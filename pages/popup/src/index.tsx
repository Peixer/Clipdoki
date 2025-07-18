import '@src/index.css';
import { AuthProvider } from '@src/context/AuthContext';
import Popup from '@src/Popup';
import { createRoot } from 'react-dom/client';

const init = () => {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(
    <AuthProvider>
      <Popup />
    </AuthProvider>,
  );
};

init();
