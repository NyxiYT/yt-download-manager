// The install guide's tabs (Radix Tabs, restyled). Every panel stays in the page (forceMount), hidden when it isn't
// picked, so the whole guide is there for search engines and without scripts. Links like href="#install-scoop"
// (the hero's "Scoop") pick their tab.
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useState, type ReactNode } from 'react';

interface Props { x64?: ReactNode; x86?: ReactNode; scoop?: ReactNode; linux?: ReactNode }
const TABS = [
  { id: 'x64', label: 'Windows 64-bit' },
  { id: 'x86', label: 'Windows 32-bit' },
  { id: 'scoop', label: 'Scoop' },
  { id: 'linux', label: 'Linux' },
] as const;

export default function InstallTabs(props: Props) {
  const [tab, setTab] = useState<string>('x64');
  useEffect(() => {
    const pick = (id: string | null) => { if (id && TABS.some((t) => t.id === id)) setTab(id); };
    const fromHash = () => pick(/^#install-(\w+)$/.exec(location.hash)?.[1] ?? null);
    fromHash();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#install-"]');
      if (a) pick(a.hash.replace('#install-', ''));
    };
    window.addEventListener('hashchange', fromHash);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('hashchange', fromHash); document.removeEventListener('click', onClick); };
  }, []);
  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="itabs">
      <Tabs.List className="itabs-list" aria-label="How to install">
        {TABS.map((t) => <Tabs.Trigger key={t.id} value={t.id} className="itabs-trigger" id={`install-${t.id}`}>{t.label}</Tabs.Trigger>)}
      </Tabs.List>
      {TABS.map((t) => (
        <Tabs.Content key={t.id} value={t.id} forceMount className="itabs-panel" hidden={tab !== t.id}>
          {props[t.id]}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
