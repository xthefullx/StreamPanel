import { Category, M3USource, Channel, Movie, Series, Season, Episode, Bouquet, Plan, Client, Reseller, CreditTransaction, Server, ActiveConnection, EpgSource, Settings } from './types';

export const demoCategories: Category[] = [
  { id: 'cat_1', name: 'Abertos', type: 'live', order: 1, active: true, itemCount: 8 },
  { id: 'cat_2', name: 'Esportes', type: 'live', order: 2, active: true, itemCount: 6 },
  { id: 'cat_3', name: 'Notícias', type: 'live', order: 3, active: true, itemCount: 4 },
  { id: 'cat_4', name: 'Infantil', type: 'live', order: 4, active: true, itemCount: 5 },
  { id: 'cat_5', name: 'Documentários', type: 'live', order: 5, active: true, itemCount: 3 },
  { id: 'cat_6', name: 'Filmes', type: 'live', order: 6, active: true, itemCount: 4 },
  { id: 'cat_7', name: 'Ação', type: 'movie', order: 1, active: true, itemCount: 3 },
  { id: 'cat_8', name: 'Comédia', type: 'movie', order: 2, active: true, itemCount: 2 },
  { id: 'cat_9', name: 'Drama', type: 'movie', order: 3, active: true, itemCount: 2 },
  { id: 'cat_10', name: 'Ficção Científica', type: 'movie', order: 4, active: true, itemCount: 2 },
  { id: 'cat_11', name: 'Ação', type: 'series', order: 1, active: true, itemCount: 2 },
  { id: 'cat_12', name: 'Drama', type: 'series', order: 2, active: true, itemCount: 2 },
  { id: 'cat_13', name: 'Comédia', type: 'series', order: 3, active: true, itemCount: 1 },
];

export const demoM3USources: M3USource[] = [
  {
    id: 'src_1', name: 'Lista Nacional Principal', url: 'https://iptv-org.github.io/iptv/countries/br.m3u',
    type: 'mixed', status: 'active', channelsCount: 156, moviesCount: 0, seriesCount: 0, episodesCount: 0,
    duplicatesCount: 3, errorsCount: 0, lastImportAt: '2024-12-01T10:30:00', nextImportAt: '2024-12-02T10:30:00',
    syncInterval: 1440, createdAt: '2024-01-15', updatedAt: '2024-12-01', lastImportDuration: 45
  },
  {
    id: 'src_2', name: 'Canais Esportivos HD', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    type: 'live', status: 'active', channelsCount: 89, moviesCount: 0, seriesCount: 0, episodesCount: 0,
    duplicatesCount: 1, errorsCount: 2, lastImportAt: '2024-11-28T08:15:00', nextImportAt: '2024-11-29T08:15:00',
    syncInterval: 720, createdAt: '2024-02-20', updatedAt: '2024-11-28', lastImportDuration: 28
  },
];

