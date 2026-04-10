import { weekDays, addDays, shortDay, dayNumber } from '../lib/date';
import './WeekStrip.css';

interface Props {
  currentDate: string;
  todayKey: string;
  maxBack: number;
  onSelect: (date: string) => void;
  weekAnchor: string; // monday of displayed week
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekStrip({ currentDate, todayKey, maxBack, onSelect, weekAnchor, onPrevWeek, onNextWeek }: Props) {
  const days = weekDays(weekAnchor);
  const oldestAllowed = addDays(todayKey, -maxBack);

  const canPrevWeek = addDays(weekAnchor, -1) >= oldestAllowed;

  return (
    <div class="week-strip">
      <button
        class="week-arrow"
        onClick={onPrevWeek}
        disabled={!canPrevWeek}
        title="Förra veckan"
      >
        ◀
      </button>

      <div class="week-days">
        {days.map((day) => {
          const isFuture = day > todayKey;
          const tooOld = day < oldestAllowed;
          const isSelected = day === currentDate;
          const isToday = day === todayKey;
          return (
            <button
              key={day}
              class={[
                'week-day',
                isSelected ? 'selected' : '',
                isToday ? 'today' : '',
                isFuture || tooOld ? 'disabled' : '',
              ].join(' ').trim()}
              onClick={() => !isFuture && !tooOld && onSelect(day)}
              disabled={isFuture || tooOld}
            >
              <span class="week-day-name">{shortDay(day)}</span>
              <span class="week-day-num">{dayNumber(day)}</span>
            </button>
          );
        })}
      </div>

      <button
        class="week-arrow"
        onClick={onNextWeek}
        disabled={days[6] >= todayKey}
        title="Nästa vecka"
      >
        ▶
      </button>
    </div>
  );
}
