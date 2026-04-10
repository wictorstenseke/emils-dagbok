import { useState } from 'preact/hooks';
import { LoginScreen } from './components/LoginScreen';
import { DiaryPage } from './components/DiaryPage';

export function App() {
  const [userName, setUserName] = useState<string | null>(null);

  if (!userName) {
    return <LoginScreen onLogin={setUserName} />;
  }

  return <DiaryPage onLogout={() => setUserName(null)} />;
}
