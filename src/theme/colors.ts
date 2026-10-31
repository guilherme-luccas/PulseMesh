import type { AlertSeverity, AlertSituation } from '../features/alerts/types/alert.types';

export interface ThemeColors {
  screen: string;
  text: string;
  muted: string;
  body: string;
  meta: string;
  border: string;
  divider: string;
  accent: string;
  button: string;
  onAccent: string;
  chipSelected: string;
  surface: string;
  input: string;
  placeholder: string;
  sync: string;
  onSync: string;
  warning: string;
  danger: string;
  online: string;
  offline: string;
  onBanner: string;
  sheet: string;
  backdrop: string;
  mapLabelText: string;
  mapLabelBackground: string;
  severity: Record<AlertSeverity, string>;
  situation: Record<AlertSituation, { background: string; text: string }>;
}

const severity: ThemeColors['severity'] = {
  info: '#7DD3C7',
  warning: '#F5C16C',
  critical: '#FF6B6B',
};

export const darkColors: ThemeColors = {
  screen: '#101614',
  text: '#F4F7F5',
  muted: '#9AABA3',
  body: '#C5D2CC',
  meta: '#7E9088',
  border: '#31423B',
  divider: '#24302B',
  accent: '#E8F36A',
  button: '#E8F36A',
  onAccent: '#17211C',
  chipSelected: '#24332D',
  surface: '#1A2420',
  input: '#18211E',
  placeholder: '#7E9088',
  sync: '#1E3A34',
  onSync: '#D7F5EA',
  warning: '#F5C16C',
  danger: '#FF8F8F',
  online: '#1E3A34',
  offline: '#3A2A1E',
  onBanner: '#F4F7F5',
  sheet: '#18211E',
  backdrop: 'rgba(0, 0, 0, 0.55)',
  mapLabelText: '#F4F7F5',
  mapLabelBackground: '#1A2420',
  severity,
  situation: {
    open: { background: '#1E3A34', text: '#7DD3C7' },
    attending: { background: '#3A3218', text: '#F5C16C' },
    closed: { background: '#3A2424', text: '#FF8F8F' },
  },
};

export const lightColors: ThemeColors = {
  screen: '#F3F6F4',
  text: '#17211C',
  muted: '#5E6E67',
  body: '#3A4943',
  meta: '#6A7A73',
  border: '#D3DDD7',
  divider: '#E1E8E4',
  accent: '#3F4E16',
  button: '#E8F36A',
  onAccent: '#17211C',
  chipSelected: '#E7F0C8',
  surface: '#FFFFFF',
  input: '#E8EFEC',
  placeholder: '#6A7A73',
  sync: '#1E3A34',
  onSync: '#D7F5EA',
  warning: '#8A5A10',
  danger: '#B42318',
  online: '#1E3A34',
  offline: '#3A2A1E',
  onBanner: '#F4F7F5',
  sheet: '#FFFFFF',
  backdrop: 'rgba(23, 33, 28, 0.4)',
  mapLabelText: '#17211C',
  mapLabelBackground: '#FFFFFF',
  severity,
  situation: {
    open: { background: '#DDF3EE', text: '#0F6E5C' },
    attending: { background: '#F8E8C4', text: '#8A5A10' },
    closed: { background: '#F8D6D6', text: '#9B2C2C' },
  },
};
