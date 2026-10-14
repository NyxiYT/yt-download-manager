// The FAQ (Radix Accordion, restyled). Every answer stays in the page (forceMount), so it's there for search
// engines and without scripts; a closed answer folds to zero height with grid rows, the way the extension's own
// history rows fold, and is hidden from screen readers once folded.
import * as Accordion from '@radix-ui/react-accordion';

interface Item { q: string; a: string; group: string; links?: { label: string; href: string }[] }
interface Props { items: Item[]; groups: readonly { id: string; title: string }[] }

export default function Faq({ items, groups }: Props) {
  return (
    <div className="faq">
      {groups.map((g) => (
        <div className="faq-group" key={g.id}>
          <h3 className="faq-gtitle label">{g.title}</h3>
          <Accordion.Root type="multiple" className="faq-list">
            {items.filter((i) => i.group === g.id).map((i) => (
              <Accordion.Item value={i.q} key={i.q} className="faq-item">
                <Accordion.Header asChild>
                  <h4 className="faq-h">
                    <Accordion.Trigger className="faq-q">
                      <span>{i.q}</span>
                      <span className="faq-mark" aria-hidden="true" />
                    </Accordion.Trigger>
                  </h4>
                </Accordion.Header>
                <Accordion.Content forceMount className="faq-a">
                  <div>
                    <p>{i.a}</p>
                    {i.links?.map((l) => <p key={l.href}><a href={l.href}>{l.label}</a></p>)}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      ))}
    </div>
  );
}
