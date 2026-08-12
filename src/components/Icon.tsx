export type IconName =
  | 'home'
  | 'chat'
  | 'call'
  | 'code'
  | 'settings'
  | 'logout'
  | 'chevron'
  | 'eye'
  | 'eye-off'
  | 'menu'
  | 'close';

interface IconProps {
  name: IconName;
  className?: string;
}

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75',
  chat: 'M21 12a8.25 8.25 0 0 1-11.9 7.4L3 21l1.6-6.1A8.25 8.25 0 1 1 21 12Z',
  call: 'M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.37a1.5 1.5 0 0 0-1.14-1.46l-3.7-.92a1.5 1.5 0 0 0-1.52.53l-.86 1.07a12 12 0 0 1-5.7-5.7l1.07-.86a1.5 1.5 0 0 0 .53-1.52l-.92-3.7A1.5 1.5 0 0 0 6.87 3H5.5a2.25 2.25 0 0 0-2.25 2.25Z',
  code: 'm8.25 15.75-3.75-3.75 3.75-3.75m7.5 0 3.75 3.75-3.75 3.75',
  settings:
    'M9.6 3.75h4.8l.5 2.4a6.4 6.4 0 0 1 1.6.93l2.32-.77 2.4 4.16-1.82 1.6a6.5 6.5 0 0 1 0 1.86l1.82 1.6-2.4 4.16-2.32-.77a6.4 6.4 0 0 1-1.6.93l-.5 2.4H9.6l-.5-2.4a6.4 6.4 0 0 1-1.6-.93l-2.32.77-2.4-4.16 1.82-1.6a6.5 6.5 0 0 1 0-1.86l-1.82-1.6 2.4-4.16 2.32.77a6.4 6.4 0 0 1 1.6-.93Z',
  logout:
    'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3-3-3m-8.25 3H21',
  chevron: 'm14.25 6-6 6 6 6',
  menu: 'M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5',
  close: 'M6 6l12 12M18 6L6 18',
  eye: 'M2.25 12s3.6-6.75 9.75-6.75S21.75 12 21.75 12s-3.6 6.75-9.75 6.75S2.25 12 2.25 12Z',
  'eye-off':
    'M3 3l18 18M10.6 6.4A7.9 7.9 0 0 1 12 6.25c6.15 0 9.75 6.75 9.75 6.75a17 17 0 0 1-3.5 4.2M6.7 7.9A16.7 16.7 0 0 0 2.25 13S5.85 19.75 12 19.75a9.3 9.3 0 0 0 4-.9M9.9 10.6a3 3 0 0 0 4.2 4.2',
};

export function Icon({ name, className = 'h-5 w-5' }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
      {(name === 'settings' || name === 'eye') && <circle cx="12" cy="12" r="2.5" />}
    </svg>
  );
}
