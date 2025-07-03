
// Add type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if (this.isSupported()) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    }
  }

  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  start(options: VoiceRecognitionOptions): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    this.recognition.lang = options.language || 'en-US';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      options.onStart?.();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      options.onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      options.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceRecognition = new VoiceRecognition();
