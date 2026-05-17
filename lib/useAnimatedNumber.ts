import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(value: number, duration = 500): number {
  const [displayed, setDisplayed] = useState(value);
  const displayedRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const from = displayedRef.current;
    const to = value;

    if (from === to) {
      setDisplayed(to);
      return;
    }

    let startTime: number | null = null;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const progress = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = from + (to - from) * progress;
      displayedRef.current = current;
      setDisplayed(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        displayedRef.current = to;
        setDisplayed(to);
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, duration]);

  return displayed;
}
