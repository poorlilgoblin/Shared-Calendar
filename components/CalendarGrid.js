// components/CalendarGrid.js
import React from 'react';

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarGrid({ year, events = [], onDayClick }) {
  return (
    <div className="calendar">
      {months.map((monthName, mIndex) => {
        // calculate padding for first day
        const firstDay = new Date(year, mIndex, 1).getDay();
        const pad = firstDay === 0 ? 6 : firstDay - 1;

        // build all day cells (pads + dates)
        const cells = [];

        // empty pad cells
        for (let i = 0; i < pad; i++) {
          cells.push(<div key={`pad-${mIndex}-${i}`} />);
        }
        // actual date cells
        for (let day = 1; day <= daysInMonth(mIndex, year); day++) {
          const dateKey = `${year}-${mIndex + 1}-${day}`;
          const dayEvents = events.filter(evt => evt.date_key === dateKey);

          cells.push(
            <div
              key={dateKey}
              className="day"
              onClick={() => onDayClick?.(dateKey)}
            >
              {day}
              {dayEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="event-bar"
                  style={{
                    bottom: `${2 + idx * 8}px`,
                    backgroundColor: evt.color || 'purple'
                  }}
                />
              ))}
            </div>
          );
        }

        return (
          <div key={mIndex} className="month">
            <h3>{monthName}</h3>
            <div className="days">{cells}</div>
          </div>
        );
      })}
    </div>
  );
}
