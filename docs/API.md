# API 文档

云聚CRM系统提供完整的RESTful API和WebSocket接口，支持所有核心功能的程序化访问。

## 🔗 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **认证方式**: JWT Bearer Token
- **API版本**: v1.0.0

## 🔐 认证

### 登录认证

```http
POST /api/auth/login
```

**请求体:**
```json
{
  "accessKey": "string"  // 密钥 (naoiod格式或管理员密钥)
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "name": "string",
      "role": {
        "id": "uuid",
        "name": "string",
        "displayName": "string",
        "level": "number",
        "color": "string"
      },
      "permissions": ["string"]
    }
  }
}
```

### 密钥验证

```http
POST /api/auth/validate-key
```

**请求体:**
```json
{
  "key": "string"  // 密钥值
}
```

## 🔑 密钥管理

### 获取密钥列表

```http
GET /api/keys
Authorization: Bearer {token}
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 100)
- `status`: 状态筛选 (active|suspended|expired)
- `type`: 类型筛选 (agent|admin)

**响应:**
```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "id": "uuid",
        "keyValue": "string",
        "type": "agent|admin",
        "status": "active|suspended|expired",
        "createdAt": "datetime",
        "expiresAt": "datetime",
        "usageCount": "number",
        "maxUsage": "number",
        "agentId": "uuid",
        "agent": {
          "id": "uuid",
          "name": "string"
        }
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

### 创建新密钥

```http
POST /api/keys
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "type": "agent|admin",
  "agentId": "uuid",        // 可选，坐席ID
  "expiresAt": "datetime",  // 可选，过期时间
  "maxUsage": "number",     // 可选，最大使用次数
  "note": "string"          // 可选，备注
}
```

### 更新密钥

```http
PUT /api/keys/{keyId}
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "status": "active|suspended",
  "expiresAt": "datetime",
  "maxUsage": "number",
  "note": "string"
}
```

### 删除密钥

```http
DELETE /api/keys/{keyId}
Authorization: Bearer {token}
```

## 👥 坐席管理

### 获取坐席列表

```http
GET /api/agents
Authorization: Bearer {token}
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "online|offline|busy|away",
      "currentSessions": "number",
      "maxSessions": "number",
      "skills": ["string"],
      "groups": ["string"],
      "user": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "role": {
          "name": "string",
          "displayName": "string"
        }
      }
    }
  ]
}
```

### 更新坐席状态

```http
PUT /api/agents/{agentId}/status
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "status": "online|offline|busy|away"
}
```

## 💬 聊天管理

### 获取聊天会话

```http
GET /api/chat/sessions
Authorization: Bearer {token}
```

**查询参数:**
- `agentId`: 坐席ID筛选
- `status`: 状态筛选 (active|closed|waiting)
- `page`: 页码
- `limit`: 每页数量

### 获取聊天消息

```http
GET /api/chat/sessions/{sessionId}/messages
Authorization: Bearer {token}
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `before`: 获取指定时间之前的消息

### 发送消息

```http
POST /api/chat/sessions/{sessionId}/messages
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "content": "string",
  "type": "text|image|file",
  "metadata": {
    "fileName": "string",  // 文件类型消息
    "fileSize": "number",  // 文件类型消息
    "mimeType": "string"   // 文件类型消息
  }
}
```

## 📁 文件上传

### 上传文件

```http
POST /api/upload/file
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**表单数据:**
- `file`: 文件对象
- `sessionId`: 会话ID (可选)

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "url": "string"
  }
}
```

## ⚙️ 坐席设置

### 获取坐席设置

```http
GET /api/agentSettings/{agentId}
Authorization: Bearer {token}
```

### 更新坐席设置

```http
PUT /api/agentSettings/{agentId}
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "autoWelcomeEnabled": "boolean",
  "soundNotifications": "boolean",
  "maxSessions": "number",
  "quickReplies": [
    {
      "category": "string",
      "content": "string"
    }
  ],
  "welcomeMessages": [
    {
      "content": "string",
      "order": "number"
    }
  ],
  "blacklistedUsers": ["string"]
}
```

## 🔗 短链接

### 创建短链接

```http
POST /api/shortlinks
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "originalUrl": "string",
  "agentId": "uuid"
}
```

### 解析短链接

```http
GET /api/shortlinks/resolve/{shortId}
```

## 🌐 WebSocket 事件

### 连接

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'jwt_token'
  }
});
```

### 客户端事件

**加入聊天室:**
```javascript
socket.emit('join-room', {
  sessionId: 'uuid',
  userType: 'agent|customer'
});
```

**发送消息:**
```javascript
socket.emit('send-message', {
  sessionId: 'uuid',
  content: 'string',
  type: 'text|image|file'
});
```

**更新坐席状态:**
```javascript
socket.emit('agent-status-change', {
  status: 'online|offline|busy|away'
});
```

### 服务器事件

**新消息:**
```javascript
socket.on('new-message', (data) => {
  // data: { sessionId, message, sender }
});
```

**会话更新:**
```javascript
socket.on('session-updated', (data) => {
  // data: { sessionId, status, agent }
});
```

**坐席状态变更:**
```javascript
socket.on('agent-status-updated', (data) => {
  // data: { agentId, status, timestamp }
});
```

## 📊 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### 常见错误码

| 错误码 | HTTP状态 | 描述 |
|--------|----------|------|
| `INVALID_KEY` | 401 | 无效的密钥 |
| `KEY_EXPIRED` | 401 | 密钥已过期 |
| `KEY_SUSPENDED` | 401 | 密钥已暂停 |
| `INSUFFICIENT_PERMISSIONS` | 403 | 权限不足 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## 🔒 安全注意事项

1. **API密钥安全**: 妥善保管JWT token，避免在客户端暴露
2. **HTTPS**: 生产环境必须使用HTTPS
3. **速率限制**: API有速率限制，避免频繁请求
4. **输入验证**: 所有输入都会进行服务器端验证
5. **权限检查**: 每个API都会检查用户权限

## 📝 更新日志

### v1.0.0 (2024-12-01)
- 初始API版本发布
- 支持完整的认证和授权
- 实现所有核心功能API
- 添加WebSocket实时通信支持

---

如有疑问，请查看 [FAQ](FAQ.md) 或联系技术支持。