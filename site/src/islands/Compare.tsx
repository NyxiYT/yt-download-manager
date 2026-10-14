// The same quality list, without and with the Windows app, under one seam you can drag (or move with the arrow keys:
// it's a Radix slider). Without the app the browser only gets what YouTube gives it directly, usually up to 1080p
// (README); with it, every quality the video has. Rows line up, so the difference is exactly what's missing.
import * as Slider from '@radix-ui/react-slider';
import { useRef, useState } from 'react';
import { fmtSize, type VideoData } from './demo/model';
import { Icon } from './demo/parts';

interface Props { data: VideoData; left: { label: string; value: string }; right: { label: string; value: string } }

function List({ data, browserOnly }: { data: VideoData; browserOnly: boolean }) {
  return (
    <div className="ysd cmp-list" aria-hidden={browserOnly ? undefined : 'true'}>
      <div className="ysd-label">Quality</div>
      <div className="ysd-dd cmp-dd">
        {data.video.map((o) => {
          const missing = browserOnly && o.height > 1080;
          return missing ? (
            <div className="ysd-dd-item cmp-missing" key={o.key}><span className="ysd-opt"><span className="ysd-opt-label">Not in the list</span></span></div>
          ) : (
            <div className="ysd-dd-item" key={o.key}>
              <span className="ysd-opt">
                <span className="ysd-opt-label">{o.quality}</span>
                {o.badge && <span className="ysd-badge">{o.badge}</span>}
                <span className="ysd-opt-hint">{o.codec}</span>
                <span className="ysd-opt-right">{fmtSize(o.size)}</span>
              </span>
              <span className="ysd-check">{(browserOnly ? data.video.find((v) => v.height <= 1080)?.key : data.video[0].key) === o.key ? <Icon name="check" size={18} /> : null}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Compare({ data, left, right }: Props) {
  const [v, setV] = useState(50);
  const area = useRef<HTMLDivElement>(null);
  const drag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[role=slider]')) return;
    const r = area.current!.getBoundingClientRect();
    const set = (x: number) => setV(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
    set(e.clientX);
    const move = (ev: PointerEvent) => set(ev.clientX);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="cmp">
      <div className="cmp-labels">
        <p><span className="label">{left.label}</span><span className="cmp-value">{left.value}</span></p>
        <p><span className="label">{right.label}</span><span className="cmp-value">{right.value}</span></p>
      </div>
      <div className="cmp-area" ref={area} onPointerDown={drag}>
        <div className="cmp-side cmp-left"><List data={data} browserOnly /></div>
        <div className="cmp-side cmp-right" style={{ clipPath: `inset(0 0 0 ${v}%)` }}><List data={data} browserOnly={false} /></div>
        <div className="cmp-seam" style={{ left: `${v}%` }} aria-hidden="true" />
        <Slider.Root className="cmp-slider" value={[v]} onValueChange={([x]) => setV(x)} min={0} max={100} step={1}>
          <Slider.Track className="cmp-track"><Slider.Range className="cmp-range" /></Slider.Track>
          <Slider.Thumb className="cmp-thumb" aria-label="Compare: drag left to see more with the Windows app, right to see more without it">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M9.7 6.3a1 1 0 0 1 0 1.4L5.41 12l4.3 4.3a1 1 0 0 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.42 0Zm4.6 0a1 1 0 0 1 1.42 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.42-1.4L18.6 12l-4.3-4.3a1 1 0 0 1 0-1.4Z" /></svg>
          </Slider.Thumb>
        </Slider.Root>
      </div>
    </div>
  );
}
