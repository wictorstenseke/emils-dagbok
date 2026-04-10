import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { storage } from '../storage/adapter';
import { today, addDays, formatDisplay, getSeason, mondayOf } from '../lib/date';
import { WeekStrip } from './WeekStrip';
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

  currentDateRef.current = currentDate;
  textRef.current = text;

  const todayKey = today();
  const daysBack = Math.round(
    (new Date(todayKey).getTime() - new Date(currentDate).getTime()) / 86400000
  );

  // Midnight flip
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = today();
      if (newToday !== currentDateRef.current) {
        flushSave();
        setCurrentDate(newToday);
        setWeekAnchor(mondayOf(newToday));
        setText(storage.getEntry(newToday));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load entry when date changes
  useEffect(() => {
    setText(storage.getEntry(currentDate));
  }, [currentDate]);

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
    }, 500);
  }, []);

  function navigateTo(date: string) {
    flushSave();
    setCurrentDate(date);
    setWeekAnchor(mondayOf(date));
  }

  function goBack() {
    if (daysBack < MAX_BACK) navigateTo(addDays(currentDate, -1));
  }

  function goForward() {
    if (currentDate < todayKey) navigateTo(addDays(currentDate, 1));
  }

  function prevWeek() {
    const newAnchor = addDays(weekAnchor, -7);
    setWeekAnchor(newAnchor);
  }

  function nextWeek() {
    const newAnchor = addDays(weekAnchor, 7);
    setWeekAnchor(newAnchor);
  }

  const season = getSeason(currentDate);
  const isToday = currentDate === todayKey;

  return (
    <div class="page-wrapper">
      <button
        class="nav-btn nav-btn-left"
        onClick={goBack}
        disabled={daysBack >= MAX_BACK}
        title="Föregående dag"
      >
        ◀
      </button>

      <div class="diary-page">
        <button class="logout-btn" onClick={onLogout}>Logga ut</button>

        <WeekStrip
          currentDate={currentDate}
          todayKey={todayKey}
          maxBack={MAX_BACK}
          onSelect={navigateTo}
          weekAnchor={weekAnchor}
          onPrevWeek={prevWeek}
          onNextWeek={nextWeek}
        />

        <div class="ruled-area">
          <div class="date-header">
            <span class="page-date">{formatDisplay(currentDate)}</span>
            <span class="page-season">{season.emoji} {season.name}</span>
          </div>
          <textarea
            class="diary-textarea"
            value={text}
            onInput={(e) => handleChange((e.target as HTMLTextAreaElement).value)}
            placeholder="Skriv vad du vill..."
            spellcheck={false}
            autocomplete="off"
          />
        </div>
      </div>

      <button
        class={`nav-btn nav-btn-right ${isToday ? 'locked' : ''}`}
        onClick={goForward}
        disabled={isToday}
        title={isToday ? 'Framtiden är inte skriven än' : 'Nästa dag'}
      >
        {isToday ? '🔒' : '▶'}
      </button>
    </div>
  );
}
