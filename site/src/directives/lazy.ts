// client:lazy: hydrate after the page has loaded and painted (plus a moment), or at once on the first touch,
// key or scroll. Used for the hero's demo, so React stays out of the first paint on every screen size.
// Astro's directive signature (astro/dist/types/public/integrations.d.ts: ClientDirective).
type Hydrate = () => Promise<void>;
type ClientDirective = (load: () => Promise<Hydrate>, options: { name: string; value: unknown }, el: HTMLElement) => void;

const lazy: ClientDirective = (load, _opts, el) => {
  let done = false;
  const go = async () => {
    if (done) return;
    done = true;
    events.forEach((e) => removeEventListener(e, go));
    el.removeEventListener('pointerenter', go);
    const hydrate = await load();
    await hydrate();
  };
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  events.forEach((e) => addEventListener(e, go, { once: true, passive: true }));
  el.addEventListener('pointerenter', go, { once: true });
  const later = () => setTimeout(go, 1800);
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
};

export default lazy;
