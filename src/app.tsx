import { useState } from 'preact/hooks';
import { storage } from './storage/adapter';
import { LoginScreen } from './components/LoginScreen';
import { DiaryPage } from './components/DiaryPage';

export function App() {
  const [userName, setUserName] = useState<string | null>(() => {
    if (storage.getSession()) {
      const profile = storage.getProfile();
      return profile ? profile.name : null;
    }
    return null;
  });

  function handleLogin(name: string) {
    storage.setSession(true);
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
