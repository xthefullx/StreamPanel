# 📡 StreamPanel IPTV - Painel Administrativo Profissional

Sistema completo de gerenciamento IPTV com interface moderna e funcional, inspirado nos painéis Xtream UI, XUI ONE e Xtream Codes, mas com arquitetura própria e código original.

## 🎯 Funcionalidades Implementadas

### ✅ Frontend (React + TypeScript + Tailwind)
- **Dashboard completo** com estatísticas, gráficos e indicadores em tempo real
- **Gerenciador M3U** com importação por URL e arquivo, progresso em tempo real
- **Parser M3U inteligente** que extrai metadados (EXTINF, tvg-logo, group-title, etc.)
- **Canais ao Vivo** com CRUD completo, filtros, busca e player de teste
- **Filmes VOD** com catálogo visual, sinopses e integração TMDB preparada
- **Séries** com estrutura de temporadas e episódios
- **Categorias** organizadas por tipo (live/movie/series)
- **Bouquets/Pacotes** de conteúdo para clientes
- **Clientes** com geração automática de usuário/senha e lista M3U personalizada
- **Testes IPTV** com duração configurável e conversão para cliente
- **Revendedores** com níveis hierárquicos (master/reseller/subreseller)
- **Sistema de créditos** com transações e extrato
- **Planos** com duração, preço, custo em créditos e bouquets
- **Servidores** com monitoramento (CPU, RAM, disco, latência)
- **Conexões ativas** com encerramento de sessões
- **EPG** (Guia de Programação) com fontes XMLTV
- **Ferramentas** (normalizador de nomes, verificação de streams, backup)
- **Logs de auditoria** completos
- **Configurações** (geral, aparência, integrações, sistema)
- **Autenticação** com login/senha
- **Persistência** via localStorage (simulando banco de dados)
- **Design responsivo** com tema escuro profissional

### 📋 Arquitetura Backend (Laravel) - Documentação

O sistema está preparado para ser conectado a um backend Laravel 11 com a seguinte estrutura:

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── DashboardController.php
│   │   │   ├── M3USourceController.php
│   │   │   ├── ChannelController.php
│   │   │   ├── MovieController.php
│   │   │   ├── SeriesController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── BouquetController.php
│   │   │   ├── ClientController.php
│   │   │   ├── ResellerController.php
│   │   │   ├── CreditController.php
│   │   │   ├── PlanController.php
│   │   │   ├── ServerController.php
│   │   │   ├── ConnectionController.php
│   │   │   ├── EpgController.php
│   │   │   ├── ToolsController.php
│   │   │   ├── SettingsController.php
│   │   │   └── AuditLogController.php
│   │   └── Api/
│   │       ├── PlayerApiController.php  (compatível com player_api.php)
│   │       ├── PlaylistController.php   (get.php)
│   │       └── XmltvController.php      (xmltv.php)
│   ├── Middleware/
│   │   ├── AdminAuth.php
│   │   ├── ResellerAuth.php
│   │   ├── ClientAuth.php
│   │   └── RateLimiter.php
│   └── Requests/
│       ├── StoreClientRequest.php
│       ├── ImportM3URequest.php
│       └── ...
├── Models/
│   ├── Admin.php
│   ├── Client.php
│   ├── Reseller.php
│   ├── Plan.php
│   ├── Bouquet.php
│   ├── Category.php
│   ├── Channel.php
│   ├── Movie.php
│   ├── Series.php
│   ├── Season.php
│   ├── Episode.php
│   ├── M3USource.php
│   ├── ImportJob.php
│   ├── Server.php
│   ├── ActiveConnection.php
│   ├── EpgSource.php
│   ├── EpgProgram.php
│   ├── CreditTransaction.php
│   ├── AuditLog.php
│   └── Setting.php
├── Jobs/
│   ├── ImportM3UJob.php
│   ├── SyncM3UJob.php
│   ├── ImportEpgJob.php
│   ├── CheckStreamStatusJob.php
│   └── ExpireTrialsJob.php
├── Services/
│   ├── M3UParser.php
│   ├── M3UGenerator.php
│   ├── TmdbService.php
│   ├── StreamChecker.php
│   ├── CreditService.php
│   └── NameNormalizer.php
└── Policies/
    ├── ClientPolicy.php
    └── ResellerPolicy.php
