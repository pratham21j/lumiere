"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

/**
 * Voice input via the Web Speech API. Renders nothing when the browser
 * doesn't support it — voice is an enhancement, never a requirement.
 */

// Minimal typings for the vendor-prefixed API.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognizer(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognizerRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    recognizerRef.current = getRecognizer();
    setSupported(Boolean(recognizerRef.current));
    return () => recognizerRef.current?.stop();
  }, []);

  if (!supported) return null;

  function toggle() {
    const rec = recognizerRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onTranscript(transcript);
    };
    rec.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access was blocked. Allow it in your browser settings.");
      }
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Search by voice"}
      aria-pressed={listening}
      className={`grid size-11 shrink-0 place-items-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor ${
        listening
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-border bg-surface text-ash hover:text-linen"
      }`}
    >
      {listening ? (
        <MicOff aria-hidden className="size-4 animate-pulse" />
      ) : (
        <Mic aria-hidden className="size-4" />
      )}
    </button>
  );
}
