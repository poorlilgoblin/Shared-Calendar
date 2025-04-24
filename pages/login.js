// pages/login.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Signing you in…');

  useEffect(() => {
    async function handleMagicLink() {
      try {
        const { data, error } = 
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) throw error;
        if (data.session) {
          router.replace('/');
        } else {
          setStatus('No session in URL');
        }
      } catch (err) {
        console.error(err);
        setStatus('Error: ' + err.message);
      }
    }
    if (router.asPath.includes('access_token=')) {
      handleMagicLink();
    }
  }, [router]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>{status}</p>
    </div>
  );
}
