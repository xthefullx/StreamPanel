import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { store, notify, addNotificationListener, audit } from './store';
import { Category, M3USource, ImportJob, Channel, Movie, Series, Season, Episode, Bouquet, Plan, Client, Reseller, CreditTransaction, Server, ActiveConnection, EpgSource, Settings, Notification as Notif, AuditLog, ParsedM3UItem, M3UAnalysis, TmdbSearchResult, ListFilters } from './types';
import { parseM3U, analyzeM3U, tmdbSearch, tmdbGetDetails, tmdbImageUrl, normalizeName, normalizePreview, detectDuplicates, validateUrl, uid, now, today, generateUsername, generatePassword, debounce } from './lib';
import { Modal, Button, Input, Select, Textarea, Badge, Card, StatCard, Tabs, SearchInput, EmptyState, useConfirm } from './components';
import {
  LayoutDashboard, List, Tv, Film, PlayCircle, Users, CreditCard, Settings as SettingsIcon,
  Menu, X, Search, Plus, Edit, Trash2, RefreshCw, Upload, Download, Eye, EyeOff,
  CheckCircle, AlertCircle, Info, LogOut, Star, Clock, Globe, Monitor, Smartphone,
  Zap, Shield, Volume2, VolumeX, Maximize2, Minimize2, Pause, Play, Server as ServerIcon,
  Activity, Database, FolderTree, Package, Key, Copy, UserCheck, UserX, Wallet,
  FileText, HardDrive, BarChart3, PieChart as PieIcon, TrendingUp, Layers, Radio,
  Calendar, AlertTriangle, Check, ChevronRight, ChevronDown, ExternalLink, Grid, Table as TableIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Hls from 'hls.js';

type Page = 'dashboard' | 'm3u' | 'channels' | 'movies' | 'series' | 'categories' | 'bouquets' | 'clients' | 'resellers' | 'credits' | 'plans' | 'servers' | 'connections' | 'epg' | 'tools' | 'settings' | 'trials' | 'logs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(store.getAuth());
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [settings, setSettings] = useState<Settings>(store.getSettings());

  useEffect(() => {
    const unsub = addNotificationListener((n) => {
      setNotifications(prev => [...prev, n]);
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 4000);
    });
    return unsub;
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => { store.setAuth(true); setIsAuthenticated(true); notify('success', 'Bem-vindo ao StreamPanel!'); }} />;
  }

  const menuSections = [
    { title: 'DASHBOARD', items: [{ id: 'dashboard' as Page, icon: <LayoutDashboard size={18} />, label: 'Visão Geral' }] },
    { title: 'CONTEÚDOS', items: [
      { id: 'channels' as Page, icon: <Tv size={18} />, label: 'Canais ao Vivo' },
      { id: 'movies' as Page, icon: <Film size={18} />, label: 'Filmes' },
      { id: 'series' as Page, icon: <PlayCircle size={18} />, label: 'Séries' },
      { id: 'categories' as Page, icon: <FolderTree size={18} />, label: 'Categorias' },
      { id: 'bouquets' as Page, icon: <Package size={18} />, label: 'Bouquets' },
    ]},
    { title: 'LISTAS M3U', items: [{ id: 'm3u' as Page, icon: <List size={18} />, label: 'Minhas Listas' }] },
    { title: 'CLIENTES', items: [
      { id: 'clients' as Page, icon: <Users size={18} />, label: 'Todos os Clientes' },
      { id: 'trials' as Page, icon: <UserCheck size={18} />, label: 'Testes IPTV' },
    ]},
    { title: 'REVENDEDORES', items: [
      { id: 'resellers' as Page, icon: <UserCheck size={18} />, label: 'Revendedores' },
      { id: 'credits' as Page, icon: <Wallet size={18} />, label: 'Créditos' },
    ]},
    { title: 'PLANOS', items: [{ id: 'plans' as Page, icon: <CreditCard size={18} />, label: 'Planos' }] },
    { title: 'SERVIDORES', items: [
      { id: 'servers' as Page, icon: <ServerIcon size={18} />, label: 'Servidores' },
      { id: 'connections' as Page, icon: <Activity size={18} />, label: 'Conexões Ativas' },
    ]},
    { title: 'FERRAMENTAS', items: [
      { id: 'epg' as Page, icon: <Calendar size={18} />, label: 'EPG' },
      { id: 'tools' as Page, icon: <Zap size={18} />, label: 'Ferramentas' },
      { id: 'logs' as Page, icon: <FileText size={18} />, label: 'Logs' },
    ]},
    { title: 'CONFIGURAÇÕES', items: [{ id: 'settings' as Page, icon: <SettingsIcon size={18} />, label: 'Geral' }] },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1120]">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#111827] border-r border-[#1F2937] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{settings.logo}</span>
              <span className="font-bold text-sm bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent truncate">{settings.panelName}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white hidden lg:block"><Menu size={18} /></button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white lg:hidden"><X size={18} /></button>
        </div>
        <nav className="overflow-y-auto h-[calc(100vh-130px)] py-2 px-2">
          {menuSections.map((section, si) => (
            <div key={si} className="mb-3">
              {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1">{section.title}</p>}
              {section.items.map(item => (
                <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${currentPage === item.id ? 'bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 text-white border border-[#3B82F6]/30' : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'}`}>
                  <span className={currentPage === item.id ? 'text-[#3B82F6]' : ''}>{item.icon}</span>
                  {sidebarOpen && <span className="text-xs font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-[#1F2937] bg-[#111827]">
          <button onClick={() => { store.setAuth(false); setIsAuthenticated(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />{sidebarOpen && <span className="text-xs font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-[#0B1120]/80 backdrop-blur-lg border-b border-[#1F2937] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><Menu size={20} /></button>
              <h2 className="text-lg font-semibold text-white capitalize">{menuSections.flatMap(s => s.items).find(i => i.id === currentPage)?.label || 'Dashboard'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#1E293B] rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-300">Sistema Online</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">A</div>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'm3u' && <M3UPage />}
          {currentPage === 'channels' && <ChannelsPage />}
          {currentPage === 'movies' && <MoviesPage />}
          {currentPage === 'series' && <SeriesPage />}
          {currentPage === 'categories' && <CategoriesPage />}
          {currentPage === 'bouquets' && <BouquetsPage />}
          {currentPage === 'clients' && <ClientsPage />}
          {currentPage === 'trials' && <TrialsPage />}
          {currentPage === 'resellers' && <ResellersPage />}
          {currentPage === 'credits' && <CreditsPage />}
          {currentPage === 'plans' && <PlansPage />}
          {currentPage === 'servers' && <ServersPage />}
          {currentPage === 'connections' && <ConnectionsPage />}
          {currentPage === 'epg' && <EpgPage />}
          {currentPage === 'tools' && <ToolsPage />}
          {currentPage === 'logs' && <LogsPage />}
          {currentPage === 'settings' && <SettingsPage settings={settings} setSettings={setSettings} />}
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in backdrop-blur-lg ${n.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : n.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : n.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'}`}>
            {n.type === 'success' && <CheckCircle size={18} />}{n.type === 'error' && <AlertCircle size={18} />}{n.type === 'info' && <Info size={18} />}{n.type === 'warning' && <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== LOGIN ====================
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@streampanel.com');
  const [password, setPassword] = useState('admin123');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (email && password.length >= 6) onLogin(); else notify('error', 'Credenciais inválidas'); };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">StreamPanel IPTV</h1>
          <p className="text-gray-400 mt-2 text-sm">Painel Administrativo Profissional</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" value={email} onChange={setEmail} type="email" required />
          <Input label="Senha" value={password} onChange={setPassword} type="password" required />
          <button type="submit" className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Entrar</button>
          <p className="text-center text-gray-500 text-xs mt-4">Demo: admin@streampanel.com / admin123</p>
        </form>
      </div>
    </div>
  );
}

// ==================== HLS PLAYER ====================
function HlsPlayer({ url, type = 'live' }: { url: string; type?: 'live' | 'vod' }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    setError(null);
    setLoading(true);

    if (url.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: type === 'live' });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false); video.play().catch(() => {}); });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(`Erro HLS: ${data.details}`);
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => { setLoading(false); video.play().catch(() => {}); });
      video.addEventListener('error', () => { setError('Erro ao carregar mídia'); setLoading(false); });
    } else {
      video.src = url;
      video.addEventListener('loadeddata', () => setLoading(false));
      video.addEventListener('error', () => { setError('Formato não suportado pelo navegador'); setLoading(false); });
    }

    return () => { if (hls) hls.destroy(); };
  }, [url, type]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} controls className="w-full h-full" playsInline />
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><RefreshCw className="animate-spin text-white" size={32} /></div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-black/80"><p className="text-red-400 text-sm text-center px-4">{error}</p></div>}
    </div>
  );
}

// ==================== DASHBOARD ====================
function DashboardPage() {
  const channels = store.getChannels();
  const movies = store.getMovies();
  const series = store.getSeries();
  const clients = store.getClients();
  const resellers = store.getResellers();
  const servers = store.getServers();
  const connections = store.getConnections();
  const categories = store.getCategories();
  const sources = store.getM3USources();
  const activeClients = clients.filter(c => c.status === 'active').length;
  const expiredClients = clients.filter(c => c.status === 'expired').length;
  const totalConns = servers.reduce((a, s) => a + s.activeConnections, 0);

  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: <Users size={22} />, color: 'from-blue-500 to-blue-600', sub: `${activeClients} ativos` },
    { label: 'Clientes Expirados', value: expiredClients, icon: <UserX size={22} />, color: 'from-red-500 to-red-600', sub: `${clients.filter(c => c.status === 'trial').length} em teste` },
    { label: 'Revendedores', value: resellers.length, icon: <UserCheck size={22} />, color: 'from-purple-500 to-purple-600', sub: 'Ativos' },
    { label: 'Canais', value: channels.length, icon: <Tv size={22} />, color: 'from-green-500 to-green-600', sub: `${channels.filter(c => c.status === 'online').length} online` },
    { label: 'Filmes', value: movies.length, icon: <Film size={22} />, color: 'from-pink-500 to-pink-600', sub: 'VOD' },
    { label: 'Séries', value: series.length, icon: <PlayCircle size={22} />, color: 'from-orange-500 to-orange-600', sub: `${store.getEpisodes().length} episódios` },
    { label: 'Categorias', value: categories.length, icon: <FolderTree size={22} />, color: 'from-cyan-500 to-cyan-600', sub: `${sources.length} listas` },
    { label: 'Conexões Ativas', value: totalConns, icon: <Activity size={22} />, color: 'from-emerald-500 to-emerald-600', sub: `${connections.length} sessões` },
  ];

  const chartData = [
    { name: 'Seg', clientes: 12, conexoes: 45 }, { name: 'Ter', clientes: 19, conexoes: 52 },
    { name: 'Qua', clientes: 15, conexoes: 38 }, { name: 'Qui', clientes: 22, conexoes: 65 },
    { name: 'Sex', clientes: 28, conexoes: 78 }, { name: 'Sáb', clientes: 35, conexoes: 95 },
    { name: 'Dom', clientes: 30, conexoes: 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-[#3B82F6]" /> Atividade Semanal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Bar dataKey="clientes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conexoes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Últimos Clientes</h3>
          <div className="space-y-2">
            {clients.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#1F2937] last:border-0">
                <div><p className="text-sm text-white">{c.name}</p><p className="text-xs text-gray-500">{c.username}</p></div>
                <Badge variant={c.status === 'active' ? 'success' : c.status === 'expired' ? 'danger' : c.status === 'trial' ? 'warning' : 'default'}>{c.status === 'active' ? 'Ativo' : c.status === 'expired' ? 'Expirado' : c.status === 'trial' ? 'Teste' : 'Suspenso'}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Status dos Servidores</h3>
          <div className="space-y-3">
            {servers.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div><p className="text-sm text-white">{s.name}</p><p className="text-xs text-gray-500">{s.host}:{s.port}</p></div>
                </div>
                <div className="text-right"><p className="text-xs text-gray-400">{s.activeConnections}/{s.maxConnections}</p><p className="text-xs text-gray-500">CPU: {s.cpu || 'N/A'}%</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ==================== M3U PAGE ====================
function M3UPage() {
  const [sources, setSources] = useState<M3USource[]>(store.getM3USources());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<M3USource | null>(null);
  const [form, setForm] = useState({ name: '', url: '', type: 'mixed' as M3USource['type'], syncInterval: 1440, maxTimeout: 30 });
  const [analysis, setAnalysis] = useState<M3UAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name || !form.url) return notify('error', 'Preencha todos os campos');
    const urlCheck = validateUrl(form.url);
    if (!urlCheck.valid) return notify('error', urlCheck.error || 'URL inválida');
    if (editing) {
      const updated = sources.map(s => s.id === editing.id ? { ...s, ...form, updatedAt: today() } : s);
      setSources(updated); store.setM3USources(updated);
      audit('update', 'm3u_source', editing.id, form.name);
      notify('success', 'Lista atualizada!');
    } else {
      const newSource: M3USource = { id: uid(), ...form, status: 'active', channelsCount: 0, moviesCount: 0, seriesCount: 0, episodesCount: 0, duplicatesCount: 0, errorsCount: 0, createdAt: today(), updatedAt: today() };
      const updated = [...sources, newSource];
      setSources(updated); store.setM3USources(updated);
      audit('create', 'm3u_source', newSource.id, form.name);
      notify('success', 'Lista adicionada!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir lista', 'Esta ação removerá a lista. Os conteúdos importados permanecerão.', () => {
      const updated = sources.filter(s => s.id !== id);
      setSources(updated); store.setM3USources(updated);
      audit('delete', 'm3u_source', id);
      notify('success', 'Lista removida!');
    });
  };

  const handleAnalyze = async (source: M3USource) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(source.url, { signal: AbortSignal.timeout(source.maxTimeout * 1000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const { items, errors } = parseM3U(text);
      const result = analyzeM3U(items);
      result.errors = errors;
      setAnalysis(result);
      notify('success', `Análise concluída: ${result.total} itens encontrados`);
    } catch (e: any) {
      notify('error', `Erro ao analisar: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImport = (source: M3USource) => {
    // Real import - fetch and parse
    setAnalyzing(true);
    fetch(source.url, { signal: AbortSignal.timeout(source.maxTimeout * 1000) })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const { items, errors } = parseM3U(text);
        
        // Import channels
        const channels = store.getChannels();
        const newChannels: Channel[] = items.filter(i => i.detectedType === 'live').map(item => ({
          id: uid(), name: item.name, tvgId: item.tvgId, tvgName: item.tvgName, logo: item.tvgLogo,
          groupTitle: item.groupTitle, url: item.url, sourceId: source.id, sourceItemKey: item.key,
          country: item.country, language: item.language, status: 'unknown' as const, active: true,
          adult: false, deliveryMode: 'default' as const, order: channels.length + items.indexOf(item),
          manualOverrides: [], createdAt: today(), updatedAt: today()
        }));
        store.setChannels([...channels, ...newChannels]);
        
        // Import movies
        const movies = store.getMovies();
        const newMovies: Movie[] = items.filter(i => i.detectedType === 'movie').map(item => ({
          id: uid(), name: item.name, url: item.url, cover: item.tvgLogo || '🎬', sourceId: source.id,
          sourceItemKey: item.key, status: 'available' as const, active: true, adult: false,
          manualOverrides: [], createdAt: today(), updatedAt: today()
        }));
        store.setMovies([...movies, ...newMovies]);
        
        // Import series (group episodes by series name)
        const seriesItems = items.filter(i => i.detectedType === 'series' && i.seriesInfo);
        const seriesMap = new Map<string, typeof seriesItems>();
        for (const item of seriesItems) {
          const key = item.seriesInfo!.name.toLowerCase().trim();
          if (!seriesMap.has(key)) seriesMap.set(key, []);
          seriesMap.get(key)!.push(item);
        }
        
        const allSeries = store.getSeries();
        const allSeasons = store.getSeasons();
        const allEpisodes = store.getEpisodes();
        let newSeriesCount = 0, newSeasonsCount = 0, newEpisodesCount = 0;
        
        for (const [seriesName, eps] of seriesMap.entries()) {
          // Create or find series
          let series = allSeries.find(s => s.name.toLowerCase().trim() === seriesName);
          if (!series) {
            series = {
              id: uid(), name: eps[0].seriesInfo!.name, seasonsCount: 0, episodesCount: 0,
              status: 'available', active: true, adult: false, manualOverrides: [],
              sourceId: source.id, createdAt: today(), updatedAt: today()
            };
            allSeries.push(series);
            newSeriesCount++;
          }
          
          // Group episodes by season
          const seasonMap = new Map<number, typeof eps>();
          for (const ep of eps) {
            const sNum = ep.seriesInfo!.season;
            if (!seasonMap.has(sNum)) seasonMap.set(sNum, []);
            seasonMap.get(sNum)!.push(ep);
          }
          
          for (const [seasonNum, seasonEps] of seasonMap.entries()) {
            // Create or find season
            let season = allSeasons.find(s => s.seriesId === series!.id && s.number === seasonNum);
            if (!season) {
              season = {
                id: uid(), seriesId: series.id, number: seasonNum, order: seasonNum, episodesCount: 0,
                createdAt: today(), updatedAt: today()
              };
              allSeasons.push(season);
              newSeasonsCount++;
              series.seasonsCount++;
            }
            
            // Create episodes
            for (const ep of seasonEps) {
              const newEp: Episode = {
                id: uid(), seriesId: series.id, seasonId: season.id, seasonNumber: seasonNum,
                episodeNumber: ep.seriesInfo!.episode, name: ep.name, url: ep.url,
                status: 'available', active: true, manualOverrides: [],
                sourceId: source.id, sourceItemKey: ep.key, createdAt: today(), updatedAt: today()
              };
              allEpisodes.push(newEp);
              season.episodesCount++;
              series.episodesCount++;
              newEpisodesCount++;
            }
          }
        }
        
        store.setSeries(allSeries);
        store.setSeasons(allSeasons);
        store.setEpisodes(allEpisodes);
        
        // Update source counts
        const updated = sources.map(s => s.id === source.id ? {
          ...s, channelsCount: items.filter(i => i.detectedType === 'live').length,
          moviesCount: items.filter(i => i.detectedType === 'movie').length,
          seriesCount: seriesMap.size,
          episodesCount: seriesItems.length,
          lastImportAt: now(), lastImportDuration: 5, status: 'active' as const
        } : s);
        setSources(updated); store.setM3USources(updated);
        audit('import', 'm3u_source', source.id, `${items.length} itens: ${newChannels.length} canais, ${newMovies.length} filmes, ${newSeriesCount} séries, ${newEpisodesCount} episódios`);
        notify('success', `Importação concluída! ${newChannels.length} canais, ${newMovies.length} filmes, ${newSeriesCount} séries (${newEpisodesCount} episódios).`);
      })
      .catch(e => notify('error', `Erro: ${e.message}`))
      .finally(() => setAnalyzing(false));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const { items, errors } = parseM3U(content);
      const newSource: M3USource = {
        id: uid(), name: file.name.replace(/\.(m3u|m3u8)$/i, ''), url: `local://${file.name}`,
        type: 'mixed', status: 'active', channelsCount: items.filter(i => i.detectedType === 'live').length,
        moviesCount: items.filter(i => i.detectedType === 'movie').length,
        seriesCount: items.filter(i => i.detectedType === 'series').length,
        episodesCount: 0, duplicatesCount: 0, errorsCount: errors.length,
        lastImportAt: now(), syncInterval: 0, maxTimeout: 30, createdAt: today(), updatedAt: today(), lastImportDuration: 2
      };
      setSources([...sources, newSource]); store.setM3USources([...sources, newSource]);
      
      // Import channels
      const channels = store.getChannels();
      const newChannels: Channel[] = items.filter(i => i.detectedType === 'live').map(item => ({
        id: uid(), name: item.name, tvgId: item.tvgId, tvgName: item.tvgName, logo: item.tvgLogo,
        groupTitle: item.groupTitle, url: item.url, sourceId: newSource.id, sourceItemKey: item.key,
        country: item.country, language: item.language, status: 'unknown' as const, active: true,
        adult: false, deliveryMode: 'default' as const, order: channels.length, manualOverrides: [],
        createdAt: today(), updatedAt: today()
      }));
      store.setChannels([...channels, ...newChannels]);
      notify('success', `Arquivo importado! ${items.length} itens (${newChannels.length} canais, ${items.filter(i => i.detectedType === 'movie').length} filmes).`);
      audit('import_file', 'm3u_source', newSource.id, `${items.length} itens`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Listas M3U</h1><p className="text-gray-400 text-sm">Gerencie e importe listas IPTV</p></div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 hover:border-[#3B82F6] cursor-pointer transition-colors">
            <Upload size={16} /><span>Upload .m3u</span>
            <input type="file" accept=".m3u,.m3u8" onChange={handleFileUpload} className="hidden" />
          </label>
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', url: '', type: 'mixed', syncInterval: 1440, maxTimeout: 30 }); }}><Plus size={16} className="inline mr-1" /> Nova Lista</Button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Lista' : 'Nova Lista M3U'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required placeholder="Ex: Lista Nacional" />
          <Input label="URL" value={form.url} onChange={v => setForm({ ...form, url: v })} required placeholder="https://exemplo.com/lista.m3u" />
          <Select label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as M3USource['type'] })} options={[{ value: 'live', label: 'Canais ao Vivo' }, { value: 'vod', label: 'Filmes VOD' }, { value: 'series', label: 'Séries' }, { value: 'mixed', label: 'Misto' }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Intervalo sync (min)" value={form.syncInterval} onChange={v => setForm({ ...form, syncInterval: Number(v) })} type="number" />
            <Input label="Timeout (seg)" value={form.maxTimeout} onChange={v => setForm({ ...form, maxTimeout: Number(v) })} type="number" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </div>
      </Modal>

      {analysis && (
        <Card className="p-5 border-[#3B82F6]/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-[#3B82F6]" /> Resultado da Análise</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
            <div className="bg-[#0F172A] rounded p-3"><p className="text-gray-500 text-xs">Total</p><p className="text-white font-bold text-xl">{analysis.total}</p></div>
            <div className="bg-[#0F172A] rounded p-3"><p className="text-gray-500 text-xs">Canais</p><p className="text-green-400 font-bold text-xl">{analysis.channels}</p></div>
            <div className="bg-[#0F172A] rounded p-3"><p className="text-gray-500 text-xs">Filmes</p><p className="text-purple-400 font-bold text-xl">{analysis.movies}</p></div>
            <div className="bg-[#0F172A] rounded p-3"><p className="text-gray-500 text-xs">Séries</p><p className="text-orange-400 font-bold text-xl">{analysis.series}</p></div>
            <div className="bg-[#0F172A] rounded p-3"><p className="text-gray-500 text-xs">Duplicados</p><p className="text-yellow-400 font-bold text-xl">{analysis.duplicates}</p></div>
          </div>
          {analysis.groups.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Grupos encontrados:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.groups.slice(0, 20).map((g, i) => (
                  <Badge key={i} variant="info">{g.name} ({g.count})</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(source => (
          <Card key={source.id} className="p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><List size={16} className="text-[#3B82F6]" />{source.name}</h3>
                <p className="text-xs text-gray-500 truncate mt-1">{source.url}</p>
              </div>
              <Badge variant={source.status === 'active' ? 'success' : source.status === 'error' ? 'danger' : 'warning'}>{source.status === 'active' ? 'Ativa' : source.status === 'error' ? 'Erro' : 'Inativa'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Canais:</span> <span className="text-white font-medium">{source.channelsCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Filmes:</span> <span className="text-white font-medium">{source.moviesCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Séries:</span> <span className="text-white font-medium">{source.seriesCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Erros:</span> <span className="text-white font-medium">{source.errorsCount}</span></div>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              <p>Última importação: {source.lastImportAt ? new Date(source.lastImportAt).toLocaleString('pt-BR') : 'Nunca'}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => handleAnalyze(source)} disabled={analyzing}><Search size={14} className="inline mr-1" /> Analisar</Button>
              <Button size="sm" onClick={() => handleImport(source)} disabled={analyzing}><Download size={14} className="inline mr-1" /> Importar</Button>
              <Button size="sm" variant="secondary" onClick={() => { setEditing(source); setForm({ name: source.name, url: source.url, type: source.type, syncInterval: source.syncInterval, maxTimeout: source.maxTimeout }); setShowForm(true); }}><Edit size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(source.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {sources.length === 0 && <EmptyState icon={<List size={48} />} title="Nenhuma lista cadastrada" description="Adicione uma lista M3U por URL ou faça upload de um arquivo." />}
    </div>
  );
}

// ==================== CHANNELS PAGE ====================
function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(store.getChannels());
  const [categories] = useState<Category[]>(store.getCategories().filter(c => c.type === 'live'));
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(store.getSettings().viewMode);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Channel | null>(null);
  const [playing, setPlaying] = useState<Channel | null>(null);
  const [form, setForm] = useState<{ name: string; url: string; urlAlt: string; logo: string; categoryId: string; groupTitle: string; tvgId: string; country: string; language: string; adult: boolean; active: boolean; deliveryMode: 'default' | 'default2' | 'direct' | 'direct2' }>({ name: '', url: '', urlAlt: '', logo: '', categoryId: '', groupTitle: '', tvgId: '', country: '', language: '', adult: false, active: true, deliveryMode: 'default' });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = useMemo(() => {
    return channels.filter(ch => {
      const matchSearch = !search || ch.name.toLowerCase().includes(search.toLowerCase()) || (ch.tvgId || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || ch.categoryId === filterCat;
      const matchStatus = filterStatus === 'all' || ch.status === filterStatus;
      const matchActive = filterActive === 'all' || String(ch.active) === filterActive;
      return matchSearch && matchCat && matchStatus && matchActive;
    });
  }, [channels, search, filterCat, filterStatus, filterActive]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = channels.map(ch => ch.id === editing.id ? { ...ch, ...form, updatedAt: today(), manualOverrides: [...ch.manualOverrides, 'edited'] } : ch);
      setChannels(updated); store.setChannels(updated);
      audit('update', 'channel', editing.id, form.name);
      notify('success', 'Canal atualizado!');
    } else {
      const newCh: Channel = { id: uid(), ...form, status: 'unknown', order: channels.length, sourceItemKey: '', manualOverrides: [], createdAt: today(), updatedAt: today() };
      const updated = [...channels, newCh];
      setChannels(updated); store.setChannels(updated);
      audit('create', 'channel', newCh.id, form.name);
      notify('success', 'Canal adicionado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir canal', 'Tem certeza que deseja excluir este canal?', () => {
      const updated = channels.filter(ch => ch.id !== id);
      setChannels(updated); store.setChannels(updated);
      audit('delete', 'channel', id);
      notify('success', 'Canal removido!');
    });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    confirm(`Excluir ${selected.size} canais`, 'Esta ação não pode ser desfeita.', () => {
      const updated = channels.filter(ch => !selected.has(ch.id));
      setChannels(updated); store.setChannels(updated);
      audit('bulk_delete', 'channel', undefined, `${selected.size} canais`);
      notify('success', `${selected.size} canais removidos!`);
      setSelected(new Set());
    });
  };

  const handleBulkToggleActive = (active: boolean) => {
    if (selected.size === 0) return;
    const updated = channels.map(ch => selected.has(ch.id) ? { ...ch, active } : ch);
    setChannels(updated); store.setChannels(updated);
    notify('success', `${selected.size} canais ${active ? 'ativados' : 'desativados'}!`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(c => c.id)));
  };

  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || 'Sem categoria';

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Canais ao Vivo</h1><p className="text-gray-400 text-sm">{filtered.length} de {channels.length} canais</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>{viewMode === 'grid' ? <TableIcon size={16} /> : <Grid size={16} />}</Button>
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', url: '', urlAlt: '', logo: '📺', categoryId: '', groupTitle: '', tvgId: '', country: '', language: '', adult: false, active: true, deliveryMode: 'default' }); }}><Plus size={16} className="inline mr-1" /> Novo Canal</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, tvg-id..." /></div>
        <Select value={filterCat} onChange={setFilterCat} options={[{ value: 'all', label: 'Todas categorias' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
        <Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Todos status' }, { value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }, { value: 'unknown', label: 'Desconhecido' }]} />
        <Select value={filterActive} onChange={v => setFilterActive(v as any)} options={[{ value: 'all', label: 'Todos' }, { value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }]} />
      </div>

      {selected.size > 0 && (
        <Card className="p-3 flex items-center gap-3 bg-[#3B82F6]/10 border-[#3B82F6]/30">
          <span className="text-sm text-white font-medium">{selected.size} selecionado(s)</span>
          <Button size="sm" variant="secondary" onClick={() => handleBulkToggleActive(true)}>Ativar</Button>
          <Button size="sm" variant="secondary" onClick={() => handleBulkToggleActive(false)}>Desativar</Button>
          <Button size="sm" variant="danger" onClick={handleBulkDelete}>Excluir</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar</Button>
        </Card>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Canal' : 'Novo Canal'} size="lg">
        <div className="space-y-4">
          <Tabs tabs={[{ id: 'info', label: 'Informações' }, { id: 'stream', label: 'Transmissão' }, { id: 'epg', label: 'EPG' }]} active="info" onChange={() => {}} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
            <Input label="Logo (emoji ou URL)" value={form.logo} onChange={v => setForm({ ...form, logo: v })} />
            <Input label="URL Principal" value={form.url} onChange={v => setForm({ ...form, url: v })} placeholder="https://..." />
            <Input label="URL Alternativa" value={form.urlAlt} onChange={v => setForm({ ...form, urlAlt: v })} />
            <Input label="TVG-ID" value={form.tvgId} onChange={v => setForm({ ...form, tvgId: v })} />
            <Input label="Grupo" value={form.groupTitle} onChange={v => setForm({ ...form, groupTitle: v })} />
            <Select label="Categoria" value={form.categoryId} onChange={v => setForm({ ...form, categoryId: v })} options={[{ value: '', label: 'Selecionar...' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
            <Select label="Modo de Entrega" value={form.deliveryMode} onChange={v => setForm({ ...form, deliveryMode: v as any })} options={[{ value: 'default', label: 'Padrão' }, { value: 'direct', label: 'Link Direto' }]} />
            <Input label="País" value={form.country} onChange={v => setForm({ ...form, country: v })} />
            <Input label="Idioma" value={form.language} onChange={v => setForm({ ...form, language: v })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-[#3B82F6]" /> Ativo</label>
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.adult} onChange={e => setForm({ ...form, adult: e.target.checked })} className="accent-[#3B82F6]" /> Adulto</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.name || 'Player'} size="lg">
        {playing && (
          <div>
            {playing.url ? <HlsPlayer url={playing.url} type="live" /> : <div className="aspect-video bg-black rounded-lg flex items-center justify-center"><p className="text-gray-500">URL não disponível</p></div>}
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">URL:</span> {playing.url || 'Não definida'}</p>
              <p><span className="text-gray-500">Categoria:</span> {getCategoryName(playing.categoryId)}</p>
              <p><span className="text-gray-500">Status:</span> {playing.status}</p>
              <p><span className="text-gray-500">TVG-ID:</span> {playing.tvgId || 'N/A'}</p>
            </div>
          </div>
        )}
      </Modal>

      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F172A]">
                <tr>
                  <th className="px-3 py-3 w-10"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="accent-[#3B82F6]" /></th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase">Logo</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase">Nome</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Categoria</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">TVG-ID</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {paginated.map(ch => (
                  <tr key={ch.id} className="hover:bg-[#0F172A]/50 transition-colors">
                    <td className="px-3 py-2"><input type="checkbox" checked={selected.has(ch.id)} onChange={() => toggleSelect(ch.id)} className="accent-[#3B82F6]" /></td>
                    <td className="px-3 py-2"><div className="w-8 h-8 rounded bg-[#0F172A] flex items-center justify-center text-lg">{ch.logo || '📺'}</div></td>
                    <td className="px-3 py-2"><p className="text-sm text-white font-medium">{ch.name}</p>{!ch.active && <Badge variant="default">Inativo</Badge>}</td>
                    <td className="px-3 py-2 text-sm text-gray-400 hidden md:table-cell">{getCategoryName(ch.categoryId)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 font-mono hidden lg:table-cell">{ch.tvgId || '-'}</td>
                    <td className="px-3 py-2"><span className={`w-2 h-2 rounded-full inline-block mr-1 ${ch.status === 'online' ? 'bg-green-500' : ch.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></span><span className="text-xs text-gray-400">{ch.status}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => setPlaying(ch)} className="p-1.5 text-gray-400 hover:text-[#3B82F6] rounded hover:bg-[#0F172A]" title="Testar"><Play size={14} /></button>
                        <button onClick={() => { navigator.clipboard.writeText(ch.url); notify('success', 'Link copiado!'); }} className="p-1.5 text-gray-400 hover:text-green-400 rounded hover:bg-[#0F172A]" title="Copiar Link"><Copy size={14} /></button>
                        <button onClick={() => { setEditing(ch); setForm({ name: ch.name, url: ch.url, urlAlt: ch.urlAlt || '', logo: ch.logo || '', categoryId: ch.categoryId || '', groupTitle: ch.groupTitle || '', tvgId: ch.tvgId || '', country: ch.country || '', language: ch.language || '', adult: ch.adult, active: ch.active, deliveryMode: ch.deliveryMode }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0F172A]" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(ch.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0F172A]" title="Excluir"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginated.map(ch => (
            <Card key={ch.id} className="p-4 hover:border-[#3B82F6]/30 transition-all group">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.has(ch.id)} onChange={() => toggleSelect(ch.id)} className="accent-[#3B82F6]" />
                <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center text-2xl overflow-hidden">
                  {ch.logo?.startsWith('http') ? <img src={ch.logo} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '📺'; }} /> : (ch.logo || '📺')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{ch.name}</h3>
                  <p className="text-xs text-gray-500">{getCategoryName(ch.categoryId)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${ch.status === 'online' ? 'bg-green-500' : ch.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-400">{ch.status}</span>
                    {ch.adult && <Badge variant="danger">18+</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-[#1F2937] opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPlaying(ch)} className="text-xs text-[#3B82F6] hover:text-blue-400 flex items-center gap-1"><Play size={12} /> Testar</button>
                <button onClick={() => { setEditing(ch); setForm({ name: ch.name, url: ch.url, urlAlt: ch.urlAlt || '', logo: ch.logo || '', categoryId: ch.categoryId || '', groupTitle: ch.groupTitle || '', tvgId: ch.tvgId || '', country: ch.country || '', language: ch.language || '', adult: ch.adult, active: ch.active, deliveryMode: ch.deliveryMode }); setShowForm(true); }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><Edit size={12} /> Editar</button>
                <button onClick={() => handleDelete(ch.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"><Trash2 size={12} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <span className="px-3 py-1.5 text-sm text-gray-300">{page} / {totalPages}</span>
            <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próximo</Button>
          </div>
        </div>
      )}

      {filtered.length === 0 && <EmptyState icon={<Tv size={48} />} title="Nenhum canal encontrado" />}
    </div>
  );
}

// ==================== MOVIES PAGE ====================
function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>(store.getMovies());
  const [categories] = useState<Category[]>(store.getCategories().filter(c => c.type === 'movie'));
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResult[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [form, setForm] = useState({ name: '', originalName: '', url: '', cover: '', backdrop: '', categoryId: '', year: '', synopsis: '', genre: '', director: '', rating: '', duration: '', classification: '', tmdbId: '', adult: false, active: true });
  const { confirm, Component: ConfirmComp } = useConfirm();
  const settings = store.getSettings();

  const filtered = movies.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.originalName || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || m.categoryId === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = movies.map(m => m.id === editing.id ? {
        ...m, name: form.name, originalName: form.originalName, url: form.url, cover: form.cover,
        backdrop: form.backdrop, categoryId: form.categoryId, year: Number(form.year) || undefined,
        synopsis: form.synopsis, genre: form.genre ? form.genre.split(',').map(g => g.trim()) : undefined,
        director: form.director, rating: Number(form.rating) || undefined, duration: form.duration,
        classification: form.classification, tmdbId: form.tmdbId, adult: form.adult, active: form.active,
        updatedAt: today(), manualOverrides: [...m.manualOverrides, 'edited']
      } : m);
      setMovies(updated); store.setMovies(updated);
      audit('update', 'movie', editing.id, form.name);
      notify('success', 'Filme atualizado!');
    } else {
      const newMov: Movie = {
        id: uid(), name: form.name, originalName: form.originalName, url: form.url, cover: form.cover || '🎬',
        backdrop: form.backdrop, categoryId: form.categoryId, year: Number(form.year) || undefined,
        synopsis: form.synopsis, genre: form.genre ? form.genre.split(',').map(g => g.trim()) : undefined,
        director: form.director, rating: Number(form.rating) || undefined, duration: form.duration,
        classification: form.classification, tmdbId: form.tmdbId, adult: form.adult, status: 'available',
        active: form.active, manualOverrides: [], createdAt: today(), updatedAt: today()
      };
      setMovies([...movies, newMov]); store.setMovies([...movies, newMov]);
      audit('create', 'movie', newMov.id, form.name);
      notify('success', 'Filme adicionado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir filme', 'Tem certeza?', () => {
      const updated = movies.filter(m => m.id !== id);
      setMovies(updated); store.setMovies(updated);
      audit('delete', 'movie', id);
      notify('success', 'Filme removido!');
    });
  };

  const handleTmdbSearch = async () => {
    if (!settings.tmdbApiKey) return notify('error', 'Configure a chave TMDB em Configurações > Integrações');
    if (!form.name) return notify('error', 'Digite um nome para buscar');
    setTmdbLoading(true);
    try {
      const results = await tmdbSearch(form.name, 'movie', form.year ? Number(form.year) : undefined, settings.tmdbApiKey, settings.tmdbLanguage);
      setTmdbResults(results);
      if (results.length === 0) notify('info', 'Nenhum resultado encontrado');
    } catch (e: any) {
      notify('error', e.message);
    } finally {
      setTmdbLoading(false);
    }
  };

  const applyTmdb = (result: TmdbSearchResult) => {
    setForm(f => ({
      ...f,
      originalName: result.original_title || result.title || f.originalName,
      synopsis: result.overview || f.synopsis,
      cover: result.poster_path ? tmdbImageUrl(result.poster_path) : f.cover,
      backdrop: result.backdrop_path ? tmdbImageUrl(result.backdrop_path, 'original') : f.backdrop,
      year: result.release_date?.slice(0, 4) || f.year,
      rating: result.vote_average ? String(result.vote_average) : f.rating,
      tmdbId: String(result.id),
    }));
    setTmdbResults([]);
    notify('success', 'Dados TMDB aplicados! URL e campos manuais preservados.');
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Filmes</h1><p className="text-gray-400 text-sm">{filtered.length} filmes</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setTmdbResults([]); setForm({ name: '', originalName: '', url: '', cover: '🎬', backdrop: '', categoryId: '', year: '', synopsis: '', genre: '', director: '', rating: '', duration: '', classification: '', tmdbId: '', adult: false, active: true }); }}><Plus size={16} className="inline mr-1" /> Novo Filme</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar filme..." /></div>
        <Select value={filterCat} onChange={setFilterCat} options={[{ value: 'all', label: 'Todas categorias' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Filme' : 'Novo Filme'} size="xl">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleTmdbSearch} disabled={tmdbLoading}>{tmdbLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />} Buscar TMDB</Button>
          </div>
          {tmdbResults.length > 0 && (
            <div className="bg-[#0F172A] rounded-lg p-3 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-300 mb-2">Resultados TMDB (clique para aplicar):</p>
              <div className="space-y-2">
                {tmdbResults.map(r => (
                  <button key={r.id} onClick={() => applyTmdb(r)} className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#1E293B] text-left transition-colors">
                    {r.poster_path && <img src={tmdbImageUrl(r.poster_path, 'w185')} alt="" className="w-10 h-14 rounded object-cover" />}
                    <div className="flex-1">
                      <p className="text-sm text-white">{r.title || r.original_title}</p>
                      <p className="text-xs text-gray-500">{r.release_date?.slice(0, 4)} • ID: {r.id}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
            <Input label="Título Original" value={form.originalName} onChange={v => setForm({ ...form, originalName: v })} />
            <Input label="URL do Vídeo" value={form.url} onChange={v => setForm({ ...form, url: v })} placeholder="https://..." />
            <Input label="TMDB ID" value={form.tmdbId} onChange={v => setForm({ ...form, tmdbId: v })} />
            <Input label="Capa (URL ou emoji)" value={form.cover} onChange={v => setForm({ ...form, cover: v })} />
            <Input label="Backdrop (URL)" value={form.backdrop} onChange={v => setForm({ ...form, backdrop: v })} />
            <Input label="Ano" value={form.year} onChange={v => setForm({ ...form, year: v })} type="number" />
            <Input label="Duração" value={form.duration} onChange={v => setForm({ ...form, duration: v })} placeholder="2h 15min" />
            <Input label="Gêneros (separados por vírgula)" value={form.genre} onChange={v => setForm({ ...form, genre: v })} />
            <Input label="Diretor" value={form.director} onChange={v => setForm({ ...form, director: v })} />
            <Input label="Classificação" value={form.classification} onChange={v => setForm({ ...form, classification: v })} placeholder="12, 14, 16, 18" />
            <Input label="Nota (0-10)" value={form.rating} onChange={v => setForm({ ...form, rating: v })} type="number" />
            <Select label="Categoria" value={form.categoryId} onChange={v => setForm({ ...form, categoryId: v })} options={[{ value: '', label: 'Selecionar...' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          </div>
          <Textarea label="Sinopse" value={form.synopsis} onChange={v => setForm({ ...form, synopsis: v })} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-[#3B82F6]" /> Ativo</label>
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.adult} onChange={e => setForm({ ...form, adult: e.target.checked })} className="accent-[#3B82F6]" /> Adulto</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="lg">
        {selected && (
          <div className="flex gap-4">
            <div className="w-32 h-48 rounded-lg bg-[#0F172A] flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
              {selected.cover?.startsWith('http') ? <img src={selected.cover} alt="" className="w-full h-full object-cover" /> : selected.cover || '🎬'}
            </div>
            <div className="flex-1">
              {selected.originalName && <p className="text-xs text-gray-500">{selected.originalName}</p>}
              <div className="flex items-center gap-3 mt-1">
                {selected.year && <span className="text-sm text-gray-400">{selected.year}</span>}
                {selected.rating && <span className="text-yellow-400 text-sm flex items-center gap-1"><Star size={12} />{selected.rating}</span>}
                {selected.duration && <span className="text-sm text-gray-400">{selected.duration}</span>}
              </div>
              {selected.genre && <div className="flex gap-1 mt-2 flex-wrap">{selected.genre.map((g, i) => <Badge key={i} variant="purple">{g}</Badge>)}</div>}
              <p className="text-gray-300 text-sm mt-3">{selected.synopsis || 'Sem sinopse disponível.'}</p>
              {selected.url && <div className="mt-3"><HlsPlayer url={selected.url} type="vod" /></div>}
              {selected.tmdbId && <p className="text-xs text-gray-500 mt-2">TMDB ID: {selected.tmdbId}</p>}
            </div>
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map(movie => (
          <Card key={movie.id} className="overflow-hidden hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
            <div className="aspect-[2/3] bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden" onClick={() => setSelected(movie)}>
              {movie.cover?.startsWith('http') ? <img src={movie.cover} alt="" className="w-full h-full object-cover" /> : movie.cover || '🎬'}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-white truncate">{movie.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {movie.rating && <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{movie.rating}</span>}
                {movie.year && <span className="text-xs text-gray-500">{movie.year}</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<Film size={48} />} title="Nenhum filme encontrado" />}
    </div>
  );
}

// ==================== SERIES PAGE ====================
function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>(store.getSeries());
  const [seasons, setSeasons] = useState<Season[]>(store.getSeasons());
  const [episodes, setEpisodes] = useState<Episode[]>(store.getEpisodes());
  const [selected, setSelected] = useState<Series | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Series | null>(null);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ number: 1, name: '' });
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [epForm, setEpForm] = useState({ name: '', url: '', duration: '', cover: '' });
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [seriesForm, setSeriesForm] = useState({ name: '', originalName: '', cover: '', synopsis: '', year: '', categoryId: '', rating: '' });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = seriesList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSaveSeries = () => {
    if (!editing) return;
    const updated = seriesList.map(s => s.id === editing.id ? { ...editing, updatedAt: today() } : s);
    setSeriesList(updated); store.setSeries(updated);
    notify('success', 'Série atualizada!');
    setShowForm(false); setEditing(null);
  };

  const handleAddSeason = () => {
    if (!selected) return;
    const existing = seasons.filter(s => s.seriesId === selected.id);
    const num = seasonForm.number || existing.length + 1;
    if (existing.some(s => s.number === num)) return notify('error', 'Já existe temporada com este número');
    const newSeason: Season = { id: uid(), seriesId: selected.id, number: num, name: seasonForm.name || `Temporada ${num}`, order: existing.length + 1, episodesCount: 0, createdAt: today(), updatedAt: today() };
    const updated = [...seasons, newSeason];
    setSeasons(updated); store.setSeasons(updated);
    // Update series count
    const updatedSeries = seriesList.map(s => s.id === selected.id ? { ...s, seasonsCount: s.seasonsCount + 1 } : s);
    setSeriesList(updatedSeries); store.setSeries(updatedSeries);
    setSelected({ ...selected, seasonsCount: selected.seasonsCount + 1 });
    setShowSeasonForm(false); setSeasonForm({ number: existing.length + 1, name: '' });
    audit('create', 'season', newSeason.id, `T${num}`);
    notify('success', `Temporada ${num} criada!`);
  };

  const handleDeleteSeason = (seasonId: string) => {
    const epCount = episodes.filter(e => e.seasonId === seasonId).length;
    confirm(`Excluir temporada`, `Esta temporada possui ${epCount} episódio(s). Todos serão excluídos.`, () => {
      const updatedSeasons = seasons.filter(s => s.id !== seasonId);
      setSeasons(updatedSeasons); store.setSeasons(updatedSeasons);
      const updatedEps = episodes.filter(e => e.seasonId !== seasonId);
      setEpisodes(updatedEps); store.setEpisodes(updatedEps);
      if (selected) {
        const updatedSeries = seriesList.map(s => s.id === selected.id ? { ...s, seasonsCount: s.seasonsCount - 1, episodesCount: s.episodesCount - epCount } : s);
        setSeriesList(updatedSeries); store.setSeries(updatedSeries);
        setSelected({ ...selected, seasonsCount: selected.seasonsCount - 1, episodesCount: selected.episodesCount - epCount });
      }
      if (selectedSeason?.id === seasonId) setSelectedSeason(null);
      audit('delete', 'season', seasonId, `${epCount} episódios removidos`);
      notify('success', 'Temporada excluída!');
    });
  };

  const handleSaveEpisode = () => {
    if (!selected || !selectedSeason) return;
    if (!epForm.name) return notify('error', 'Nome obrigatório');
    if (editingEpisode) {
      const updated = episodes.map(e => e.id === editingEpisode.id ? { ...e, ...epForm, status: epForm.url ? 'available' as const : 'draft' as const, updatedAt: today(), manualOverrides: [...e.manualOverrides, 'edited'] } : e);
      setEpisodes(updated); store.setEpisodes(updated);
      notify('success', 'Episódio atualizado!');
    } else {
      const seasonEps = episodes.filter(e => e.seasonId === selectedSeason.id);
      const newEp: Episode = {
        id: uid(), seriesId: selected.id, seasonId: selectedSeason.id, seasonNumber: selectedSeason.number,
        episodeNumber: seasonEps.length + 1, name: epForm.name, url: epForm.url, cover: epForm.cover,
        duration: epForm.duration, status: epForm.url ? 'available' : 'draft', active: true,
        manualOverrides: [], createdAt: today(), updatedAt: today()
      };
      const updated = [...episodes, newEp];
      setEpisodes(updated); store.setEpisodes(updated);
      // Update counts
      const updatedSeasons = seasons.map(s => s.id === selectedSeason.id ? { ...s, episodesCount: s.episodesCount + 1 } : s);
      setSeasons(updatedSeasons); store.setSeasons(updatedSeasons);
      const updatedSeries = seriesList.map(s => s.id === selected.id ? { ...s, episodesCount: s.episodesCount + 1 } : s);
      setSeriesList(updatedSeries); store.setSeries(updatedSeries);
      setSelectedSeason({ ...selectedSeason, episodesCount: selectedSeason.episodesCount + 1 });
      setSelected({ ...selected, episodesCount: selected.episodesCount + 1 });
      audit('create', 'episode', newEp.id, `S${selectedSeason.number}E${newEp.episodeNumber}`);
      notify('success', `Episódio ${newEp.episodeNumber} adicionado!`);
    }
    setShowEpisodeForm(false); setEditingEpisode(null); setEpForm({ name: '', url: '', duration: '', cover: '' });
  };

  const handleDeleteEpisode = (epId: string) => {
    confirm('Excluir episódio', 'Tem certeza?', () => {
      const updated = episodes.filter(e => e.id !== epId);
      setEpisodes(updated); store.setEpisodes(updated);
      if (selectedSeason) {
        const updatedSeasons = seasons.map(s => s.id === selectedSeason.id ? { ...s, episodesCount: Math.max(0, s.episodesCount - 1) } : s);
        setSeasons(updatedSeasons); store.setSeasons(updatedSeasons);
        setSelectedSeason({ ...selectedSeason, episodesCount: Math.max(0, selectedSeason.episodesCount - 1) });
      }
      if (selected) {
        const updatedSeries = seriesList.map(s => s.id === selected.id ? { ...s, episodesCount: Math.max(0, s.episodesCount - 1) } : s);
        setSeriesList(updatedSeries); store.setSeries(updatedSeries);
        setSelected({ ...selected, episodesCount: Math.max(0, selected.episodesCount - 1) });
      }
      audit('delete', 'episode', epId);
      notify('success', 'Episódio removido!');
    });
  };

  const seriesSeasons = selected ? seasons.filter(s => s.seriesId === selected.id).sort((a, b) => a.number - b.number) : [];
  const seasonEpisodes = selectedSeason ? episodes.filter(e => e.seasonId === selectedSeason.id).sort((a, b) => a.episodeNumber - b.episodeNumber) : [];

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Séries</h1><p className="text-gray-400 text-sm">{filtered.length} séries</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setSeriesForm({ name: '', originalName: '', cover: '', synopsis: '', year: '', categoryId: '', rating: '' }); }}><Plus size={16} className="inline mr-1" /> Nova Série</Button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar série..." />

      {/* Series Detail Modal */}
      <Modal open={!!selected && !selectedSeason} onClose={() => { setSelected(null); setSelectedSeason(null); }} title={selected?.name || ''} size="xl">
        {selected && (
          <div>
            <div className="flex gap-4 mb-6">
              <div className="w-32 h-48 rounded-lg bg-[#0F172A] flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                {selected.cover?.startsWith('http') ? <img src={selected.cover} alt="" className="w-full h-full object-cover" /> : selected.cover}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {selected.year && <span className="text-sm text-gray-400">{selected.year}</span>}
                  {selected.rating && <span className="text-yellow-400 text-sm flex items-center gap-1"><Star size={12} />{selected.rating}</span>}
                </div>
                {selected.genre && <div className="flex gap-1 mt-2 flex-wrap">{selected.genre.map((g, i) => <Badge key={i} variant="purple">{g}</Badge>)}</div>}
                <p className="text-gray-300 text-sm mt-3">{selected.synopsis}</p>
                <p className="text-xs text-gray-500 mt-2">{selected.seasonsCount} temporada(s) • {selected.episodesCount} episódio(s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Temporadas</h4>
              <Button size="sm" onClick={() => { setShowSeasonForm(true); setSeasonForm({ number: seriesSeasons.length + 1, name: '' }); }}><Plus size={14} className="inline mr-1" /> Temporada</Button>
            </div>
            {showSeasonForm && (
              <Card className="p-4 mb-3 bg-[#0F172A]">
                <div className="flex gap-3 items-end">
                  <Input label="Número" value={seasonForm.number} onChange={v => setSeasonForm({ ...seasonForm, number: Number(v) })} type="number" />
                  <Input label="Nome (opcional)" value={seasonForm.name} onChange={v => setSeasonForm({ ...seasonForm, name: v })} />
                  <Button onClick={handleAddSeason}>Criar</Button>
                  <Button variant="ghost" onClick={() => setShowSeasonForm(false)}>Cancelar</Button>
                </div>
              </Card>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {seriesSeasons.map(season => (
                <Card key={season.id} className="p-4 hover:border-[#3B82F6]/30 transition-all cursor-pointer" >
                  <div className="flex items-center justify-between" onClick={() => setSelectedSeason(season)}>
                    <div>
                      <h5 className="text-white font-medium">Temporada {season.number}</h5>
                      <p className="text-xs text-gray-500">{season.episodesCount} episódios</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSeason(season.id); }} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0F172A]"><Trash2 size={14} /></button>
                  </div>
                </Card>
              ))}
            </div>
            {seriesSeasons.length === 0 && <EmptyState icon={<Layers size={32} />} title="Nenhuma temporada" description="Crie a primeira temporada para adicionar episódios." />}
          </div>
        )}
      </Modal>

      {/* Season Detail Modal */}
      <Modal open={!!selectedSeason} onClose={() => setSelectedSeason(null)} title={selectedSeason ? `${selected?.name} - Temporada ${selectedSeason.number}` : ''} size="xl">
        {selectedSeason && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">{seasonEpisodes.length} episódio(s)</p>
              <Button size="sm" onClick={() => { setShowEpisodeForm(true); setEditingEpisode(null); setEpForm({ name: '', url: '', duration: '', cover: '' }); }}><Plus size={14} className="inline mr-1" /> Episódio</Button>
            </div>
            {showEpisodeForm && (
              <Card className="p-4 mb-3 bg-[#0F172A]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Nome" value={epForm.name} onChange={v => setEpForm({ ...epForm, name: v })} required />
                  <Input label="URL" value={epForm.url} onChange={v => setEpForm({ ...epForm, url: v })} placeholder="https://..." />
                  <Input label="Duração" value={epForm.duration} onChange={v => setEpForm({ ...epForm, duration: v })} placeholder="45min" />
                  <Input label="Capa (URL)" value={epForm.cover} onChange={v => setEpForm({ ...epForm, cover: v })} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleSaveEpisode}>{editingEpisode ? 'Salvar' : 'Adicionar'}</Button>
                  <Button variant="ghost" onClick={() => { setShowEpisodeForm(false); setEditingEpisode(null); }}>Cancelar</Button>
                </div>
              </Card>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {seasonEpisodes.map(ep => (
                <div key={ep.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 font-mono">E{String(ep.episodeNumber).padStart(2, '0')}</span>
                    <div>
                      <p className="text-sm text-white">{ep.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {ep.duration && <span className="text-xs text-gray-500">{ep.duration}</span>}
                        <Badge variant={ep.status === 'available' ? 'success' : ep.status === 'draft' ? 'warning' : 'default'}>{ep.status === 'available' ? 'Disponível' : ep.status === 'draft' ? 'Rascunho' : ep.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {ep.url && <button onClick={() => setPlayingEpisode(ep)} className="p-1.5 text-gray-400 hover:text-[#3B82F6] rounded hover:bg-[#0B1120]"><Play size={14} /></button>}
                    <button onClick={() => { setEditingEpisode(ep); setEpForm({ name: ep.name, url: ep.url, duration: ep.duration || '', cover: ep.cover || '' }); setShowEpisodeForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0B1120]"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteEpisode(ep.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0B1120]"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            {seasonEpisodes.length === 0 && <EmptyState icon={<PlayCircle size={32} />} title="Nenhum episódio" />}
          </div>
        )}
      </Modal>

      {/* Episode Player Modal */}
      <Modal open={!!playingEpisode} onClose={() => setPlayingEpisode(null)} title={playingEpisode ? `E${String(playingEpisode.episodeNumber).padStart(2, '0')} - ${playingEpisode.name}` : ''} size="lg">
        {playingEpisode && (
          <div>
            {playingEpisode.url ? <HlsPlayer url={playingEpisode.url} type="vod" /> : <div className="aspect-video bg-black rounded-lg flex items-center justify-center"><p className="text-gray-500">URL não disponível</p></div>}
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">Temporada:</span> {playingEpisode.seasonNumber} | <span className="text-gray-500">Episódio:</span> {playingEpisode.episodeNumber}</p>
              {playingEpisode.duration && <p><span className="text-gray-500">Duração:</span> {playingEpisode.duration}</p>}
              <p><span className="text-gray-500">Status:</span> {playingEpisode.status}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* New Series Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Série' : 'Nova Série'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" value={seriesForm.name} onChange={v => setSeriesForm({ ...seriesForm, name: v })} required />
            <Input label="Nome Original" value={seriesForm.originalName} onChange={v => setSeriesForm({ ...seriesForm, originalName: v })} />
            <Input label="Capa (URL ou emoji)" value={seriesForm.cover} onChange={v => setSeriesForm({ ...seriesForm, cover: v })} />
            <Input label="Ano" value={seriesForm.year} onChange={v => setSeriesForm({ ...seriesForm, year: v })} type="number" />
            <Input label="Avaliação (0-10)" value={seriesForm.rating} onChange={v => setSeriesForm({ ...seriesForm, rating: v })} type="number" />
            <Select label="Categoria" value={seriesForm.categoryId} onChange={v => setSeriesForm({ ...seriesForm, categoryId: v })} options={[{ value: '', label: 'Selecionar...' }, ...store.getCategories().filter(c => c.type === 'series').map(c => ({ value: c.id, label: c.name }))]} />
          </div>
          <Textarea label="Sinopse" value={seriesForm.synopsis} onChange={v => setSeriesForm({ ...seriesForm, synopsis: v })} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!seriesForm.name) return notify('error', 'Nome obrigatório');
              if (editing) {
                const updated = seriesList.map(s => s.id === editing.id ? { ...s, name: seriesForm.name, originalName: seriesForm.originalName, cover: seriesForm.cover, year: Number(seriesForm.year) || undefined, rating: Number(seriesForm.rating) || undefined, categoryId: seriesForm.categoryId || undefined, synopsis: seriesForm.synopsis, updatedAt: today() } : s);
                setSeriesList(updated); store.setSeries(updated);
                notify('success', 'Série atualizada!');
              } else {
                const newS: Series = { id: uid(), name: seriesForm.name, originalName: seriesForm.originalName, cover: seriesForm.cover || '🎬', year: Number(seriesForm.year) || undefined, rating: Number(seriesForm.rating) || undefined, categoryId: seriesForm.categoryId || undefined, synopsis: seriesForm.synopsis, seasonsCount: 0, episodesCount: 0, status: 'available', active: true, adult: false, manualOverrides: [], createdAt: today(), updatedAt: today() };
                setSeriesList([...seriesList, newS]); store.setSeries([...seriesList, newS]);
                audit('create', 'series', newS.id, seriesForm.name);
                notify('success', 'Série criada!');
              }
              setShowForm(false); setEditing(null); setSeriesForm({ name: '', originalName: '', cover: '', synopsis: '', year: '', categoryId: '', rating: '' });
            }}>{editing ? 'Salvar' : 'Criar Série'}</Button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map(serie => (
          <Card key={serie.id} className="overflow-hidden hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
            <div className="aspect-[2/3] bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden" onClick={() => { setSelected(serie); setSelectedSeason(null); }}>
              {serie.cover?.startsWith('http') ? <img src={serie.cover} alt="" className="w-full h-full object-cover" /> : serie.cover}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-white truncate">{serie.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {serie.rating && <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{serie.rating}</span>}
                <span className="text-xs text-gray-500">{serie.seasonsCount}T • {serie.episodesCount}E</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<PlayCircle size={48} />} title="Nenhuma série encontrada" />}
    </div>
  );
}

// ==================== CATEGORIES PAGE ====================
function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(store.getCategories());
  const [activeTab, setActiveTab] = useState<'live' | 'movie' | 'series'>('live');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', type: 'live' as Category['type'], adult: false });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = categories.filter(c => c.type === activeTab);

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = categories.map(c => c.id === editing.id ? { ...c, ...form, updatedAt: today() } : c);
      setCategories(updated); store.setCategories(updated);
      notify('success', 'Categoria atualizada!');
    } else {
      const newCat: Category = { id: uid(), name: form.name, type: form.type, order: filtered.length + 1, active: true, adult: form.adult, itemCount: 0, createdAt: today(), updatedAt: today() };
      const updated = [...categories, newCat];
      setCategories(updated); store.setCategories(updated);
      notify('success', 'Categoria criada!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir categoria', 'Os conteúdos não serão excluídos, apenas desvinculados.', () => {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated); store.setCategories(updated);
      notify('success', 'Categoria removida!');
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Categorias</h1><p className="text-gray-400 text-sm">Organize seus conteúdos</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', type: activeTab, adult: false }); }}><Plus size={16} className="inline mr-1" /> Nova Categoria</Button>
      </div>
      <Tabs tabs={[{ id: 'live', label: 'Canais ao Vivo', count: categories.filter(c => c.type === 'live').length }, { id: 'movie', label: 'Filmes', count: categories.filter(c => c.type === 'movie').length }, { id: 'series', label: 'Séries', count: categories.filter(c => c.type === 'series').length }]} active={activeTab} onChange={v => setActiveTab(v as any)} />
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'} size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Select label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as Category['type'] })} options={[{ value: 'live', label: 'Canais ao Vivo' }, { value: 'movie', label: 'Filmes' }, { value: 'series', label: 'Séries' }]} />
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.adult} onChange={e => setForm({ ...form, adult: e.target.checked })} className="accent-[#3B82F6]" /> Conteúdo adulto</label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(cat => (
          <Card key={cat.id} className="p-4 flex items-center justify-between hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center"><FolderTree size={18} className="text-[#3B82F6]" /></div>
              <div><h3 className="text-white font-medium text-sm">{cat.name}</h3><p className="text-xs text-gray-500">{cat.itemCount} itens</p></div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(cat); setForm({ name: cat.name, type: cat.type, adult: cat.adult }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0F172A]"><Edit size={14} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0F172A]"><Trash2 size={14} /></button>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<FolderTree size={48} />} title="Nenhuma categoria" />}
    </div>
  );
}

// ==================== BOUQUETS PAGE ====================
function BouquetsPage() {
  const [bouquets, setBouquets] = useState<Bouquet[]>(store.getBouquets());
  const [categories] = useState(store.getCategories());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bouquet | null>(null);
  const [form, setForm] = useState({ name: '', description: '', categoryIds: [] as string[] });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = bouquets.map(b => b.id === editing.id ? { ...b, ...form, updatedAt: today() } : b);
      setBouquets(updated); store.setBouquets(updated);
      notify('success', 'Bouquet atualizado!');
    } else {
      const newB: Bouquet = { id: uid(), name: form.name, description: form.description, categoryIds: form.categoryIds, channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: today(), updatedAt: today() };
      setBouquets([...bouquets, newB]); store.setBouquets([...bouquets, newB]);
      notify('success', 'Bouquet criado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir bouquet', 'Tem certeza?', () => {
      const updated = bouquets.filter(b => b.id !== id);
      setBouquets(updated); store.setBouquets(updated);
      notify('success', 'Bouquet removido!');
    });
  };

  const toggleCategory = (catId: string) => {
    setForm(f => ({ ...f, categoryIds: f.categoryIds.includes(catId) ? f.categoryIds.filter(c => c !== catId) : [...f.categoryIds, catId] }));
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Bouquets</h1><p className="text-gray-400 text-sm">Pacotes de conteúdo para clientes</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', categoryIds: [] }); }}><Plus size={16} className="inline mr-1" /> Novo Bouquet</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Bouquet' : 'Novo Bouquet'} size="lg">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Textarea label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} />
          <div>
            <label className="block text-sm text-gray-300 mb-2">Categorias incluídas</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${form.categoryIds.includes(cat.id) ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30' : 'bg-[#0F172A] border border-[#334155]'}`}>
                  <input type="checkbox" checked={form.categoryIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="accent-[#3B82F6]" />
                  <span className="text-sm text-white">{cat.name}</span>
                  <Badge variant="default">{cat.type}</Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bouquets.map(b => (
          <Card key={b.id} className="p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-white flex items-center gap-2"><Package size={16} className="text-[#8B5CF6]" />{b.name}</h3>{b.description && <p className="text-xs text-gray-500 mt-1">{b.description}</p>}</div>
              <Badge variant={b.active ? 'success' : 'default'}>{b.active ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {b.categoryIds.slice(0, 5).map(cid => { const cat = categories.find(c => c.id === cid); return cat ? <Badge key={cid} variant="purple">{cat.name}</Badge> : null; })}
              {b.categoryIds.length > 5 && <Badge variant="default">+{b.categoryIds.length - 5}</Badge>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setEditing(b); setForm({ name: b.name, description: b.description || '', categoryIds: b.categoryIds }); setShowForm(true); }}><Edit size={14} className="inline mr-1" /> Editar</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(b.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {bouquets.length === 0 && <EmptyState icon={<Package size={48} />} title="Nenhum bouquet" />}
    </div>
  );
}

// ==================== CLIENTS PAGE ====================
function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(store.getClients().filter(c => !c.isTrial));
  const [plans] = useState(store.getPlans());
  const [bouquets] = useState(store.getBouquets());
  const [resellers] = useState(store.getResellers());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [showListModal, setShowListModal] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', planId: '', bouquetId: '', maxConnections: 1, expiresAt: '', resellerId: '' });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = clients.map(c => c.id === editing.id ? { ...c, ...form, maxConnections: Number(form.maxConnections) } : c);
      setClients(updated); store.setClients(updated);
      audit('update', 'client', editing.id, form.name);
      notify('success', 'Cliente atualizado!');
    } else {
      const username = generateUsername(form.name);
      const password = generatePassword();
      const plan = plans.find(p => p.id === form.planId);
      const newClient: Client = {
        id: uid(), username, password, name: form.name, email: form.email, whatsapp: form.whatsapp,
        planId: form.planId, bouquetId: form.bouquetId, resellerId: form.resellerId || undefined,
        maxConnections: Number(form.maxConnections), activeConnections: 0, status: 'active',
        createdAt: now(), expiresAt: form.expiresAt || new Date(Date.now() + (plan?.durationDays || 30) * 86400000).toISOString().split('T')[0], isTrial: false
      };
      setClients([...clients, newClient]); store.setClients([...clients, newClient]);
      audit('create', 'client', newClient.id, form.name);
      notify('success', `Cliente criado! Usuário: ${username}`);
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir cliente', 'Esta ação não pode ser desfeita.', () => {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated); store.setClients(updated);
      audit('delete', 'client', id);
      notify('success', 'Cliente removido!');
    });
  };

  const handleRenew = (client: Client) => {
    const plan = plans.find(p => p.id === client.planId);
    const newExpires = new Date(Date.now() + (plan?.durationDays || 30) * 86400000).toISOString().split('T')[0];
    const updated = clients.map(c => c.id === client.id ? { ...c, expiresAt: newExpires, status: 'active' as const } : c);
    setClients(updated); store.setClients(updated);
    audit('renew', 'client', client.id, `Renovado até ${newExpires}`);
    notify('success', `Cliente renovado até ${newExpires}`);
  };

  const getM3UUrl = (client: Client) => `${store.getSettings().mainUrl}/get.php?username=${client.username}&password=${client.password}&type=m3u_plus`;

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); notify('success', 'Copiado!'); };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Clientes</h1><p className="text-gray-400 text-sm">{filtered.length} clientes</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', email: '', whatsapp: '', planId: plans[0]?.id || '', bouquetId: bouquets[0]?.id || '', maxConnections: 1, expiresAt: '', resellerId: '' }); }}><Plus size={16} className="inline mr-1" /> Novo Cliente</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou usuário..." /></div>
        <Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Todos status' }, { value: 'active', label: 'Ativos' }, { value: 'expired', label: 'Expirados' }, { value: 'suspended', label: 'Suspensos' }]} />
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
            <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
            <Input label="WhatsApp" value={form.whatsapp} onChange={v => setForm({ ...form, whatsapp: v })} />
            <Input label="Vencimento" value={form.expiresAt} onChange={v => setForm({ ...form, expiresAt: v })} type="date" />
            <Select label="Plano" value={form.planId} onChange={v => setForm({ ...form, planId: v })} options={plans.map(p => ({ value: p.id, label: `${p.name} - R$ ${p.price.toFixed(2)}` }))} />
            <Select label="Bouquet" value={form.bouquetId} onChange={v => setForm({ ...form, bouquetId: v })} options={bouquets.map(b => ({ value: b.id, label: b.name }))} />
            <Input label="Conexões máximas" value={form.maxConnections} onChange={v => setForm({ ...form, maxConnections: Number(v) })} type="number" />
            <Select label="Revendedor" value={form.resellerId} onChange={v => setForm({ ...form, resellerId: v })} options={[{ value: '', label: 'Nenhum' }, ...resellers.map(r => ({ value: r.id, label: r.name }))]} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!showListModal} onClose={() => setShowListModal(null)} title="Dados de Acesso" size="lg">
        {showListModal && (
          <div className="space-y-4">
            <div className="bg-[#0F172A] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Usuário:</span><span className="text-white text-sm font-mono">{showListModal.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Senha:</span><span className="text-white text-sm font-mono">{showListModal.password}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Plano:</span><span className="text-white text-sm">{plans.find(p => p.id === showListModal.planId)?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Vencimento:</span><span className="text-white text-sm">{showListModal.expiresAt}</span></div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Lista M3U:</label>
              <div className="flex gap-2">
                <input readOnly value={getM3UUrl(showListModal)} className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-xs font-mono" />
                <Button size="sm" onClick={() => copyToClipboard(getM3UUrl(showListModal))}><Copy size={14} /></Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0F172A]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Vencimento</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filtered.map(client => {
                const plan = plans.find(p => p.id === client.planId);
                return (
                  <tr key={client.id} className="hover:bg-[#0F172A]/50 transition-colors">
                    <td className="px-4 py-3"><p className="text-sm text-white font-medium">{client.name}</p><p className="text-xs text-gray-500 font-mono">{client.username}</p></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-gray-300">{plan?.name || 'N/A'}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-gray-400">{client.expiresAt}</span></td>
                    <td className="px-4 py-3"><Badge variant={client.status === 'active' ? 'success' : client.status === 'expired' ? 'danger' : client.status === 'suspended' ? 'warning' : 'default'}>{client.status === 'active' ? 'Ativo' : client.status === 'expired' ? 'Expirado' : client.status === 'suspended' ? 'Suspenso' : client.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setShowListModal(client)} className="p-1.5 text-gray-400 hover:text-[#3B82F6] rounded hover:bg-[#0F172A]" title="Dados"><Key size={14} /></button>
                        <button onClick={() => handleRenew(client)} className="p-1.5 text-gray-400 hover:text-green-400 rounded hover:bg-[#0F172A]" title="Renovar"><RefreshCw size={14} /></button>
                        <button onClick={() => { setEditing(client); setForm({ name: client.name, email: client.email || '', whatsapp: client.whatsapp || '', planId: client.planId, bouquetId: client.bouquetId, maxConnections: client.maxConnections, expiresAt: client.expiresAt, resellerId: client.resellerId || '' }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0F172A]" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(client.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0F172A]" title="Excluir"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {filtered.length === 0 && <EmptyState icon={<Users size={48} />} title="Nenhum cliente encontrado" />}
    </div>
  );
}

// ==================== TRIALS PAGE ====================
function TrialsPage() {
  const [clients, setClients] = useState<Client[]>(store.getClients().filter(c => c.isTrial));
  const [plans] = useState(store.getPlans().filter(p => p.trial));
  const [bouquets] = useState(store.getBouquets());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', duration: 24, bouquetId: bouquets[0]?.id || '', maxConnections: 1 });

  const handleCreate = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    const username = generateUsername(form.name);
    const password = generatePassword();
    const expiresAt = new Date(Date.now() + form.duration * 3600000).toISOString();
    const newClient: Client = {
      id: uid(), username, password, name: form.name, planId: plans[0]?.id || 'plan_trial',
      bouquetId: form.bouquetId, maxConnections: form.maxConnections, activeConnections: 0,
      status: 'trial', createdAt: now(), expiresAt, isTrial: true
    };
    setClients([...clients, newClient]);
    store.setClients([...store.getClients(), newClient]);
    notify('success', `Teste criado! Usuário: ${username} / Senha: ${password}`);
    setShowForm(false);
  };

  const convertToClient = (trial: Client) => {
    const allClients = store.getClients().map(c => c.id === trial.id ? { ...c, isTrial: false, status: 'active' as const, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] } : c);
    store.setClients(allClients);
    setClients(allClients.filter(c => c.isTrial));
    notify('success', 'Teste convertido em cliente!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Testes IPTV</h1><p className="text-gray-400 text-sm">{clients.length} testes ativos</p></div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} className="inline mr-1" /> Gerar Teste</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Gerar Teste IPTV" size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Select label="Duração" value={String(form.duration)} onChange={v => setForm({ ...form, duration: Number(v) })} options={[{ value: '0.5', label: '30 minutos' }, { value: '1', label: '1 hora' }, { value: '2', label: '2 horas' }, { value: '6', label: '6 horas' }, { value: '12', label: '12 horas' }, { value: '24', label: '24 horas' }]} />
          <Select label="Bouquet" value={form.bouquetId} onChange={v => setForm({ ...form, bouquetId: v })} options={bouquets.map(b => ({ value: b.id, label: b.name }))} />
          <Input label="Conexões máximas" value={form.maxConnections} onChange={v => setForm({ ...form, maxConnections: Number(v) })} type="number" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Gerar Teste</Button>
          </div>
        </div>
      </Modal>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0F172A]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Criado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Expira</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {clients.map(trial => (
              <tr key={trial.id} className="hover:bg-[#0F172A]/50">
                <td className="px-4 py-3"><p className="text-sm text-white">{trial.name}</p><p className="text-xs text-gray-500 font-mono">{trial.username}</p></td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(trial.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(trial.expiresAt).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3"><Button size="sm" onClick={() => convertToClient(trial)}>Converter</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {clients.length === 0 && <EmptyState icon={<UserCheck size={48} />} title="Nenhum teste ativo" />}
    </div>
  );
}

// ==================== RESELLERS PAGE ====================
function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>(store.getResellers());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reseller | null>(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', whatsapp: '', level: 'reseller' as Reseller['level'], credits: 0 });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name || !form.username) return notify('error', 'Preencha os campos');
    if (editing) {
      const updated = resellers.map(r => r.id === editing.id ? { ...r, ...form, credits: Number(form.credits) } : r);
      setResellers(updated); store.setResellers(updated);
      notify('success', 'Revendedor atualizado!');
    } else {
      const newRes: Reseller = { id: uid(), ...form, credits: Number(form.credits), status: 'active', createdAt: today(), totalClients: 0, totalSales: 0 };
      setResellers([...resellers, newRes]); store.setResellers([...resellers, newRes]);
      notify('success', 'Revendedor criado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir revendedor', 'Tem certeza?', () => {
      const updated = resellers.filter(r => r.id !== id);
      setResellers(updated); store.setResellers(updated);
      notify('success', 'Revendedor removido!');
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Revendedores</h1><p className="text-gray-400 text-sm">{resellers.length} revendedores</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', username: '', email: '', whatsapp: '', level: 'reseller', credits: 50 }); }}><Plus size={16} className="inline mr-1" /> Novo Revendedor</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Revendedor' : 'Novo Revendedor'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="Usuário" value={form.username} onChange={v => setForm({ ...form, username: v })} required />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
          <Input label="WhatsApp" value={form.whatsapp} onChange={v => setForm({ ...form, whatsapp: v })} />
          <Select label="Nível" value={form.level} onChange={v => setForm({ ...form, level: v as Reseller['level'] })} options={[{ value: 'master', label: 'Master' }, { value: 'reseller', label: 'Revendedor' }, { value: 'subreseller', label: 'Sub-revendedor' }]} />
          <Input label="Créditos iniciais" value={form.credits} onChange={v => setForm({ ...form, credits: Number(v) })} type="number" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resellers.map(r => (
          <Card key={r.id} className="p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-white">{r.name}</h3><p className="text-xs text-gray-500">@{r.username}</p></div>
              <Badge variant={r.level === 'master' ? 'purple' : 'info'}>{r.level}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Créditos:</span> <span className="text-green-400 font-bold">{r.credits}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Clientes:</span> <span className="text-white font-bold">{r.totalClients}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Vendas:</span> <span className="text-white font-bold">R$ {r.totalSales.toFixed(2)}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Status:</span> <span className={r.status === 'active' ? 'text-green-400' : 'text-red-400'}>{r.status === 'active' ? 'Ativo' : 'Suspenso'}</span></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setEditing(r); setForm({ name: r.name, username: r.username, email: r.email, whatsapp: r.whatsapp || '', level: r.level, credits: r.credits }); setShowForm(true); }}><Edit size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== CREDITS PAGE ====================
function CreditsPage() {
  const [resellers] = useState(store.getResellers());
  const [transactions, setTransactions] = useState<CreditTransaction[]>(store.getCreditTx());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resellerId: '', type: 'credit' as CreditTransaction['type'], amount: 0, description: '' });

  const handleSave = () => {
    if (!form.resellerId || !form.amount) return notify('error', 'Preencha os campos');
    const newTx: CreditTransaction = { id: uid(), ...form, amount: Number(form.amount), createdAt: today() };
    setTransactions([newTx, ...transactions]); store.setCreditTx([newTx, ...transactions]);
    const resellers = store.getResellers();
    const updatedResellers = resellers.map(r => {
      if (r.id === form.resellerId) {
        const delta = form.type === 'credit' ? Number(form.amount) : form.type === 'debit' ? -Number(form.amount) : 0;
        return { ...r, credits: r.credits + delta };
      }
      return r;
    });
    store.setResellers(updatedResellers);
    notify('success', 'Transação registrada!');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Créditos</h1><p className="text-gray-400 text-sm">Gerencie créditos de revendedores</p></div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} className="inline mr-1" /> Nova Transação</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resellers.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">{r.name}</h3>
              <Badge variant={r.level === 'master' ? 'purple' : 'info'}>{r.level}</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{r.credits}</p>
            <p className="text-xs text-gray-500">créditos disponíveis</p>
          </Card>
        ))}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Transação" size="sm">
        <div className="space-y-4">
          <Select label="Revendedor" value={form.resellerId} onChange={v => setForm({ ...form, resellerId: v })} options={[{ value: '', label: 'Selecionar...' }, ...resellers.map(r => ({ value: r.id, label: `${r.name} (${r.credits} créditos)` }))]} />
          <Select label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as CreditTransaction['type'] })} options={[{ value: 'credit', label: 'Créditar' }, { value: 'debit', label: 'Debitar' }, { value: 'transfer', label: 'Transferir' }]} />
          <Input label="Quantidade" value={form.amount} onChange={v => setForm({ ...form, amount: Number(v) })} type="number" />
          <Input label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Registrar</Button>
          </div>
        </div>
      </Modal>
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#1F2937]"><h3 className="text-white font-semibold">Histórico</h3></div>
        <table className="w-full">
          <thead className="bg-[#0F172A]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Data</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Revendedor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {transactions.map(tx => {
              const reseller = resellers.find(r => r.id === tx.resellerId);
              return (
                <tr key={tx.id} className="hover:bg-[#0F172A]/50">
                  <td className="px-4 py-3 text-sm text-gray-400">{tx.createdAt}</td>
                  <td className="px-4 py-3 text-sm text-white">{reseller?.name || 'N/A'}</td>
                  <td className="px-4 py-3"><Badge variant={tx.type === 'credit' ? 'success' : tx.type === 'debit' ? 'danger' : 'info'}>{tx.type === 'credit' ? 'Crédito' : tx.type === 'debit' ? 'Débito' : 'Transferência'}</Badge></td>
                  <td className={`px-4 py-3 text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'credit' ? '+' : '-'}{tx.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{tx.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ==================== PLANS PAGE ====================
function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(store.getPlans());
  const [bouquets] = useState(store.getBouquets());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: '', description: '', durationDays: 30, price: 0, creditCost: 1, maxConnections: 1, bouquetIds: [] as string[] });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = plans.map(p => p.id === editing.id ? { ...p, ...form, durationDays: Number(form.durationDays), price: Number(form.price), creditCost: Number(form.creditCost), maxConnections: Number(form.maxConnections) } : p);
      setPlans(updated); store.setPlans(updated);
      notify('success', 'Plano atualizado!');
    } else {
      const newPlan: Plan = { id: uid(), name: form.name, description: form.description, durationDays: Number(form.durationDays), price: Number(form.price), creditCost: Number(form.creditCost), maxConnections: Number(form.maxConnections), bouquetIds: form.bouquetIds, active: true, createdAt: today() };
      setPlans([...plans, newPlan]); store.setPlans([...plans, newPlan]);
      notify('success', 'Plano criado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir plano', 'Tem certeza?', () => {
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated); store.setPlans(updated);
      notify('success', 'Plano removido!');
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Planos</h1><p className="text-gray-400 text-sm">{plans.length} planos</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', durationDays: 30, price: 0, creditCost: 1, maxConnections: 1, bouquetIds: [] }); }}><Plus size={16} className="inline mr-1" /> Novo Plano</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Plano' : 'Novo Plano'} size="lg">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Textarea label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duração (dias)" value={form.durationDays} onChange={v => setForm({ ...form, durationDays: Number(v) })} type="number" />
            <Input label="Preço (R$)" value={form.price} onChange={v => setForm({ ...form, price: Number(v) })} type="number" />
            <Input label="Custo em créditos" value={form.creditCost} onChange={v => setForm({ ...form, creditCost: Number(v) })} type="number" />
            <Input label="Conexões máximas" value={form.maxConnections} onChange={v => setForm({ ...form, maxConnections: Number(v) })} type="number" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Bouquets incluídos</label>
            <div className="flex flex-wrap gap-2">
              {bouquets.map(b => (
                <label key={b.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm ${form.bouquetIds.includes(b.id) ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white' : 'bg-[#0F172A] border border-[#334155] text-gray-400'}`}>
                  <input type="checkbox" checked={form.bouquetIds.includes(b.id)} onChange={() => setForm(f => ({ ...f, bouquetIds: f.bouquetIds.includes(b.id) ? f.bouquetIds.filter(x => x !== b.id) : [...f.bouquetIds, b.id] }))} className="accent-[#3B82F6]" />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.id} className="p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-white">{plan.name}</h3>{plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}</div>
              {plan.trial && <Badge variant="warning">Teste</Badge>}
            </div>
            <div className="text-3xl font-bold text-white mb-1">R$ {plan.price.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mb-3">{plan.durationDays} dias • {plan.maxConnections} conexão(ões)</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Custo:</span> <span className="text-white">{plan.creditCost} créditos</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Bouquets:</span> <span className="text-white">{plan.bouquetIds.length}</span></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setEditing(plan); setForm({ name: plan.name, description: plan.description || '', durationDays: plan.durationDays, price: plan.price, creditCost: plan.creditCost, maxConnections: plan.maxConnections, bouquetIds: plan.bouquetIds }); setShowForm(true); }}><Edit size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== SERVERS PAGE ====================
function ServersPage() {
  const [servers, setServers] = useState<Server[]>(store.getServers());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Server | null>(null);
  const [form, setForm] = useState({ name: '', host: '', port: 8080, protocol: 'https' as Server['protocol'], maxConnections: 5000 });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name || !form.host) return notify('error', 'Preencha os campos');
    if (editing) {
      const updated = servers.map(s => s.id === editing.id ? { ...s, ...form, port: Number(form.port), maxConnections: Number(form.maxConnections) } : s);
      setServers(updated); store.setServers(updated);
      notify('success', 'Servidor atualizado!');
    } else {
      const newSrv: Server = { id: uid(), name: form.name, host: form.host, port: Number(form.port), protocol: form.protocol, status: 'unknown', maxConnections: Number(form.maxConnections), activeConnections: 0, createdAt: today() };
      setServers([...servers, newSrv]); store.setServers([...servers, newSrv]);
      notify('success', 'Servidor adicionado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir servidor', 'Tem certeza?', () => {
      const updated = servers.filter(s => s.id !== id);
      setServers(updated); store.setServers(updated);
      notify('success', 'Servidor removido!');
    });
  };

  const handleCheck = (id: string) => {
    const updated = servers.map(s => s.id === id ? { ...s, status: 'online' as const, lastCheckAt: now(), cpu: Math.floor(Math.random() * 60) + 20, memory: Math.floor(Math.random() * 40) + 30, disk: Math.floor(Math.random() * 30) + 20, latency: Math.floor(Math.random() * 30) + 5 } : s);
    setServers(updated); store.setServers(updated);
    notify('success', 'Verificação concluída!');
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Servidores</h1><p className="text-gray-400 text-sm">{servers.length} servidores</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', host: '', port: 8080, protocol: 'https', maxConnections: 5000 }); }}><Plus size={16} className="inline mr-1" /> Novo Servidor</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Servidor' : 'Novo Servidor'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="Host/IP" value={form.host} onChange={v => setForm({ ...form, host: v })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Porta" value={form.port} onChange={v => setForm({ ...form, port: Number(v) })} type="number" />
            <Select label="Protocolo" value={form.protocol} onChange={v => setForm({ ...form, protocol: v as Server['protocol'] })} options={[{ value: 'http', label: 'HTTP' }, { value: 'https', label: 'HTTPS' }, { value: 'rtmp', label: 'RTMP' }]} />
          </div>
          <Input label="Conexões máximas" value={form.maxConnections} onChange={v => setForm({ ...form, maxConnections: Number(v) })} type="number" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map(srv => (
          <Card key={srv.id} className="p-5 hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${srv.status === 'online' ? 'bg-green-500' : srv.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                <h3 className="font-semibold text-white">{srv.name}</h3>
              </div>
              <Badge variant={srv.status === 'online' ? 'success' : srv.status === 'offline' ? 'danger' : 'default'}>{srv.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 mb-3">{srv.host}:{srv.port} • {srv.protocol.toUpperCase()}</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><p className="text-gray-500">Conexões</p><p className="text-white font-bold">{srv.activeConnections}/{srv.maxConnections}</p></div>
              <div className="bg-[#0F172A] rounded p-2"><p className="text-gray-500">Latência</p><p className="text-white font-bold">{srv.latency ? `${srv.latency}ms` : 'N/A'}</p></div>
              <div className="bg-[#0F172A] rounded p-2"><p className="text-gray-500">CPU</p><p className="text-white font-bold">{srv.cpu !== undefined ? `${srv.cpu}%` : 'N/A'}</p></div>
              <div className="bg-[#0F172A] rounded p-2"><p className="text-gray-500">RAM</p><p className="text-white font-bold">{srv.memory !== undefined ? `${srv.memory}%` : 'N/A'}</p></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleCheck(srv.id)}><RefreshCw size={14} className="inline mr-1" /> Verificar</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(srv.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== CONNECTIONS PAGE ====================
function ConnectionsPage() {
  const [connections, setConnections] = useState<ActiveConnection[]>(store.getConnections());
  const [search, setSearch] = useState('');
  const filtered = connections.filter(c => c.clientName.toLowerCase().includes(search.toLowerCase()) || c.streamName.toLowerCase().includes(search.toLowerCase()) || c.ip.includes(search));
  const handleKill = (id: string) => { const updated = connections.filter(c => c.id !== id); setConnections(updated); store.setConnections(updated); notify('success', 'Conexão encerrada!'); };
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Conexões Ativas</h1><p className="text-gray-400 text-sm">{filtered.length} conexões</p></div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0F172A]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Stream</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">IP</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Dispositivo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {filtered.map(conn => (
              <tr key={conn.id} className="hover:bg-[#0F172A]/50">
                <td className="px-4 py-3 text-sm text-white">{conn.clientName}</td>
                <td className="px-4 py-3"><p className="text-sm text-gray-300">{conn.streamName}</p><Badge variant={conn.streamType === 'live' ? 'info' : 'purple'}>{conn.streamType}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{conn.ip}</td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell">{conn.device}</td>
                <td className="px-4 py-3"><Button size="sm" variant="danger" onClick={() => handleKill(conn.id)}>Encerrar</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {filtered.length === 0 && <EmptyState icon={<Activity size={48} />} title="Nenhuma conexão ativa" />}
    </div>
  );
}

// ==================== EPG PAGE ====================
function EpgPage() {
  const [sources, setSources] = useState<EpgSource[]>(store.getEpgSources());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });
  const handleSave = () => {
    if (!form.name || !form.url) return notify('error', 'Preencha os campos');
    const newSrc: EpgSource = { id: uid(), name: form.name, url: form.url, status: 'active', lastImportAt: now(), channelsCount: 150, programsCount: 4500 };
    setSources([...sources, newSrc]); store.setEpgSources([...sources, newSrc]);
    notify('success', 'Fonte EPG adicionada!');
    setShowForm(false); setForm({ name: '', url: '' });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">EPG</h1><p className="text-gray-400 text-sm">Fontes XMLTV</p></div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} className="inline mr-1" /> Nova Fonte</Button>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Fonte EPG" size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="URL XMLTV" value={form.url} onChange={v => setForm({ ...form, url: v })} required />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Adicionar</Button>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(src => (
          <Card key={src.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-white flex items-center gap-2"><Calendar size={16} className="text-[#3B82F6]" />{src.name}</h3><p className="text-xs text-gray-500 truncate mt-1">{src.url}</p></div>
              <Badge variant={src.status === 'active' ? 'success' : 'danger'}>{src.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Canais:</span> <span className="text-white font-bold">{src.channelsCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Programas:</span> <span className="text-white font-bold">{src.programsCount}</span></div>
            </div>
            <Button size="sm"><RefreshCw size={14} className="inline mr-1" /> Atualizar</Button>
          </Card>
        ))}
      </div>
      {sources.length === 0 && <EmptyState icon={<Calendar size={48} />} title="Nenhuma fonte EPG" />}
    </div>
  );
}

// ==================== TOOLS PAGE ====================
function ToolsPage() {
  const [normalizerInput, setNormalizerInput] = useState('');
  const [normalizerOutput, setNormalizerOutput] = useState<{ before: string; after: string }[]>([]);
  const channels = store.getChannels();
  const movies = store.getMovies();
  const duplicates = detectDuplicates(channels.map(c => ({ id: c.id, name: c.name, url: c.url })));

  const handleNormalize = () => {
    const lines = normalizerInput.split('\n').filter(l => l.trim());
    setNormalizerOutput(normalizePreview(lines));
  };

  const handleClearCache = () => { notify('success', 'Cache limpo!'); audit('clear_cache', 'system'); };
  const handleBackup = () => {
    const data = JSON.stringify({ channels: store.getChannels(), movies: store.getMovies(), series: store.getSeries(), clients: store.getClients(), categories: store.getCategories() });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup_${today()}.json`; a.click();
    notify('success', 'Backup exportado!');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Ferramentas</h1><p className="text-gray-400 text-sm">Utilitários administrativos</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3"><AlertTriangle size={20} className="text-yellow-400" /></div>
          <h3 className="text-white font-medium">Duplicados</h3>
          <p className="text-xs text-gray-500 mt-1">{duplicates.length} encontrados</p>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3"><Database size={20} className="text-purple-400" /></div>
          <h3 className="text-white font-medium">Limpar Cache</h3>
          <Button size="sm" className="mt-3" onClick={handleClearCache}>Executar</Button>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3"><HardDrive size={20} className="text-green-400" /></div>
          <h3 className="text-white font-medium">Backup</h3>
          <Button size="sm" className="mt-3" onClick={handleBackup}>Exportar</Button>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3"><FileText size={20} className="text-blue-400" /></div>
          <h3 className="text-white font-medium">Conteúdos</h3>
          <p className="text-xs text-gray-500 mt-1">{channels.length} canais • {movies.length} filmes</p>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-[#3B82F6]" /> Normalizador de Nomes</h3>
        <p className="text-sm text-gray-400 mb-4">Cole os nomes para normalizá-los. Pré-visualização antes de aplicar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Entrada</label>
            <textarea value={normalizerInput} onChange={e => setNormalizerInput(e.target.value)} rows={8} placeholder={"BR | FILME EXEMPLO 2024 FHD DUBLADO\nSERIE.TESTE.S01E02.1080P"} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none resize-none font-mono" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Resultado (Dry-run)</label>
            <div className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 h-[200px] overflow-y-auto">
              {normalizerOutput.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1 text-xs font-mono">
                  <span className="text-red-400 line-through">{item.before}</span>
                  <ChevronRight size={12} className="text-gray-500" />
                  <span className="text-green-400">{item.after}</span>
                </div>
              ))}
              {normalizerOutput.length === 0 && <p className="text-gray-500 text-xs">Nenhum resultado ainda</p>}
            </div>
          </div>
        </div>
        <Button className="mt-3" onClick={handleNormalize}>Normalizar (Dry-run)</Button>
      </Card>
    </div>
  );
}

// ==================== LOGS PAGE ====================
function LogsPage() {
  const [logs] = useState<AuditLog[]>(store.getAuditLogs());
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Logs de Auditoria</h1><p className="text-gray-400 text-sm">{logs.length} registros</p></div>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0F172A]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Data/Hora</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ação</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Entidade</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {logs.length > 0 ? logs.map(log => (
              <tr key={log.id} className="hover:bg-[#0F172A]/50">
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-sm text-white">{log.userName}</td>
                <td className="px-4 py-3"><Badge variant="info">{log.action}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.entity}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{log.details || '-'}</td>
              </tr>
            )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum log registrado</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [form, setForm] = useState(settings);
  const [activeTab, setActiveTab] = useState('general');
  const handleSave = () => { setSettings(form); store.setSettings(form); audit('update', 'settings', undefined, 'Configurações atualizadas'); notify('success', 'Configurações salvas!'); };
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Configurações</h1><p className="text-gray-400 text-sm">Personalize seu painel</p></div>
      <Tabs tabs={[{ id: 'general', label: 'Geral' }, { id: 'appearance', label: 'Aparência' }, { id: 'integrations', label: 'Integrações' }, { id: 'system', label: 'Sistema' }]} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'general' && (
        <Card className="p-6 space-y-4">
          <Input label="Nome do Painel" value={form.panelName} onChange={v => setForm({ ...form, panelName: v })} />
          <Input label="Logotipo (emoji)" value={form.logo} onChange={v => setForm({ ...form, logo: v })} />
          <Input label="URL Principal" value={form.mainUrl} onChange={v => setForm({ ...form, mainUrl: v })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Fuso Horário" value={form.timezone} onChange={v => setForm({ ...form, timezone: v })} options={[{ value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' }, { value: 'America/Manaus', label: 'Manaus (GMT-4)' }, { value: 'UTC', label: 'UTC' }]} />
            <Select label="Idioma" value={form.language} onChange={v => setForm({ ...form, language: v })} options={[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }]} />
          </div>
        </Card>
      )}
      {activeTab === 'appearance' && (
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cor Secundária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
        </Card>
      )}
      {activeTab === 'integrations' && (
        <Card className="p-6 space-y-4">
          <Input label="TMDB API Key" value={form.tmdbApiKey || ''} onChange={v => setForm({ ...form, tmdbApiKey: v })} placeholder="Sua chave da API TMDB" />
          <p className="text-xs text-gray-500">Obtenha em <a href="https://www.themoviedb.org/settings/api" target="_blank" className="text-[#3B82F6] hover:underline">themoviedb.org</a>. A chave é armazenada apenas no navegador.</p>
          <Select label="Idioma TMDB" value={form.tmdbLanguage} onChange={v => setForm({ ...form, tmdbLanguage: v })} options={[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en-US', label: 'English (US)' }]} />
        </Card>
      )}
      {activeTab === 'system' && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Intervalo sync M3U (min)" value={form.m3uSyncInterval} onChange={v => setForm({ ...form, m3uSyncInterval: Number(v) })} type="number" />
            <Input label="Intervalo sync EPG (min)" value={form.epgSyncInterval} onChange={v => setForm({ ...form, epgSyncInterval: Number(v) })} type="number" />
            <Input label="Tamanho máx. importação (MB)" value={form.maxImportSize} onChange={v => setForm({ ...form, maxImportSize: Number(v) })} type="number" />
            <Select label="Driver de filas" value={form.queueDriver} onChange={v => setForm({ ...form, queueDriver: v as Settings['queueDriver'] })} options={[{ value: 'sync', label: 'Síncrono' }, { value: 'database', label: 'Database' }, { value: 'redis', label: 'Redis' }]} />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
            <div><p className="text-white text-sm">Cache habilitado</p><p className="text-xs text-gray-500">Melhora performance</p></div>
            <button onClick={() => setForm({ ...form, cacheEnabled: !form.cacheEnabled })} className={`w-12 h-6 rounded-full transition-colors ${form.cacheEnabled ? 'bg-[#3B82F6]' : 'bg-[#334155]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.cacheEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Visualização padrão</label>
            <div className="flex gap-3">
              <button onClick={() => setForm({ ...form, viewMode: 'grid' })} className={`px-4 py-2 rounded-lg text-sm ${form.viewMode === 'grid' ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white' : 'bg-[#0F172A] border border-[#334155] text-gray-400'}`}><Grid size={16} className="inline mr-1" /> Grade</button>
              <button onClick={() => setForm({ ...form, viewMode: 'table' })} className={`px-4 py-2 rounded-lg text-sm ${form.viewMode === 'table' ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white' : 'bg-[#0F172A] border border-[#334155] text-gray-400'}`}><TableIcon size={16} className="inline mr-1" /> Tabela</button>
            </div>
          </div>
        </Card>
      )}
      <Button onClick={handleSave}>Salvar Configurações</Button>
    </div>
  );
}
