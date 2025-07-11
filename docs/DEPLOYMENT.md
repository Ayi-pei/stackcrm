# 部署指南

本文档详细介绍了云聚CRM系统的各种部署方案，包括开发环境、测试环境和生产环境的配置。

## 📋 部署前准备

### 系统要求

**最低配置:**
- CPU: 2核心
- 内存: 4GB RAM
- 存储: 20GB SSD
- 网络: 10Mbps带宽

**推荐配置:**
- CPU: 4核心
- 内存: 8GB RAM
- 存储: 50GB SSD
- 网络: 100Mbps带宽

### 软件依赖

- Node.js 18.0+
- PostgreSQL 13+ (或 Supabase)
- Nginx (生产环境)
- PM2 (进程管理)
- SSL证书 (HTTPS)

## 🐳 Docker 部署

### 1. 准备 Docker 文件

**前端 Dockerfile:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**后端 Dockerfile:**
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```

### 2. Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - ./server/.env
    volumes:
      - ./server/uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  uploads:
```

### 3. 部署命令

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 更新服务
docker-compose pull
docker-compose up -d --force-recreate
```

## 🖥️ 传统服务器部署

### 1. 环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install nginx -y

# 安装 Git
sudo apt install git -y
```

### 2. 代码部署

```bash
# 克隆代码
git clone https://github.com/your-org/yunju-crm.git
cd yunju-crm

# 安装依赖
npm install
cd server && npm install && cd ..

# 构建前端
npm run build

# 配置环境变量
cp server/.env.example server/.env
nano server/.env
```

### 3. PM2 配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'yunju-crm-backend',
      script: './server/index.js',
      cwd: '/path/to/yunju-crm',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 4. Nginx 配置

```nginx
# /etc/nginx/sites-available/yunju-crm
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # 前端静态文件
    location / {
        root /path/to/yunju-crm/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO 支持
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传
    location /uploads/ {
        alias /path/to/yunju-crm/server/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/yunju-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ☁️ 云平台部署

### Vercel 部署 (前端)

1. **配置 vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **部署命令**
```bash
npm install -g vercel
vercel --prod
```

### Railway 部署 (全栈)

1. **配置 railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **环境变量配置**
```bash
# Railway 环境变量
NODE_ENV=production
PORT=$PORT
DATABASE_URL=$DATABASE_URL
```

### AWS 部署

1. **EC2 实例配置**
```bash
# 用户数据脚本
#!/bin/bash
yum update -y
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git nginx

# 克隆和配置应用
cd /opt
git clone https://github.com/your-org/yunju-crm.git
cd yunju-crm
npm install
cd server && npm install && cd ..
npm run build

# 配置 PM2 和 Nginx
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

systemctl start nginx
systemctl enable nginx
```

2. **RDS 数据库配置**
```bash
# 创建 PostgreSQL RDS 实例
aws rds create-db-instance \
  --db-instance-identifier yunju-crm-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

## 🔒 安全配置

### SSL/TLS 证书

```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 防火墙配置

```bash
# UFW 防火墙
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 安全头配置

```nginx
# Nginx 安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 监控和日志

### 应用监控

```bash
# PM2 监控
pm2 monit

# 系统资源监控
htop
iostat -x 1
```

### 日志管理

```bash
# PM2 日志
pm2 logs

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 应用日志
tail -f /path/to/yunju-crm/logs/combined.log
```

### 备份策略

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/yunju-crm"

# 数据库备份
pg_dump $DATABASE_URL > $BACKUP_DIR/db_$DATE.sql

# 文件备份
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/uploads

# 清理旧备份 (保留30天)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## 🔧 故障排除

### 常见问题

1. **端口占用**
```bash
sudo lsof -i :3001
sudo kill -9 PID
```

2. **权限问题**
```bash
sudo chown -R $USER:$USER /path/to/yunju-crm
chmod +x /path/to/yunju-crm/server/index.js
```

3. **内存不足**
```bash
# 增加 swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 性能优化

1. **Node.js 优化**
```bash
# 增加内存限制
node --max-old-space-size=4096 index.js
```

2. **数据库优化**
```sql
-- 创建索引
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_agent_id ON chat_sessions(agent_id);
```

3. **Nginx 优化**
```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 📞 技术支持

如遇到部署问题，请：

1. 查看 [FAQ 文档](FAQ.md)
2. 检查 [故障排除指南](TROUBLESHOOTING.md)
3. 提交 [GitHub Issue](https://github.com/your-org/yunju-crm/issues)
4. 联系技术支持: support@yunju-crm.com

---

部署成功后，请及时更新系统和依赖，定期备份数据，监控系统性能。