import { ParsedM3UItem, M3UAnalysis, TmdbSearchResult, TmdbDetails } from './types';

// ==================== M3U PARSER ====================
export function parseM3U(content: string): { items: ParsedM3UItem[]; errors: { line: number; message: string }[] } {
  // Remove BOM
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  
  const lines = content.split(/\r?\n/);
  const items: ParsedM3UItem[] = [];
  const errors: { line: number; message: string }[] = [];
  let current: Partial<ParsedM3UItem> | null = null;
  let isExtM3U = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    if (!line) continue;

    if (line === '#EXTM3U') {
      isExtM3U = true;
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      const infoPart = line.substring(8); // Remove '#EXTINF:'
      const commaIdx = infoPart.lastIndexOf(',');
      if (commaIdx === -1) {
        errors.push({ line: lineNum, message: 'EXTINF sem nome do canal' });
        continue;
      }

      const attrsPart = infoPart.substring(0, commaIdx);
      const name = infoPart.substring(commaIdx + 1).trim();

      // Parse attributes
      const attrs: Record<string, string> = {};
      const attrRegex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
      let match;
      while ((match = attrRegex.exec(attrsPart)) !== null) {
        attrs[match[1].toLowerCase()] = match[2];
      }

      current = {
        key: `${attrs['tvg-id'] || ''}_${name}_${i}`,
        name: name || 'Sem nome',
        url: '',
        tvgId: attrs['tvg-id'],
        tvgName: attrs['tvg-name'],
        tvgLogo: attrs['tvg-logo'],
        groupTitle: attrs['group-title'],
        country: attrs['tvg-country'],
        language: attrs['tvg-language'],
        rawAttributes: attrs,
        detectedType: 'unknown',
        lineIndex: i,
      };
      continue;
    }

    if (line.startsWith('#EXTGRP:')) {
      if (current) {
        current.groupTitle = line.substring(8).trim();
      }
      continue;
    }

    if (line.startsWith('#')) continue;

    // URL line
    if (current) {
      current.url = line;
      // Detect type
      current.detectedType = detectContentType(current.name || '', current.groupTitle || '', line);
      // Detect series info
      if (current.detectedType === 'series') {
        current.seriesInfo = parseSeriesInfo(current.name || '');
      }
      items.push(current as ParsedM3UItem);
      current = null;
    } else if (line.startsWith('http')) {
      // URL without EXTINF - treat as channel
      errors.push({ line: lineNum, message: 'URL sem EXTINF precedente' });
    }
  }

  return { items, errors };
}

function detectContentType(name: string, group: string, url: string): 'live' | 'movie' | 'series' | 'unknown' {
  const nameL = name.toLowerCase();
  const groupL = group.toLowerCase();
  const urlL = url.toLowerCase();

  // Series detection (S01E01, 1x01, T1E2, etc.)
  if (/s\d{1,2}e\d{1,2}|season\s*\d+.*episode|\d+x\d+|t\d+e\d+|temporada.*epis[oa]dio|cap[íi]tulo/i.test(name)) {
    return 'series';
  }
  if (/s[ée]ries|series|novela|anime/.test(groupL)) {
    return 'series';
  }

  // Movie detection
  if (/\.(mp4|mkv|avi|mov|wmv)(\?|$)/i.test(urlL)) {
    return 'movie';
  }
  if (/filme|movie|vod|cinema|filmoteca/.test(groupL)) {
    return 'movie';
  }
  if (/\b(19|20)\d{2}\b/.test(name) && !/hd|fhd|sd|4k|uhd/i.test(name)) {
    // Has year and doesn't look like a channel
    return 'movie';
  }

  // Live detection
  if (/\.(m3u8|ts|flv)(\?|$)/i.test(urlL)) {
    return 'live';
  }
  if (/ao vivo|live|24h|24\/7|canal|tv|news|esporte/.test(groupL)) {
    return 'live';
  }

  return 'unknown';
}

export function parseSeriesInfo(name: string): { name: string; season: number; episode: number } | undefined {
  // S01E02
  let m = name.match(/(.+?)\s*S(\d{1,2})E(\d{1,2})/i);
  if (m) return { name: m[1].trim(), season: parseInt(m[2]), episode: parseInt(m[3]) };
  
  // 1x02
  m = name.match(/(.+?)\s*(\d{1,2})x(\d{1,2})/i);
  if (m) return { name: m[1].trim(), season: parseInt(m[2]), episode: parseInt(m[3]) };
  
  // T1E2
  m = name.match(/(.+?)\s*T(\d{1,2})E(\d{1,2})/i);
  if (m) return { name: m[1].trim(), season: parseInt(m[2]), episode: parseInt(m[3]) };

  return undefined;
}

export function analyzeM3U(items: ParsedM3UItem[]): M3UAnalysis {
  const groups: Record<string, { count: number; detectedType: string }> = {};
  let channels = 0, movies = 0, series = 0, episodes = 0, duplicates = 0;
  const seen = new Set<string>();

  for (const item of items) {
    // Count by type
    if (item.detectedType === 'live') channels++;
    else if (item.detectedType === 'movie') movies++;
    else if (item.detectedType === 'series') {
      series++;
      episodes++;
    }

    // Group
    const group = item.groupTitle || 'Sem grupo';
    if (!groups[group]) groups[group] = { count: 0, detectedType: item.detectedType };
    groups[group].count++;

    // Duplicates (by URL)
    if (item.url) {
      if (seen.has(item.url)) duplicates++;
      else seen.add(item.url);
    }
  }

  return {
    total: items.length,
    channels,
    movies,
    series,
    episodes,
    groups: Object.entries(groups).map(([name, data]) => ({ name, ...data })),
    errors: [],
    duplicates,
    samples: items.slice(0, 10),
  };
}

