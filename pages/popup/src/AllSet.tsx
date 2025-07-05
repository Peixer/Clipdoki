import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const AllSet = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      fontFamily: "'VT323', monospace",
      textAlign: 'center',
      gap: 0,
    }}>
    {/* Imagem do Tamagotchi */}
    <img
      src={chrome.runtime.getURL('popup/avatar.png')}
      alt="You're all set"
      style={{
        width: 300,
        height: 'auto',
      }}
    />

    {/* Texto principal */}
    <h1 style={{ fontSize: '2.5rem', marginBottom: 0, marginTop: 0 }}>
      You&apos;re <span style={{ color: '#c5361b' }}>all</span> set
    </h1>
    <p style={{ fontSize: '1.25rem', marginBottom: 26, marginTop: 2 }}>You can start using ClippyDoki now!</p>

    {/* Box de instruções */}
    <div
      style={{
        border: '2px solid #5c4435',
        borderRadius: 24,
        padding: '2px 10px',
        maxWidth: 350,
        background: 'rgba(255,255,255,0.2)',
      }}>
      <p style={{ fontSize: '1.1rem', marginBottom: 8, fontWeight: 'bold' }}>Put your AI mentor within reach!</p>
      <p style={{ fontSize: '1.1rem' }}>Click Extension 🧩 and Pin 📌 ClippyDoki</p>
    </div>
  </div>
);

export default withErrorBoundary(withSuspense(AllSet, <LoadingSpinner />), ErrorDisplay);
