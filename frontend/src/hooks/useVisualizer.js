import { useState, useEffect, useRef, useCallback } from 'react';

// Central "video player" hook. Components feed it a history array and call
// play/pause/step; it drives currentStep automatically via a timer.
export default function useVisualizer() {
  const [history,      setHistory]      = useState([]);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [speed,        setSpeed]        = useState(100); // ms between frames
  const timerRef = useRef(null);

  // Derived — no useState needed, these are computed facts
  const isSorting  = history.length > 0 && currentStep > 0;
  const isComplete = history.length > 0 && currentStep >= history.length;

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || isComplete) { setIsPlaying(false); return; }
    timerRef.current = setTimeout(() => {
      setCurrentStep(p => Math.min(p + 1, history.length));
    }, speed);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, speed, isComplete, history.length]);

  const load = useCallback((h) => {
    clearTimeout(timerRef.current);
    setHistory(h ?? []);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const play      = useCallback(() => setIsPlaying(true),  []);
  const pause     = useCallback(() => setIsPlaying(false), []);
  const reset     = useCallback(() => { setIsPlaying(false); setCurrentStep(0); }, []);
  const stepBack  = useCallback(() => { setIsPlaying(false); setCurrentStep(p => Math.max(p - 1, 0)); }, []);
  const stepForward = useCallback(() => {
    setCurrentStep(p => Math.min(p + 1, history.length));
  }, [history.length]);

  const handlePlayPause = useCallback(async (fetchFn) => {
    if (isComplete) return;
    if (history.length === 0) {
      // First press — fetch from backend, then start playing
      try {
        const data = await fetchFn();
        load(data.history);
        setIsPlaying(true);
      } catch (err) {
        alert('Could not connect to C++ backend. Is the server running on :8080?');
        console.error(err);
      }
    } else {
      setIsPlaying(p => !p);
    }
  }, [isComplete, history.length, load]);

  return {
    history, currentStep, isPlaying, speed, isSorting, isComplete,
    currentFrame: history[currentStep - 1] ?? null,
    load, play, pause, reset, stepBack, stepForward, handlePlayPause, setSpeed,
  };
}
