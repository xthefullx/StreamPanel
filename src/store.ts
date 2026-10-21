import { Category, M3USource, ImportJob, Channel, Movie, Series, Season, Episode, Bouquet, Plan, Client, Reseller, CreditTransaction, Server, ActiveConnection, EpgSource, Settings, AuditLog, Notification } from './types';
import { demoCategories, demoM3USources, demoChannels, demoMovies, demoSeries, demoSeasons, demoEpisodes, demoBouquets, demoPlans, demoClients, demoResellers, demoCreditTransactions, demoServers, demoActiveConnections, demoEpgSources, defaultSettings } from './data';

const K = {
  categories: 'iptv_categories',
  m3uSources: 'iptv_m3u_sources',
  importJobs: 'iptv_import_jobs',
  channels: 'iptv_channels',
  movies: 'iptv_movies',
  series: 'iptv_series',
  seasons: 'iptv_seasons',
  episodes: 'iptv_episodes',
  bouquets: 'iptv_bouquets',
  plans: 'iptv_plans',
  clients: 'iptv_clients',
  resellers: 'iptv_resellers',
  creditTx: 'iptv_credit_tx',
  servers: 'iptv_servers',
  connections: 'iptv_connections',
  epgSources: 'iptv_epg_sources',
  settings: 'iptv_settings',
  auth: 'iptv_auth',
  auditLogs: 'iptv_audit_logs',
};

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch (e) { /* empty */ }
  return fallback;
}

function save<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* empty */ }
}

export const store = {
  // Categories
  getCategories: (): Category[] => load(K.categories, demoCategories),
  setCategories: (v: Category[]) => save(K.categories, v),
  // M3U Sources
  getM3USources: (): M3USource[] => load(K.m3uSources, demoM3USources),
  setM3USources: (v: M3USource[]) => save(K.m3uSources, v),
  // Import Jobs
  getImportJobs: (): ImportJob[] => load(K.importJobs, []),
  setImportJobs: (v: ImportJob[]) => save(K.importJobs, v),
  // Channels
  getChannels: (): Channel[] => load(K.channels, demoChannels),
  setChannels: (v: Channel[]) => save(K.channels, v),
  // Movies
  getMovies: (): Movie[] => load(K.movies, demoMovies),
  setMovies: (v: Movie[]) => save(K.movies, v),
  // Series
  getSeries: (): Series[] => load(K.series, demoSeries),
  setSeries: (v: Series[]) => save(K.series, v),
  // Seasons
  getSeasons: (): Season[] => load(K.seasons, demoSeasons),
  setSeasons: (v: Season[]) => save(K.seasons, v),
  // Episodes
  getEpisodes: (): Episode[] => load(K.episodes, demoEpisodes),
  setEpisodes: (v: Episode[]) => save(K.episodes, v),
  // Bouquets
  getBouquets: (): Bouquet[] => load(K.bouquets, demoBouquets),
  setBouquets: (v: Bouquet[]) => save(K.bouquets, v),
  // Plans
  getPlans: (): Plan[] => load(K.plans, demoPlans),
  setPlans: (v: Plan[]) => save(K.plans, v),
  // Clients
  getClients: (): Client[] => load(K.clients, demoClients),
  setClients: (v: Client[]) => save(K.clients, v),
  // Resellers
  getResellers: (): Reseller[] => load(K.resellers, demoResellers),
  setResellers: (v: Reseller[]) => save(K.resellers, v),
  // Credit Transactions
  getCreditTx: (): CreditTransaction[] => load(K.creditTx, demoCreditTransactions),
  setCreditTx: (v: CreditTransaction[]) => save(K.creditTx, v),
  // Servers
  getServers: (): Server[] => load(K.servers, demoServers),
  setServers: (v: Server[]) => save(K.servers, v),
  // Connections
  getConnections: (): ActiveConnection[] => load(K.connections, demoActiveConnections),
  setConnections: (v: ActiveConnection[]) => save(K.connections, v),
  // EPG
  getEpgSources: (): EpgSource[] => load(K.epgSources, demoEpgSources),
  setEpgSources: (v: EpgSource[]) => save(K.epgSources, v),
  // Settings
  getSettings: (): Settings => load(K.settings, defaultSettings),
  setSettings: (v: Settings) => save(K.settings, v),
  // Auth
  getAuth: (): boolean => load(K.auth, false),
  setAuth: (v: boolean) => save(K.auth, v),
  // Audit Logs
  getAuditLogs: (): AuditLog[] => load(K.auditLogs, []),
  setAuditLogs: (v: AuditLog[]) => save(K.auditLogs, v),
};

// Helpers
export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
export const now = () => new Date().toISOString();
export const today = () => new Date().toISOString().split('T')[0];

