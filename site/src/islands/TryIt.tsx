// Try it: the page's only interactive section. Five tabs over one demo; each tab opens its scene mid-use, and the
// caption under the player says what it shows. On phones the demo is a picture (its real-size buttons would be
// too small to tap); the tabs still switch it.
//
// While nobody touches it, a guided tour plays: the drawn cursor shows each tab's story, then the next
// tab, round and round, only while the section is in view. Any pointer or key input inside takes over and stops the
// tour. After 8 s without input, "Resuming tour" shows briefly and the tour goes on from the current tab.
import * as Tabs from '@radix-ui/react-tabs';
import { useCallback, useEffect, useRef, useState } from 'react';
import Demo from './Demo';
import type { FilmSrc } from './demo/parts';
import type { VideoData } from './demo/model';
import { useMotionPref } from './motion-pref';

interface Tab { id: 'video' | 'audio' | 'trim' | 'shorts' | 'history'; label: string; caption: string }

const IDLE_MS = 8000;
const HINT_MS = 1400;

export default function TryIt({ tabs, video, short, film, cover, resumeText }: { tabs: Tab[]; video: VideoData; short: VideoData; film: FilmSrc; cover: string; resumeText: string }) {
  const [tab, setTab] = useState<Tab['id']>('video');
  const [tour, setTour] = useState(true);
  const [hint, setHint] = useState(false);
  const reduced = useMotionPref() === 'reduced';
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const cur = tabs.find((t) => t.id === tab)!;

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  // The visitor did something: the tour stops, and comes back after 8 s of quiet.
  const takeOver = useCallback(() => {
    clear();
    setTour(false);
    setHint(false);
    timers.current.push(window.setTimeout(() => {
      setHint(true);
      timers.current.push(window.setTimeout(() => { setHint(false); setTour(true); }, HINT_MS));
    }, IDLE_MS));
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // A mouse that really moves counts; the page scrolling under a resting pointer (no movement) and the wheel don't,
    // so scrolling past the section never stops the tour.
    const onMove = (e: PointerEvent) => { if (e.pointerType !== 'touch' && (e.movementX || e.movementY)) takeOver(); };
    el.addEventListener('pointerdown', takeOver);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('keydown', takeOver);
    return () => {
      el.removeEventListener('pointerdown', takeOver);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('keydown', takeOver);
      clear();
    };
  }, [takeOver]);

  const next = useCallback(() => {
    setTab((t) => tabs[(tabs.findIndex((x) => x.id === t) + 1) % tabs.length].id);
  }, [tabs]);

  return (
    <div ref={box}>
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as Tab['id'])} className="try" activationMode="automatic">
        <Tabs.List className="try-tabs" aria-label="What to try">
          {tabs.map((t) => (
            <Tabs.Trigger key={t.id} value={t.id} className="try-tab">{t.label}</Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value={tab} forceMount className="try-panel" data-cursor="try" data-tour={tour && !reduced ? '' : undefined}>
          <Demo key={tab} mode="try" scene={tab} data={tab === 'shorts' ? short : video} film={film} cover={cover} label={`${cur.label}: ${cur.caption}`}
            tour={tour && !reduced} onTourEnd={next} />
          <div className="try-foot">
            <p className="try-caption" aria-live="polite">{cur.caption}</p>
            <p className="try-resume mono" data-on={hint ? '' : undefined} aria-live="polite">{hint ? resumeText : ''}</p>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
