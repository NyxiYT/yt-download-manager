// The FAQ (Radix Accordion, restyled). Every answer stays in the page (forceMount), for search engines and without
// scripts; a closed answer folds to zero height with grid rows and is hidden from screen readers once folded.
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
          <Accordion.Content forceMount className="faq-a">
            <div><p>{i.a}</p></div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
