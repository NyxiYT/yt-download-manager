// The donate dialog (Radix Dialog): each wallet's QR code (SVG, made at build time from the address), the address
// with a copy button, and the network warning for USDT.
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { AI } from '../lib/anim-icons';

interface Wallet { id: string; name: string; address: string; qr: string; warning?: string }

export default function Donate({ label, wallets }: { label: string; wallets: Wallet[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (w: Wallet) => {
    try { await navigator.clipboard.writeText(w.address); } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: w.address });
      document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setCopied(w.id);
    setTimeout(() => setCopied((c) => (c === w.id ? null : c)), 1800);
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger className="btn btn-primary" data-ai-host>
        <span dangerouslySetInnerHTML={{ __html: AI.heart }} />{label}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content className="dlg" aria-describedby="dlg-desc">
          <div className="dlg-head">
            <Dialog.Title className="dlg-title">{label}</Dialog.Title>
            <Dialog.Close className="dlg-x" aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </Dialog.Close>
          </div>
          <p id="dlg-desc" className="sr-only">Scan a code or copy an address.</p>
          <div className="dlg-wallets">
            {wallets.map((w) => (
              <div className="wallet" key={w.id}>
                <div className="wallet-qr" role="img" aria-label={`QR code for the ${w.name} address`} dangerouslySetInnerHTML={{ __html: w.qr }} />
                <div className="wallet-info">
                  <p className="wallet-name">{w.name}</p>
                  <code className="wallet-addr">{w.address}</code>
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => copy(w)} data-done={copied === w.id ? '' : undefined}>
                    <span dangerouslySetInnerHTML={{ __html: AI.copy }} />
                    <span aria-live="polite">{copied === w.id ? 'Copied' : 'Copy address'}</span>
                  </button>
                  {w.warning && <p className="wallet-warn">{w.warning}</p>}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