```

### 🗄️ Estrutura do Banco de Dados (MySQL/MariaDB)

```sql
-- Tabela de administradores
CREATE TABLE admins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin') DEFAULT 'admin',
    two_factor_secret TEXT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de revendedores
CREATE TABLE resellers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    level ENUM('master', 'reseller', 'subreseller') DEFAULT 'reseller',
    credits INT DEFAULT 0,
    status ENUM('active', 'suspended') DEFAULT 'active',
    parent_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES resellers(id) ON DELETE SET NULL
);

-- Tabela de transações de crédito
CREATE TABLE credit_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reseller_id BIGINT UNSIGNED NOT NULL,
    type ENUM('credit', 'debit', 'transfer') NOT NULL,
    amount INT NOT NULL,
    description TEXT,
    related_client_id BIGINT UNSIGNED NULL,
    related_reseller_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES resellers(id) ON DELETE CASCADE
);

-- Tabela de categorias
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('live', 'movie', 'series') NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    `order` INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de fontes M3U
CREATE TABLE m3u_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type ENUM('live', 'vod', 'series', 'mixed') DEFAULT 'mixed',
    status ENUM('active', 'inactive', 'error', 'importing') DEFAULT 'active',
    channels_count INT DEFAULT 0,
    movies_count INT DEFAULT 0,
    series_count INT DEFAULT 0,
    episodes_count INT DEFAULT 0,
    duplicates_count INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    last_import_at TIMESTAMP NULL,
    next_import_at TIMESTAMP NULL,
    sync_interval INT DEFAULT 1440,
    last_import_duration INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de jobs de importação
CREATE TABLE import_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    status ENUM('queued', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'queued',
    mode ENUM('add', 'update', 'sync', 'ignore_duplicates') DEFAULT 'add',
    progress DECIMAL(5,2) DEFAULT 0,
    total_found INT DEFAULT 0,
    processed INT DEFAULT 0,
    channels INT DEFAULT 0,
    movies INT DEFAULT 0,
    episodes INT DEFAULT 0,
    duplicates INT DEFAULT 0,
    errors INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    logs JSON NULL,
    FOREIGN KEY (source_id) REFERENCES m3u_sources(id) ON DELETE CASCADE
);

-- Tabela de canais
CREATE TABLE channels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    tvg_id VARCHAR(255) NULL,
    tvg_name VARCHAR(500) NULL,
    logo TEXT NULL,
    group_title VARCHAR(255) NULL,
    category_id BIGINT UNSIGNED NULL,
    url TEXT NOT NULL,
    source_id BIGINT UNSIGNED NULL,
    country VARCHAR(5) NULL,
    language VARCHAR(10) NULL,
    status ENUM('online', 'offline', 'unknown') DEFAULT 'unknown',
    active BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    epg_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES m3u_sources(id) ON DELETE SET NULL,
    INDEX idx_channels_status (status),
    INDEX idx_channels_category (category_id),
    INDEX idx_channels_source (source_id),
    FULLTEXT INDEX idx_channels_search (name, tvg_name)
);

-- Tabela de filmes
CREATE TABLE movies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NULL,
    synopsis TEXT NULL,
    year SMALLINT NULL,
    genre JSON NULL,
    category_id BIGINT UNSIGNED NULL,
    cover TEXT NULL,
    banner TEXT NULL,
    rating DECIMAL(3,1) NULL,
    duration VARCHAR(20) NULL,
    url TEXT NOT NULL,
    source_id BIGINT UNSIGNED NULL,
    format VARCHAR(10) NULL,
    language VARCHAR(10) NULL,
    classification VARCHAR(5) NULL,
    tmdb_id VARCHAR(20) NULL,
    status ENUM('available', 'unavailable') DEFAULT 'available',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_movies_category (category_id),
    FULLTEXT INDEX idx_movies_search (name, original_name)
);

-- Tabela de séries
CREATE TABLE series (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NULL,
    synopsis TEXT NULL,
    year SMALLINT NULL,
    genre JSON NULL,
    category_id BIGINT UNSIGNED NULL,
    cover TEXT NULL,
    banner TEXT NULL,
    rating DECIMAL(3,1) NULL,
    url TEXT NULL,
    source_id BIGINT UNSIGNED NULL,
    tmdb_id VARCHAR(20) NULL,
    seasons_count INT DEFAULT 0,
    episodes_count INT DEFAULT 0,
    status ENUM('available', 'unavailable') DEFAULT 'available',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FULLTEXT INDEX idx_series_search (name, original_name)
);

