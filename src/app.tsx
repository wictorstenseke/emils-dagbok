import { useState, useEffect, useCallback } from 'preact/hooks';
import { storage } from './storage/adapter';
import { LoginScreen } from './components/LoginScreen';
import { DiaryPage } from './components/DiaryPage';

export function App() {
  const [userName, setUserName] = useState<string | null>(() => {
    if (storage.getSession() && !storage.isSessionExpired()) {
      const profile = storage.getProfile();
      return profile ? profile.name : null;
    }
    storage.setSession(false);
    return null;
  });

  const expireIfNeeded = useCallback(() => {
    if (userName && storage.isSessionExpired()) {
      storage.setSession(false);
      setUserName(null);
    }
  }, [userName]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') expireIfNeeded();
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [expireIfNeeded]);

  function handleLogin(name: string) {
    storage.setSession(true);
    storage.touchActivity();
    setUserName(name);
  }

  function handleLogout() {
    storage.setSession(false);
    setUserName(null);
  }

  if (!userName) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <DiaryPage onLogout={handleLogout} />;
}
