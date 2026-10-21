// Tipos completos do sistema IPTV

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export type ContentType = 'live' | 'movie' | 'series';

export interface Category {
  id: string;
  name: string;
  type: ContentType;
  parentId?: string;
  order: number;
  active: boolean;
  itemCount: number;
}

export interface M3USource {
  id: string;
  name: string;
  url: string;
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
  syncInterval: number; // minutes
  createdAt: string;
  updatedAt: string;
  lastImportDuration?: number; // seconds
}

export interface ImportJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  mode: 'add' | 'update' | 'sync' | 'ignore_duplicates';
  progress: number;
  totalFound: number;
  processed: number;
  channels: number;
  movies: number;
  episodes: number;
  duplicates: number;
  errors: number;
  startedAt: string;
  completedAt?: string;
  logs: string[];
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
  sourceId?: string;
  country?: string;
  language?: string;
  status: 'online' | 'offline' | 'unknown';
  active: boolean;
  order: number;
  epgId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: string;
  name: string;
  originalName?: string;
  synopsis?: string;
  year?: number;
  genre?: string[];
  categoryId?: string;
  cover?: string;
  banner?: string;
  rating?: number;
  duration?: string;
  url: string;
  sourceId?: string;
  format?: string;
  language?: string;
  classification?: string;
  tmdbId?: string;
  status: 'available' | 'unavailable';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  originalName?: string;
  synopsis?: string;
  year?: number;
  genre?: string[];
  categoryId?: string;
  cover?: string;
  banner?: string;
  rating?: number;
  url?: string;
  sourceId?: string;
  tmdbId?: string;
  seasonsCount: number;
  episodesCount: number;
  status: 'available' | 'unavailable';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  number: number;
  name?: string;
  order: number;
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
  duration?: string;
  order: number;
  active: boolean;
  createdAt: string;
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
  network?: number;
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
  channelId: string;
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

export interface Settings {
  panelName: string;
  logo: string;
  favicon: string;
  mainUrl: string;
  timezone: string;
  language: string;
  theme: 'dark' | 'light';
  primaryColor: string;
  secondaryColor: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  tmdbApiKey?: string;
  m3uSyncInterval: number;
  epgSyncInterval: number;
  maxImportSize: number;
  cacheEnabled: boolean;
  queueDriver: 'sync' | 'database' | 'redis';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  timestamp: number;
}
