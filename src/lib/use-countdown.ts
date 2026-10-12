import { useEffect, useRef, useState } from 'react';

/** Ticking countdown (seconds) for OTP resend / 2FA 30s refresh rings. Call `restart()` to reset. */
export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const restart = (seconds = initialSeconds) => setRemaining(seconds);

  return { remaining, restart, isDone: remaining <= 0 };
}
