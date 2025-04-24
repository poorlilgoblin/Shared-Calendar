import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CalendarGrid from '../../components/CalendarGrid';
import InviteModal from '../../components/InviteModal';

export default function CalendarPage() {
  const router = useRouter();
  const { id: calendarId } = router.query;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!calendarId) return;
    async function fetchEvents() {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('calendar_id', calendarId);
      setEvents(data);
      setLoading(false);
    }
    fetchEvents();
    const subscription = supabase
      .from(`events:calendar_id=eq.${calendarId}`)
      .on('INSERT', payload => setEvents(prev => [...prev, payload.new]))
      .on('UPDATE', payload => setEvents(prev => prev.map(evt => evt.id === payload.new.id ? payload.new : evt)))
      .on('DELETE', payload => setEvents(prev => prev.filter(evt => evt.id !== payload.old.id)))
      .subscribe();
    return () => supabase.removeSubscription(subscription);
  }, [calendarId]);

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shared Calendar</h1>
        <button onClick={() => setInviteOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">
          Invite Collaborators
        </button>
      </div>
      <CalendarGrid year={2025} events={events} calendarId={calendarId} />
      {inviteOpen && <InviteModal calendarId={calendarId} onClose={() => setInviteOpen(false)} />}
    </div>
)
