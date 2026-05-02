import { useCallback, useEffect, useRef } from "react";

const INITIAL_DELAY = 400;
const REPEAT_INTERVAL = 80;

export const useLongPress = (fn: () => void) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current ?? undefined);
    clearInterval(intervalRef.current ?? undefined);
  }, []);

  const start = useCallback(() => {
    fnRef.current();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => fnRef.current(), REPEAT_INTERVAL);
    }, INITIAL_DELAY);
  }, []);

  useEffect(() => stop, [stop]);

  return {
    onPointerDown: start,
    onPointerLeave: stop,
    onPointerUp: stop,
  };
};
