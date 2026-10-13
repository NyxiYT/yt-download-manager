import { ICONS, type IconName } from '../lib/icons';

export function Icon({ name, className, style }: { name: IconName; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}
