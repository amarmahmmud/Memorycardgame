export default function speakArabic(text) {
  if (!window || !window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);
  // Try to find an Arabic voice
  const voices = window.speechSynthesis.getVoices();
  let ar = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'))
           || voices.find(v => v.name && /arab/i.test(v.name));
  if (ar) utter.voice = ar;
  utter.lang = 'ar-SA';
  utter.rate = 1;
  utter.pitch = 1;
  // On some browsers voices load asynchronously
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const loaded = window.speechSynthesis.getVoices();
      const found = loaded.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'))
                 || loaded.find(v => v.name && /arab/i.test(v.name));
      if (found) utter.voice = found;
      window.speechSynthesis.speak(utter);
    };
  } else {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
}
