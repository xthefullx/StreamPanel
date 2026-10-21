import { useState, useEffect, useCallback } from 'react';
import { store, parseM3U, validateM3UUrl, notify, addNotificationListener } from './store';
import { M3UList, Channel, Movie, Serie, User, Plan, Settings, Notification as Notif } from './types';
import {
  LayoutDashboard, List, Tv, Film, PlayCircle, Users, CreditCard, Settings as SettingsIcon,
  Menu, X, Search, Plus, Edit, Trash2, RefreshCw, Upload, Download, Eye, EyeOff,
  CheckCircle, AlertCircle, Info, LogOut, ChevronDown, Star, Clock, Globe,
  Monitor, Smartphone, Zap, Shield, Volume2, VolumeX, Maximize2, Minimize2, Pause
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

type Page = 'dashboard' | 'lists' | 'channels' | 'movies' | 'player' | 'users' | 'plans' | 'settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(store.getAuth());
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [settings, setSettings] = useState<Settings>(store.getSettings());

  useEffect(() => {
    const unsub = addNotificationListener((n) => {
      setNotifications(prev => [...prev, n]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(x => x.id !== n.id));
      }, 4000);
    });
    return unsub;
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => { store.setAuth(true); setIsAuthenticated(true); notify('success', 'Bem-vindo ao painel!'); }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        settings={settings}
        onLogout={() => { store.setAuth(false); setIsAuthenticated(false); }}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <TopBar settings={settings} setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        <div className="p-4 md:p-6 animate-fade-in">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'lists' && <ListsPage />}
          {currentPage === 'channels' && <ChannelsPage />}
          {currentPage === 'movies' && <MoviesPage />}
          {currentPage === 'player' && <PlayerPage />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'plans' && <PlansPage />}
          {currentPage === 'settings' && <SettingsPage settings={settings} setSettings={setSettings} />}
        </div>
      </main>
      <NotificationToast notifications={notifications} />
    </div>
  );
}

