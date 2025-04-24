import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CalendarGrid({ year, events, calendarId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('');
  const [dayEvents, setDayEvents] = useState([]);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = (m, y) => new Date(y, m+1, 0).getDate();
  const padCount = m => {
    const first = new Date(year, m, 1).getDay();
    return first === 0 ? 6 : first - 1;
  };

  const onDayClick = dateKey => {
    const dayEv = events.filter(evt => evt.date_key === dateKey);
    if (dayEv.length) {
      setDayEvents(dayEv);
      setCurrentDateKey(dateKey);
      setListModalVisible(true);
    } else {
      setCurrentDateKey(dateKey);
      setEditingEvent(null);
      setEventTitle('');
      setEventColor('');
      setModalVisible(true);
    }
  };

  const onEventClick = evt => {
    setCurrentDateKey(evt.date_key);
    setEditingEvent(evt);
    setEventTitle(evt.title);
    setEventColor(evt.color);
    setListModalVisible(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!eventTitle.trim()) return;
    if (editingEvent) {
      await supabase
        .from('events')
        .update({ title: eventTitle, color: eventColor })
        .eq('id', editingEvent.id);
    } else {
      await supabase
        .from('events')
        .insert([{ calendar_id: calendarId, date_key: currentDateKey, title: eventTitle, color: eventColor }]);
    }
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (editingEvent) {
      await supabase
        .from('events')
        .delete()
        .eq('id', editingEvent.id);
    }
    setModalVisible(false);
  };

  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl mb-4">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
        <input
          type="text"
          placeholder="Event Title"
          value={eventTitle}
          onChange={e => setEventTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="text"
          placeholder="Color (e.g. #00ff00)"
          value={eventColor}
          onChange={e => setEventColor(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-between">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          {editingEvent && <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>}
        </div>
      </div>
    </div>
  );

  const renderListModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl mb-4">Events on {currentDateKey}</h2>
        <ul>
          {dayEvents.map(evt => (
            <li key={evt.id} onClick={() => onEventClick(evt)} className="cursor-pointer py-3 border-b last:border-none">{evt.title}</li>
          ))}
        </ul>
        <button onClick={() => setListModalVisible(false)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Close</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month, m) => (
          <div key={m} className="bg-white p-4 rounded shadow">
            <h3 className="text-center mb-2 font-semibold">{month}</h3>
            <div className="grid grid-cols-7 gap-1">
              {Array(padCount(m)).fill().map((_, i) => <div key={`pad-${i}`}/>)}
              {Array.from({ length: daysInMonth(m, year) }, (_, i) => {
                const day = i+1;
                const dateKey = `${year}-${m+1}-${day}`;
                const dayEv = events.filter(e => e.date_key === dateKey);
                return (
                  <div key={dateKey} className="relative border h-16 p-1 text-sm cursor-pointer" onClick={() => onDayClick(dateKey)}>
                    <span className="block mb-1">{day}</span>
                    {dayEv.map((ev, idx) => (
                      <div key={ev.id} className="h-1 rounded absolute left-1 right-1" style={{ bottom: `${4+idx*6}px`, backgroundColor: ev.color }} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {modalVisible && renderModal()}
      {listModalVisible && renderListModal()}
    </>
  );
}
