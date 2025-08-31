import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onResult: (text: string) => void;
  disabled?: boolean;
};

export default function MicRecorder({ onResult, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (ev: any) => {
      try {
        const transcript = Array.from(ev.results)
          .map((r: any) => r[0].transcript)
          .join('');
        // Only send final transcripts to the parent to avoid noisy intermediate updates
        if (ev.results[0] && ev.results[0].isFinal) {
          onResult(transcript.trim());
        }
      } catch (e) {
        console.error('MicRecorder parse error', e);
      }
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [onResult]);

  const toggle = () => {
    if (disabled) return;
    const rec = recognitionRef.current;
    if (!rec) {
      // Feature not supported
      alert('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (listening) {
      try {
        rec.stop();
      } catch (e) {
        console.error(e);
      }
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch (e) {
        console.error('Could not start recognition', e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm ${listening ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
        <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 5 6.9V21a1 1 0 0 0 2 0v-3.1A7 7 0 0 0 19 11z" />
      </svg>
      {listening ? 'Stop' : 'Mic'}
    </button>
  );
}
