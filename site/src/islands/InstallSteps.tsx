// "Set up in three steps": a stepper, and for the chosen step a short loop of that exact screen, played by the
// drawn cursor (choreo.ts). The loops can't be clicked; the visitor only switches steps. Each loop lasts what its
// label says, and stands still while it's off screen or motion is turned down.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createChoreo, type Choreo } from './choreo';
import { Cursor, Ui } from './demo/parts';
import { AppWindow, DownloadDone, Extensions, FolderDialog, Installer, KeyChip, Protected, type SetupStage } from './screens';
import { useMotionPref } from './motion-pref';

interface Step { n: number; title: string; text: string; loop: string }
const PATH = 'C:\\Users\\Public\\AppData\\Local\\YT Download Manager\\extension';

type Scene = {
  dl?: boolean; ss?: 'off' | 'less' | 'more'; setup?: SetupStage | null; pct?: number;
  app?: 'off' | 'not' | 'copied' | 'on'; ext?: 'off' | 'plain' | 'dev' | 'loaded'; fd?: string | null; keys?: boolean; front?: 'app' | 'ext';
};
const FIRST: Record<number, Scene> = {
  1: { dl: true, ss: 'off', setup: null },
  2: { setup: 'start' },
  3: { app: 'not', ext: 'off', front: 'app' },
};

export default function InstallSteps({ steps, labelPrefix }: { steps: Step[]; labelPrefix: string }) {
  const [active, setActive] = useState(0);
  const reduced = useMotionPref() === 'reduced';
  const [sc, setSc] = useState<Scene>(FIRST[1]);
  const [ui, setUi] = useState<{ hover: string | null; press: string | null }>({ hover: null, press: null });
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = steps[active].n;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useLayoutEffect(() => { (window as Window & { __fitStages?: () => void }).__fitStages?.(); }, []);

  useEffect(() => {
    setSc(FIRST[n]);
    setUi({ hover: null, press: null });
    if (reduced) { setSc(n === 1 ? { ss: 'more', setup: null } : n === 2 ? { setup: 'done' } : { app: 'on', ext: 'loaded', front: 'app' }); return; }
    const c = new AbortController();
    const ch = createChoreo({ root: root.current!, cursor: cursor.current!, show: `install-${n}`, signal: c.signal, live: () => visible.current && !document.hidden, setUi });
    const set = (p: Scene) => setSc((s) => ({ ...s, ...p }));
    const loops: Record<number, (ch: Choreo) => Promise<void>> = {
      async 1(ch) {
        set(FIRST[1]);
        await ch.enter(560, 380);
        await ch.click('dl-file', () => set({ dl: false, ss: 'less' }), 600);
        await ch.wait(700);
        await ch.click('ss-more', () => set({ ss: 'more' }), 520);
        await ch.wait(600);
        await ch.click('ss-run', () => set({ ss: 'off', setup: 'start' }), 520);
        await ch.wait(1500);
        await ch.leave();
        await ch.wait(500);
      },
      async 2(ch) {
        set(FIRST[2]);
        await ch.enter(600, 390);
        await ch.click('setup-install', () => set({ setup: 'working', pct: 0 }), 600);
        await ch.move('setup-anchor', 500);
        await ch.tween(1700, (k) => set({ pct: k * 100 }));
        set({ setup: 'done' });
        await ch.wait(500);
        await ch.click('setup-open', () => set({ setup: null, app: 'not' }), 450);
        await ch.wait(1300);
        await ch.leave();
        await ch.wait(400);
      },
      async 3(ch) {
        set(FIRST[3]);
        await ch.enter(560, 400);
        await ch.click('app-add', () => set({ app: 'copied', ext: 'plain', front: 'ext' }), 600);
        await ch.wait(500);
        await ch.click('ext-dev', () => set({ ext: 'dev' }), 650);
        await ch.wait(350);
        await ch.click('ext-load', () => set({ fd: '' }), 520);
        await ch.wait(400);
        await ch.click('fd-bar', () => set({ keys: true }), 480);
        await ch.wait(450);
        set({ fd: PATH, keys: false });
        await ch.wait(400);
        await ch.click('fd-select', () => set({ fd: null, ext: 'loaded' }), 480);
        await ch.wait(900);
        set({ app: 'on', front: 'app' }); // the app window now says Connected
        await ch.wait(1700);
        await ch.leave();
        await ch.wait(400);
      },
    };
    (async () => {
      for (;;) {
        await loops[n](ch);
        setUi({ hover: null, press: null });
      }
    })().catch((e) => { if ((e as Error).name !== 'AbortError') throw e; });
    return () => c.abort();
  }, [n, reduced]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + steps.length) % steps.length;
    setActive(j);
    tabs.current[j]?.focus();
  };

  return (
    <div className="steps">
      <div className="steps-list" role="tablist" aria-label="Install steps" aria-orientation="vertical">
        {steps.map((s, i) => (
          <button key={s.n} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`step-tab-${s.n}`} aria-controls="step-panel" aria-selected={i === active}
            tabIndex={i === active ? 0 : -1} className="step" onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}>
            <span className="step-n mono">{s.n}</span>
            <span className="step-body">
              <span className="step-title">{s.title}</span>
              <span className="step-text">{s.text}</span>
            </span>
            <span className="step-loop mono" aria-label={`Loop, ${s.loop}`}>{s.loop}</span>
          </button>
        ))}
      </div>
      <div className="steps-stage" id="step-panel" role="tabpanel" aria-labelledby={`step-tab-${n}`}>
        <div className="stage stage-scr" role="img" aria-label={`${labelPrefix} ${steps[active].title}. ${steps[active].text}`} style={{ '--dw-d': '720', '--dh-d': '450' } as CSSProperties}>
          <div className="stage-inner">
            <Ui.Provider value={ui}>
              <div ref={root} className="scr" inert>
                {sc.dl && <div className="at" style={{ left: 180, top: 70 }}><DownloadDone /></div>}
                {sc.ss && sc.ss !== 'off' && <div className="at pop-in" style={{ left: 125, top: 60 }}><Protected more={sc.ss === 'more'} /></div>}
                {sc.setup && <div className="at pop-in" style={{ left: 149, top: 50 }}><Installer stage={sc.setup} pct={sc.pct} /><span data-t="setup-anchor" className="anchor" style={{ left: 330, top: 250 }} /></div>}
                {sc.app && sc.app !== 'off' && <div className={`at pop-in${sc.front === 'ext' ? ' back' : ''}`} style={{ left: sc.ext && sc.ext !== 'off' ? 24 : 137, top: 18, zIndex: sc.front === 'app' ? 3 : 1 }}><AppWindow connected={sc.app === 'on'} copied={sc.app === 'copied'} /></div>}
                {sc.ext && sc.ext !== 'off' && <div className={`at pop-in${sc.front === 'app' ? ' back' : ''}`} style={{ left: 64, top: 100, zIndex: 2 }}><Extensions dev={sc.ext !== 'plain'} loaded={sc.ext === 'loaded'} /></div>}
                {sc.fd !== undefined && sc.fd !== null && <div className="at pop-in" style={{ left: 100, top: 128, zIndex: 4 }}><FolderDialog path={sc.fd} /></div>}
                {sc.keys && <div className="at" style={{ left: 330, top: 150, zIndex: 5 }}><KeyChip keys="Ctrl+V" /></div>}
                <div ref={cursor} className="s-cursor" style={{ opacity: 0 }}><Cursor press={!!ui.press} /></div>
              </div>
            </Ui.Provider>
          </div>
        </div>
        <p className="step-now">{steps[active].text}</p>
      </div>
    </div>
  );
}
