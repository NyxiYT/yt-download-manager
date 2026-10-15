// useScenePlayback: the shared playback model (lib/playback.ts) for the React islands. `live` is a stable function
// for the choreographies (they check it every frame); `playing` is the same value as state, for rendering.
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { scenePlayback, type Playback } from '../lib/playback';

export function useScenePlayback(ref: RefObject<Element | null>) {
  const pb = useRef<Playback | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const p = scenePlayback(ref.current);
    pb.current = p;
    const off = p.onChange(setPlaying);
    return () => { off(); p.dispose(); pb.current = null; };
  }, [ref]);
  const live = useCallback(() => pb.current?.live() ?? false, []);
  return { live, playing };
}
