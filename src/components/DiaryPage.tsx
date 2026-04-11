import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { storage } from '../storage/adapter';
import { today, addDays, formatDisplay, getSeason, mondayOf } from '../lib/date';
import { usePress } from '../lib/usePress';
import { highlightNames, highlightNamesWithAvatars } from '../lib/highlightNames';
import { WeekStrip } from './WeekStrip';
import { SettingsMenu } from './SettingsMenu';
import './DiaryPage.css';

const MAX_BACK = 10;

interface Props {
  onLogout: () => void;
}

export function DiaryPage({ onLogout }: Props) {
  const [currentDate, setCurrentDate] = useState(today());
  const [text, setText] = useState(() => storage.getEntry(today()));
  const [weekAnchor, setWeekAnchor] = useState(() => mondayOf(today()));
  const [editing, setEditing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDateRef = useRef(currentDate);
  const textRef = useRef(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const backPress = usePress();
  const fwdPress = usePress();
  const lastTodayRef = useRef(today());

  currentDateRef.current = currentDate;
  textRef.current = text;

  const todayKey = today();
  const daysBack = Math.round(
    (new Date(todayKey).getTime() - new Date(currentDate).getTime()) / 86400000
  );

  // Detect midnight crossing — only auto-navigate if user was viewing today
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = today();
      if (newToday !== lastTodayRef.current) {
        const wasViewingToday = currentDateRef.current === lastTodayRef.current;
        lastTodayRef.current = newToday;
        if (wasViewingToday) {
          flushSave();
          setCurrentDate(newToday);
          setWeekAnchor(mondayOf(newToday));
          setText(storage.getEntry(newToday));
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setText(storage.getEntry(currentDate));
  }, [currentDate]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const ta = textareaRef.current;
    if (editing && ta) {
      const scrollY = window.scrollY;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      window.scrollTo(0, scrollY);
    }
  }, [editing, text]);

  function flushSave() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      storage.saveEntry(currentDateRef.current, textRef.current);
    }
  }

  const handleChange = useCallback((value: string) => {
    setText(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      storage.saveEntry(currentDateRef.current, value);
      storage.touchActivity();
    }, 500);
  }, []);

  function navigateTo(date: string) {
    flushSave();
    setEditing(false);
    setCurrentDate(date);
    setWeekAnchor(mondayOf(date));
    storage.touchActivity();
  }

  function handleImported() {
    // Drop any pending autosave for the now-replaced data, then re-read the
    // current date so the editor reflects the imported entries.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setEditing(false);
    setText(storage.getEntry(currentDateRef.current));
    storage.touchActivity();
  }

  function goBack() {
    if (daysBack < MAX_BACK) navigateTo(addDays(currentDate, -1));
  }

  function goForward() {
    if (currentDate < todayKey) navigateTo(addDays(currentDate, 1));
  }

  const season = getSeason(currentDate);
  const isToday = currentDate === todayKey;
  const backDisabled = daysBack >= MAX_BACK;
  const fwdDisabled = isToday;

  return (
    <div class="page-wrapper">
      <button
        class={`nav-btn nav-btn-left ${backPress.pressed && !backDisabled ? 'pressed' : ''}`}
        onClick={goBack}
        disabled={backDisabled}
        {...backPress.pressProps}
      >
        ◀
      </button>

      <div class="diary-page">
        <div class="page-header">
          <SettingsMenu onImported={handleImported} />
          <button class="logout-btn" onClick={onLogout}>Logga ut</button>
        </div>

        <WeekStrip
          currentDate={currentDate}
          todayKey={todayKey}
          maxBack={MAX_BACK}
          onSelect={navigateTo}
          weekAnchor={weekAnchor}
          onPrevWeek={() => setWeekAnchor(addDays(weekAnchor, -7))}
          onNextWeek={() => setWeekAnchor(addDays(weekAnchor, 7))}
        />

        <div class="ruled-area">
          <div class="date-header">
            <span class="page-date">{formatDisplay(currentDate)}</span>
            <span class="page-season">{season.emoji} {season.name}</span>
          </div>
          <div class="diary-editor">
            {editing ? (
              <>
                <div
                  class="diary-overlay"
                  ref={overlayRef}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: highlightNames(text) }}
                />
                <textarea
                  class="diary-textarea"
                  ref={textareaRef}
                  value={text}
                  onInput={(e) => handleChange((e.target as HTMLTextAreaElement).value)}
                  onBlur={() => {
                    flushSave();
                    setEditing(false);
                  }}
                  onScroll={() => {
                    if (textareaRef.current && overlayRef.current) {
                      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
                    }
                  }}
                  placeholder="Skriv vad du vill..."
                  spellcheck={false}
                  autocomplete="off"
                />
              </>
            ) : (
              <div
                class="diary-display"
                onClick={() => setEditing(true)}
                dangerouslySetInnerHTML={{
                  __html: text
                    ? highlightNamesWithAvatars(text)
                    : '<span class="diary-placeholder">Tryck här för att skriva...</span>'
                }}
              />
            )}
          </div>
        </div>
      </div>

      <button
        class={`nav-btn nav-btn-right ${isToday ? 'locked' : ''} ${fwdPress.pressed && !fwdDisabled ? 'pressed' : ''}`}
        onClick={goForward}
        disabled={fwdDisabled}
        {...fwdPress.pressProps}
      >
        {isToday ? '🔒' : '▶'}
      </button>
    </div>
  );
}
