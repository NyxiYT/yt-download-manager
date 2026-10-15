// The FAQ (Radix Accordion, restyled). One answer open at a time. Opening animates the height to Radix's
// --radix-accordion-content-height (260 ms, ease out), the answer fades in and rises 6 px, and the plus turns 45°
// into a cross; closing plays it backwards (Faq.astro). No forceMount: with it, Radix doesn't re-render after
// measuring, so the height variable lags behind and nothing animates. Radix keeps a closing answer in the page until
// its animation ends.
import * as Accordion from '@radix-ui/react-accordion';

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion.Root type="single" collapsible className="faq-list" defaultValue={items[0].q}>
      {items.map((i) => (
        <Accordion.Item value={i.q} key={i.q} className="faq-item">
          <Accordion.Header asChild>
            <h3 className="faq-h">
              <Accordion.Trigger className="faq-q">
                <span>{i.q}</span>
                <span className="faq-mark" aria-hidden="true" />
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="faq-a">
            <div><p>{i.a}</p></div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
