import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function InvitePage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) return;
    async function accept() {
      const { data: invite, error: e1 } = await supabase
        .from('invites').select('*').eq('token', token).single();
      if (e1 || !invite) return setStatus('Invalid token');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/');
      await supabase.from('calendar_users').insert([
        { calendar_id: invite.calendar_id, user_id: user.id, role: invite.role }
      ]);
      await supabase.from('invites').update({ accepted: true }).eq('id', invite.id);
      setStatus('Invite accepted!');
    }
    accept();
  }, [token]);

  return <div className="p-4">{status || 'Processing invite...'}</div>;
}