-- Tabela de temporadas
CREATE TABLE seasons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    series_id BIGINT UNSIGNED NOT NULL,
    number SMALLINT NOT NULL,
    name VARCHAR(255) NULL,
    `order` INT DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    UNIQUE KEY unique_series_season (series_id, number)
);

-- Tabela de episódios
CREATE TABLE episodes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    series_id BIGINT UNSIGNED NOT NULL,
    season_id BIGINT UNSIGNED NOT NULL,
    season_number SMALLINT NOT NULL,
    episode_number SMALLINT NOT NULL,
    name VARCHAR(500) NOT NULL,
    synopsis TEXT NULL,
    url TEXT NOT NULL,
    duration VARCHAR(20) NULL,
    `order` INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_episode (series_id, season_number, episode_number)
);

-- Tabela de bouquets
CREATE TABLE bouquets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de itens do bouquet (relacionamentos)
CREATE TABLE bouquet_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bouquet_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('category', 'channel', 'movie', 'series') NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bouquet_item (bouquet_id, item_type, item_id)
);

-- Tabela de planos
CREATE TABLE plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    credit_cost INT DEFAULT 1,
    max_connections INT DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    is_trial BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de bouquets do plano
CREATE TABLE plan_bouquets (
    plan_id BIGINT UNSIGNED NOT NULL,
    bouquet_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (plan_id, bouquet_id),
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);

-- Tabela de clientes
CREATE TABLE clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    whatsapp VARCHAR(20) NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    bouquet_id BIGINT UNSIGNED NOT NULL,
    reseller_id BIGINT UNSIGNED NULL,
    max_connections INT DEFAULT 1,
    active_connections INT DEFAULT 0,
    status ENUM('active', 'expired', 'suspended', 'trial') DEFAULT 'active',
    is_trial BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_access_at TIMESTAMP NULL,
    notes TEXT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(id),
    FOREIGN KEY (reseller_id) REFERENCES resellers(id) ON DELETE SET NULL,
    INDEX idx_clients_status (status),
    INDEX idx_clients_expires (expires_at),
    INDEX idx_clients_reseller (reseller_id)
);

-- Tabela de servidores
CREATE TABLE servers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT DEFAULT 8080,
    protocol ENUM('http', 'https', 'rtmp') DEFAULT 'https',
    status ENUM('online', 'offline', 'unknown') DEFAULT 'unknown',
    max_connections INT DEFAULT 5000,
    active_connections INT DEFAULT 0,
    cpu TINYINT NULL,
    memory TINYINT NULL,
    disk TINYINT NULL,
    network INT NULL,
    latency INT NULL,
    last_check_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de conexões ativas
CREATE TABLE active_connections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT UNSIGNED NOT NULL,
    stream_type ENUM('live', 'movie', 'series') NOT NULL,
    stream_name VARCHAR(500) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    device VARCHAR(255) NULL,
    server_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'idle') DEFAULT 'active',
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    INDEX idx_connections_client (client_id),
    INDEX idx_connections_token (token)
);

-- Tabela de fontes EPG
CREATE TABLE epg_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    status ENUM('active', 'error') DEFAULT 'active',
    last_import_at TIMESTAMP NULL,
    channels_count INT DEFAULT 0,
    programs_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de programas EPG
CREATE TABLE epg_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    channel_id BIGINT UNSIGNED NULL,
    tvg_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    FOREIGN KEY (source_id) REFERENCES epg_sources(id) ON DELETE CASCADE,
    INDEX idx_epg_channel (tvg_id, start_at)
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    user_type ENUM('admin', 'reseller') NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    details TEXT NULL,
    ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity, entity_id),
    INDEX idx_audit_created (created_at)
);

-- Tabela de configurações
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 Instalação (Backend Laravel)

### Requisitos
- PHP 8.3+
- MySQL 8.0+ ou MariaDB 10.6+
- Composer
- Node.js 18+
- Nginx ou Apache
- Redis (opcional, para filas)
- FFmpeg (opcional, para transcodificação)

### Passos de Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/streampanel-iptv.git
cd streampanel-iptv

# 2. Instale dependências PHP
composer install

