// Tipos completos do sistema IPTV - Evolução StreamPanel

export type ContentType = 'live' | 'movie' | 'series';
export type DeliveryMode = 'default' | 'default2' | 'direct' | 'direct2';
export type ItemStatus = 'online' | 'offline' | 'unknown';
export type Availability = 'available' | 'unavailable' | 'draft';
export type ImportMode = 'add' | 'update' | 'sync' | 'ignore_duplicates' | 'dry_run';
export type JobStatus = 'queued' | 'analyzing' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface Category {
  id: string;
  name: string;
  type: ContentType;
  parentId?: string;
  order: number;
  active: boolean;
  adult: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface M3USource {
  id: string;
  name: string;
  url: string;
  credentials?: { username?: string; password?: string };
  type: 'live' | 'vod' | 'series' | 'mixed';
  status: 'active' | 'inactive' | 'error' | 'importing';
  channelsCount: number;
  moviesCount: number;
  seriesCount: number;
  episodesCount: number;
  duplicatesCount: number;
  errorsCount: number;
  lastImportAt?: string;
  nextImportAt?: string;
  syncInterval: number;
  maxTimeout: number;
  createdAt: string;
  updatedAt: string;
  lastImportDuration?: number;
}

export interface ParsedM3UItem {
  key: string;
  name: string;
  url: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  country?: string;
  language?: string;
  rawAttributes: Record<string, string>;
  detectedType: 'live' | 'movie' | 'series' | 'unknown';
  seriesInfo?: { name: string; season: number; episode: number };
  lineIndex: number;
}

export interface M3UAnalysis {
  total: number;
  channels: number;
  movies: number;
  series: number;
  episodes: number;
  groups: { name: string; count: number; detectedType: string }[];
  errors: { line: number; message: string }[];
  duplicates: number;
  samples: ParsedM3UItem[];
}

export interface ImportJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: JobStatus;
  mode: ImportMode;
  progress: number;
  totalFound: number;
  processed: number;
  channelsImported: number;
  moviesImported: number;
  seriesImported: number;
  episodesImported: number;
  duplicates: number;
  errors: number;
  startedAt: string;
  completedAt?: string;
  logs: { time: string; level: 'info' | 'warn' | 'error'; message: string }[];
  selectedGroups: string[];
  tmdbEnrich: boolean;
}