// ==================== TMDB CLIENT ====================
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function tmdbSearch(query: string, type: 'movie' | 'tv', year?: number, apiKey?: string, language = 'pt-BR'): Promise<TmdbSearchResult[]> {
  if (!apiKey) throw new Error('TMDB API Key não configurada. Vá em Configurações > Integrações.');
  
  const params = new URLSearchParams({
    api_key: apiKey,
    query,
    language,
    include_adult: 'false',
  });
  if (year) params.set('year', String(year));
  if (type === 'tv') params.set('first_air_date_year', String(year));

  const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
  const res = await fetch(`${TMDB_BASE}${endpoint}?${params}`);
  if (!res.ok) {
    if (res.status === 401) throw new Error('Chave TMDB inválida');
    if (res.status === 429) throw new Error('Limite de requisições TMDB atingido');
    throw new Error(`Erro TMDB: ${res.status}`);
  }
  const data = await res.json();
  return data.results || [];
}

export async function tmdbGetDetails(id: number, type: 'movie' | 'tv', apiKey: string, language = 'pt-BR'): Promise<TmdbDetails> {
  const params = new URLSearchParams({
    api_key: apiKey,
    language,
    append_to_response: 'credits,external_ids,videos',
  });
  if (type === 'tv') params.set('append_to_response', 'credits,external_ids,videos');

  const res = await fetch(`${TMDB_BASE}/${type}/${id}?${params}`);
  if (!res.ok) throw new Error(`Erro TMDB: ${res.status}`);
  return res.json();
}

export async function tmdbGetSeason(tvId: number, seasonNumber: number, apiKey: string, language = 'pt-BR'): Promise<TmdbDetails> {
  const params = new URLSearchParams({ api_key: apiKey, language });
  const res = await fetch(`${TMDB_BASE}/tv/${tvId}/season/${seasonNumber}?${params}`);
  if (!res.ok) throw new Error(`Erro TMDB: ${res.status}`);
  return res.json();
}

export function tmdbImageUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ==================== NAME NORMALIZER ====================
export function normalizeName(name: string): string {
  let result = name;
  
  // Remove common tags
  result = result.replace(/\b(FHD|HD|SD|4K|UHD|DUBLADO|LEGENDADO|DUAL|AUDIO|MULTI|BLURAY|BDRIP|WEBRIP|WEBDL|HDTV|REPACK|PROPER|EXTENDED|UNRATED|DIRECTORS)\b/gi, '');
  
  // Replace dots with spaces (but keep in URLs)
  if (!result.includes('http')) {
    result = result.replace(/\./g, ' ');
  }
  
  // Remove pipes and excessive separators
  result = result.replace(/\|/g, ' ');
  result = result.replace(/\[|\]/g, ' ');
  result = result.replace(/\{|\}/g, ' ');
  
  // Normalize season/episode patterns
  result = result.replace(/\bS(\d{1,2})E(\d{1,2})\b/gi, '- T$1E$2');
  result = result.replace(/\b(\d{1,2})x(\d{1,2})\b/g, '- T$1E$2');
  result = result.replace(/\bT(\d{1,2})E(\d{1,2})\b/gi, '- T$1E$2');
  
  // Extract year
  const yearMatch = result.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) {
    result = result.replace(yearMatch[0], '');
    result = result.trim() + ` (${yearMatch[1]})`;
  }
  
  // Clean up whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter of each word (title case)
  result = result.replace(/\b\w/g, l => l.toUpperCase());
  
  return result;
}

export function normalizePreview(names: string[]): { before: string; after: string }[] {
  return names.map(name => ({ before: name, after: normalizeName(name) }));
}

// ==================== DUPLICATE DETECTION ====================
export interface DuplicateGroup {
  key: string;
  items: { id: string; name: string; url?: string }[];
  reason: 'url' | 'name_year' | 'tvg_id';
}

export function detectDuplicates<T extends { id: string; name: string; url?: string; year?: number; tvgId?: string }>(items: T[]): DuplicateGroup[] {
  const groups: Map<string, DuplicateGroup> = new Map();

  // By URL
  const byUrl = new Map<string, T[]>();
  for (const item of items) {
    if (!item.url) continue;
    const key = item.url;
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key)!.push(item);
  }
  for (const [url, group] of byUrl) {
    if (group.length > 1) {
      groups.set(`url:${url}`, { key: `url:${url}`, items: group.map(i => ({ id: i.id, name: i.name, url: i.url })), reason: 'url' });
    }
  }

  // By name + year
  const byNameYear = new Map<string, T[]>();
  for (const item of items) {
    const key = `${item.name.toLowerCase().trim()}_${item.year || ''}`;
    if (!byNameYear.has(key)) byNameYear.set(key, []);
    byNameYear.get(key)!.push(item);
  }
  for (const [key, group] of byNameYear) {
    if (group.length > 1) {
      groups.set(`name:${key}`, { key: `name:${key}`, items: group.map(i => ({ id: i.id, name: i.name })), reason: 'name_year' });
    }
  }

  return Array.from(groups.values());
}

// ==================== URL VALIDATION ====================
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { valid: false, error: 'Protocolo não suportado' };
    }
    // SSRF protection
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'];
    if (blockedHosts.includes(u.hostname)) {
      return { valid: false, error: 'Host bloqueado por segurança' };
    }
    // Private IP ranges
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(u.hostname)) {
      return { valid: false, error: 'Rede privada não permitida' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL inválida' };
  }
}

// ==================== UTILS ====================
export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
export const now = () => new Date().toISOString();
export const today = () => new Date().toISOString().split('T')[0];

export function generateUsername(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20) + '_' + Math.random().toString(36).slice(2, 6);
}

export function generatePassword(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
