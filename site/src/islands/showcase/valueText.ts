// React Aria reads slider values out as numbers ("3", "245"). These sliders mean "480p" and "04:05", so the
// text screen readers announce is set on the slider's inputs after each render.
import { useLayoutEffect, type RefObject } from 'react';

export function useValueText(root: RefObject<HTMLElement | null>, texts: string[]) {
  const key = texts.join('|');
  useLayoutEffect(() => {
    root.current?.querySelectorAll('input[type="range"]').forEach((input, i) => {
      if (texts[i]) input.setAttribute('aria-valuetext', texts[i]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
