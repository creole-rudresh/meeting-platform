'use client';

import { useState } from 'react';

export default function Home() {
  const [meetingDetails, setMeetingDetails] = useState({
    dialInNumber: '',
    meetingId: '',
    passcode: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending invitation...');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingDetails),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('✅ Agent is on its way to the meeting!');
      } else {
        setStatus(`❌ Error: ${data.error || 'Failed to initiate call'}`);
      }
    } catch (err) {
      setStatus('❌ Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Vapi Meeting Agent
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Invite your AI assistant to any Zoom or Google Meet session via PSTN.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Meeting Dial-in Number</label>
            <input
              type="text"
              required
              placeholder="(US) +1 413-418-4561"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
              value={meetingDetails.dialInNumber}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, dialInNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Meeting ID / PIN</label>
            <input
              type="text"
              required
              placeholder="838 772 169#"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
              value={meetingDetails.meetingId}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, meetingId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Passcode (Optional)</label>
            <input
              type="text"
              placeholder="123456"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
              value={meetingDetails.passcode}
              onChange={(e) => setMeetingDetails({ ...meetingDetails, passcode: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${loading
              ? 'bg-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 shadow-purple-500/25 shadow-xl'
              }`}
          >
            {loading ? 'Initiating...' : 'Invite Agent to Meeting'}
          </button>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-xl bg-slate-800/50 text-center text-sm border border-slate-700">
            {status}
          </div>
        )}
      </div>

      <div className="mt-8 text-slate-500 text-sm max-w-sm text-center">
        Ensure your Google Meet or Zoom has "Dial-in" enabled. The agent will join as a phone participant.
      </div>
    </main>
  );
}
