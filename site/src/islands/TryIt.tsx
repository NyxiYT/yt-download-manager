// Try it: the page's only interactive section. Five tabs over one demo; each tab opens its scene mid-use, and the
// caption under the player says what it shows. On phones the demo is a picture (its real-size buttons would be
// too small to tap); the tabs still switch it.
import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import Demo from './Demo';
import type { FilmSrc } from './demo/parts';
import type { VideoData } from './demo/model';

interface Tab { id: 'video' | 'audio' | 'trim' | 'shorts' | 'history'; label: string; caption: string }

export default function TryIt({ tabs, video, short, film, cover }: { tabs: Tab[]; video: VideoData; short: VideoData; film: FilmSrc; cover: string }) {
  const [tab, setTab] = useState<Tab['id']>('video');
  const cur = tabs.find((t) => t.id === tab)!;
  return (
    <Tabs.Root value={tab} onValueChange={(v) => setTab(v as Tab['id'])} className="try" activationMode="automatic">
      <Tabs.List className="try-tabs" aria-label="What to try">
        {tabs.map((t) => (
          <Tabs.Trigger key={t.id} value={t.id} className="try-tab">{t.label}</Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value={tab} forceMount className="try-panel" data-cursor="try">
        <Demo key={tab} mode="try" scene={tab} data={tab === 'shorts' ? short : video} film={film} cover={cover} label={`${cur.label}: ${cur.caption}`} />
        <p className="try-caption" aria-live="polite">{cur.caption}</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
