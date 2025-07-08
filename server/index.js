import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// 首先初始化 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 现在可以安全地使用 __dirname 加载环境变量
dotenv.config({ path: path.resolve(__dirname, './.env') });

// 路由导入
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import agentRoutes from './routes/agents.js';
import keyRoutes from './routes/keys.js';
import uploadRoutes from './routes/upload.js';
import agentSettingsRoutes from './routes/agentSettings.js';
import shortlinksRoutes from './routes/shortlinks.js';

// 中间件导入
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';

// Socket处理器导入
import { setupSocketHandlers } from './socket/handlers.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
app.use(rateLimiterMiddleware);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    
    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/shortlinks/resolve/${shortId}`);
    
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

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🌐 客户端地址: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
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

export default app;