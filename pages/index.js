// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const router = useRouter();
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // DEBUG: log session
  console.log('Logged in session:', session);

  // Fetch calendars on mount
  useEffect(() => {
    async function fetchCalendars() {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading calendars:', error);
      } else {
        setCalendars(data);
      }
      setLoading(false);
    }

    fetchCalendars();
  }, []);

  // Create a new calendar
  const createCalendar = async () => {
    setErrorMsg('');
    if (!newTitle.trim()) {
      setErrorMsg('Please enter a calendar title.');
      return;
    }
//
    const payload = {
      title: newTitle.trim(),
      owner_id: session?.user?.id,
    };
    console.log('Inserting calendar payload:', payload);

    try {
      const { data, error } = await supabase
        .from('calendars')
        .insert([payload])
        .select()      // return the inserted row
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        setErrorMsg(JSON.stringify(error));
        return;
      }

      console.log('Created calendar:', data);
      setNewTitle('');
      router.push(`/calendar/${data.id}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMsg(err.message ?? JSON.stringify(err));
    }
  };

  // Sign the user out
  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Calendars</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="text"
          placeholder="New calendar title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="p-2 border rounded w-64 mr-2"
        />
        <button
          onClick={createCalendar}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create
        </button>
      </div>
      {errorMsg && (
        <div className="text-red-600 mb-4">{errorMsg}</div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : calendars.length ? (
        <ul className="space-y-4">
          {calendars.map((cal) => (
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
