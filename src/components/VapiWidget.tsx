'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

type Props = {
  assistantId: string;
  publicKey?: string | null;
};

type CallState = 'idle' | 'connecting' | 'in-call' | 'speaking';

export default function VapiWidget({ assistantId, publicKey }: Props) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const projectKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const effectiveKey = publicKey?.trim() || projectKey;

    if (!effectiveKey) {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (stopError) {
          console.error('Failed to stop Vapi client during reinitialisation', stopError);
        }
      }
      vapiRef.current = null;
      setCallState('idle');
      setMessages([]);
      setError(
        'Vapi public key is not configured. Provide a per-agent key or set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your environment.'
      );
      return;
    }

    setMessages([]);
    setCallState('idle');
    setError(null);

    const client = new Vapi(effectiveKey);
    vapiRef.current = client;

    const handleCallStart = () => {
      setCallState('in-call');
      setError(null);
    };

    const handleCallEnd = () => {
      setCallState('idle');
    };

    const handleSpeechStart = () => {
      setCallState('speaking');
    };

    const handleSpeechEnd = () => {
      setCallState('in-call');
    };

    const handleMessage = (message: unknown) => {
      setMessages((prev) => [
        ...prev,
        typeof message === 'string' ? message : JSON.stringify(message),
      ]);
    };

    const handleError = (event: unknown) => {
      const details =
        typeof event === 'string'
          ? event
          : event instanceof Error
          ? event.message
          : 'An unexpected error occurred while using Vapi.';
      setError(details);
      setCallState('idle');
    };

    client.on('call-start', handleCallStart);
    client.on('call-end', handleCallEnd);
    client.on('speech-start', handleSpeechStart);
    client.on('speech-end', handleSpeechEnd);
    client.on('message', handleMessage);
    client.on('error', handleError);

    return () => {
      try {
        client.off('call-start', handleCallStart);
        client.off('call-end', handleCallEnd);
        client.off('speech-start', handleSpeechStart);
        client.off('speech-end', handleSpeechEnd);
        client.off('message', handleMessage);
        client.off('error', handleError);
      } catch (subscriptionError) {
        console.error('Failed to remove Vapi event listeners', subscriptionError);
      }

      try {
        client.stop();
      } catch (stopError) {
        console.error('Failed to stop Vapi client', stopError);
      }

      vapiRef.current = null;
    };
  }, [publicKey]);

  const startCall = async () => {
    if (!vapiRef.current) {
      setError('Vapi is not ready yet.');
      return;
    }

    setError(null);
    setCallState('connecting');

    try {
      await vapiRef.current.start(assistantId);
    } catch (startError) {
      console.error('Failed to start Vapi call', startError);
      setError('Unable to start the call. Check the assistant ID and try again.');
      setCallState('idle');
    }
  };

  const stopCall = async () => {
    if (!vapiRef.current) {
      return;
    }

    try {
      await vapiRef.current.stop();
    } catch (stopError) {
      console.error('Failed to stop Vapi call', stopError);
      setError('Unable to stop the call. Please refresh and try again.');
    }
  };

  const isButtonDisabled = callState === 'connecting';

  return (
    <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Voice Agent</h2>
      <p className="mt-1 text-sm text-slate-600">
        Use the controls below to start or stop a live Vapi voice session for this agent.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={startCall}
          disabled={isButtonDisabled || callState === 'in-call' || callState === 'speaking'}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {callState === 'connecting' ? 'Connecting…' : 'Start Call'}
        </button>
        <button
          type="button"
          onClick={stopCall}
          disabled={callState === 'idle' || callState === 'connecting'}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          End Call
        </button>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Status: {callState.replace('-', ' ')}
        </span>
      </div>

      {messages.length > 0 ? (
        <div className="mt-6 max-h-48 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Event Log
          </h3>
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li key={`${message}-${index}`} className="rounded bg-white p-2 shadow-sm">
                {message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
