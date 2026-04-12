import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { storage } from '../storage/adapter';
import { today, addDays, formatDisplay, getSeason, mondayOf } from '../lib/date';
import { usePress } from '../lib/usePress';
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
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDateRef = useRef(currentDate);
  const textRef = useRef(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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


  // Auto-resize textarea to fit content
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [text, currentDate]);

  // Scroll content into view when iOS keyboard appears
  useEffect(() => {
    const vv = window.visualViewport;
    function handleResize() {
      if (document.activeElement !== textareaRef.current) return;
      if (vv) {
        window.scrollTo(0, vv.offsetTop);
      } else {
        textareaRef.current?.scrollIntoView({ block: 'nearest' });
      }
    }
    if (vv) {
      vv.addEventListener('resize', handleResize);
      return () => vv.removeEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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
            <textarea
              class="diary-textarea"
              ref={textareaRef}
              value={text}
              onInput={(e) => handleChange((e.target as HTMLTextAreaElement).value)}
              onBlur={flushSave}
              placeholder="Skriv vad du vill..."
              spellcheck={false}
              autocomplete="off"
            />
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
