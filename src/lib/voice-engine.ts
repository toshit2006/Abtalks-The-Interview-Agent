/**
 * Native Web Speech API integration for real-time Text-to-Speech (TTS)
 * and Speech-to-Text (STT) mic input. Zero external SDK dependency.
 */

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: Array<Array<{ transcript: string }> & { isFinal?: boolean }>;
};

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: { error?: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  } | null = null;

  public isListening = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as Record<string, unknown>)["SpeechRecognition"] ||
        (window as unknown as Record<string, unknown>)["webkitSpeechRecognition"];
      if (SpeechRecognition && typeof SpeechRecognition === "function") {
        this.recognition = new (SpeechRecognition as new () => VoiceEngine["recognition"])();
        if (this.recognition) {
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = "en-US";
        }
      }
    }
  }

  /** Speak text out loud using browser Web Speech API */
  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (onEnd) utterance.onend = onEnd;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) this.synth.cancel();
  }

  /** Listen for voice input from candidate microphone */
  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
  ) {
    if (!this.recognition) {
      onError?.("Web SpeechRecognition is not supported in this browser.");
      return;
    }
    try {
      this.isListening = true;
      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let transcript = "";
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0]) {
            transcript += item[0].transcript;
            if (item.isFinal) isFinal = true;
          }
        }
        onResult(transcript, isFinal);
      };
      this.recognition.onerror = (e: { error?: string }) => {
        this.isListening = false;
        onError?.(e.error || "Speech recognition error");
      };
      this.recognition.onend = () => {
        this.isListening = false;
      };
      this.recognition.start();
    } catch {
      this.isListening = false;
      onError?.("Could not access microphone.");
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceEngine = new VoiceEngine();
