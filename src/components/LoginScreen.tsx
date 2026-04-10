import { useState } from 'preact/hooks';
import { storage } from '../storage/adapter';
import './LoginScreen.css';

const DEFAULT_CODE = [12, 6, 8, 6];

interface Props {
  onLogin: (name: string) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [taps, setTaps] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [pressedCell, setPressedCell] = useState<number | null>(null);
  const [backspacePressed, setBackspacePressed] = useState(false);

  function tap(n: number) {
    if (taps.length >= 4) return;
    const next = [...taps, n];
    setTaps(next);
    if (next.length === 4) validate(next);
  }

  function validate(input: number[]) {
    let profile = storage.getProfile();
    if (!profile) {
      profile = { name: name.trim() || 'Emil', code: DEFAULT_CODE };
      storage.saveProfile(profile);
    }
    const correct = input.every((v, i) => v === profile!.code[i]);
    if (correct) {
      onLogin(profile.name);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setTaps([]); }, 600);
    }
  }

  function backspace() {
    setTaps(taps.slice(0, -1));
  }

  const displayName = storage.getProfile()?.name ?? (name.trim() || '');

  return (
    <div class="login-screen">
      <div class="login-card">
        <div class="login-title">📖 Min Dagbok</div>

        {!storage.getProfile() && (
          <input
            class="name-input"
            type="text"
            placeholder="Vad heter du?"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            maxLength={20}
          />
        )}

        {displayName && <div class="login-greeting">Hej {displayName}! 👋</div>}

        <div class="code-hint">Skriv in din hemliga kod</div>

        <div class={`dots-row ${shake ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} class={`dot ${taps[i] !== undefined ? 'filled' : ''}`}>●</span>
          ))}
        </div>

        <div class="tap-grid">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              class={`tap-cell ${pressedCell === n ? 'pressed' : ''}`}
              onClick={() => tap(n)}
              onPointerDown={() => setPressedCell(n)}
              onPointerUp={() => setPressedCell(null)}
              onPointerLeave={() => setPressedCell(null)}
              onPointerCancel={() => setPressedCell(null)}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          class={`backspace-btn ${backspacePressed ? 'pressed' : ''}`}
          onClick={backspace}
          disabled={taps.length === 0}
          onPointerDown={() => setBackspacePressed(true)}
          onPointerUp={() => setBackspacePressed(false)}
          onPointerLeave={() => setBackspacePressed(false)}
          onPointerCancel={() => setBackspacePressed(false)}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
