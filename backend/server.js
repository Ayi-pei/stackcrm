const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, './.env') });

// 导入路由
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agents');
const keyRoutes = require('./routes/keys');
const uploadRoutes = require('./routes/upload');
const agentSettingsRoutes = require('./routes/agentSettings');
const shortlinksRoutes = require('./routes/shortlinks');

// 导入中间件
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiterMiddleware } = require('./middleware/rateLimiter');

// 导入Socket处理器
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
app.use(rateLimiterMiddleware);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/agentSettings', agentSettingsRoutes);
app.use('/api/shortlinks', shortlinksRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 短链接重定向处理
app.get('/s/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiBaseUrl}/api/shortlinks/resolve/${shortId}`);
    
    if (!response.ok) {
      return res.status(404).send('短链接不存在或已失效');
    }
    
    const data = await response.json();
    
    // 302重定向到原始URL
    res.redirect(302, data.data.originalUrl);
    
  } catch (error) {
    console.error('Short link redirect error:', error);
    res.status(500).send('服务器错误');
  }
});

// Socket.IO处理
setupSocketHandlers(io);

// 错误处理中间件
app.use(errorHandler);

// 前端路由处理 (SPA)
app.get('*', (req, res) => {
  // 如果是API请求，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.originalUrl 
    });
  }
  
  // 其他请求返回前端应用
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🌐 客户端地址: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;