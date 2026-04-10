import { useState } from 'preact/hooks';

/** Returns props to spread on a button for reliable iOS touch press animation. */
export function usePress() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    pressProps: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
    },
  };
}
