import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const { calendar_id, email, role } = req.body;
  const token = uuidv4();
  const { data, error } = await supabase
    .from('invites')
    .insert([{ calendar_id, email, role, token }]);
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ token });
}