export const demoChannels: Channel[] = [
  { id: 'ch_1', name: 'Globo HD', tvgId: 'globo.br', logo: '📺', groupTitle: 'Abertos', categoryId: 'cat_1', url: 'https://stream.frfrcloud.com/globo_rj/index.m3u8', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 1, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_2', name: 'SBT HD', tvgId: 'sbt.br', logo: '📺', groupTitle: 'Abertos', categoryId: 'cat_1', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 2, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_3', name: 'Record TV', tvgId: 'record.br', logo: '📺', groupTitle: 'Abertos', categoryId: 'cat_1', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 3, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_4', name: 'Band HD', tvgId: 'band.br', logo: '📺', groupTitle: 'Abertos', categoryId: 'cat_1', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 4, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_5', name: 'TV Cultura', tvgId: 'cultura.br', logo: '📺', groupTitle: 'Abertos', categoryId: 'cat_1', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 5, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_6', name: 'ESPN Brasil', tvgId: 'espn.br', logo: '⚽', groupTitle: 'Esportes', categoryId: 'cat_2', url: '', sourceId: 'src_2', country: 'BR', status: 'online', active: true, order: 10, createdAt: '2024-02-20', updatedAt: '2024-11-28' },
  { id: 'ch_7', name: 'SporTV', tvgId: 'sportv.br', logo: '⚽', groupTitle: 'Esportes', categoryId: 'cat_2', url: '', sourceId: 'src_2', country: 'BR', status: 'online', active: true, order: 11, createdAt: '2024-02-20', updatedAt: '2024-11-28' },
  { id: 'ch_8', name: 'Fox Sports', tvgId: 'foxsports.br', logo: '⚽', groupTitle: 'Esportes', categoryId: 'cat_2', url: '', sourceId: 'src_2', country: 'BR', status: 'offline', active: true, order: 12, createdAt: '2024-02-20', updatedAt: '2024-11-28' },
  { id: 'ch_9', name: 'Band Sports', tvgId: 'bandsports.br', logo: '⚽', groupTitle: 'Esportes', categoryId: 'cat_2', url: '', sourceId: 'src_2', country: 'BR', status: 'online', active: true, order: 13, createdAt: '2024-02-20', updatedAt: '2024-11-28' },
  { id: 'ch_10', name: 'Cartoon Network', tvgId: 'cartoon.br', logo: '🧸', groupTitle: 'Infantil', categoryId: 'cat_4', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 20, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_11', name: 'Discovery Kids', tvgId: 'discoverykids.br', logo: '🧸', groupTitle: 'Infantil', categoryId: 'cat_4', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 21, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { id: 'ch_12', name: 'Discovery Channel', tvgId: 'discovery.br', logo: '🌍', groupTitle: 'Documentários', categoryId: 'cat_5', url: '', sourceId: 'src_1', country: 'BR', status: 'online', active: true, order: 30, createdAt: '2024-01-15', updatedAt: '2024-12-01' },
];

export const demoMovies: Movie[] = [
  { id: 'mov_1', name: 'Aventura Espacial', originalName: 'Space Adventure', synopsis: 'Uma equipe de astronautas embarca em uma missão épica para salvar a humanidade.', year: 2024, genre: ['Ficção Científica', 'Ação'], categoryId: 'cat_10', cover: '🚀', rating: 8.5, duration: '2h 15min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '12', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'mov_2', name: 'O Último Guardião', originalName: 'The Last Guardian', synopsis: 'Um guerreiro solitário deve proteger o último artefato mágico do mundo.', year: 2024, genre: ['Fantasia', 'Aventura'], categoryId: 'cat_7', cover: '🗡️', rating: 7.8, duration: '1h 58min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '14', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'mov_3', name: 'Coração de Aço', originalName: 'Heart of Steel', synopsis: 'A história real de um boxeador que superou todas as adversidades.', year: 2023, genre: ['Drama', 'Esporte'], categoryId: 'cat_9', cover: '💪', rating: 8.2, duration: '2h 05min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '12', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'mov_4', name: 'Mistério em Paris', originalName: 'Mystery in Paris', synopsis: 'Um detetive brasileiro investiga um caso intrigante na cidade luz.', year: 2024, genre: ['Suspense', 'Mistério'], categoryId: 'cat_9', cover: '🔍', rating: 7.5, duration: '1h 45min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '14', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'mov_5', name: 'O Riso Final', originalName: 'The Last Laugh', synopsis: 'Um comediante falido descobre que seu maior talento está em lugares inesperados.', year: 2024, genre: ['Comédia'], categoryId: 'cat_8', cover: '😂', rating: 7.0, duration: '1h 40min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '10', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
  { id: 'mov_6', name: 'Velocidade Máxima', originalName: 'Maximum Speed', synopsis: 'Corridas ilegais e adrenalina nas ruas de São Paulo.', year: 2024, genre: ['Ação', 'Thriller'], categoryId: 'cat_7', cover: '🏎️', rating: 7.2, duration: '1h 50min', url: '', sourceId: 'src_1', format: 'mp4', language: 'pt-BR', classification: '14', status: 'available', active: true, createdAt: '2024-03-10', updatedAt: '2024-12-05' },
];

export const demoSeries: Series[] = [
  { id: 'ser_1', name: 'Fronteira Digital', originalName: 'Digital Frontier', synopsis: 'Hackers enfrentam uma conspiração global que ameaça a segurança cibernética mundial.', year: 2024, genre: ['Thriller', 'Tech'], categoryId: 'cat_11', cover: '💻', rating: 9.0, seasonsCount: 3, episodesCount: 30, status: 'available', active: true, createdAt: '2024-04-12', updatedAt: '2024-11-20' },
  { id: 'ser_2', name: 'Sangue & Honra', originalName: 'Blood & Honor', synopsis: 'A saga de uma família do crime organizado no interior de São Paulo.', year: 2023, genre: ['Drama', 'Crime'], categoryId: 'cat_12', cover: '🩸', rating: 8.8, seasonsCount: 4, episodesCount: 48, status: 'available', active: true, createdAt: '2024-04-12', updatedAt: '2024-11-20' },
  { id: 'ser_3', name: 'Cozinha Radical', originalName: 'Radical Kitchen', synopsis: 'Chefs competem em desafios extremos nas cozinhas mais difíceis do mundo.', year: 2024, genre: ['Reality', 'Gastronomia'], categoryId: 'cat_13', cover: '👨‍🍳', rating: 7.5, seasonsCount: 5, episodesCount: 60, status: 'available', active: true, createdAt: '2024-04-12', updatedAt: '2024-11-20' },
];

export const demoSeasons: Season[] = [
  { id: 'sea_1', seriesId: 'ser_1', number: 1, name: 'Temporada 1', order: 1 },
  { id: 'sea_2', seriesId: 'ser_1', number: 2, name: 'Temporada 2', order: 2 },
  { id: 'sea_3', seriesId: 'ser_1', number: 3, name: 'Temporada 3', order: 3 },
  { id: 'sea_4', seriesId: 'ser_2', number: 1, name: 'Temporada 1', order: 1 },
  { id: 'sea_5', seriesId: 'ser_2', number: 2, name: 'Temporada 2', order: 2 },
];

export const demoEpisodes: Episode[] = [
  { id: 'ep_1', seriesId: 'ser_1', seasonId: 'sea_1', seasonNumber: 1, episodeNumber: 1, name: 'O Início', url: '', duration: '45min', order: 1, active: true, createdAt: '2024-04-12' },
  { id: 'ep_2', seriesId: 'ser_1', seasonId: 'sea_1', seasonNumber: 1, episodeNumber: 2, name: 'Conexão Perdida', url: '', duration: '48min', order: 2, active: true, createdAt: '2024-04-12' },
  { id: 'ep_3', seriesId: 'ser_1', seasonId: 'sea_1', seasonNumber: 1, episodeNumber: 3, name: 'Firewall', url: '', duration: '42min', order: 3, active: true, createdAt: '2024-04-12' },
  { id: 'ep_4', seriesId: 'ser_2', seasonId: 'sea_4', seasonNumber: 1, episodeNumber: 1, name: 'A Família', url: '', duration: '52min', order: 1, active: true, createdAt: '2024-04-12' },
  { id: 'ep_5', seriesId: 'ser_2', seasonId: 'sea_4', seasonNumber: 1, episodeNumber: 2, name: 'O Negócio', url: '', duration: '50min', order: 2, active: true, createdAt: '2024-04-12' },
];

export const demoBouquets: Bouquet[] = [
  { id: 'bouq_1', name: 'Pacote Básico', description: 'Canais abertos e notícias', categoryIds: ['cat_1', 'cat_3'], channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: '2024-01-20' },
  { id: 'bouq_2', name: 'Pacote Completo', description: 'Todos os conteúdos', categoryIds: ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5', 'cat_6', 'cat_7', 'cat_8', 'cat_9', 'cat_10', 'cat_11', 'cat_12', 'cat_13'], channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: '2024-01-20' },
  { id: 'bouq_3', name: 'Pacote Infantil', description: 'Conteúdo infantil', categoryIds: ['cat_4'], channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: '2024-02-15' },
  { id: 'bouq_4', name: 'Pacote Esportes', description: 'Canais esportivos', categoryIds: ['cat_2'], channelIds: [], movieIds: [], seriesIds: [], active: true, createdAt: '2024-03-10' },
];

export const demoPlans: Plan[] = [
  { id: 'plan_1', name: 'Mensal Básico', description: 'Plano mensal com 1 conexão', durationDays: 30, price: 19.90, creditCost: 1, maxConnections: 1, bouquetIds: ['bouq_1'], active: true },
  { id: 'plan_2', name: 'Mensal Premium', description: 'Plano mensal com 3 conexões', durationDays: 30, price: 39.90, creditCost: 2, maxConnections: 3, bouquetIds: ['bouq_2'], active: true },
  { id: 'plan_3', name: 'Trimestral', description: 'Plano trimestral com 3 conexões', durationDays: 90, price: 99.90, creditCost: 5, maxConnections: 3, bouquetIds: ['bouq_2'], active: true },
  { id: 'plan_4', name: 'Anual Família', description: 'Plano anual com 5 conexões', durationDays: 365, price: 399.90, creditCost: 15, maxConnections: 5, bouquetIds: ['bouq_2', 'bouq_3'], active: true },
  { id: 'plan_trial', name: 'Teste 24h', description: 'Teste de 24 horas', durationDays: 1, price: 0, creditCost: 0, maxConnections: 1, bouquetIds: ['bouq_2'], active: true, trial: true },
];

export const demoClients: Client[] = [
  { id: 'cli_1', username: 'joao_silva', password: 'abc123xyz', name: 'João Silva', email: 'joao@email.com', whatsapp: '(11) 99999-1234', planId: 'plan_2', bouquetId: 'bouq_2', maxConnections: 3, activeConnections: 1, status: 'active', createdAt: '2024-01-15', expiresAt: '2025-12-31', lastAccessAt: '2024-12-10T14:30:00', isTrial: false },
  { id: 'cli_2', username: 'maria_santos', password: 'def456uvw', name: 'Maria Santos', email: 'maria@email.com', whatsapp: '(21) 98888-5678', planId: 'plan_3', bouquetId: 'bouq_2', resellerId: 'res_1', maxConnections: 3, activeConnections: 0, status: 'active', createdAt: '2024-03-20', expiresAt: '2025-06-30', lastAccessAt: '2024-12-09T18:20:00', isTrial: false },
  { id: 'cli_3', username: 'pedro_oliveira', password: 'ghi789rst', name: 'Pedro Oliveira', email: 'pedro@email.com', whatsapp: '(31) 97777-9012', planId: 'plan_1', bouquetId: 'bouq_1', maxConnections: 1, activeConnections: 0, status: 'active', createdAt: '2024-06-10', expiresAt: '2025-03-15', lastAccessAt: '2024-12-08T10:15:00', isTrial: false },
  { id: 'cli_4', username: 'ana_costa', password: 'jkl012opq', name: 'Ana Costa', email: 'ana@email.com', whatsapp: '(41) 96666-3456', planId: 'plan_2', bouquetId: 'bouq_2', maxConnections: 3, activeConnections: 0, status: 'expired', createdAt: '2024-02-28', expiresAt: '2024-11-30', lastAccessAt: '2024-11-29T22:45:00', isTrial: false },
  { id: 'cli_5', username: 'carlos_mendes', password: 'mno345lmn', name: 'Carlos Mendes', email: 'carlos@email.com', whatsapp: '(51) 95555-7890', planId: 'plan_4', bouquetId: 'bouq_2', resellerId: 'res_2', maxConnections: 5, activeConnections: 2, status: 'active', createdAt: '2024-04-15', expiresAt: '2025-09-20', lastAccessAt: '2024-12-10T16:00:00', isTrial: false },
  { id: 'cli_6', username: 'teste_user01', password: 'test98765', name: 'Usuário Teste', planId: 'plan_trial', bouquetId: 'bouq_2', maxConnections: 1, activeConnections: 0, status: 'trial', createdAt: '2024-12-10T12:00:00', expiresAt: '2024-12-11T12:00:00', isTrial: true },
];

export const demoResellers: Reseller[] = [
  { id: 'res_1', name: 'Revenda Top IPTV', username: 'topiptv', email: 'contato@topiptv.com', whatsapp: '(11) 91234-5678', level: 'master', credits: 85, status: 'active', createdAt: '2024-01-10', totalClients: 45, totalSales: 1850.00 },
  { id: 'res_2', name: 'Digital TV Revendas', username: 'digitaltv', email: 'vendas@digitaltv.com', whatsapp: '(21) 92345-6789', level: 'reseller', credits: 42, status: 'active', createdAt: '2024-03-05', totalClients: 28, totalSales: 1120.00 },
];

export const demoCreditTransactions: CreditTransaction[] = [
  { id: 'ct_1', resellerId: 'res_1', type: 'credit', amount: 100, description: 'Créditos iniciais', createdAt: '2024-01-10' },
  { id: 'ct_2', resellerId: 'res_1', type: 'debit', amount: 2, description: 'Criação de cliente - Maria Santos', relatedClientId: 'cli_2', createdAt: '2024-03-20' },
  { id: 'ct_3', resellerId: 'res_1', type: 'debit', amount: 2, description: 'Renovação de cliente', relatedClientId: 'cli_2', createdAt: '2024-06-20' },
  { id: 'ct_4', resellerId: 'res_2', type: 'credit', amount: 50, description: 'Créditos iniciais', createdAt: '2024-03-05' },
  { id: 'ct_5', resellerId: 'res_2', type: 'debit', amount: 15, description: 'Criação de cliente - Carlos Mendes', relatedClientId: 'cli_5', createdAt: '2024-04-15' },
];

export const demoServers: Server[] = [
  { id: 'srv_1', name: 'Servidor Principal SP', host: 'sp01.streampanel.com', port: 8080, protocol: 'https', status: 'online', maxConnections: 5000, activeConnections: 1245, cpu: 42, memory: 58, disk: 35, network: 280, latency: 12, lastCheckAt: '2024-12-10T16:00:00', createdAt: '2024-01-01' },
  { id: 'srv_2', name: 'Servidor RJ', host: 'rj01.streampanel.com', port: 8080, protocol: 'https', status: 'online', maxConnections: 3000, activeConnections: 892, cpu: 38, memory: 45, disk: 28, network: 180, latency: 18, lastCheckAt: '2024-12-10T16:00:00', createdAt: '2024-02-15' },
  { id: 'srv_3', name: 'Servidor Backup', host: 'backup.streampanel.com', port: 8080, protocol: 'https', status: 'online', maxConnections: 2000, activeConnections: 0, cpu: 5, memory: 12, disk: 45, latency: 8, lastCheckAt: '2024-12-10T16:00:00', createdAt: '2024-05-20' },
];

export const demoActiveConnections: ActiveConnection[] = [
  { id: 'conn_1', clientId: 'cli_1', clientName: 'João Silva', streamType: 'live', streamName: 'Globo HD', ip: '187.34.xx.xx', device: 'Smart TV Samsung', serverId: 'srv_1', startedAt: '2024-12-10T14:30:00', lastActivityAt: '2024-12-10T16:15:00', status: 'active' },
  { id: 'conn_2', clientId: 'cli_5', clientName: 'Carlos Mendes', streamType: 'live', streamName: 'ESPN Brasil', ip: '200.155.xx.xx', device: 'Android TV Box', serverId: 'srv_1', startedAt: '2024-12-10T15:00:00', lastActivityAt: '2024-12-10T16:15:00', status: 'active' },
  { id: 'conn_3', clientId: 'cli_5', clientName: 'Carlos Mendes', streamType: 'movie', streamName: 'Aventura Espacial', ip: '177.88.xx.xx', device: 'iPhone 14', serverId: 'srv_2', startedAt: '2024-12-10T15:45:00', lastActivityAt: '2024-12-10T16:15:00', status: 'active' },
];

export const demoEpgSources: EpgSource[] = [
  { id: 'epg_1', name: 'EPG Brasil', url: 'https://example.com/epg-br.xml', status: 'active', lastImportAt: '2024-12-10T06:00:00', channelsCount: 150, programsCount: 4500 },
];

export const defaultSettings: Settings = {
  panelName: 'StreamPanel IPTV',
  logo: '📡',
  favicon: '📡',
  mainUrl: 'https://painel.streampanel.com',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  theme: 'dark',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  m3uSyncInterval: 1440,
  epgSyncInterval: 360,
  maxImportSize: 100,
  cacheEnabled: true,
  queueDriver: 'database',
};
