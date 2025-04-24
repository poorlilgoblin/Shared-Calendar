import React, { useState } from 'react';

export default function InviteModal({ calendarId, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [status, setStatus] = useState(null);

  const sendInvite = async () => {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendar_id: calendarId, email, role }),
    });
    const data = await res.json();
    if (data.token) {
      setStatus({ success: `Invite link: /invite?token=${data.token}` });
    } else {
      setStatus({ error: data.error || 'Error creating invite' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h2 className="text-xl mb-4">Invite Collaborator</h2>
        <input
          type="email"
          className="w-full p-2 border rounded mb-3"
          placeholder="friend@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded mb-3">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        {status?.error && <p className="text-red-600">{status.error}</p>}
        {status?.success && <p className="text-green-600">{status.success}</p>}
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={sendInvite} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