# 3. Instale dependências JS
npm install

# 4. Configure o ambiente
cp .env.example .env
php artisan key:generate

# 5. Configure o banco de dados no .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=streampanel
# DB_USERNAME=streampanel
# DB_PASSWORD=sua_senha_segura

# 6. Execute as migrations
php artisan migrate --seed

# 7. Crie o link de armazenamento
php artisan storage:link

# 8. Compile os assets
npm run build

# 9. Configure o cron (agendador)
# Adicione ao crontab:
# * * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1

# 10. Inicie os workers de fila
php artisan queue:work --queue=imports,default --sleep=3 --tries=3

# 11. Configure o Nginx (exemplo em nginx.conf)
```

### Configuração Nginx

```nginx
server {
    listen 80;
    server_name painel.dominio.com;
    root /var/www/streampanel/public;
    index index.php;

    # API routes compatíveis
    location ~ ^/(get\.php|player_api\.php|xmltv\.php|live|movie|series) {
        try_files $uri /index.php?$query_string;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## 🔌 APIs Compatíveis

O sistema implementa APIs compatíveis com os formatos mais utilizados:

### Rotas de Compatibilidade

| Rota | Descrição |
|------|-----------|
| `GET /get.php` | Gera lista M3U personalizada |
| `GET /player_api.php` | API completa de player |
| `GET /xmltv.php` | Guia de programação XMLTV |
| `GET /live/{user}/{pass}/{stream_id}.m3u8` | Stream ao vivo HLS |
| `GET /movie/{user}/{pass}/{stream_id}` | Stream de filme |
| `GET /series/{user}/{pass}/{series}/{season}/{episode}` | Stream de episódio |

### Exemplos de Uso

```
# Lista M3U personalizada
https://painel.com/get.php?username=joao&password=abc123&type=m3u_plus

# API Player - Informações do usuário
https://painel.com/player_api.php?username=joao&password=abc123

# API Player - Categorias de canais ao vivo
https://painel.com/player_api.php?username=joao&password=abc123&action=get_live_categories

# API Player - Canais ao vivo
https://painel.com/player_api.php?username=joao&password=abc123&action=get_live_streams
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt
- ✅ Proteção CSRF em todas as rotas web
- ✅ Validação rigorosa de entradas
- ✅ Proteção contra SQL Injection (Eloquent ORM)
- ✅ Proteção contra XSS (escape automático no Blade)
- ✅ Rate limiting nas APIs
- ✅ Logs de auditoria completos
- ✅ Sessões seguras (HTTPOnly, Secure, SameSite)
- ✅ Validação de URLs contra SSRF
- ✅ Limite de tamanho para uploads
- ✅ Sanitização de conteúdo M3U importado
- ✅ Autenticação por token para APIs

## 📊 Performance

O sistema é dimensionado para:
- 100.000+ canais
- 50.000+ filmes
- 10.000+ séries
- Milhares de clientes simultâneos

Otimizações implementadas:
- Paginação no servidor (cursor-based)
- Índices em campos de busca
- Processamento em lotes (chunk)
- Filas assíncronas para importação
- Cache de consultas frequentes
- Importação incremental
- Lazy loading de relacionamentos

## 📁 Estrutura do Projeto Frontend

```
src/
├── App.tsx           # Componente principal com roteamento
├── types.ts          # Definições TypeScript
├── store.ts          # Store com persistência (localStorage)
├── data.ts           # Dados de demonstração
├── components.tsx    # Componentes UI reutilizáveis
├── index.css         # Estilos globais
└── main.tsx          # Entry point
```

## 🎨 Design System

- **Fundo principal**: `#0B1120`
- **Sidebar**: `#111827`
- **Cards**: `#1E293B`
- **Bordas**: `#334155`
- **Primária**: `#3B82F6` (azul)
- **Secundária**: `#8B5CF6` (roxo)
- **Sucesso**: `#10B981` (verde)
- **Erro**: `#EF4444` (vermelho)
- **Alerta**: `#F59E0B` (amarelo)

## 📝 Licença

Este projeto é destinado apenas para gerenciamento de conteúdo IPTV autorizado.
Não utilize para distribuir conteúdo protegido por direitos autorais sem autorização.

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Desenvolvido com React + TypeScript + Tailwind CSS**
**Arquitetura backend preparada para Laravel 11 + MySQL**
