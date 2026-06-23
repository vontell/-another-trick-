import { useCallback, useEffect, useRef } from 'react';

// A stack of the currently-mounted, enabled typing surfaces. Only the one on
// top responds to the physical keyboard, so a dialog opened over a room (e.g.
// the meta puzzle on top of an open room panel) doesn't leak keystrokes into
// the surface beneath it.
let nextId = 0;
const stack: number[] = [];

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

  const idRef = useRef<number>();
  if (idRef.current === undefined) idRef.current = nextId++;

  const press = useCallback(
    (key: string) => {
      if (disabled) return;
      if (key === 'ENTER') onEnter();
      else if (key === 'BACK') onBackspace();
      else if (/^[A-Z]$/.test(key)) onLetter(key);
    },
    [disabled, onLetter, onBackspace, onEnter],
  );

  // Register this surface on the stack while it's enabled; the last to mount
  // (the topmost overlay) wins ownership of the physical keyboard.
  useEffect(() => {
    if (disabled) return;
    const id = idRef.current!;
    stack.push(id);
    return () => {
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Only the topmost typing surface handles physical key presses.
      if (stack[stack.length - 1] !== idRef.current) return;
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
