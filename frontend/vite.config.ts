import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 确保路径别名正确
    }
  },
  server: {
    port: 3000, // 前端开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 后端API地址
        changeOrigin: true,
        // 根据后端API路径决定是否需要rewrite
        // 如果后端API有/api前缀，则不需要rewrite
        rewrite: (path) => path.replace(/^\/api/, '') // 可选：根据后端配置决定
      },
      // 添加WebSocket代理（如果需要）
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/public'), // 更安全的路径写法
    emptyOutDir: true,
    // 添加sourcemap便于调试
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  // 添加环境变量前缀
  envPrefix: 'VITE_'
});