"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function VoiceSearchButton({
  onTranscript,
  className = "",
  size = "md",
}: VoiceSearchButtonProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API availability
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN"; // English (India) with fallback

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onTranscript(transcript);
            toast(`Voice heard: "${transcript}"`, "success");
          }
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            toast("Microphone access denied. Please check browser permissions.", "error");
          } else if (event.error !== "no-speech") {
            toast("Voice search unavailable or timed out.", "info");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onTranscript, toast]);

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!recognitionRef.current) {
      toast("Voice search is not supported in this browser. Please type your search.", "info");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        toast("Listening... Speak product, brand, or SKU now", "info");
      } catch (err: any) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <button
      type="button"
      id="voice-search-btn"
      onClick={handleToggleVoice}
      title={isListening ? "Stop listening" : "Search by voice"}
      className={`relative flex items-center justify-center transition-all cursor-pointer ${
        isListening
          ? "text-rose-500 bg-rose-500/10 animate-pulse"
          : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
      } ${
        size === "sm" ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl"
      } ${className}`}
    >
      {isListening ? (
        <>
          <Mic className="w-4 h-4 text-rose-600 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