export function parseM3U(content: string): { channels: Partial<Channel>[]; movies: Partial<Movie>[]; series: Partial<Series>[] } {
  const lines = content.split(/\r?\n/);
  const channels: Partial<Channel>[] = [];
  const movies: Partial<Movie>[] = [];
  const series: Partial<Series>[] = [];
  let current: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      current = {
        id: uid(),
        name: nameMatch?.[1]?.trim() || 'Sem nome',
        tvgId: tvgIdMatch?.[1],
        tvgName: tvgNameMatch?.[1],
        logo: logoMatch?.[1] || '📺',
        groupTitle: groupMatch?.[1] || 'Sem categoria',
        active: true,
        status: 'unknown',
        order: 0,
        createdAt: today(),
        updatedAt: today(),
      };
    } else if (line && !line.startsWith('#') && current) {
      current.url = line;
      const group = (current.groupTitle || '').toLowerCase();
      const name = (current.name || '').toLowerCase();
      // Simple heuristic to classify
      if (/s\d{1,2}e\d{1,2}|temporada|season|serie|series/.test(name) || /s[eé]ries/.test(group)) {
        series.push({ ...current });
      } else if (/filme|movie|vod|cinema/.test(group) || /\.(mp4|mkv|avi)$/i.test(line)) {
        movies.push({ ...current });
      } else {
        channels.push({ ...current });
      }
      current = null;
    }
  }
  return { channels, movies, series };
}

export function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

export function normalizeName(name: string): string {
  return name
    .replace(/\b(FHD|HD|SD|4K|UHD|DUBLADO|LEGENDADO|DUAL|AUDIO)\b/gi, '')
    .replace(/\|/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\bS(\d{1,2})E(\d{1,2})\b/i, '- T$1E$2')
    .replace(/\bT(\d{1,2})E(\d{1,2})\b/i, '- T$1E$2')
    .replace(/\((\d{4})\)/g, '($1)')
    .trim();
}

export function generateUsername(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20) + '_' + Math.random().toString(36).slice(2, 6);
}

export function generatePassword(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function generateM3UList(client: Client, channels: Channel[], movies: Movie[], series: Series[], episodes: Episode[], bouquet: Bouquet | undefined, categories: Category[]): string {
  let content = '#EXTM3U\n';
  const allowedCats = bouquet?.categoryIds || [];

  const allowedChannels = channels.filter(ch =>
    ch.active && (!bouquet || allowedCats.includes(ch.categoryId || ''))
  );
  const allowedMovies = movies.filter(m =>
    m.active && (!bouquet || allowedCats.includes(m.categoryId || ''))
  );
  const allowedSeries = series.filter(s =>
    s.active && (!bouquet || allowedCats.includes(s.categoryId || ''))
  );

  allowedChannels.forEach(ch => {
    const cat = categories.find(c => c.id === ch.categoryId);
    content += `#EXTINF:-1 tvg-id="${ch.tvgId || ''}" tvg-logo="${ch.logo || ''}" group-title="${cat?.name || 'Geral'}",${ch.name}\n${ch.url}\n`;
  });
  allowedMovies.forEach(m => {
    const cat = categories.find(c => c.id === m.categoryId);
    content += `#EXTINF:-1 tvg-logo="${m.cover || ''}" group-title="${cat?.name || 'Filmes'}",${m.name}\n${m.url}\n`;
  });
  allowedSeries.forEach(s => {
    const eps = episodes.filter(e => e.seriesId === s.id && e.active);
    eps.forEach(e => {
      const cat = categories.find(c => c.id === s.categoryId);
      content += `#EXTINF:-1 tvg-logo="${s.cover || ''}" group-title="${cat?.name || 'Séries'}",${s.name} S${String(e.seasonNumber).padStart(2, '0')}E${String(e.episodeNumber).padStart(2, '0')} - ${e.name}\n${e.url}\n`;
    });
  });
  return content;
}

// Notification system
let listeners: ((n: Notification) => void)[] = [];
export function addNotificationListener(fn: (n: Notification) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
export function notify(type: Notification['type'], message: string, title?: string) {
  const n: Notification = { id: uid(), type, message, title, timestamp: Date.now() };
  listeners.forEach(fn => fn(n));
}

// Audit log
export function audit(action: string, entity: string, entityId?: string, details?: string) {
  const logs = store.getAuditLogs();
  logs.unshift({
    id: uid(),
    userId: 'admin_1',
    userName: 'Administrador',
    action, entity, entityId, details,
    ip: '127.0.0.1',
    createdAt: now(),
  });
  store.setAuditLogs(logs.slice(0, 500));
}
