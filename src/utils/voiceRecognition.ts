
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
      this.recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
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
