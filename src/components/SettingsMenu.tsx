import { useEffect, useRef, useState } from 'preact/hooks';
import { storage, type ExportData } from '../storage/adapter';
import { today } from '../lib/date';
import './SettingsMenu.css';

interface Props {
  onImported: () => void;
}

type Toast = { kind: 'success' | 'error'; message: string } | null;

function downloadJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseImport(raw: string): Record<string, string> {
  const data = JSON.parse(raw) as Partial<ExportData> | Record<string, unknown>;
  // Accept either { entries: {...} } or a bare { date: text } map.
  const candidate =
    data && typeof data === 'object' && 'entries' in data && data.entries
      ? (data as ExportData).entries
      : (data as Record<string, unknown>);

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('Ogiltig fil');
  }

  const entries: Record<string, string> = {};
  for (const [date, text] of Object.entries(candidate)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Ogiltigt datumformat');
    }
    if (typeof text !== 'string') {
      throw new Error('Ogiltigt textinnehåll');
    }
    entries[date] = text;
  }
  return entries;
}

export function SettingsMenu({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [pressed, setPressed] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function showToast(kind: 'success' | 'error', message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ kind, message });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function handleExport() {
    try {
      const data: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        entries: storage.getAllEntries(),
      };
      downloadJson(`emils-dagbok-${today()}.json`, data);
      setOpen(false);
      showToast('success', 'Exporterat!');
    } catch {
      setOpen(false);
      showToast('error', 'Något gick fel');
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    // Reset so picking the same file twice still triggers change.
    input.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const entries = parseImport(text);
        storage.replaceAllEntries(entries);
        setOpen(false);
        showToast('success', 'Importerat!');
        onImported();
      } catch {
        setOpen(false);
        showToast('error', 'Kunde inte läsa filen');
      }
    };
    reader.onerror = () => {
      setOpen(false);
      showToast('error', 'Kunde inte läsa filen');
    };
    reader.readAsText(file);
  }

  return (
    <div class="settings-wrapper" ref={wrapperRef}>
      <button
        class={`settings-btn ${pressed ? 'pressed' : ''}`}
        onClick={() => setOpen((v) => !v)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        aria-label="Inställningar"
        aria-expanded={open}
      >
        ⚙️
      </button>

      {open && (
        <div class="settings-menu" role="menu">
          <button
            class={`settings-item ${pressedItem === 'export' ? 'pressed' : ''}`}
            role="menuitem"
            onClick={handleExport}
            onPointerDown={() => setPressedItem('export')}
            onPointerUp={() => setPressedItem(null)}
            onPointerLeave={() => setPressedItem(null)}
            onPointerCancel={() => setPressedItem(null)}
          >
            <span class="settings-item-icon">⬇️</span>
            <span>Exportera</span>
          </button>
          <button
            class={`settings-item ${pressedItem === 'import' ? 'pressed' : ''}`}
            role="menuitem"
            onClick={handleImportClick}
            onPointerDown={() => setPressedItem('import')}
            onPointerUp={() => setPressedItem(null)}
            onPointerLeave={() => setPressedItem(null)}
            onPointerCancel={() => setPressedItem(null)}
          >
            <span class="settings-item-icon">⬆️</span>
            <span>Importera</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        class="settings-file-input"
        onChange={handleFileChange}
      />

      {toast && (
        <div class={`settings-toast settings-toast-${toast.kind}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
