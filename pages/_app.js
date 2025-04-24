import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import '../styles/globals.css';

function Auth() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const signIn = async () => {
    if (!email) return setMsg('Please enter an email.');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg(error.message);
    else setMsg('Magic link sent! Check your email.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-4 text-center">Sign In</h1>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={signIn}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >Send Magic Link</button>
        {msg && <p className="mt-4 text-center">{msg}</p>}
      </div>
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session && router.pathname !== '/login') {
        router.replace('/login');
      }
      if (data.session && router.pathname === '/login') {
        router.replace('/');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.replace('/login');
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (!session || router.pathname === '/login') {
    if (router.pathname === '/login') return <Auth />;
    return null;
  }

  return <Component {...pageProps} session={session} />;
}
