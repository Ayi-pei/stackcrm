# 云聚CRM 安装配置指南

本指南提供详细的安装和配置说明，适用于开发和生产环境。

> 💡 **快速开始**: 如果你想快速体验系统，请查看 [QUICK_START.md](./QUICK_START.md)

## 📋 前置要求

- **Node.js 18.0+** ([下载地址](https://nodejs.org/))
- **Git** ([下载地址](https://git-scm.com/))
- **现代浏览器** (Chrome, Firefox, Safari, Edge)

## 🚀 一键安装

### 方法一: 使用安装脚本 (推荐)

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/yunju-crm/main/scripts/install.sh | bash
```

### 方法二: 手动安装

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/yunju-crm.git
cd yunju-crm

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖
cd server
npm install

# 4. 配置环境变量
cp .env.example .env

# 5. 返回根目录
cd ..
```

## ⚙️ 数据库配置

### 使用 Supabase (推荐)

1. **创建 Supabase 项目**
   - 访问 [Supabase](https://supabase.com/)
   - 创建新项目
   - 获取项目 URL 和 API Key

2. **配置数据库连接**
   ```bash
   # 编辑 server/.env 文件
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

3. **初始化数据库**
   - 在 Supabase SQL 编辑器中运行 `server/database/schema.sql`
   - 或使用命令行工具:
   ```bash
   cd server
   npm run db:init
   ```

### 使用本地 PostgreSQL

```bash
# 1. 安装 PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# 2. 创建数据库
createdb yunju_crm

# 3. 运行初始化脚本
psql yunju_crm < server/database/schema.sql

# 4. 更新环境变量
DATABASE_URL=postgresql://username:password@localhost:5432/yunju_crm
```

## 🏃‍♂️ 启动服务

### 开发环境

```bash
# 方法一: 同时启动前后端 (推荐)
npm run dev:all

# 方法二: 分别启动
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
npm run dev
```

### 生产环境

```bash
# 1. 构建前端
npm run build

# 2. 启动后端
cd server
npm start
```

## 🔑 首次登录

1. **打开浏览器**
   ```
   http://localhost:5173
   ```

2. **使用管理员账户登录**
   ```
   密钥: adminayi888
   ```

3. **创建坐席密钥**
   - 进入"密钥管理"页面
   - 点击"生成新密钥"
   - 分配给坐席使用

## 📱 功能验证

### 1. 管理员功能测试

- ✅ 登录管理后台
- ✅ 查看系统概览
- ✅ 管理密钥
- ✅ 查看坐席状态

### 2. 坐席功能测试

- ✅ 使用坐席密钥登录
- ✅ 接收客户消息
- ✅ 发送回复
- ✅ 文件传输

### 3. 客户功能测试

- ✅ 访问客服链接
- ✅ 发起聊天
- ✅ 接收坐席回复

## 🔧 自定义配置

### 修改端口

```bash
# 前端端口 (vite.config.ts)
export default defineConfig({
  server: {
    port: 3000  // 默认 5173
  }
});

# 后端端口 (server/.env)
PORT=8000  # 默认 3001
```

### 配置文件上传

```bash
# server/.env
MAX_FILE_SIZE=20971520  # 20MB
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
```

### 自定义主题

```javascript
// src/index.css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
}
```

## 🐳 Docker 部署

### 使用 Docker Compose (推荐)

```bash
# 1. 创建 docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: yunju_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# 2. 启动服务
docker-compose up -d
```

### 单独构建镜像

```bash
# 构建镜像
docker build -t yunju-crm .

# 运行容器
docker run -d \
  --name yunju-crm \
  -p 3000:3000 \
  -e NODE_ENV=production \
  yunju-crm
```

## 🌐 云平台部署

### Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel --prod
```

### Railway 部署

```bash
# 1. 连接 GitHub 仓库到 Railway
# 2. 设置环境变量
# 3. 自动部署
```

### AWS EC2 部署

```bash
# 1. 创建 EC2 实例
# 2. 安装 Node.js 和 PM2
sudo npm install -g pm2

# 3. 克隆代码并启动
git clone your-repo
cd yunju-crm
npm install
cd server && npm install
pm2 start ecosystem.config.js
```

## 🔒 安全配置

### 生产环境安全检查

```bash
# 1. 更新 JWT 密钥
JWT_SECRET=$(openssl rand -base64 64)

# 2. 启用 HTTPS
# 3. 配置防火墙
# 4. 设置速率限制
# 5. 启用日志记录
```

### SSL 证书配置

```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 📊 监控和日志

### 启用监控

```bash
# 安装监控工具
npm install -g pm2
pm2 install pm2-logrotate

# 启动应用
pm2 start server/index.js --name yunju-crm
pm2 monit
```

### 日志配置

```javascript
// server/config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🆘 常见问题

### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3001
# 或
netstat -tulpn | grep :3001

# 终止进程
kill -9 PID
```

### 权限问题

```bash
# 修复文件权限
chmod -R 755 .
chmod 600 server/.env
```

### 内存不足

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📞 获取帮助

- 📖 [完整文档](./docs/)
- 🐛 [问题反馈](https://github.com/your-repo/yunju-crm/issues)
- 💬 [技术交流群](https://t.me/yunju-crm)
- 📧 [邮件支持](mailto:support@yunju-crm.com)

---

🎉 **恭喜！您已成功安装云聚CRM系统！**

接下来可以：
1. 阅读 [用户手册](./docs/USER_GUIDE.md)
2. 查看 [API 文档](./docs/API.md)
3. 了解 [最佳实践](./docs/BEST_PRACTICES.md)