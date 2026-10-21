import { M3UList, Channel, Movie, Serie, User, Plan, Settings, Notification } from './types';
import { demoM3ULists, demoChannels, demoMovies, demoSeries, demoUsers, demoPlans, defaultSettings } from './data/demo';

const STORAGE_KEYS = {
  lists: 'iptv_lists',
  channels: 'iptv_channels',
  movies: 'iptv_movies',
  series: 'iptv_series',
  users: 'iptv_users',
  plans: 'iptv_plans',
  settings: 'iptv_settings',
  auth: 'iptv_auth',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

export const store = {
  getLists: (): M3UList[] => loadFromStorage(STORAGE_KEYS.lists, demoM3ULists),
  setLists: (lists: M3UList[]) => saveToStorage(STORAGE_KEYS.lists, lists),

  getChannels: (): Channel[] => loadFromStorage(STORAGE_KEYS.channels, demoChannels),
  setChannels: (channels: Channel[]) => saveToStorage(STORAGE_KEYS.channels, channels),

  getMovies: (): Movie[] => loadFromStorage(STORAGE_KEYS.movies, demoMovies),
  setMovies: (movies: Movie[]) => saveToStorage(STORAGE_KEYS.movies, movies),

  getSeries: (): Serie[] => loadFromStorage(STORAGE_KEYS.series, demoSeries),
  setSeries: (series: Serie[]) => saveToStorage(STORAGE_KEYS.series, series),

  getUsers: (): User[] => loadFromStorage(STORAGE_KEYS.users, demoUsers),
  setUsers: (users: User[]) => saveToStorage(STORAGE_KEYS.users, users),

  getPlans: (): Plan[] => loadFromStorage(STORAGE_KEYS.plans, demoPlans),
  setPlans: (plans: Plan[]) => saveToStorage(STORAGE_KEYS.plans, plans),

  getSettings: (): Settings => loadFromStorage(STORAGE_KEYS.settings, defaultSettings),
  setSettings: (settings: Settings) => saveToStorage(STORAGE_KEYS.settings, settings),

  getAuth: (): boolean => loadFromStorage(STORAGE_KEYS.auth, false),
  setAuth: (auth: boolean) => saveToStorage(STORAGE_KEYS.auth, auth),
};

// Parse M3U file content
export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const countryMatch = line.match(/tvg-country="([^"]*)"/);
      const idMatch = line.match(/tvg-id="([^"]*)"/);

      currentChannel = {
        id: idMatch?.[1] || `ch_${Date.now()}_${i}`,
        name: nameMatch?.[1] || 'Canal Desconhecido',
        logo: logoMatch?.[1] || '📺',
        category: groupMatch?.[1] || 'Sem Categoria',
        country: countryMatch?.[1] || 'BR',
        status: 'online',
        number: channels.length + 1,
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }

  return channels;
}

// Validate M3U URL
export function validateM3UUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Notification helper
let notificationListeners: ((n: Notification) => void)[] = [];

export function addNotificationListener(fn: (n: Notification) => void) {
  notificationListeners.push(fn);
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== fn);
  };
}

export function notify(type: Notification['type'], message: string) {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: Date.now(),
  };
  notificationListeners.forEach(fn => fn(notification));
}
