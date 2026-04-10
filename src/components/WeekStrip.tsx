import { useState } from 'preact/hooks';
import { weekDays, addDays, shortDay, dayNumber } from '../lib/date';
import './WeekStrip.css';

interface Props {
  currentDate: string;
  todayKey: string;
  maxBack: number;
  onSelect: (date: string) => void;
  weekAnchor: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function pressProps(setPressed: (v: boolean) => void) {
  return {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
  };
}

export function WeekStrip({ currentDate, todayKey, maxBack, onSelect, weekAnchor, onPrevWeek, onNextWeek }: Props) {
  const days = weekDays(weekAnchor);
  const oldestAllowed = addDays(todayKey, -maxBack);
  const canPrevWeek = addDays(weekAnchor, -1) >= oldestAllowed;
  const [prevPressed, setPrevPressed] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);
  const [pressedDay, setPressedDay] = useState<string | null>(null);

  return (
    <div class="week-strip">
      <button
        class={`week-arrow ${prevPressed && canPrevWeek ? 'pressed' : ''}`}
        onClick={onPrevWeek}
        disabled={!canPrevWeek}
        {...pressProps(setPrevPressed)}
      >
        ◀
      </button>

      <div class="week-days">
        {days.map((day) => {
          const isFuture = day > todayKey;
          const tooOld = day < oldestAllowed;
          const isDisabled = isFuture || tooOld;
          return (
            <button
              key={day}
              class={[
                'week-day',
                day === currentDate ? 'selected' : '',
                day === todayKey ? 'today' : '',
                isDisabled ? 'disabled' : '',
                pressedDay === day && !isDisabled ? 'pressed' : '',
              ].join(' ').trim()}
              onClick={() => !isDisabled && onSelect(day)}
              disabled={isDisabled}
              onPointerDown={() => !isDisabled && setPressedDay(day)}
              onPointerUp={() => setPressedDay(null)}
              onPointerLeave={() => setPressedDay(null)}
              onPointerCancel={() => setPressedDay(null)}
            >
              <span class="week-day-name">{shortDay(day)}</span>
              <span class="week-day-num">{dayNumber(day)}</span>
            </button>
          );
        })}
      </div>

      <button
        class={`week-arrow ${nextPressed && days[6] < todayKey ? 'pressed' : ''}`}
        onClick={onNextWeek}
        disabled={days[6] >= todayKey}
        {...pressProps(setNextPressed)}
      >
        ▶
      </button>
    </div>
  );
}
