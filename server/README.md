# 云聚CRM后端服务

## 项目概述

云聚CRM后端服务是一个基于Node.js和Express的RESTful API服务，为云聚CRM客服管理系统提供完整的后端支持。

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **Supabase** - 数据库和认证服务
- **Socket.io** - 实时通信
- **JWT** - 身份认证
- **Multer** - 文件上传处理

## 项目结构

```
server/
├── config/
│   └── supabase.js          # Supabase配置
├── database/
│   └── schema.sql           # 数据库架构
├── middleware/
│   ├── auth.js              # 认证中间件
│   ├── errorHandler.js      # 错误处理中间件
│   └── rateLimiter.js       # 速率限制中间件
├── routes/
│   ├── auth.js              # 认证路由
│   ├── keys.js              # 密钥管理路由
│   ├── agents.js            # 坐席管理路由
│   ├── chat.js              # 聊天功能路由
│   ├── upload.js            # 文件上传路由
│   └── admin.js             # 管理员功能路由
├── socket/
│   └── handlers.js          # Socket.io事件处理
├── utils/
│   └── keyGenerator.js      # 密钥生成工具
├── .env.example             # 环境变量示例
├── package.json             # 项目依赖
└── index.js                 # 应用入口
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键变量：

```env
# Supabase配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here

# 其他配置...
```

### 3. 数据库初始化

在Supabase控制台中执行 `database/schema.sql` 文件来创建数据库表结构。

### 4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://localhost:3001` 启动。

## API文档

### 认证接口

#### POST /api/auth/login
用户登录接口，支持管理员密钥和坐席密钥登录。

**请求体：**
```json
{
  "accessKey": "adminayi888" // 或 naoiod格式密钥
}
```

**响应：**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "用户名",
    "role": {...},
    "type": "admin|agent"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/validate-key
验证密钥有效性。

#### POST /api/auth/logout
用户登出。

### 密钥管理接口（仅管理员）

#### GET /api/keys
获取密钥列表，支持分页和筛选。

#### POST /api/keys/generate
生成新密钥。

**请求体：**
```json
{
  "type": "agent",
  "validityDays": 2,
  "maxUsage": 100,
  "agentId": "uuid",
  "notes": "备注信息"
}
```

#### PUT /api/keys/:id
更新密钥信息。

#### POST /api/keys/:id/suspend
暂停密钥。

#### POST /api/keys/:id/activate
激活密钥。

#### DELETE /api/keys/:id
删除密钥（仅超级管理员）。

#### GET /api/keys/:id/logs
获取密钥使用日志。

### 聊天接口

#### GET /api/chat/sessions
获取聊天会话列表。

#### POST /api/chat/sessions
创建新的聊天会话。

#### GET /api/chat/sessions/:id/messages
获取会话消息记录。

#### POST /api/chat/sessions/:id/messages
发送消息。

### 文件上传接口

#### POST /api/upload/file
上传文件，支持图片、音频、文档等多种格式。

## Socket.io事件

### 客户端事件

- `send_message` - 发送消息
- `typing_start` - 开始输入
- `typing_stop` - 停止输入
- `update_status` - 更新状态
- `assign_session` - 分配会话（管理员）

### 服务端事件

- `new_message` - 新消息通知
- `user_typing` - 用户正在输入
- `user_stop_typing` - 用户停止输入
- `session_assigned` - 会话已分配
- `agent_status_updated` - 坐席状态更新

## 安全特性

### 1. 认证和授权
- JWT令牌认证
- 基于角色的权限控制
- 密钥有效期管理

### 2. 速率限制
- API请求频率限制
- 登录尝试次数限制

### 3. 数据验证
- 输入参数验证
- naoiod密钥格式验证
- 文件类型和大小限制

### 4. 安全头部
- Helmet.js安全头部
- CORS跨域配置
- 请求压缩

## 密钥系统

### naoiod格式密钥
- **格式**: 12-16位小写字母和数字组合
- **类型**: 
  - 管理员密钥: 12位（如：adminayi888）
  - 坐席密钥: 16位（如：naoiod123abc456def）
- **有效期**: 默认48小时
- **状态**: active, expired, suspended

### 密钥生成规则
1. 使用加密安全的随机数生成器
2. 确保密钥唯一性
3. 自动设置过期时间
4. 记录创建和使用日志

## 数据库设计

### 核心表结构
- `users` - 用户信息
- `roles` - 角色定义
- `permissions` - 权限定义
- `access_keys` - 密钥管理
- `key_usage_logs` - 使用日志
- `chat_sessions` - 聊天会话
- `chat_messages` - 聊天消息
- `agent_settings` - 坐席设置

详细的数据库架构请参考 `database/schema.sql`。

## 部署指南

### Docker部署

1. 构建镜像：
```bash
docker build -t yunju-crm-server .
```

2. 运行容器：
```bash
docker run -p 3001:3001 --env-file .env yunju-crm-server
```

### PM2部署

1. 安装PM2：
```bash
npm install -g pm2
```

2. 启动应用：
```bash
pm2 start ecosystem.config.js --env production
```

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6 (可选)

## 监控和日志

### 日志级别
- `error` - 错误日志
- `warn` - 警告日志
- `info` - 信息日志
- `debug` - 调试日志

### 监控指标
- API响应时间
- 错误率统计
- 密钥使用情况
- 在线用户数量

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查Supabase配置
   - 验证网络连接
   - 确认数据库权限

2. **JWT验证失败**
   - 检查JWT_SECRET配置
   - 验证令牌格式
   - 确认令牌未过期

3. **文件上传失败**
   - 检查文件大小限制
   - 验证文件类型
   - 确认存储权限

### 调试模式

启用调试模式：
```bash
NODE_ENV=development npm run dev
```

查看详细日志：
```bash
DEBUG=* npm run dev
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 技术支持：tech@yourdomain.com
- 问题反馈：issues@yourdomain.com