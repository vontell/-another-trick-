import { useCallback, useEffect } from 'react';

/**
 * Wires up typing for an answer field via both the on-screen keyboard
 * (returned `press`) and the physical keyboard (global keydown listener).
 * No native input element is used, so the mobile OS keyboard never appears.
 */
export function useTyping(opts: {
  length: number;
  disabled?: boolean;
  onLetter: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}) {
  const { disabled, onLetter, onBackspace, onEnter } = opts;

  const press = useCallback(
    (key: string) => {
      if (disabled) return;
      if (key === 'ENTER') onEnter();
      else if (key === 'BACK') onBackspace();
      else if (/^[A-Z]$/.test(key)) onLetter(key);
    },
    [disabled, onLetter, onBackspace, onEnter],
  );

  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') press('ENTER');
      else if (e.key === 'Backspace') press('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [press, disabled]);

  return press;
}
