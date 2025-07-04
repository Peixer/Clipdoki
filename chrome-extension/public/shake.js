(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes shake {
      0% { transform: translate(0, 0); }
      20% { transform: translate(0, -10px); }
      40% { transform: translate(0, 10px); }
      60% { transform: translate(0, -10px); }
      80% { transform: translate(0, 10px); }
      100% { transform: translate(0, 0); }
    }
    body.shake {
      animation: shake 0.5s;
    }
  `;
  document.head.appendChild(style);

  // Create and play MSN sound
  const audio = new Audio(
    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  );
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Audio play failed:', e));

  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
  }, 500);
})();
