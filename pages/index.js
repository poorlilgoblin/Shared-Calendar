import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const router = useRouter();
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    async function fetchCalendars() {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setCalendars(data);
      setLoading(false);
    }
    fetchCalendars();

      // create a channel scoped to all changes in "calendars"
    const channel = supabase
      .channel('public:calendars')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendars' },
        () => {
          fetchCalendars();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

     const createCalendar = async () => {
     if (!newTitle.trim()) return;
-    const { data } = await supabase.from('calendars').insert([{ title: newTitle.trim() }]).single();
+    const { data, error } = await supabase
+      .from('calendars')
+      .insert([{
+        title: newTitle.trim(),
+        owner_id: session.user.id      // <— set the owner
+      }])
+      .single();
     if (error) {
       console.error('Error creating calendar:', error);
       return;
     }
     setNewTitle('');
     router.push(`/calendar/${data.id}`);
   };


  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Calendars</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">
          Logout
        </button>
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="text"
          placeholder="New calendar title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="p-2 border rounded w-64 mr-2"
        />
        <button
          onClick={createCalendar}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : calendars.length ? (
        <ul className="space-y-4">
          {calendars.map(cal => (
            <li key={cal.id}>
              <button
                onClick={() => router.push(`/calendar/${cal.id}`)}
                className="text-blue-600 hover:underline text-lg"
              >
                {cal.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div>No calendars found. Create one above!</div>
      )}
    </div>
  );
}
