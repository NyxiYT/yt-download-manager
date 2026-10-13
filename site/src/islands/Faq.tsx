// The questions and answers, in HeroUI's accordion (React Aria: keyboard, focus and screen readers handled). Its
// panels grow and shrink smoothly, and not at all with reduced motion.
import { Accordion } from '@heroui/react/accordion';
import { faq } from '../lib/content';

export default function Faq() {
  return (
    <Accordion className="faq" allowsMultipleExpanded>
      {faq.map((f) => (
        <Accordion.Item key={f.q} id={f.q} className="faq-item">
          <Accordion.Heading level={3}>
            <Accordion.Trigger className="faq-trigger">
              {f.q}
              <Accordion.Indicator className="faq-indicator" />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="faq-body">{f.a}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
