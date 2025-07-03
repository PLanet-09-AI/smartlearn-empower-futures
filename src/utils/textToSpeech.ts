
export const speakText = (text: string) => {
  // Check if speech synthesis is available
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure the utterance
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for better comprehension
  utterance.pitch = 1;
  utterance.volume = 1;

  // Speak the text
  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};