// LOGIN PAGE
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@streampanel.com');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password.length >= 6) {
      onLogin();
    } else {
      setError('Credenciais inválidas. Use email válido e senha com 6+ caracteres.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StreamPanel IPTV
          </h1>
          <p className="text-gray-400 mt-2">Painel Administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Entrar
          </button>
          <p className="text-center text-gray-500 text-xs mt-4">
            Demo: admin@streampanel.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}

// SIDEBAR
function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, settings, onLogout }: {
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  settings: Settings;
  onLogout: () => void;
}) {
  const menuItems: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'lists', icon: <List size={20} />, label: 'Listas M3U' },
    { id: 'channels', icon: <Tv size={20} />, label: 'Canais' },
    { id: 'movies', icon: <Film size={20} />, label: 'Filmes & Séries' },
    { id: 'player', icon: <PlayCircle size={20} />, label: 'Player IPTV' },
    { id: 'users', icon: <Users size={20} />, label: 'Usuários' },
    { id: 'plans', icon: <CreditCard size={20} />, label: 'Planos' },
    { id: 'settings', icon: <SettingsIcon size={20} />, label: 'Configurações' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-dark-surface border-r border-dark-border z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{settings.logo}</span>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {settings.panelName}
            </span>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1">
          <Menu size={20} />
        </button>
      </div>
      <nav className="p-2 space-y-1 mt-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-card'
            }`}
          >
            <span className={currentPage === item.id ? 'text-primary' : ''}>{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}

// TOP BAR
function TopBar({ settings, setSidebarOpen, sidebarOpen }: { settings: Settings; setSidebarOpen: (v: boolean) => void; sidebarOpen: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          {searchOpen ? (
            <div className="flex items-center bg-dark-card border border-dark-border rounded-lg px-3 py-2 animate-fade-in">
              <Search size={16} className="text-gray-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-white ml-2 text-sm w-40 md:w-64"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-dark-card">
              <Search size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-dark-card rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-300">Sistema Online</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

// DASHBOARD PAGE
function DashboardPage() {
  const lists = store.getLists();
  const channels = store.getChannels();
  const movies = store.getMovies();
  const series = store.getSeries();
  const users = store.getUsers();

  const activeLists = lists.filter(l => l.status === 'active').length;
  const expiredLists = lists.filter(l => l.status === 'expired').length;
  const totalChannels = channels.length;
  const totalMovies = movies.length;
  const totalSeries = series.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const stats = [
    { label: 'Listas M3U', value: lists.length, icon: <List size={24} />, color: 'from-blue-500 to-blue-600', change: '+2 este mês' },
    { label: 'Canais', value: totalChannels, icon: <Tv size={24} />, color: 'from-green-500 to-green-600', change: `${channels.filter(c => c.status === 'online').length} online` },
    { label: 'Filmes', value: totalMovies, icon: <Film size={24} />, color: 'from-purple-500 to-purple-600', change: 'Catálogo atualizado' },
    { label: 'Séries', value: totalSeries, icon: <PlayCircle size={24} />, color: 'from-orange-500 to-orange-600', change: `${series.reduce((a, s) => a + s.episodes, 0)} episódios` },
    { label: 'Listas Ativas', value: activeLists, icon: <CheckCircle size={24} />, color: 'from-emerald-500 to-emerald-600', change: `${expiredLists} expiradas` },
    { label: 'Usuários', value: users.length, icon: <Users size={24} />, color: 'from-pink-500 to-pink-600', change: `${activeUsers} ativos` },
  ];

  const chartData = [
    { name: 'Seg', canais: 45, filmes: 12 },
    { name: 'Ter', canais: 52, filmes: 18 },
    { name: 'Qua', canais: 38, filmes: 15 },
    { name: 'Qui', canais: 65, filmes: 22 },
    { name: 'Sex', canais: 78, filmes: 30 },
    { name: 'Sáb', canais: 95, filmes: 45 },
    { name: 'Dom', canais: 88, filmes: 40 },
  ];

  const pieData = [
    { name: 'Canais Abertos', value: 6, color: '#6366f1' },
    { name: 'Esportes', value: 4, color: '#8b5cf6' },
    { name: 'Filmes', value: 4, color: '#ec4899' },
    { name: 'Séries', value: 3, color: '#f59e0b' },
    { name: 'Documentários', value: 3, color: '#10b981' },
    { name: 'Infantil', value: 4, color: '#3b82f6' },
  ];

  const lineData = [
    { name: 'Jan', usuarios: 12 },
    { name: 'Fev', usuarios: 19 },
    { name: 'Mar', usuarios: 25 },
    { name: 'Abr', usuarios: 32 },
    { name: 'Mai', usuarios: 38 },
    { name: 'Jun', usuarios: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Visão geral do sistema IPTV</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={14} />
          <span>Última atualização: agora</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Atividade Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d6b" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid #2d2d6b', borderRadius: '8px' }} />
              <Bar dataKey="canais" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="filmes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid #2d2d6b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: item.color }}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Crescimento de Usuários</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d6b" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid #2d2d6b', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="usuarios" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// LISTS PAGE
function ListsPage() {
  const [lists, setLists] = useState<M3UList[]>(store.getLists());
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<M3UList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({ name: '', url: '', expiresAt: '' });

  const filteredLists = lists.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = () => {
    if (!formData.name || !formData.url) {
      notify('error', 'Preencha todos os campos obrigatórios');
      return;
    }
    if (!validateM3UUrl(formData.url)) {
      notify('error', 'URL inválida. Use http:// ou https://');
      return;
    }

    if (editingList) {
      const updated = lists.map(l => l.id === editingList.id ? { ...l, ...formData, updatedAt: new Date().toISOString().split('T')[0] } : l);
      setLists(updated);
      store.setLists(updated);
      notify('success', 'Lista atualizada com sucesso!');
    } else {
      const newList: M3UList = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        expiresAt: formData.expiresAt || '2025-12-31',
        channelCount: 0,
      };
      const updated = [...lists, newList];
      setLists(updated);
      store.setLists(updated);
      notify('success', 'Lista adicionada com sucesso!');
    }
    setShowForm(false);
    setEditingList(null);
    setFormData({ name: '', url: '', expiresAt: '' });
  };

  const handleDelete = (id: string) => {
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    store.setLists(updated);
    notify('success', 'Lista removida com sucesso!');
  };

  const handleEdit = (list: M3UList) => {
    setEditingList(list);
    setFormData({ name: list.name, url: list.url, expiresAt: list.expiresAt });
    setShowForm(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const channels = parseM3U(content);
      const newList: M3UList = {
        id: Date.now().toString(),
        name: file.name.replace(/\.(m3u|m3u8)$/i, ''),
        url: `local://${file.name}`,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        expiresAt: '2025-12-31',
        channelCount: channels.length,
      };
      const updated = [...lists, newList];
      setLists(updated);
      store.setLists(updated);
      
      // Also add parsed channels
      const existingChannels = store.getChannels();
      const newChannels = [...existingChannels, ...channels.map((ch, i) => ({ ...ch, id: `upload_${Date.now()}_${i}` }))];
      store.setChannels(newChannels);
      
      notify('success', `Arquivo importado! ${channels.length} canais encontrados.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Listas M3U</h1>
          <p className="text-gray-400 text-sm">Gerencie suas listas de reprodução</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-sm text-gray-300 hover:border-primary cursor-pointer transition-colors">
            <Upload size={16} />
            <span>Upload .m3u</span>
            <input type="file" accept=".m3u,.m3u8" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={() => { setShowForm(true); setEditingList(null); setFormData({ name: '', url: '', expiresAt: '' }); }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nova Lista
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-dark-card border border-dark-border rounded-lg px-3 py-2 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar lista..."
            className="bg-transparent border-none outline-none text-white ml-2 text-sm w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-primary outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="expired">Expiradas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">{editingList ? 'Editar Lista' : 'Nova Lista M3U'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
                  placeholder="Ex: Lista Premium"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">URL *</label>
                <input
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
                  placeholder="https://exemplo.com/lista.m3u"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Data de Expiração</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-dark-card border border-dark-border text-gray-300 py-2.5 rounded-lg hover:bg-dark-border transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  {editingList ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLists.map((list, i) => (
          <div key={list.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <List size={18} className="text-primary" />
                  <h3 className="font-semibold text-white truncate">{list.name}</h3>
                </div>
                <p className="text-xs text-gray-500 truncate mb-3">{list.url}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    list.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    list.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {list.status === 'active' ? 'Ativa' : list.status === 'expired' ? 'Expirada' : 'Inativa'}
                  </span>
                  <span className="text-gray-400">{list.channelCount} canais</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Expira: {list.expiresAt}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-dark-border">
              <button onClick={() => handleEdit(list)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-dark-card">
                <Edit size={14} /> Editar
              </button>
              <button onClick={() => handleDelete(list.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-dark-card">
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLists.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <List size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma lista encontrada</p>
        </div>
      )}
    </div>
  );
}

// CHANNELS PAGE
function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(store.getChannels());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const categories = ['Canais Abertos', 'Esportes', 'Filmes', 'Séries', 'Documentários', 'Infantil'];

  const filteredChannels = channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || ch.category === filterCategory;
    const matchStatus = filterStatus === 'all' || ch.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = (id: string) => {
    const updated = channels.filter(ch => ch.id !== id);
    setChannels(updated);
    store.setChannels(updated);
    notify('success', 'Canal removido!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Canais</h1>
        <p className="text-gray-400 text-sm">{filteredChannels.length} canais encontrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-dark-card border border-dark-border rounded-lg px-3 py-2 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar canal..."
            className="bg-transparent border-none outline-none text-white ml-2 text-sm w-full"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-primary outline-none"
        >
          <option value="all">Todas categorias</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-primary outline-none"
        >
          <option value="all">Todos status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredChannels.map((channel, i) => (
          <div key={channel.id} className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all duration-300 animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-dark-card flex items-center justify-center text-2xl">
                {channel.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate">{channel.name}</h3>
                <p className="text-xs text-gray-500">{channel.category} • {channel.country}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${channel.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-xs text-gray-400">Ch. {channel.number}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-2 border-t border-dark-border opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-primary hover:text-primary-light flex items-center gap-1">
                <PlayCircle size={12} /> Assistir
              </button>
              <button onClick={() => handleDelete(channel.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto">
                <Trash2 size={12} /> Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Tv size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum canal encontrado</p>
        </div>
      )}
    </div>
  );
}

// MOVIES PAGE
function MoviesPage() {
  const [movies] = useState<Movie[]>(store.getMovies());
  const [series] = useState<Serie[]>(store.getSeries());
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<(Movie | Serie) | null>(null);

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSeries = series.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Filmes & Séries</h1>
          <p className="text-gray-400 text-sm">Catálogo de conteúdos</p>
        </div>
        <div className="flex items-center bg-dark-card border border-dark-border rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="bg-transparent border-none outline-none text-white ml-2 text-sm w-40"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'movies' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-card text-gray-400 hover:text-white'}`}
        >
          <Film size={16} className="inline mr-2" />Filmes ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('series')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'series' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-card text-gray-400 hover:text-white'}`}
        >
          <PlayCircle size={16} className="inline mr-2" />Séries ({series.length})
        </button>
      </div>

      {/* Content Grid */}
      {activeTab === 'movies' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie, i) => (
            <div key={movie.id} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelectedItem(movie)}>
              <div className="aspect-[2/3] bg-gradient-to-br from-dark-card to-dark-surface flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                {movie.cover}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{movie.rating}</span>
                  <span className="text-xs text-gray-500">{movie.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSeries.map((serie, i) => (
            <div key={serie.id} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelectedItem(serie)}>
              <div className="aspect-[2/3] bg-gradient-to-br from-dark-card to-dark-surface flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                {serie.cover}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate">{serie.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{serie.rating}</span>
                  <span className="text-xs text-gray-500">{serie.seasons}T</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-24 h-36 rounded-lg bg-gradient-to-br from-dark-card to-dark-surface flex items-center justify-center text-4xl flex-shrink-0">
                {'cover' in selectedItem ? selectedItem.cover : ''}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{'title' in selectedItem ? selectedItem.title : ''}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-yellow-400 flex items-center gap-1 text-sm"><Star size={14} />{'rating' in selectedItem ? selectedItem.rating : ''}</span>
                  <span className="text-gray-400 text-sm">{'year' in selectedItem ? selectedItem.year : ''}</span>
                  {'duration' in selectedItem && <span className="text-gray-400 text-sm">{selectedItem.duration}</span>}
                  {'seasons' in selectedItem && <span className="text-gray-400 text-sm">{selectedItem.seasons} temporadas • {selectedItem.episodes} episódios</span>}
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {selectedItem.genre.map((g, i) => (
                    <span key={i} className="text-xs bg-primary/20 text-primary-light px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{selectedItem.synopsis}</p>
                <button className="mt-4 flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <PlayCircle size={16} /> Assistir Agora
                </button>
              </div>
            </div>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// PLAYER PAGE
function PlayerPage() {
  const [channels] = useState<Channel[]>(store.getChannels().filter(ch => ch.url));
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const demoStreamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Player IPTV</h1>
        <p className="text-gray-400 text-sm">Assista suas transmissões ao vivo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player */}
        <div className="lg:col-span-2">
          <div className={`glass-card rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
            <div className="aspect-video bg-black relative flex items-center justify-center">
              {selectedChannel ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedChannel.logo}</div>
                  <p className="text-white text-lg">{selectedChannel.name}</p>
                  <p className="text-gray-400 text-sm mt-1">Transmitindo ao vivo...</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-400 text-xs">AO VIVO</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <PlayCircle size={64} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">Selecione um canal para assistir</p>
                  <p className="text-gray-600 text-xs mt-1">ou teste com stream de demonstração</p>
                  <button
                    onClick={() => setSelectedChannel({ id: 'demo', name: 'Stream Demo (HLS)', logo: '📡', category: 'Demo', country: 'TEST', status: 'online', url: demoStreamUrl, number: 0 })}
                    className="mt-4 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    Testar Stream Demo
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-primary transition-colors">
                    {isPlaying ? <Pause size={20} /> : <PlayCircle size={20} />}
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary transition-colors">
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                      className="w-20 h-1 accent-primary"
                    />
                  </div>
                  <div className="flex-1"></div>
                  <span className="text-white text-xs">
                    {selectedChannel ? selectedChannel.name : 'Nenhum canal'}
                  </span>
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:text-primary transition-colors">
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          {selectedChannel && (
            <div className="glass-card rounded-xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dark-card flex items-center justify-center text-xl">
                  {selectedChannel.logo}
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedChannel.name}</h3>
                  <p className="text-gray-400 text-xs">{selectedChannel.category} • {selectedChannel.country}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-dark-card rounded-lg">
                <p className="text-xs text-gray-500 break-all">{selectedChannel.url}</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel List */}
        <div className="glass-card rounded-xl p-4 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Tv size={18} className="text-primary" /> Canais Disponíveis
          </h3>
          <div className="space-y-2">
            {channels.length > 0 ? channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => { setSelectedChannel(channel); setIsPlaying(true); }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${
                  selectedChannel?.id === channel.id
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-dark-card'
                }`}
              >
                <span className="text-xl">{channel.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{channel.name}</p>
                  <p className="text-xs text-gray-500">Ch. {channel.number}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${channel.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </button>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">Nenhum canal com URL disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// USERS PAGE
function UsersPage() {
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [plans] = useState<Plan[]>(store.getPlans());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', planId: '', expiresAt: '', maxDevices: 1,
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      notify('error', 'Preencha nome e email');
      return;
    }

    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...formData, maxDevices: Number(formData.maxDevices) } : u);
      setUsers(updated);
      store.setUsers(updated);
      notify('success', 'Usuário atualizado!');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        planId: formData.planId || '1',
        m3uListId: '1',
        expiresAt: formData.expiresAt || '2025-12-31',
        status: 'active',
        devices: 0,
        maxDevices: Number(formData.maxDevices) || 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [...users, newUser];
      setUsers(updated);
      store.setUsers(updated);
      notify('success', 'Usuário cadastrado!');
    }
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', planId: '', expiresAt: '', maxDevices: 1 });
  };

  const handleDelete = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    store.setUsers(updated);
    notify('success', 'Usuário removido!');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      planId: user.planId,
      expiresAt: user.expiresAt,
      maxDevices: user.maxDevices,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-gray-400 text-sm">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingUser(null); setFormData({ name: '', email: '', phone: '', planId: '', expiresAt: '', maxDevices: 1 }); }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="flex items-center bg-dark-card border border-dark-border rounded-lg px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="bg-transparent border-none outline-none text-white ml-2 text-sm w-full"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <div className="space-y-3">
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Nome completo *" />
              <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Email *" type="email" />
              <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Telefone" />
              <select value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })} className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none">
                <option value="">Selecionar plano</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" />
                <input type="number" value={formData.maxDevices} onChange={e => setFormData({ ...formData, maxDevices: Number(e.target.value) })} className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" placeholder="Dispositivos" min="1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-dark-card border border-dark-border text-gray-300 py-2.5 rounded-lg hover:bg-dark-border transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-card">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Expira</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredUsers.map(user => {
                const plan = plans.find(p => p.id === user.planId);
                return (
                  <tr key={user.id} className="hover:bg-dark-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-300">{plan?.name || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-400">{user.expiresAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : user.status === 'expired' ? 'Expirado' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(user)} className="text-gray-400 hover:text-primary transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PLANS PAGE
function PlansPage() {
  const [plans] = useState<Plan[]>(store.getPlans());
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [devices, setDevices] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setDevices(plan.maxDevices);
    setShowCheckout(true);
  };

  const handleConfirmCheckout = () => {
    notify('success', `Plano "${selectedPlan?.name}" contratado com sucesso! ${devices} dispositivo(s) ativado(s).`);
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planos & Assinaturas</h1>
        <p className="text-gray-400 text-sm">Escolha o melhor plano para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <div key={plan.id} className={`glass-card rounded-xl p-6 relative animate-fade-in ${plan.popular ? 'border-primary/50 ring-1 ring-primary/30' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
                Mais Popular
              </div>
            )}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">R$ {plan.price.toFixed(2)}</span>
                <span className="text-gray-400 text-sm">/{plan.duration} dias</span>
              </div>
              <div className="mt-4 space-y-2 text-left">
                {plan.features.map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleCheckout(plan)}
                className={`w-full mt-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                    : 'bg-dark-card border border-dark-border text-gray-300 hover:border-primary hover:text-white'
                }`}
              >
                Contratar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Checkout Simulado</h3>
            <p className="text-gray-400 text-sm mb-6">Confirme os detalhes da contratação</p>
            
            <div className="space-y-4">
              <div className="bg-dark-card rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Plano:</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300">Duração:</span>
                  <span className="text-white">{selectedPlan.duration} dias</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300">Dispositivos:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDevices(Math.max(1, devices - 1))} className="w-7 h-7 rounded bg-dark-border text-white flex items-center justify-center hover:bg-primary/30">-</button>
                    <span className="text-white font-bold w-8 text-center">{devices}</span>
                    <button onClick={() => setDevices(Math.min(selectedPlan.maxDevices, devices + 1))} className="w-7 h-7 rounded bg-dark-border text-white flex items-center justify-center hover:bg-primary/30">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Máximo permitido:</span>
                  <span>{selectedPlan.maxDevices} dispositivos</span>
                </div>
              </div>

              <div className="bg-dark-card rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Valor:</span>
                  <span className="text-2xl font-bold text-white">R$ {selectedPlan.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">* Pagamento simulado - sem cobrança real</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCheckout(false)} className="flex-1 bg-dark-card border border-dark-border text-gray-300 py-2.5 rounded-lg hover:bg-dark-border transition-colors">
                  Cancelar
                </button>
                <button onClick={handleConfirmCheckout} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Shield size={16} /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SETTINGS PAGE
function SettingsPage({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    setSettings(formData);
    store.setSettings(formData);
    notify('success', 'Configurações salvas com sucesso!');
  };

  const handleReset = () => {
    const defaults = { panelName: 'StreamPanel IPTV', logo: '📡', primaryColor: '#6366f1', secondaryColor: '#8b5cf6', theme: 'dark' as const, language: 'pt-BR' };
    setFormData(defaults);
    setSettings(defaults);
    store.setSettings(defaults);
    notify('info', 'Configurações restauradas para o padrão');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 text-sm">Personalize seu painel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" /> Geral
          </h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nome do Painel</label>
            <input
              value={formData.panelName}
              onChange={e => setFormData({ ...formData, panelName: e.target.value })}
              className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Logotipo (emoji)</label>
            <input
              value={formData.logo}
              onChange={e => setFormData({ ...formData, logo: e.target.value })}
              className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none text-2xl"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Idioma</label>
            <select
              value={formData.language}
              onChange={e => setFormData({ ...formData, language: e.target.value })}
              className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-primary" /> Aparência
          </h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                value={formData.primaryColor}
                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cor Secundária</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                value={formData.secondaryColor}
                onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tema</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.theme === 'dark' ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-dark-card border border-dark-border text-gray-400'}`}
              >
                🌙 Escuro
              </button>
              <button
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.theme === 'light' ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-dark-card border border-dark-border text-gray-400'}`}
              >
                ☀️ Claro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pré-visualização</h3>
        <div className="bg-dark-bg rounded-xl p-6 border border-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{formData.logo}</span>
            <span className="text-xl font-bold" style={{ background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formData.panelName}
            </span>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})` }}>
              Botão Primário
            </div>
            <div className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: formData.secondaryColor, color: formData.secondaryColor }}>
              Botão Secundário
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleReset} className="bg-dark-card border border-dark-border text-gray-300 px-6 py-2.5 rounded-lg hover:bg-dark-border transition-colors">
          Restaurar Padrão
        </button>
        <button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

// NOTIFICATION TOAST
function NotificationToast({ notifications }: { notifications: Notif[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in backdrop-blur-lg ${
            n.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
            n.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
            n.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
            'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          }`}
        >
          {n.type === 'success' && <CheckCircle size={18} />}
          {n.type === 'error' && <AlertCircle size={18} />}
          {n.type === 'info' && <Info size={18} />}
          {n.type === 'warning' && <AlertCircle size={18} />}
          <span className="text-sm font-medium">{n.message}</span>
        </div>
      ))}
    </div>
  );
}

export default App;
