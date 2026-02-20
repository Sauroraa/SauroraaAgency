export const SITE_NAME = 'Sauroraa Agency';
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sauroraa.be';
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

export const COUNTRIES: Record<string, string> = {
  BEL: 'Belgium', FRA: 'France', DEU: 'Germany', NLD: 'Netherlands',
  GBR: 'United Kingdom', ESP: 'Spain', ITA: 'Italy', PRT: 'Portugal',
  USA: 'United States', CAN: 'Canada', AUS: 'Australia', JPN: 'Japan',
  BRA: 'Brazil', CHE: 'Switzerland', AUT: 'Austria', SWE: 'Sweden',
  NOR: 'Norway', DNK: 'Denmark', POL: 'Poland', CZE: 'Czech Republic',
};

export const EVENT_TYPES = [
  { value: 'festival', label: 'Festival' },
  { value: 'club', label: 'Club Night' },
  { value: 'private', label: 'Private Event' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'other', label: 'Other' },
];

export const BOOKING_STATUSES = [
  { value: 'new', label: 'New', color: '#00d4ff' },
  { value: 'reviewing', label: 'Reviewing', color: '#3a86ff' },
  { value: 'scored', label: 'Scored', color: '#7b2fbe' },
  { value: 'quoted', label: 'Quoted', color: '#ff006e' },
  { value: 'negotiating', label: 'Negotiating', color: '#ffa500' },
  { value: 'confirmed', label: 'Confirmed', color: '#00ff88' },
  { value: 'declined', label: 'Declined', color: '#ff4444' },
  { value: 'cancelled', label: 'Cancelled', color: '#5c5c5c' },
];
