import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared digit-buffer state for PIN/OTP entry screens, driven by <NumericKeypad>.
 * Fires `onComplete` via an effect (not inline during `append`) so callers can safely reference
 * `clear`/other values from the same destructuring without a temporal-dead-zone hazard.
 */
export function useNumericKeypad(maxLength: number, onComplete?: (value: string) => void) {
  const [value, setValue] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const append = useCallback(
    (d: string) => setValue((prev) => (prev.length >= maxLength ? prev : prev + d)),
    [maxLength]
  );
  const backspace = useCallback(() => setValue((prev) => prev.slice(0, -1)), []);
  const clear = useCallback(() => setValue(''), []);

  useEffect(() => {
    if (value.length === maxLength) onCompleteRef.current?.(value);
  }, [value, maxLength]);

  return { value, append, backspace, clear };
}
