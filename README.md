# 云聚CRM - 智能客服管理系统

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.38.0-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 项目概述

云聚CRM是一个现代化的智能客服管理系统，提供完整的客户服务解决方案。系统采用前后端分离架构，支持实时聊天、多角色权限管理、智能密钥系统等核心功能。

### 核心功能

- **多角色权限体系**: 支持超级管理员、管理员、主管、经理、客服、实习客服等6种角色
- **智能密钥管理**: naoiod安全格式密钥，支持自动过期和使用统计
- **实时聊天系统**: 基于Socket.io的实时通信，支持文件传输
- **客户管理**: 完整的客户信息管理和聊天历史记录
- **智能分配**: 自动会话分配和负载均衡
- **数据分析**: 实时监控和统计报表

### 技术架构

**前端技术栈:**
- React 18.3.1 + TypeScript
- Vite 构建工具
- Ant Design UI 组件库
- Zustand 状态管理
- React Router 路由管理
- Socket.io-client 实时通信
- Tailwind CSS 样式框架

**后端技术栈:**
- Node.js + Express.js
- Supabase (PostgreSQL) 数据库
- Socket.io 实时通信
- JWT 身份认证
- Multer 文件上传
- Helmet 安全防护

## 🛠 快速开始

### 环境要求

- Node.js 18.0+
- npm 或 yarn
- PostgreSQL 数据库 (推荐使用 Supabase)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-org/yunju-crm.git
   cd yunju-crm
   ```

2. **集成前端到后端**
   ```bash
   # 自动安装依赖、构建前端并集成到后端
   .\integrate-frontend-to-backend.bat
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp backend/.env.example backend/.env
   
   # 编辑环境变量
   nano backend/.env
   ```

4. **初始化数据库**
   ```bash
   # 在Supabase中执行数据库脚本
   # 文件位置: backend/database/schema.sql
   ```

5. **启动集成服务器**
   ```bash
   # 启动集成服务器 (前端+后端)
   .\start-integrated-server.bat
   ```

6. **访问应用**
   - 完整应用: http://localhost:3001
   - API接口: http://localhost:3001/api/*
   - 健康检查: http://localhost:3001/health
   - 管理员登录: 输入 `adminayi888` 自动跳转

## 🌐 部署指南

### Docker 部署 (推荐)

1. **使用 Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **环境变量配置**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     frontend:
       build: .
       ports:
         - "80:80"
     backend:
       build: ./server
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
   ```

### 传统服务器部署

详细部署步骤请参考 [部署文档](docs/DEPLOYMENT.md)

### 云平台部署

支持以下平台的一键部署：
- **Vercel**: 前端部署
- **Railway**: 全栈部署  
- **AWS**: 企业级部署
- **阿里云**: 国内部署方案
🗄 数据库设计
完整的13个核心表结构：

用户管理: users, roles, permissions, role_permissions
密钥系统: access_keys, key_usage_logs
客服聊天: customers, chat_sessions, chat_messages
功能配置: quick_replies, welcome_messages, agent_settings
文件管理: file_uploads
系统配置: system_settings
🔧 关键特性
密钥管理系统
naoiod安全格式：12-16位字母数字组合
48小时默认有效期：符合您的要求
实时状态监控：过期提醒、使用统计
管理员特殊密钥：adminayi888
多角色权限体系
6个预定义角色（超级管理员到实习客服）
细粒度权限控制
基于级别的权限继承
智能客服功能
自动欢迎语（多条按序发送）
快捷回复分类管理
黑名单用户管理
实时聊天和文件传输
🔒 安全和监控
HTTPS配置
防火墙设置
数据库安全
日志管理
性能监控
📊 运维管理
备份策略
性能优化
故障排除
更新维护

实现功能服务层和 API，你需要将当前前端应用中的模拟数据和内存状态管理替换为与后端数据库交互的实际 API 调用。这将涉及设置一个后端服务器、定义数据库模式、创建 API 端点，并修改前端的 Zustand 存储以通过这些 API 进行数据操作。

The Plan
设置后端项目结构:

在项目根目录创建一个新的 server 文件夹，用于存放后端代码。
在 server 文件夹内初始化一个新的 Node.js 项目，并安装必要的依赖，例如 express 用于构建 API，dotenv 用于管理环境变量，以及 Supabase 客户端库。
（可选）设计 Supabase 数据库模式:

