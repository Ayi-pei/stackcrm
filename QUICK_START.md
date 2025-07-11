# 🚀 云聚CRM 快速启动指南

## 📋 系统要求

- **Node.js 18.0+** 
- **npm** 
- **Supabase 账号** (免费)

## ⚡ 5分钟快速部署

### 1. 获取项目
```bash
git clone https://github.com/your-org/yunju-crm.git
cd yunju-crm
```

### 2. 一键集成
```bash
# Windows
.\integrate-frontend-to-backend.bat

# Linux/Mac
chmod +x integrate-frontend-to-backend.sh
./integrate-frontend-to-backend.sh
```

### 3. 配置数据库
```bash
# 1. 访问 https://supabase.com 创建项目
# 2. 复制配置文件
cp backend/.env.example backend/.env

# 3. 编辑配置文件，填入你的 Supabase 信息
nano backend/.env
```

### 4. 启动系统
```bash
# Windows
.\start-integrated-server.bat

# Linux/Mac
cd backend && npm run dev
```

### 5. 开始使用
- 🌐 **访问**: http://localhost:3001
- 👤 **管理员登录**: 输入 `adminayi888`
- 🔑 **坐席登录**: 输入有效的坐席密钥

## 🎯 默认账号

### 管理员账号
- **密钥**: `adminayi888`
- **权限**: 完整系统管理权限
- **功能**: 密钥管理、坐席管理、数据统计

### 测试坐席账号
系统会自动生成测试坐席密钥，格式为 12-16 位小写字母数字组合。

## 📁 项目结构

```
yunju-crm/
├── frontend/                 # 前端源码
├── backend/                  # 后端源码
│   ├── public/              # 前端构建文件 (自动生成)
│   ├── routes/              # API 路由
│   ├── config/              # 配置文件
│   └── database/            # 数据库脚本
├── docs/                    # 文档
├── integrate-frontend-to-backend.bat  # 集成脚本
└── start-integrated-server.bat       # 启动脚本
```

## 🔧 常用命令

### 开发模式
```bash
# 重新集成前端 (前端代码修改后)
.\integrate-frontend-to-backend.bat

# 启动开发服务器
.\start-integrated-server.bat
```

### 生产部署
```bash
# 构建生产版本
cd frontend && npm run build
cp -r dist/* ../backend/public/

# 启动生产服务器
cd backend && npm start
```

## 🌐 部署到云端

### Railway 部署
1. 推送代码到 GitHub
2. 连接 Railway 到你的仓库
3. 选择 `backend` 目录
4. 设置环境变量
5. 自动部署完成

### Render 部署
1. 连接 GitHub 仓库
2. 选择 `backend` 目录
3. 构建命令: `npm install`
4. 启动命令: `npm start`
5. 设置环境变量

## ❓ 常见问题

### Q: 前端页面显示 404
**A**: 运行 `.\integrate-frontend-to-backend.bat` 重新集成前端

### Q: API 请求失败
**A**: 检查 Supabase 配置和网络连接

### Q: 管理员登录失败
**A**: 确认输入的是 `adminayi888`，注意大小写

### Q: 端口被占用
**A**: 修改 `backend/.env` 中的 `PORT` 配置

## 📞 技术支持

- 📧 **邮箱**: support@yunju-crm.com
- 📖 **文档**: [完整文档](./README.md)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-org/yunju-crm/issues)

---

**🎉 恭喜！你的云聚CRM系统已经启动成功！**