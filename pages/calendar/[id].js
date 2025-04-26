// pages/calendar/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CalendarGrid from '../../components/CalendarGrid';
import InviteModal from '../../components/InviteModal';

export default function CalendarPage({ session }) {
  const router = useRouter();
  const calendarId = router.query.id;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const titleRef = useRef();
  const colorRef = useRef();

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);

  // Load events
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
            date_key: evt.date.split('T')[0] // ensure YYYY-MM-DD
          }))
        );
        setLoading(false);
      });
  }, [calendarId]);

  // Open event modal
  function openModal(dateKey, evt = null) {
    setEditingEvent(evt);
    setModalDate(dateKey);
    setModalOpen(true);
    setTimeout(() => {
      titleRef.current.value = evt?.title || '';
      colorRef.current.value = evt?.color || '';
    }, 0);
  }

  // Save or update event
  async function saveEvent() {
    const title = titleRef.current.value.trim();
    const color = colorRef.current.value.trim() || 'purple';
    if (!title) return alert('Title cannot be blank');

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

    // refresh list
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

  // Delete event
  async function deleteEvent() {
    if (!editingEvent) return;
    await supabase.from('events').delete().eq('id', editingEvent.id);
    setEvents(events.filter(e => e.id !== editingEvent.id));
    setModalOpen(false);
  }

  if (loading) return <div>Loading...</div>;
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

      {/* Calendar Grid */}
      <CalendarGrid
        year={new Date().getFullYear()}
        events={events}
        onDayClick={dateKey => openModal(dateKey)}
      />

      {/* Event Modal */}
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

      {/* Invite Modal */}
      {inviteOpen && (
        <InviteModal
          calendarId={calendarId}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