在 Supabase 中创建以下表格，并定义相应的列和关系：
users: 存储用户（包括管理员和坐席）信息，包含 id, name, role_id, avatar_url 等。
roles: 存储角色定义，包含 id, name, display_name, level, color 等。
permissions: 存储权限定义，包含 id, name, display_name, category, description 等。
role_permissions: 关联 roles 和 permissions 表，定义每个角色拥有的权限。
keys: 存储密钥信息，包含 id, key_value (naoiod值), type, status, created_at, expires_at, agent_id 等。
key_usage_logs: 存储密钥使用日志，包含 id, key_id, action, timestamp, ip_address 等。
agents: 存储坐席的详细信息，包含 id, user_id, status, current_sessions, max_sessions, skills, groups 等。
customers: 存储客户信息，包含 id, name, is_online, last_seen, ip_address 等。
chat_sessions: 存储聊天会话信息，包含 id, customer_id, agent_id, status, start_time, last_message_time 等。
chat_messages: 存储聊天消息，包含 id, session_id, sender_id, sender_type, content, type, timestamp 等。
agent_settings: 存储坐席的个性化设置，包含 id, agent_id, auto_welcome_enabled, sound_notifications 等。
quick_replies: 存储快捷回复，关联 agent_settings。
welcome_messages: 存储欢迎语，关联 agent_settings。
blacklisted_users: 存储黑名单用户，关联 agent_settings。
实现后端 API 端点:

在 server 文件夹内创建 API 路由和控制器，使用 Supabase 客户端库与数据库交互。
认证 API:
POST /api/auth/login: 接收密钥（管理员密钥或坐席密钥），验证其有效性，并返回用户（管理员或坐席）信息和认证令牌。
POST /api/auth/validate-key: 验证坐席密钥的有效性（格式、状态、有效期等）。
密钥管理 API:
GET /api/keys: 获取所有密钥列表。
POST /api/keys: 生成新密钥并保存到数据库。
PUT /api/keys/:id: 更新指定密钥的信息（例如备注、最大使用次数、过期时间）。
DELETE /api/keys/:id: 删除指定密钥。
POST /api/keys/:id/suspend: 暂停指定密钥。
POST /api/keys/:id/activate: 激活指定密钥。
坐席管理 API:
GET /api/agents: 获取所有坐席列表。
POST /api/agents: 创建新坐席。
PUT /api/agents/:id: 更新坐席信息。
DELETE /api/agents/:id: 删除坐席。
PUT /api/agents/:id/status: 更新坐席状态。
聊天与会话 API:
GET /api/customers: 获取客户列表。
GET /api/sessions: 获取所有会话列表。
GET /api/sessions/:id/messages: 获取指定会话的消息记录。
POST /api/sessions/:id/messages: 发送新消息到指定会话。
POST /api/sessions/:id/assign: 将会话分配给指定坐席。
坐席设置 API:
GET /api/agent-settings/:agentId: 获取指定坐席的设置。
PUT /api/agent-settings/:agentId: 更新坐席设置（例如自动回复、声音通知）。
POST /api/agent-settings/:agentId/quick-replies: 添加快捷回复。
PUT /api/agent-settings/:agentId/quick-replies/:id: 更新快捷回复。
DELETE /api/agent-settings/:agentId/quick-replies/:id: 删除快捷回复。
类似地，为欢迎语 (welcome-messages) 和黑名单 (blacklist) 实现 CRUD 操作。
文件存储 API:
POST /api/upload/file: 处理文件上传，将文件存储到 Supabase Storage，并返回文件 URL。
修改前端 Zustand 存储以调用 API:

src/stores/authStore.ts: 修改 login 方法，不再使用模拟数据，而是调用后端认证 API (POST /api/auth/login)。
src/stores/adminStore.ts:
修改 refreshDashboard 方法，从后端 API 获取仪表盘数据。
修改 generateKey 方法，调用后端生成密钥 API (POST /api/keys)。
修改 validateKey 方法，调用后端密钥验证 API (POST /api/auth/validate-key)。
修改 updateKey, deleteKey, suspendKey, activateKey 方法，调用相应的后端密钥管理 API。
src/stores/agentStore.ts: 修改 setAgents, addAgent, updateAgent, removeAgent, setAgentStatus 等方法，调用后端坐席管理 API。
src/stores/chatStore.ts:
修改 setCustomers, setSessions, addMessage 等方法，从后端 API 获取客户和会话数据，并发送消息。
修改 setAgentSettings, updateQuickReplies, updateWelcomeMessages, addToBlacklist, removeFromBlacklist 等方法，调用后端坐席设置 API。
src/stores/sessionStore.ts: 修改 setSessions, addSession, updateSession, assignSession 等方法，调用后端会话管理 API。
更新文件上传组件:

