'use client';

import { useEffect, useState } from 'react';
import { UltravoxSession } from 'ultravox-client';

export default function HomePage() {
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('disconnected');
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStarted) return;

    const initializeSession = async () => {
      try {
        const res = await fetch('/api/call', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          setError(`Failed to start call: ${errorData.error || res.statusText}`);
          return;
        }

        const data = await res.json();
        const uvSession = new UltravoxSession();
        
        uvSession.addEventListener('status', () => {
          setStatus(uvSession.status);
        });
        
        uvSession.addEventListener('transcripts', () => {
          const texts = uvSession.transcripts.map((t) => `${t.speaker}: ${t.text}`);
          setTranscripts(texts);
        });

        uvSession.joinCall(data.joinUrl);
        setSession(uvSession);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      }
    };

    initializeSession();

    return () => {
      if (session) {
        session.leaveCall();
      }
    };
  }, [isStarted]);

  const startConversation = () => {
    setError(null);
    setIsStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        {!isStarted ? (
          <div className="text-white text-center py-20">
            <h1 className="text-5xl font-bold mb-8">Voice AI Assistant</h1>
            <p className="text-xl mb-12">Start a conversation with our AI assistant</p>
            <button
              onClick={startConversation}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Start Talking Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-6 mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Voice Chat</h2>
              <span className="text-sm text-gray-500">Status: {status}</span>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {transcripts.map((transcript, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  {transcript}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}