export interface Channel {
  id: string;
  name: string;
  tvgId?: string;
  tvgName?: string;
  logo?: string;
  groupTitle?: string;
  categoryId?: string;
  url: string;
  urlAlt?: string;
  sourceId?: string;
  sourceItemKey?: string;
  country?: string;
  language?: string;
  adult: boolean;
  status: ItemStatus;
  deliveryMode: DeliveryMode;
  active: boolean;
  order: number;
  epgId?: string;
  epgSourceId?: string;
  lastTestAt?: string;
  lastTestStatus?: ItemStatus;
  lastTestLatency?: number;
  manualOverrides: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: string;
  name: string;
  originalName?: string;
  synopsis?: string;
  year?: number;
  releaseDate?: string;
  genre?: string[];
  director?: string;
  cast?: string[];
  categoryId?: string;
  cover?: string;
  backdrop?: string;
  trailer?: string;
  rating?: number;
  duration?: string;
  durationMinutes?: number;
  url: string;
  sourceId?: string;
  sourceItemKey?: string;
  format?: string;
  container?: string;
  resolution?: string;
  audio?: string;
  subtitles?: string[];
  language?: string;
  country?: string;
  classification?: string;
  adult: boolean;
  tmdbId?: string;
  imdbId?: string;
  tmdbSyncedAt?: string;
  status: Availability;
  active: boolean;
  manualOverrides: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  originalName?: string;
  synopsis?: string;
  year?: number;
  releaseDate?: string;
  genre?: string[];
  creators?: string[];
  cast?: string[];
  categoryId?: string;
  cover?: string;
  backdrop?: string;
  rating?: number;
  sourceId?: string;
  sourceItemKey?: string;
  language?: string;
  country?: string;
  classification?: string;
  adult: boolean;
  tmdbId?: string;
  imdbId?: string;
  tmdbSyncedAt?: string;
  seasonsCount: number;
  episodesCount: number;
  status: Availability;
  active: boolean;
  manualOverrides: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  number: number;
  name?: string;
  synopsis?: string;
  cover?: string;
  airDate?: string;
  tmdbId?: string;
  order: number;
  episodesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  synopsis?: string;
  url: string;
  cover?: string;
  duration?: string;
  durationMinutes?: number;
  airDate?: string;
  format?: string;
  language?: string;
  sourceId?: string;
  sourceItemKey?: string;
  tmdbId?: string;
  status: Availability;
  active: boolean;
  manualOverrides: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bouquet {
  id: string;
  name: string;
  description?: string;
  categoryIds: string[];
  channelIds: string[];
  movieIds: string[];
  seriesIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  creditCost: number;
  maxConnections: number;
  bouquetIds: string[];
  active: boolean;
  trial?: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  whatsapp?: string;
  planId: string;
  bouquetId: string;
  resellerId?: string;
  maxConnections: number;
  activeConnections: number;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  createdAt: string;
  expiresAt: string;
  lastAccessAt?: string;
  notes?: string;
  isTrial: boolean;
}

export interface Reseller {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp?: string;
  level: 'master' | 'reseller' | 'subreseller';
  credits: number;
  status: 'active' | 'suspended';
  parentId?: string;
  createdAt: string;
  totalClients: number;
  totalSales: number;
}

export interface CreditTransaction {
  id: string;
  resellerId: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string;
  relatedClientId?: string;
  relatedResellerId?: string;
  createdAt: string;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'rtmp';
  status: 'online' | 'offline' | 'unknown';
  maxConnections: number;
  activeConnections: number;
  cpu?: number;
  memory?: number;
  disk?: number;
  latency?: number;
  lastCheckAt?: string;
  createdAt: string;
}

export interface ActiveConnection {
  id: string;
  clientId: string;
  clientName: string;
  streamType: 'live' | 'movie' | 'series';
  streamName: string;
  ip: string;
  device: string;
  serverId: string;
  startedAt: string;
  lastActivityAt: string;
  status: 'active' | 'idle';
}

export interface EpgSource {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'error';
  lastImportAt?: string;
  channelsCount: number;
  programsCount: number;
}

export interface EpgProgram {
  id: string;
  sourceId: string;
  channelId?: string;
  tvgId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  timestamp: number;
}

export interface Settings {
  panelName: string;
  logo: string;
  mainUrl: string;
  timezone: string;
  language: string;
  theme: 'dark' | 'light';
  primaryColor: string;
  secondaryColor: string;
  tmdbApiKey?: string;
  tmdbLanguage: string;
  m3uSyncInterval: number;
  epgSyncInterval: number;
  maxImportSize: number;
  cacheEnabled: boolean;
  queueDriver: 'sync' | 'database' | 'redis';
  viewMode: 'grid' | 'table';
  pageSize: 25 | 50 | 100;
}

export interface TmdbSearchResult {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string }[];
    crew: { id: number; name: string; job: string }[];
  };
  seasons?: {
    id: number;
    season_number: number;
    name: string;
    overview?: string;
    poster_path?: string;
    air_date?: string;
    episode_count: number;
  }[];
  episodes?: {
    id: number;
    episode_number: number;
    name: string;
    overview?: string;
    still_path?: string;
    air_date?: string;
    runtime?: number;
  }[];
  external_ids?: {
    imdb_id?: string;
  };
  videos?: {
    results: { key: string; site: string; type: string }[];
  };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    from: number;
    to: number;
  };
}

export interface ListFilters {
  search?: string;
  categoryId?: string;
  sourceId?: string;
  status?: string;
  active?: boolean;
  adult?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