src/components/chat/FileUploadModal.tsx: 修改 handleUpload 函数，不再只是打印文件信息，而是调用后端文件上传 API (POST /api/upload/file)。
更新 src/components/admin/KeyManagement.tsx 中的模拟数据初始化:

移除 useEffect 中用于初始化模拟密钥数据的代码，因为数据将从后端获取。
更新 src/components/agent/AgentSettings.tsx 中的模拟密钥信息:

currentKey 的模拟数据也应替换为从后端获取的实际坐席密钥信息。

为了实现短链和二维码的有效访问，并确保它们能够持久化和正确重定向，您需要一个后端服务来管理短链接的生成和解析。

目前，您的前端代码 (src/components/agent/AgentSettings.tsx) 已经包含了生成短链（通过随机字符串）和显示二维码的功能，并且 src/App.tsx 中也配置了 /s/:shortId 的路由，可以将短链请求路由到 UserChatPage 组件。

然而，当前短链的生成是纯前端模拟的，这意味着每次页面加载或刷新时，短链都会重新生成，并且这些短链之间没有持久的映射关系。要使其真正可访问和有效，需要以下步骤：

The Plan
创建后端短链服务:

您需要搭建一个后端服务，提供两个主要的API接口：
短链生成接口: 接收一个长链接（例如，您的客服专属链接 /chat/:agentId），生成一个唯一的短ID，并将这个短ID与长链接的映射关系存储在数据库中。
短链重定向接口: 当用户访问短链接（例如 yourdomain.com/s/shortId）时，后端服务会根据 shortId 在数据库中查找对应的长链接，然后执行HTTP 302重定向到该长链接。
这个后端服务可以是基于Node.js、Python、Go等任何您熟悉的语言，并使用数据库（如PostgreSQL, MongoDB等）来存储映射关系。
修改 src/components/agent/AgentSettings.tsx:

文件: src/components/agent/AgentSettings.tsx
修改内容:
将 generateShortLink 函数修改为调用您后端服务的短链生成API。
当API返回短ID和完整的短链接时，更新组件的状态 shortLink。
在调用API时，将客服的完整链接 (agentLink) 作为参数传递给后端。
原因: 这将确保生成的短链接是持久化的，并且由后端管理其映射关系，从而实现真正的短链功能。
配置后端重定向:

文件: (后端文件，此处无法提供具体路径)
修改内容:
确保您的后端服务能够捕获所有 /s/:shortId 形式的请求。
在接收到这些请求后，从URL中提取 shortId。
使用 shortId 查询数据库，找到对应的长链接。
执行一个HTTP 302（临时重定向）到查找到的长链接。
原因: 这是短链接功能的核心，它允许用户通过简短的URL访问到实际的客服聊天页面。
部署后端服务:

将您的后端服务部署到一个可公开访问的服务器或云平台上。
确保您的前端应用能够访问到这个后端服务的API接口。

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git

### 1. 克隆项目
```bash
git clone <repository-url>
cd yunju-crm
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 环境配置
创建 `.env.local` 文件：
```env
# 应用配置
VITE_APP_TITLE=云聚CRM
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3001/api

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/yunju_crm
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/zip

# Socket.io配置
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### 4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:5173

### 5. 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 生产环境部署

### 方案一：Docker部署（推荐）

#### 1. 创建 Dockerfile
```dockerfile
# 前端构建阶段
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # 处理前端路由
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API代理
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Socket.io代理
        location /socket.io/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

#### 3. 创建 docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
      - database
      - redis
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@database:5432/yunju_crm
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database
      - redis
    networks:
      - app-network

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=yunju_crm
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

#### 4. 部署命令
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方案二：传统服务器部署

#### 1. 服务器环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install nginx -y

# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 安装Redis
sudo apt install redis-server -y
```

#### 2. 数据库初始化
```bash
# 切换到postgres用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE yunju_crm;
CREATE USER yunju_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE yunju_crm TO yunju_user;
\q
```

