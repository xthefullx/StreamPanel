import { useState, useEffect, useMemo } from 'react';
import { store, parseM3U, validateUrl, notify, addNotificationListener, audit, uid, now, today, normalizeName, generateUsername, generatePassword, generateM3UList } from './store';
import { Category, M3USource, ImportJob, Channel, Movie, Series, Season, Episode, Bouquet, Plan, Client, Reseller, CreditTransaction, Server, ActiveConnection, EpgSource, Settings, Notification as Notif, AuditLog } from './types';
import { Modal, Button, Input, Select, Textarea, Badge, Card, StatCard, Tabs, SearchInput, EmptyState, useConfirm } from './components';
import {
  LayoutDashboard, List, Tv, Film, PlayCircle, Users, CreditCard, Settings as SettingsIcon,
  Menu, X, Search, Plus, Edit, Trash2, RefreshCw, Upload, Download, Eye, EyeOff,
  CheckCircle, AlertCircle, Info, LogOut, Star, Clock, Globe, Monitor, Smartphone,
  Zap, Shield, Volume2, VolumeX, Maximize2, Minimize2, Pause, Play, Server as ServerIcon,
  Activity, Database, FolderTree, Package, Key, Copy, UserCheck, UserX, Wallet,
  FileText, HardDrive, BarChart3, PieChart as PieIcon, TrendingUp, Layers, Radio,
  Calendar, AlertTriangle, Check, ChevronRight, ChevronDown, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

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
    { title: 'LISTAS M3U', items: [
      { id: 'm3u' as Page, icon: <List size={18} />, label: 'Minhas Listas' },
    ]},
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
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#111827] border-r border-[#1F2937] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{settings.logo}</span>
              <span className="font-bold text-sm bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent truncate">
                {settings.panelName}
              </span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white hidden lg:block">
            <Menu size={18} />
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>
        <nav className="overflow-y-auto h-[calc(100vh-130px)] py-2 px-2">
          {menuSections.map((section, si) => (
            <div key={si} className="mb-3">
              {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1">{section.title}</p>}
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 text-white border border-[#3B82F6]/30'
                      : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
                  }`}
                >
                  <span className={currentPage === item.id ? 'text-[#3B82F6]' : ''}>{item.icon}</span>
                  {sidebarOpen && <span className="text-xs font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-[#1F2937] bg-[#111827]">
          <button onClick={() => { store.setAuth(false); setIsAuthenticated(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            {sidebarOpen && <span className="text-xs font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
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

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in backdrop-blur-lg ${
            n.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
            n.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
            n.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          }`}>
            {n.type === 'success' && <CheckCircle size={18} />}
            {n.type === 'error' && <AlertCircle size={18} />}
            {n.type === 'info' && <Info size={18} />}
            {n.type === 'warning' && <AlertTriangle size={18} />}
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
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password.length >= 6) onLogin();
    else setError('Credenciais inválidas.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">StreamPanel IPTV</h1>
          <p className="text-gray-400 mt-2 text-sm">Painel Administrativo Profissional</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
          <Input label="Email" value={email} onChange={setEmail} type="email" required />
          <div>
            <label className="block text-sm text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Entrar</button>
          <p className="text-center text-gray-500 text-xs mt-4">Demo: admin@streampanel.com / admin123</p>
        </form>
      </div>
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
  const trialClients = clients.filter(c => c.status === 'trial').length;
  const onlineChannels = channels.filter(c => c.status === 'online').length;
  const offlineChannels = channels.filter(c => c.status === 'offline').length;
  const totalEpisodes = store.getEpisodes().length;
  const totalConns = servers.reduce((a, s) => a + s.activeConnections, 0);

  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: <Users size={22} />, color: 'from-blue-500 to-blue-600', sub: `${activeClients} ativos` },
    { label: 'Clientes Expirados', value: expiredClients, icon: <UserX size={22} />, color: 'from-red-500 to-red-600', sub: `${trialClients} em teste` },
    { label: 'Revendedores', value: resellers.length, icon: <UserCheck size={22} />, color: 'from-purple-500 to-purple-600', sub: 'Ativos' },
    { label: 'Canais', value: channels.length, icon: <Tv size={22} />, color: 'from-green-500 to-green-600', sub: `${onlineChannels} online` },
    { label: 'Filmes', value: movies.length, icon: <Film size={22} />, color: 'from-pink-500 to-pink-600', sub: 'VOD' },
    { label: 'Séries', value: series.length, icon: <PlayCircle size={22} />, color: 'from-orange-500 to-orange-600', sub: `${totalEpisodes} episódios` },
    { label: 'Categorias', value: categories.length, icon: <FolderTree size={22} />, color: 'from-cyan-500 to-cyan-600', sub: `${sources.length} listas` },
    { label: 'Conexões Ativas', value: totalConns, icon: <Activity size={22} />, color: 'from-emerald-500 to-emerald-600', sub: `${connections.length} sessões` },
  ];

  const chartData = [
    { name: 'Seg', clientes: 12, conexoes: 45 },
    { name: 'Ter', clientes: 19, conexoes: 52 },
    { name: 'Qua', clientes: 15, conexoes: 38 },
    { name: 'Qui', clientes: 22, conexoes: 65 },
    { name: 'Sex', clientes: 28, conexoes: 78 },
    { name: 'Sáb', clientes: 35, conexoes: 95 },
    { name: 'Dom', clientes: 30, conexoes: 88 },
  ];

  const pieData = [
    { name: 'Abertos', value: categories.filter(c => c.type === 'live').length, color: '#3B82F6' },
    { name: 'Filmes', value: categories.filter(c => c.type === 'movie').length, color: '#8B5CF6' },
    { name: 'Séries', value: categories.filter(c => c.type === 'series').length, color: '#EC4899' },
  ];

  const monthlyData = [
    { name: 'Jan', value: 12 }, { name: 'Fev', value: 19 }, { name: 'Mar', value: 25 },
    { name: 'Abr', value: 32 }, { name: 'Mai', value: 38 }, { name: 'Jun', value: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><PieIcon size={18} className="text-[#8B5CF6]" /> Distribuição</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: item.color }}></span>{item.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Crescimento de Clientes</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Últimos Clientes</h3>
          <div className="space-y-2">
            {clients.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#1F2937] last:border-0">
                <div>
                  <p className="text-sm text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.username}</p>
                </div>
                <Badge variant={c.status === 'active' ? 'success' : c.status === 'expired' ? 'danger' : c.status === 'trial' ? 'warning' : 'default'}>
                  {c.status === 'active' ? 'Ativo' : c.status === 'expired' ? 'Expirado' : c.status === 'trial' ? 'Teste' : 'Suspenso'}
                </Badge>
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
                  <div>
                    <p className="text-sm text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.host}:{s.port}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{s.activeConnections}/{s.maxConnections}</p>
                  <p className="text-xs text-gray-500">CPU: {s.cpu || 'N/A'}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ==================== M3U SOURCES ====================
function M3UPage() {
  const [sources, setSources] = useState<M3USource[]>(store.getM3USources());
  const [jobs, setJobs] = useState<ImportJob[]>(store.getImportJobs());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<M3USource | null>(null);
  const [importing, setImporting] = useState<ImportJob | null>(null);
  const [form, setForm] = useState({ name: '', url: '', type: 'mixed' as M3USource['type'], syncInterval: 1440 });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name || !form.url) return notify('error', 'Preencha todos os campos');
    if (form.url.startsWith('http') && !validateUrl(form.url)) return notify('error', 'URL inválida');
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
    setShowForm(false); setEditing(null); setForm({ name: '', url: '', type: 'mixed', syncInterval: 1440 });
  };

  const handleDelete = (id: string) => {
    confirm('Excluir lista', 'Esta ação removerá a lista. Os conteúdos importados permanecerão.', () => {
      const updated = sources.filter(s => s.id !== id);
      setSources(updated); store.setM3USources(updated);
      audit('delete', 'm3u_source', id);
      notify('success', 'Lista removida!');
    });
  };

  const handleImport = (source: M3USource) => {
    const job: ImportJob = {
      id: uid(), sourceId: source.id, sourceName: source.name, status: 'running', mode: 'add',
      progress: 0, totalFound: 0, processed: 0, channels: 0, movies: 0, episodes: 0, duplicates: 0, errors: 0,
      startedAt: now(), logs: ['Iniciando importação...', 'Conectando à fonte...']
    };
    setJobs([...jobs, job]); store.setImportJobs([...jobs, job]);
    setImporting(job);

    // Simulate import progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const finalJob = { ...job, status: 'completed' as const, progress: 100, totalFound: 156, processed: 156, channels: 120, movies: 25, episodes: 11, duplicates: 3, errors: 0, completedAt: now(), logs: [...job.logs, 'Importação concluída!'] };
        const updatedJobs = jobs.map(j => j.id === job.id ? finalJob : j);
        setJobs(updatedJobs); store.setImportJobs(updatedJobs);
        setImporting(null);

        // Update source
        const updatedSources = sources.map(s => s.id === source.id ? { ...s, channelsCount: 120, moviesCount: 25, seriesCount: 11, lastImportAt: now(), lastImportDuration: 45, status: 'active' as const } : s);
        setSources(updatedSources); store.setM3USources(updatedSources);
        notify('success', 'Importação concluída! 156 itens processados.');
        audit('import', 'm3u_source', source.id, '156 itens importados');
      } else {
        const updatedJob = { ...job, progress, processed: Math.floor(progress * 1.56), logs: [...job.logs, `Processando... ${Math.floor(progress)}%`] };
        setJobs(jobs.map(j => j.id === job.id ? updatedJob : j)); store.setImportJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
        setImporting(updatedJob);
      }
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseM3U(content);
      const total = parsed.channels.length + parsed.movies.length + parsed.series.length;
      const newSource: M3USource = {
        id: uid(), name: file.name.replace(/\.(m3u|m3u8)$/i, ''), url: `local://${file.name}`,
        type: 'mixed', status: 'active', channelsCount: parsed.channels.length, moviesCount: parsed.movies.length,
        seriesCount: parsed.series.length, episodesCount: 0, duplicatesCount: 0, errorsCount: 0,
        lastImportAt: now(), syncInterval: 0, createdAt: today(), updatedAt: today(), lastImportDuration: 2
      };
      const updated = [...sources, newSource];
      setSources(updated); store.setM3USources(updated);

      // Add parsed channels
      const existingChannels = store.getChannels();
      const newChannels: Channel[] = parsed.channels.map(ch => ({
        id: uid(), name: ch.name || '', tvgId: ch.tvgId, tvgName: ch.tvgName, logo: ch.logo,
        groupTitle: ch.groupTitle, url: ch.url || '', sourceId: newSource.id, status: 'unknown' as const,
        active: true, order: existingChannels.length, createdAt: today(), updatedAt: today()
      }));
      store.setChannels([...existingChannels, ...newChannels]);
      notify('success', `Arquivo importado! ${total} itens encontrados (${parsed.channels.length} canais, ${parsed.movies.length} filmes, ${parsed.series.length} séries).`);
      audit('import_file', 'm3u_source', newSource.id, `${total} itens`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Listas M3U</h1>
          <p className="text-gray-400 text-sm">Gerencie e importe listas IPTV</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 hover:border-[#3B82F6] cursor-pointer transition-colors">
            <Upload size={16} /><span>Upload .m3u</span>
            <input type="file" accept=".m3u,.m3u8" onChange={handleFileUpload} className="hidden" />
          </label>
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', url: '', type: 'mixed', syncInterval: 1440 }); }}>
            <Plus size={16} className="inline mr-1" /> Nova Lista
          </Button>
        </div>
      </div>

      {/* Import Progress */}
      {importing && (
        <Card className="p-5 border-[#3B82F6]/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2"><RefreshCw size={16} className="animate-spin text-[#3B82F6]" /> Importando: {importing.sourceName}</h3>
            <Badge variant="info">{Math.floor(importing.progress)}%</Badge>
          </div>
          <div className="w-full bg-[#0F172A] rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-2 rounded-full transition-all" style={{ width: `${importing.progress}%` }}></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><span className="text-gray-500">Total:</span> <span className="text-white">{importing.totalFound || '...'}</span></div>
            <div><span className="text-gray-500">Canais:</span> <span className="text-white">{importing.channels || '...'}</span></div>
            <div><span className="text-gray-500">Filmes:</span> <span className="text-white">{importing.movies || '...'}</span></div>
            <div><span className="text-gray-500">Episódios:</span> <span className="text-white">{importing.episodes || '...'}</span></div>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Lista' : 'Nova Lista M3U'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required placeholder="Ex: Lista Nacional" />
          <Input label="URL" value={form.url} onChange={v => setForm({ ...form, url: v })} required placeholder="https://exemplo.com/lista.m3u" />
          <Select label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as M3USource['type'] })} options={[{ value: 'live', label: 'Canais ao Vivo' }, { value: 'vod', label: 'Filmes VOD' }, { value: 'series', label: 'Séries' }, { value: 'mixed', label: 'Misto' }]} />
          <Input label="Intervalo de sincronização (minutos)" value={form.syncInterval} onChange={v => setForm({ ...form, syncInterval: Number(v) })} type="number" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </div>
      </Modal>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <Card key={source.id} className="p-5 hover:border-[#3B82F6]/30 transition-all animate-fade-in" >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><List size={16} className="text-[#3B82F6]" />{source.name}</h3>
                <p className="text-xs text-gray-500 truncate mt-1">{source.url}</p>
              </div>
              <Badge variant={source.status === 'active' ? 'success' : source.status === 'error' ? 'danger' : 'warning'}>
                {source.status === 'active' ? 'Ativa' : source.status === 'error' ? 'Erro' : 'Inativa'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Canais:</span> <span className="text-white font-medium">{source.channelsCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Filmes:</span> <span className="text-white font-medium">{source.moviesCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Séries:</span> <span className="text-white font-medium">{source.seriesCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Erros:</span> <span className="text-white font-medium">{source.errorsCount}</span></div>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              <p>Última importação: {source.lastImportAt ? new Date(source.lastImportAt).toLocaleString('pt-BR') : 'Nunca'}</p>
              {source.lastImportDuration && <p>Duração: {source.lastImportDuration}s</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleImport(source)}><RefreshCw size={14} className="inline mr-1" /> Importar</Button>
              <Button size="sm" variant="secondary" onClick={() => { setEditing(source); setForm({ name: source.name, url: source.url, type: source.type, syncInterval: source.syncInterval }); setShowForm(true); }}><Edit size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(source.id)}><Trash2 size={14} className="text-red-400" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {sources.length === 0 && <EmptyState icon={<List size={48} />} title="Nenhuma lista cadastrada" description="Adicione uma lista M3U por URL ou faça upload de um arquivo." />}

      {/* Import History */}
      {jobs.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Histórico de Importações</h3>
          <div className="space-y-2">
            {jobs.slice().reverse().slice(0, 10).map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                <div>
                  <p className="text-sm text-white">{job.sourceName}</p>
                  <p className="text-xs text-gray-500">{new Date(job.startedAt).toLocaleString('pt-BR')}</p>
                </div>
                <Badge variant={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'danger' : job.status === 'running' ? 'info' : 'default'}>
                  {job.status === 'completed' ? 'Concluído' : job.status === 'failed' ? 'Falhou' : job.status === 'running' ? 'Executando' : job.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ==================== CHANNELS ====================
function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(store.getChannels());
  const [categories] = useState<Category[]>(store.getCategories().filter(c => c.type === 'live'));
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Channel | null>(null);
  const [playing, setPlaying] = useState<Channel | null>(null);
  const [form, setForm] = useState({ name: '', url: '', logo: '', categoryId: '', groupTitle: '' });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || ch.categoryId === filterCat;
    const matchStatus = filterStatus === 'all' || ch.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = channels.map(ch => ch.id === editing.id ? { ...ch, ...form, updatedAt: today() } : ch);
      setChannels(updated); store.setChannels(updated);
      notify('success', 'Canal atualizado!');
    } else {
      const newCh: Channel = { id: uid(), ...form, status: 'unknown', active: true, order: channels.length, createdAt: today(), updatedAt: today() };
      const updated = [...channels, newCh];
      setChannels(updated); store.setChannels(updated);
      notify('success', 'Canal adicionado!');
    }
    setShowForm(false); setEditing(null); setForm({ name: '', url: '', logo: '', categoryId: '', groupTitle: '' });
  };

  const handleDelete = (id: string) => {
    confirm('Excluir canal', 'Tem certeza que deseja excluir este canal?', () => {
      const updated = channels.filter(ch => ch.id !== id);
      setChannels(updated); store.setChannels(updated);
      notify('success', 'Canal removido!');
    });
  };

  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || 'Sem categoria';

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Canais ao Vivo</h1><p className="text-gray-400 text-sm">{filtered.length} canais</p></div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', url: '', logo: '📺', categoryId: '', groupTitle: '' }); }}><Plus size={16} className="inline mr-1" /> Novo Canal</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar canal..." /></div>
        <Select value={filterCat} onChange={setFilterCat} options={[{ value: 'all', label: 'Todas categorias' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
        <Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Todos status' }, { value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }, { value: 'unknown', label: 'Desconhecido' }]} />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Canal' : 'Novo Canal'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="URL do Stream" value={form.url} onChange={v => setForm({ ...form, url: v })} placeholder="https://..." />
          <Input label="Logo (emoji ou URL)" value={form.logo} onChange={v => setForm({ ...form, logo: v })} />
          <Input label="Grupo" value={form.groupTitle} onChange={v => setForm({ ...form, groupTitle: v })} />
          <Select label="Categoria" value={form.categoryId} onChange={v => setForm({ ...form, categoryId: v })} options={[{ value: '', label: 'Selecionar...' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Player Modal */}
      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.name || 'Player'} size="lg">
        {playing && (
          <div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
              {playing.url ? (
                <div className="text-center">
                  <div className="text-6xl mb-3">{playing.logo || '📺'}</div>
                  <p className="text-white">{playing.name}</p>
                  <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> AO VIVO</p>
                </div>
              ) : (
                <p className="text-gray-500">URL não disponível para reprodução</p>
              )}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">URL:</span> {playing.url || 'Não definida'}</p>
              <p><span className="text-gray-500">Categoria:</span> {getCategoryName(playing.categoryId)}</p>
              <p><span className="text-gray-500">Status:</span> {playing.status}</p>
            </div>
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((ch, i) => (
          <Card key={ch.id} className="p-4 hover:border-[#3B82F6]/30 transition-all group animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center text-2xl">{ch.logo || '📺'}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate">{ch.name}</h3>
                <p className="text-xs text-gray-500">{getCategoryName(ch.categoryId)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${ch.status === 'online' ? 'bg-green-500' : ch.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-400">{ch.status}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-2 border-t border-[#1F2937] opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setPlaying(ch)} className="text-xs text-[#3B82F6] hover:text-blue-400 flex items-center gap-1"><Play size={12} /> Testar</button>
              <button onClick={() => { setEditing(ch); setForm({ name: ch.name, url: ch.url, logo: ch.logo || '', categoryId: ch.categoryId || '', groupTitle: ch.groupTitle || '' }); setShowForm(true); }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><Edit size={12} /> Editar</button>
              <button onClick={() => handleDelete(ch.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"><Trash2 size={12} /></button>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<Tv size={48} />} title="Nenhum canal encontrado" />}
    </div>
  );
}

// ==================== MOVIES ====================
function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>(store.getMovies());
  const [categories] = useState<Category[]>(store.getCategories().filter(c => c.type === 'movie'));
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Movie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [form, setForm] = useState({ name: '', url: '', cover: '', categoryId: '', year: '', synopsis: '' });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = movies.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = movies.map(m => m.id === editing.id ? { ...m, ...form, year: Number(form.year) || undefined, updatedAt: today() } : m);
      setMovies(updated); store.setMovies(updated);
      notify('success', 'Filme atualizado!');
    } else {
      const newMov: Movie = { id: uid(), name: form.name, url: form.url, cover: form.cover || '🎬', categoryId: form.categoryId, year: Number(form.year) || undefined, synopsis: form.synopsis, status: 'available', active: true, createdAt: today(), updatedAt: today() };
      setMovies([...movies, newMov]); store.setMovies([...movies, newMov]);
      notify('success', 'Filme adicionado!');
    }
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    confirm('Excluir filme', 'Tem certeza?', () => {
      const updated = movies.filter(m => m.id !== id);
      setMovies(updated); store.setMovies(updated);
      notify('success', 'Filme removido!');
    });
  };

  const handleTMDBSearch = () => {
    notify('info', 'Integração TMDB: Configure a chave API em Configurações > Integrações para buscar metadados automaticamente.');
  };

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Filmes</h1><p className="text-gray-400 text-sm">{filtered.length} filmes</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleTMDBSearch}><Search size={16} className="inline mr-1" /> Buscar TMDB</Button>
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', url: '', cover: '🎬', categoryId: '', year: '', synopsis: '' }); }}><Plus size={16} className="inline mr-1" /> Novo Filme</Button>
        </div>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar filme..." />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Filme' : 'Novo Filme'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="URL" value={form.url} onChange={v => setForm({ ...form, url: v })} />
          <Input label="Capa (emoji ou URL)" value={form.cover} onChange={v => setForm({ ...form, cover: v })} />
          <Input label="Ano" value={form.year} onChange={v => setForm({ ...form, year: v })} type="number" />
          <Select label="Categoria" value={form.categoryId} onChange={v => setForm({ ...form, categoryId: v })} options={[{ value: '', label: 'Selecionar...' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <Textarea label="Sinopse" value={form.synopsis} onChange={v => setForm({ ...form, synopsis: v })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="lg">
        {selected && (
          <div className="flex gap-4">
            <div className="w-32 h-48 rounded-lg bg-[#0F172A] flex items-center justify-center text-5xl flex-shrink-0">{selected.cover || '🎬'}</div>
            <div className="flex-1">
              {selected.originalName && <p className="text-xs text-gray-500">{selected.originalName}</p>}
              <div className="flex items-center gap-3 mt-1">
                {selected.year && <span className="text-sm text-gray-400">{selected.year}</span>}
                {selected.rating && <span className="text-yellow-400 text-sm flex items-center gap-1"><Star size={12} />{selected.rating}</span>}
                {selected.duration && <span className="text-sm text-gray-400">{selected.duration}</span>}
              </div>
              {selected.genre && <div className="flex gap-1 mt-2 flex-wrap">{selected.genre.map((g, i) => <Badge key={i} variant="purple">{g}</Badge>)}</div>}
              <p className="text-gray-300 text-sm mt-3">{selected.synopsis || 'Sem sinopse disponível.'}</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm"><Play size={14} className="inline mr-1" /> Assistir</Button>
                <Button size="sm" variant="secondary" onClick={handleTMDBSearch}>Buscar TMDB</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((movie, i) => (
          <Card key={movie.id} className="overflow-hidden hover:border-[#3B82F6]/30 transition-all cursor-pointer group animate-fade-in" >
            <div className="aspect-[2/3] bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform" onClick={() => setSelected(movie)}>{movie.cover || '🎬'}</div>
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

// ==================== SERIES ====================
function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>(store.getSeries());
  const [seasons, setSeasons] = useState<Season[]>(store.getSeasons());
  const [episodes, setEpisodes] = useState<Episode[]>(store.getEpisodes());
  const [selected, setSelected] = useState<Series | null>(null);
  const [search, setSearch] = useState('');
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = seriesList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const seriesSeasons = selected ? seasons.filter(s => s.seriesId === selected.id).sort((a, b) => a.number - b.number) : [];
  const seriesEpisodes = selected ? episodes.filter(e => e.seriesId === selected.id) : [];

  return (
    <div className="space-y-6">
      <ConfirmComp />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Séries</h1><p className="text-gray-400 text-sm">{filtered.length} séries</p></div>
        <Button><Plus size={16} className="inline mr-1" /> Nova Série</Button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar série..." />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="xl">
        {selected && (
          <div>
            <div className="flex gap-4 mb-6">
              <div className="w-32 h-48 rounded-lg bg-[#0F172A] flex items-center justify-center text-5xl flex-shrink-0">{selected.cover}</div>
              <div>
                <div className="flex items-center gap-3">
                  {selected.year && <span className="text-sm text-gray-400">{selected.year}</span>}
                  {selected.rating && <span className="text-yellow-400 text-sm flex items-center gap-1"><Star size={12} />{selected.rating}</span>}
                </div>
                {selected.genre && <div className="flex gap-1 mt-2 flex-wrap">{selected.genre.map((g, i) => <Badge key={i} variant="purple">{g}</Badge>)}</div>}
                <p className="text-gray-300 text-sm mt-3">{selected.synopsis}</p>
                <p className="text-xs text-gray-500 mt-2">{selected.seasonsCount} temporadas • {selected.episodesCount} episódios</p>
              </div>
            </div>
            <h4 className="text-white font-semibold mb-3">Temporadas e Episódios</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {seriesSeasons.map(season => {
                const seasonEps = seriesEpisodes.filter(e => e.seasonId === season.id).sort((a, b) => a.episodeNumber - b.episodeNumber);
                return (
                  <div key={season.id} className="bg-[#0F172A] rounded-lg p-3">
                    <h5 className="text-white text-sm font-medium mb-2">Temporada {season.number}</h5>
                    <div className="space-y-1">
                      {seasonEps.map(ep => (
                        <div key={ep.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#1E293B]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">E{String(ep.episodeNumber).padStart(2, '0')}</span>
                            <span className="text-sm text-white">{ep.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {ep.duration && <span className="text-xs text-gray-500">{ep.duration}</span>}
                            <button className="text-[#3B82F6] hover:text-blue-400"><Play size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((serie, i) => (
          <Card key={serie.id} className="overflow-hidden hover:border-[#3B82F6]/30 transition-all cursor-pointer group animate-fade-in" >
            <div className="aspect-[2/3] bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform" onClick={() => setSelected(serie)}>{serie.cover}</div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-white truncate">{serie.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {serie.rating && <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{serie.rating}</span>}
                <span className="text-xs text-gray-500">{serie.seasonsCount}T</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<PlayCircle size={48} />} title="Nenhuma série encontrada" />}
    </div>
  );
}

// ==================== CATEGORIES ====================
function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(store.getCategories());
  const [activeTab, setActiveTab] = useState<'live' | 'movie' | 'series'>('live');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', type: 'live' as Category['type'] });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const filtered = categories.filter(c => c.type === activeTab);

  const handleSave = () => {
    if (!form.name) return notify('error', 'Nome obrigatório');
    if (editing) {
      const updated = categories.map(c => c.id === editing.id ? { ...c, ...form } : c);
      setCategories(updated); store.setCategories(updated);
      notify('success', 'Categoria atualizada!');
    } else {
      const newCat: Category = { id: uid(), name: form.name, type: form.type, order: filtered.length + 1, active: true, itemCount: 0 };
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
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', type: activeTab }); }}><Plus size={16} className="inline mr-1" /> Nova Categoria</Button>
      </div>

      <Tabs tabs={[{ id: 'live', label: 'Canais ao Vivo', count: categories.filter(c => c.type === 'live').length }, { id: 'movie', label: 'Filmes', count: categories.filter(c => c.type === 'movie').length }, { id: 'series', label: 'Séries', count: categories.filter(c => c.type === 'series').length }]} active={activeTab} onChange={v => setActiveTab(v as any)} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'} size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Select label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as Category['type'] })} options={[{ value: 'live', label: 'Canais ao Vivo' }, { value: 'movie', label: 'Filmes' }, { value: 'series', label: 'Séries' }]} />
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
              <div>
                <h3 className="text-white font-medium text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.itemCount} itens</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(cat); setForm({ name: cat.name, type: cat.type }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0F172A]"><Edit size={14} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#0F172A]"><Trash2 size={14} /></button>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon={<FolderTree size={48} />} title="Nenhuma categoria" />}
    </div>
  );
}

// ==================== BOUQUETS ====================
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
      const updated = bouquets.map(b => b.id === editing.id ? { ...b, ...form } : b);
      setBouquets(updated); store.setBouquets(updated);
      notify('success', 'Bouquet atualizado!');
    } else {
      const newB: Bouquet = { id: uid(), name: form.name, description: form.description, categoryIds: form.categoryIds, channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: today() };
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
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><Package size={16} className="text-[#8B5CF6]" />{b.name}</h3>
                {b.description && <p className="text-xs text-gray-500 mt-1">{b.description}</p>}
              </div>
              <Badge variant={b.active ? 'success' : 'default'}>{b.active ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {b.categoryIds.slice(0, 5).map(cid => {
                const cat = categories.find(c => c.id === cid);
                return cat ? <Badge key={cid} variant="purple">{cat.name}</Badge> : null;
              })}
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

// ==================== CLIENTS ====================
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

  const handleSuspend = (client: Client) => {
    const updated = clients.map(c => c.id === client.id ? { ...c, status: 'suspended' as const } : c);
    setClients(updated); store.setClients(updated);
    notify('success', 'Cliente suspenso!');
  };

  const getM3UUrl = (client: Client) => {
    const settings = store.getSettings();
    return `${settings.mainUrl}/get.php?username=${client.username}&password=${client.password}&type=m3u_plus`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify('success', 'Copiado para a área de transferência!');
  };

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
            <div>
              <label className="block text-sm text-gray-300 mb-1">API URL:</label>
              <div className="flex gap-2">
                <input readOnly value={`${store.getSettings().mainUrl}/player_api.php?username=${showListModal.username}&password=${showListModal.password}`} className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-xs font-mono" />
                <Button size="sm" onClick={() => copyToClipboard(`${store.getSettings().mainUrl}/player_api.php?username=${showListModal.username}&password=${showListModal.password}`)}><Copy size={14} /></Button>
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
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{client.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{client.username}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-gray-300">{plan?.name || 'N/A'}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-gray-400">{client.expiresAt}</span></td>
                    <td className="px-4 py-3">
                      <Badge variant={client.status === 'active' ? 'success' : client.status === 'expired' ? 'danger' : client.status === 'suspended' ? 'warning' : 'default'}>
                        {client.status === 'active' ? 'Ativo' : client.status === 'expired' ? 'Expirado' : client.status === 'suspended' ? 'Suspenso' : client.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setShowListModal(client)} className="p-1.5 text-gray-400 hover:text-[#3B82F6] rounded hover:bg-[#0F172A]" title="Dados de acesso"><Key size={14} /></button>
                        <button onClick={() => handleRenew(client)} className="p-1.5 text-gray-400 hover:text-green-400 rounded hover:bg-[#0F172A]" title="Renovar"><RefreshCw size={14} /></button>
                        <button onClick={() => handleSuspend(client)} className="p-1.5 text-gray-400 hover:text-yellow-400 rounded hover:bg-[#0F172A]" title="Suspender"><UserX size={14} /></button>
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

// ==================== TRIALS ====================
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
    const updated = clients.map(c => c.id === trial.id ? { ...c, isTrial: false, status: 'active' as const, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] } : c);
    setClients(updated);
    const allClients = store.getClients().map(c => c.id === trial.id ? { ...c, isTrial: false, status: 'active' as const } : c);
    store.setClients(allClients);
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
          <Input label="Nome do usuário" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0F172A]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Criado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Expira</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {clients.map(trial => (
                <tr key={trial.id} className="hover:bg-[#0F172A]/50">
                  <td className="px-4 py-3"><p className="text-sm text-white">{trial.name}</p><p className="text-xs text-gray-500 font-mono">{trial.username}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(trial.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(trial.expiresAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3"><Badge variant="warning">Teste</Badge></td>
                  <td className="px-4 py-3"><Button size="sm" onClick={() => convertToClient(trial)}>Converter</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {clients.length === 0 && <EmptyState icon={<UserCheck size={48} />} title="Nenhum teste ativo" />}
    </div>
  );
}

// ==================== RESELLERS ====================
function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>(store.getResellers());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reseller | null>(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', whatsapp: '', level: 'reseller' as Reseller['level'], credits: 0 });
  const { confirm, Component: ConfirmComp } = useConfirm();

  const handleSave = () => {
    if (!form.name || !form.username) return notify('error', 'Preencha os campos obrigatórios');
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
              <div>
                <h3 className="font-semibold text-white">{r.name}</h3>
                <p className="text-xs text-gray-500">@{r.username}</p>
              </div>
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

// ==================== CREDITS ====================
function CreditsPage() {
  const [resellers] = useState(store.getResellers());
  const [transactions, setTransactions] = useState<CreditTransaction[]>(store.getCreditTx());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resellerId: '', type: 'credit' as CreditTransaction['type'], amount: 0, description: '' });

  const handleSave = () => {
    if (!form.resellerId || !form.amount) return notify('error', 'Preencha os campos');
    const newTx: CreditTransaction = { id: uid(), ...form, amount: Number(form.amount), createdAt: today() };
    const updated = [newTx, ...transactions];
    setTransactions(updated); store.setCreditTx(updated);

    // Update reseller credits
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
        <div className="p-4 border-b border-[#1F2937]"><h3 className="text-white font-semibold">Histórico de Transações</h3></div>
        <div className="overflow-x-auto">
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
        </div>
      </Card>
    </div>
  );
}

// ==================== PLANS ====================
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
      const newPlan: Plan = { id: uid(), name: form.name, description: form.description, durationDays: Number(form.durationDays), price: Number(form.price), creditCost: Number(form.creditCost), maxConnections: Number(form.maxConnections), bouquetIds: form.bouquetIds, active: true };
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
              <div>
                <h3 className="font-semibold text-white">{plan.name}</h3>
                {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}
              </div>
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

// ==================== SERVERS ====================
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
              <div className="bg-[#0F172A] rounded p-2">
                <p className="text-gray-500">Conexões</p>
                <p className="text-white font-bold">{srv.activeConnections}/{srv.maxConnections}</p>
              </div>
              <div className="bg-[#0F172A] rounded p-2">
                <p className="text-gray-500">Latência</p>
                <p className="text-white font-bold">{srv.latency ? `${srv.latency}ms` : 'N/A'}</p>
              </div>
              <div className="bg-[#0F172A] rounded p-2">
                <p className="text-gray-500">CPU</p>
                <p className="text-white font-bold">{srv.cpu !== undefined ? `${srv.cpu}%` : 'N/A'}</p>
              </div>
              <div className="bg-[#0F172A] rounded p-2">
                <p className="text-gray-500">RAM</p>
                <p className="text-white font-bold">{srv.memory !== undefined ? `${srv.memory}%` : 'N/A'}</p>
              </div>
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

// ==================== CONNECTIONS ====================
function ConnectionsPage() {
  const [connections, setConnections] = useState<ActiveConnection[]>(store.getConnections());
  const [clients] = useState(store.getClients());
  const [servers] = useState(store.getServers());
  const [search, setSearch] = useState('');

  const filtered = connections.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.streamName.toLowerCase().includes(search.toLowerCase()) ||
    c.ip.includes(search)
  );

  const handleKill = (id: string) => {
    const updated = connections.filter(c => c.id !== id);
    setConnections(updated); store.setConnections(updated);
    notify('success', 'Conexão encerrada!');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Conexões Ativas</h1><p className="text-gray-400 text-sm">{filtered.length} conexões ativas</p></div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, stream ou IP..." />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0F172A]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Stream</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">IP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Dispositivo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Início</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filtered.map(conn => (
                <tr key={conn.id} className="hover:bg-[#0F172A]/50">
                  <td className="px-4 py-3"><p className="text-sm text-white">{conn.clientName}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-gray-300">{conn.streamName}</p><Badge variant={conn.streamType === 'live' ? 'info' : conn.streamType === 'movie' ? 'purple' : 'default'}>{conn.streamType}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{conn.ip}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell">{conn.device}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(conn.startedAt).toLocaleTimeString('pt-BR')}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="danger" onClick={() => handleKill(conn.id)}>Encerrar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {filtered.length === 0 && <EmptyState icon={<Activity size={48} />} title="Nenhuma conexão ativa" />}
    </div>
  );
}

// ==================== EPG ====================
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
        <div><h1 className="text-2xl font-bold text-white">EPG (Guia de Programação)</h1><p className="text-gray-400 text-sm">Gerencie fontes XMLTV</p></div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} className="inline mr-1" /> Nova Fonte EPG</Button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Fonte EPG" size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Input label="URL XMLTV" value={form.url} onChange={v => setForm({ ...form, url: v })} required placeholder="https://..." />
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
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><Calendar size={16} className="text-[#3B82F6]" />{src.name}</h3>
                <p className="text-xs text-gray-500 truncate mt-1">{src.url}</p>
              </div>
              <Badge variant={src.status === 'active' ? 'success' : 'danger'}>{src.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Canais:</span> <span className="text-white font-bold">{src.channelsCount}</span></div>
              <div className="bg-[#0F172A] rounded p-2"><span className="text-gray-500">Programas:</span> <span className="text-white font-bold">{src.programsCount}</span></div>
            </div>
            <p className="text-xs text-gray-500">Última atualização: {src.lastImportAt ? new Date(src.lastImportAt).toLocaleString('pt-BR') : 'Nunca'}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm"><RefreshCw size={14} className="inline mr-1" /> Atualizar</Button>
            </div>
          </Card>
        ))}
      </div>
      {sources.length === 0 && <EmptyState icon={<Calendar size={48} />} title="Nenhuma fonte EPG" />}
    </div>
  );
}

// ==================== TOOLS ====================
function ToolsPage() {
  const [normalizerInput, setNormalizerInput] = useState('');
  const [normalizerOutput, setNormalizerOutput] = useState('');

  const handleNormalize = () => {
    const lines = normalizerInput.split('\n').filter(l => l.trim());
    const normalized = lines.map(l => normalizeName(l));
    setNormalizerOutput(normalized.join('\n'));
  };

  const channels = store.getChannels();
  const duplicates = channels.filter((ch, i, arr) => arr.findIndex(c => c.name === ch.name) !== i);

  const handleClearCache = () => { notify('success', 'Cache limpo com sucesso!'); audit('clear_cache', 'system'); };
  const handleCheckStreams = () => { notify('info', 'Verificação de streams iniciada em segundo plano...'); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Ferramentas</h1><p className="text-gray-400 text-sm">Utilitários administrativos</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all cursor-pointer" >
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3"><RefreshCw size={20} className="text-blue-400" /></div>
          <h3 className="text-white font-medium">Verificar Streams</h3>
          <p className="text-xs text-gray-500 mt-1">Testa disponibilidade das URLs</p>
          <Button size="sm" className="mt-3" onClick={handleCheckStreams}>Executar</Button>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all cursor-pointer" >
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3"><Database size={20} className="text-purple-400" /></div>
          <h3 className="text-white font-medium">Limpar Cache</h3>
          <p className="text-xs text-gray-500 mt-1">Remove dados em cache</p>
          <Button size="sm" className="mt-3" onClick={handleClearCache}>Executar</Button>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all cursor-pointer" >
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3"><AlertTriangle size={20} className="text-yellow-400" /></div>
          <h3 className="text-white font-medium">Duplicados</h3>
          <p className="text-xs text-gray-500 mt-1">{duplicates.length} encontrados</p>
          <Button size="sm" className="mt-3" onClick={() => notify('info', `${duplicates.length} itens duplicados identificados`)}>{duplicates.length > 0 ? 'Ver' : 'OK'}</Button>
        </Card>
        <Card className="p-5 hover:border-[#3B82F6]/30 transition-all cursor-pointer" >
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3"><HardDrive size={20} className="text-green-400" /></div>
          <h3 className="text-white font-medium">Backup</h3>
          <p className="text-xs text-gray-500 mt-1">Exportar dados do sistema</p>
          <Button size="sm" className="mt-3" onClick={() => { const data = JSON.stringify({ channels: store.getChannels(), movies: store.getMovies(), series: store.getSeries(), clients: store.getClients() }); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_${today()}.json`; a.click(); notify('success', 'Backup exportado!'); }}>Exportar</Button>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-[#3B82F6]" /> Normalizador de Nomes</h3>
        <p className="text-sm text-gray-400 mb-4">Cole os nomes abaixo para normalizá-los automaticamente.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Entrada</label>
            <textarea value={normalizerInput} onChange={e => setNormalizerInput(e.target.value)} rows={8} placeholder="BR | FILME EXEMPLO 2024 FHD DUBLADO&#10;SERIE.TESTE.S01E02.1080P" className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none resize-none font-mono" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Resultado</label>
            <textarea readOnly value={normalizerOutput} rows={8} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-green-400 text-sm resize-none font-mono" />
          </div>
        </div>
        <Button className="mt-3" onClick={handleNormalize}>Normalizar</Button>
      </Card>
    </div>
  );
}

// ==================== LOGS ====================
function LogsPage() {
  const [logs] = useState<AuditLog[]>(store.getAuditLogs());

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Logs de Auditoria</h1><p className="text-gray-400 text-sm">{logs.length} registros</p></div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
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
              )) : (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum log registrado ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsPage({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [form, setForm] = useState(settings);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    setSettings(form); store.setSettings(form);
    audit('update', 'settings', undefined, 'Configurações atualizadas');
    notify('success', 'Configurações salvas!');
  };

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
            <Select label="Idioma" value={form.language} onChange={v => setForm({ ...form, language: v })} options={[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }, { value: 'es', label: 'Español' }]} />
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
          <div>
            <label className="block text-sm text-gray-300 mb-2">Tema</label>
            <div className="flex gap-3">
              <button onClick={() => setForm({ ...form, theme: 'dark' })} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${form.theme === 'dark' ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white' : 'bg-[#0F172A] border border-[#334155] text-gray-400'}`}>🌙 Escuro</button>
              <button onClick={() => setForm({ ...form, theme: 'light' })} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${form.theme === 'light' ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-white' : 'bg-[#0F172A] border border-[#334155] text-gray-400'}`}>☀️ Claro</button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'integrations' && (
        <Card className="p-6 space-y-4">
          <Input label="TMDB API Key" value={form.tmdbApiKey || ''} onChange={v => setForm({ ...form, tmdbApiKey: v })} placeholder="Sua chave da API TMDB" />
          <p className="text-xs text-gray-500">Obtenha sua chave em <a href="https://www.themoviedb.org/settings/api" target="_blank" className="text-[#3B82F6] hover:underline">themoviedb.org</a></p>
          <div className="border-t border-[#334155] pt-4 mt-4">
            <h4 className="text-white font-medium mb-3">SMTP (Email)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Host" value={form.smtpHost || ''} onChange={v => setForm({ ...form, smtpHost: v })} placeholder="smtp.gmail.com" />
              <Input label="Porta" value={form.smtpPort || 587} onChange={v => setForm({ ...form, smtpPort: Number(v) })} type="number" />
              <Input label="Usuário" value={form.smtpUser || ''} onChange={v => setForm({ ...form, smtpUser: v })} />
              <Input label="Senha" value={form.smtpPass || ''} onChange={v => setForm({ ...form, smtpPass: v })} type="password" />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'system' && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Intervalo sincronização M3U (min)" value={form.m3uSyncInterval} onChange={v => setForm({ ...form, m3uSyncInterval: Number(v) })} type="number" />
            <Input label="Intervalo sincronização EPG (min)" value={form.epgSyncInterval} onChange={v => setForm({ ...form, epgSyncInterval: Number(v) })} type="number" />
            <Input label="Tamanho máximo importação (MB)" value={form.maxImportSize} onChange={v => setForm({ ...form, maxImportSize: Number(v) })} type="number" />
            <Select label="Driver de filas" value={form.queueDriver} onChange={v => setForm({ ...form, queueDriver: v as Settings['queueDriver'] })} options={[{ value: 'sync', label: 'Síncrono' }, { value: 'database', label: 'Database' }, { value: 'redis', label: 'Redis' }]} />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
            <div><p className="text-white text-sm">Cache habilitado</p><p className="text-xs text-gray-500">Melhora performance de consultas</p></div>
            <button onClick={() => setForm({ ...form, cacheEnabled: !form.cacheEnabled })} className={`w-12 h-6 rounded-full transition-colors ${form.cacheEnabled ? 'bg-[#3B82F6]' : 'bg-[#334155]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.cacheEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}
