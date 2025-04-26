// pages/calendar/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CalendarGrid from '../../components/CalendarGrid';
import InviteModal from '../../components/InviteModal';

export default function CalendarPage({ session }) {
  const router = useRouter();
  const calendarId = router.query.id;

  // event list & loading flag
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const titleRef = useRef();
  const colorRef = useRef();

  // invite modal
  const [inviteOpen, setInviteOpen] = useState(false);

  // theme
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem('themeMode') || 'system'
  );
  const [manualDark, setManualDark] = useState(
    () => localStorage.getItem('manualDark') === 'true'
  );

  // load events from Supabase
  useEffect(() => {
    if (!calendarId) return;
    setLoading(true);
    supabase
      .from('events')
      .select('*')
      .eq('calendar_id', calendarId)
      .then(({ data }) => {
        setEvents(
          data.map(evt => ({
            ...evt,
            date_key: evt.date.split('T')[0], // "YYYY-MM-DD"
          }))
        );
        setLoading(false);
      });
  }, [calendarId]);

  // apply theme
  useEffect(() => {
    const apply = () => {
      let useDark = false;
      if (themeMode === 'system') {
        useDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else if (themeMode === 'time') {
        const h = new Date().getHours();
        useDark = h < 6 || h >= 19;
      } else {
        useDark = manualDark;
      }
      document.body.classList.toggle('dark', useDark);
      localStorage.setItem('themeMode', themeMode);
      localStorage.setItem('manualDark', manualDark);
    };
    apply();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
  }, [themeMode, manualDark]);

  // open the add/edit modal
  function openModal(dateKey, evt = null) {
    setEditingEvent(evt);
    setModalDate(dateKey);
    setModalOpen(true);
    // preload inputs
    setTimeout(() => {
      titleRef.current.value = evt?.title || '';
      colorRef.current.value = evt?.color || '';
    }, 0);
  }

  // save or update event
  async function saveEvent() {
    const title = titleRef.current.value.trim();
    const color = colorRef.current.value.trim() || 'purple';
    if (!title) {
      alert('Event title can’t be blank');
      return;
    }

    const payload = {
      calendar_id: calendarId,
      date: modalDate,
      title,
      color,
    };

    if (editingEvent) {
      // update
      await supabase
        .from('events')
        .update(payload)
        .eq('id', editingEvent.id);
    } else {
      // insert
      await supabase.from('events').insert(payload);
    }

    // reload events
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('calendar_id', calendarId);
    setEvents(
      data.map(evt => ({
        ...evt,
        date_key: evt.date.split('T')[0],
      }))
    );

    setModalOpen(false);
  }

  // delete event
  async function deleteEvent() {
    if (!editingEvent) return;
    await supabase.from('events').delete().eq('id', editingEvent.id);
    setEvents(events.filter(e => e.id !== editingEvent.id));
    setModalOpen(false);
  }

  if (loading) return <div>Loading…</div>;
  if (!session) return <div>Please sign in</div>;

  return (
    <div>
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shared Calendar</h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Invite Collaborators
        </button>
      </div>

      {/* Theme selector */}
      <div className="settings">
        <label>Theme:</label>
        <select
          value={themeMode}
          onChange={e => setThemeMode(e.target.value)}
        >
          <option value="system">System</option>
          <option value="time">Time</option>
          <option value="manual">Manual</option>
        </select>
        {themeMode === 'manual' && (
          <label style={{ marginLeft: '8px' }}>
            <input
              type="checkbox"
              checked={manualDark}
              onChange={e => setManualDark(e.target.checked)}
            />{' '}
            Dark
          </label>
        )}
      </div>

      {/* The calendar grid */}
      <CalendarGrid
        year={new Date().getFullYear()}
        events={events}
        onDayClick={dateKey => openModal(dateKey)}
      />

      {/* Event modal */}
      {modalOpen && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal">
            <h2>{editingEvent ? 'Edit Event' : 'New Event'}</h2>
            <input ref={titleRef} type="text" placeholder="Event Title" />
            <input ref={colorRef} type="text" placeholder="Color" />
            <div className="modal-actions">
              <button onClick={saveEvent}>Save</button>
              {editingEvent && <button onClick={deleteEvent}>Delete</button>}
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <InviteModal
          calendarId={calendarId}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