#### 3. 应用部署
```bash
# 克隆代码
git clone <repository-url> /var/www/yunju-crm
cd /var/www/yunju-crm

# 安装依赖
npm install

# 构建前端
npm run build

# 配置环境变量
cp .env.example .env.production
nano .env.production

# 启动后端服务（假设后端在backend目录）
cd backend
npm install
pm2 start ecosystem.config.js --env production
```

#### 4. Nginx配置
```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/yunju-crm
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/yunju-crm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/yunju-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 方案三：云平台部署

#### Vercel部署（前端）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### Railway部署（全栈）
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署

#### AWS/阿里云部署
1. 创建EC2/ECS实例
2. 配置安全组
3. 按传统服务器部署流程操作

## 数据库设计

### 核心表结构

#### 1. 用户表 (users)
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  role_id CHAR(36),
  status VARCHAR(20) DEFAULT 'offline',
  access_key VARCHAR(16) UNIQUE,
  key_expires_at DATETIME,
  is_online BOOLEAN DEFAULT FALSE,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_access_key (access_key),
  INDEX idx_users_role_id (role_id),
  INDEX idx_users_status (status)
);
```

#### 2. 角色表 (roles)
```sql
CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  level INT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. 权限表 (permissions)
```sql
CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
  role_id CHAR(36),
  permission_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);
