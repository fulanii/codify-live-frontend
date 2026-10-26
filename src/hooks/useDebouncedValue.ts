import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    // Clearing on every change is what makes this a debounce rather than a
    // throttle: only the last value in a burst survives the delay.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
