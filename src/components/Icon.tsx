export type IconName =
  | 'reveal' // spyglass
  | 'vowel' // flame / signal flare
  | 'meta' // gem
  | 'check' // solved
  | 'spot' // X marks the spot
  | 'lock'
  | 'chest' // final chamber
  | 'compass' // help
  | 'sliders' // settings
  | 'scroll' // stats / ledger
  | 'hourglass' // timer
  | 'flag' // maze finished
  | 'star' // meta / treasure
  | 'calendar'
  | 'close';

const PATHS: Record<IconName, React.ReactNode> = {
  reveal: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5 L20 20" />
    </>
  ),
  vowel: (
    <path d="M12 3c3 3.5 4 5.5 4 8.5a4 4 0 0 1-8 0c0-1.7.7-2.9 1.8-3.9 0 1.5.7 2.1 1.5 2.7C12.5 8.6 11 6.4 12 3z" />
  ),
  meta: (
    <>
      <path d="M6 9.5 L9 4.5 H15 L18 9.5 L12 20 Z" />
      <path d="M6 9.5 H18 M9 4.5 L12 9.5 L15 4.5 M12 9.5 V20" />
    </>
  ),
  check: <path d="M5 13 l4 4 L19 6" />,
  spot: (
    <>
      <path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" />
      <circle cx="12" cy="12" r="9.2" strokeDasharray="2.5 3.2" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
      <path d="M8.5 10.5 V8 a3.5 3.5 0 0 1 7 0 v2.5" />
      <circle cx="12" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  chest: (
    <>
      <path d="M4 10.5 a8 4.5 0 0 1 16 0 V18.5 H4 Z" />
      <path d="M4 10.5 H20" />
      <rect x="10.5" y="11.5" width="3" height="4" rx="0.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5 L14 12 L12 17.5 L10 12 Z" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="7" cy="17" r="2" fill="currentColor" />
    </>
  ),
  scroll: (
    <>
      <path d="M5 19 V8 a2 2 0 0 1 2-2 h10 a2 2 0 0 1 2 2 v9 a2 2 0 0 1-2 2 Z" />
      <path d="M8.5 16 V12 M12 16 V9.5 M15.5 16 V13.5" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 3 H17 M7 21 H17" />
      <path d="M8 3 V6 L12 11.5 L16 6 V3 M8 21 V18 L12 12.5 L16 18 V21" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21 V4" />
      <path d="M6 4.5 H17 l-2.5 3.5 L17 11.5 H6" />
    </>
  ),
  star: (
    <path d="M12 2.5 L14 9.5 L21.5 12 L14 14.5 L12 21.5 L10 14.5 L2.5 12 L10 9.5 Z" />
  ),
  close: <path d="M6 6 L18 18 M18 6 L6 18" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 9.5 H20 M8 3.5 V7 M16 3.5 V7" />
    </>
  ),
};

export default function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