```

#### 4. 密钥管理表 (access_keys)
```sql
CREATE TABLE access_keys (
  id CHAR(36) PRIMARY KEY,
  key_value VARCHAR(16) UNIQUE NOT NULL,
  key_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  user_id CHAR(36),
  created_by CHAR(36),
  expires_at DATETIME NOT NULL,
  max_usage INT,
  usage_count INT DEFAULT 0,
  last_used_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_access_keys_key_value (key_value),
  INDEX idx_access_keys_user_id (user_id),
  INDEX idx_access_keys_status (status),
  INDEX idx_access_keys_expires_at (expires_at)
);
```

#### 5. 密钥使用日志表 (key_usage_logs)
```sql
CREATE TABLE key_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES access_keys(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'session_start', 'session_end', 'heartbeat'
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    duration INTEGER, -- 持续时间（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_key_usage_logs_key_id ON key_usage_logs(key_id);
CREATE INDEX idx_key_usage_logs_user_id ON key_usage_logs(user_id);
CREATE INDEX idx_key_usage_logs_created_at ON key_usage_logs(created_at);
```

#### 6. 客户表 (customers)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    ip_address INET,
    device_info TEXT,
    user_agent TEXT,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    has_received_welcome BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_online ON customers(is_online);
CREATE INDEX idx_customers_is_blacklisted ON customers(is_blacklisted);
```

#### 7. 聊天会话表 (chat_sessions)
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    agent_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'vip'
    source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'api'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    satisfaction_rating INTEGER, -- 1-5星评分
    welcome_sent BOOLEAN DEFAULT false,
    tags TEXT[], -- 会话标签
    metadata JSONB, -- 额外元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_chat_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_started_at ON chat_sessions(started_at);
```

#### 8. 聊天消息表 (chat_messages)
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    sender_id UUID, -- 可以是customer_id或user_id
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'agent', 'system'
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    content TEXT NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent', -- 'sending', 'sent', 'delivered', 'read', 'failed'
    is_welcome_message BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

#### 9. 快捷回复表 (quick_replies)
```sql
CREATE TABLE quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_quick_replies_agent_id ON quick_replies(agent_id);
CREATE INDEX idx_quick_replies_category ON quick_replies(category);
```

#### 10. 欢迎语表 (welcome_messages)
```sql
CREATE TABLE welcome_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_welcome_messages_agent_id ON welcome_messages(agent_id);
CREATE INDEX idx_welcome_messages_order ON welcome_messages(display_order);
```

#### 11. 坐席设置表 (agent_settings)
```sql
CREATE TABLE agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID UNIQUE REFERENCES users(id),
    auto_welcome_enabled BOOLEAN DEFAULT true,
    sound_notifications BOOLEAN DEFAULT true,
    auto_reply_enabled BOOLEAN DEFAULT false,
    max_concurrent_sessions INTEGER DEFAULT 5,
    working_hours JSONB, -- 工作时间配置
    break_duration INTEGER DEFAULT 15, -- 休息时长（分钟）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. 文件上传表 (file_uploads)
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    session_id UUID REFERENCES chat_sessions(id),
    status VARCHAR(20) DEFAULT 'uploaded', -- 'uploading', 'uploaded', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_file_uploads_session_id ON file_uploads(session_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
```

#### 13. 系统配置表 (system_settings)
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false, -- 是否可以被前端访问
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化系统配置
INSERT INTO system_settings (key, value, description, category) VALUES
('key_default_validity_hours', '48', '密钥默认有效期（小时）', 'security'),
('max_sessions_per_agent', '5', '每个坐席最大并发会话数', 'performance'),
('auto_assignment_enabled', 'true', '是否启用自动分配', 'assignment'),
('welcome_message_delay', '1000', '欢迎语发送间隔（毫秒）', 'chat');
```

### 数据库初始化脚本

创建 `database/init.sql`：

```sql
-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建所有表（按上述结构）
-- ... 这里包含所有表的创建语句 ...

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_keys_updated_at BEFORE UPDATE ON access_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... 其他表的触发器 ...

-- 创建默认管理员账号
INSERT INTO users (name, email, role_id, access_key, key_expires_at, status) 
SELECT 
    '系统管理员', 
    'admin@system.com', 
    r.id, 
    'adminayi888', 
    CURRENT_TIMESTAMP + INTERVAL '10 years',
    'online'
FROM roles r WHERE r.name = 'super_admin';
```

## 环境变量配置

### 开发环境 (.env.local)
```env
# 应用基础配置
VITE_APP_TITLE=云聚CRM开发环境
VITE_APP_VERSION=1.0.0-dev
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001

# 开发模式配置
VITE_DEV_MODE=true
VITE_DEBUG_ENABLED=true
```

### 生产环境 (.env.production)
```env
# 应用基础配置
VITE_APP_TITLE=云聚CRM
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com

# 生产模式配置
VITE_DEV_MODE=false
VITE_DEBUG_ENABLED=false
```

## 监控和日志

### 1. 应用监控
- 使用PM2进行进程监控
- 集成Sentry进行错误追踪
- 使用Prometheus + Grafana进行性能监控

### 2. 日志管理
```javascript
// 日志配置示例
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## 安全配置

### 1. HTTPS配置
```bash
# 使用Let's Encrypt获取SSL证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. 防火墙配置
```bash
# UFW防火墙配置
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. 数据库安全
```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE yunju_crm TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

## 备份策略

### 1. 数据库备份
```bash
#!/bin/bash
# 数据库备份脚本
BACKUP_DIR="/var/backups/yunju-crm"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="yunju_crm"

mkdir -p $BACKUP_DIR

# 创建备份
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### 2. 文件备份
```bash
#!/bin/bash
# 文件备份脚本
rsync -av --delete /var/www/yunju-crm/ /backup/yunju-crm/
```

## 性能优化

### 1. 前端优化
- 代码分割和懒加载
- 图片压缩和CDN
- 缓存策略
- Bundle分析

### 2. 后端优化
- 数据库索引优化
- Redis缓存
- API响应压缩
- 连接池配置

### 3. 数据库优化
```sql
-- 性能监控查询
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename IN ('users', 'chat_sessions', 'chat_messages');

-- 慢查询分析
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 故障排除

### 常见问题

1. **密钥验证失败**
   - 检查密钥格式是否为naoiod格式
   - 确认密钥未过期
   - 验证数据库连接

2. **Socket连接失败**
   - 检查防火墙设置
   - 确认Socket.io服务运行状态
   - 验证CORS配置

3. **文件上传失败**
   - 检查文件大小限制
   - 确认上传目录权限
   - 验证文件类型限制

### 日志查看
```bash
# PM2日志
pm2 logs

# Nginx日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

## 更新和维护

### 1. 应用更新
```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 构建新版本
npm run build

# 重启服务
pm2 restart all
```

### 2. 数据库迁移
```sql
-- 创建迁移脚本示例
-- migration_001_add_new_column.sql
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);
CREATE INDEX idx_users_new_field ON users(new_field);
```

### 3. 版本管理
- 使用语义化版本控制
- 创建发布标签
- 维护更新日志

## 联系支持

如有问题，请联系：
- 技术支持：tech@yourdomain.com
- 文档更新：docs@yourdomain.com
- 紧急联系：emergency@yourdomain.com

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: 云聚CRM开发团队