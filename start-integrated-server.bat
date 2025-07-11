@echo off
echo 🚀 启动集成服务器 (前端+后端)
echo.

echo 📍 当前目录: %CD%
echo.

echo 🔧 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo 📦 安装后端依赖...
    D:\DevTools\nvm\nodejs\npm.cmd install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 📁 检查前端文件...
if not exist "public\index.html" (
    echo ❌ 前端文件不存在，请先运行 integrate-frontend-to-backend.bat
    echo.
    echo 💡 运行以下命令集成前端:
    echo .\integrate-frontend-to-backend.bat
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 启动集成服务器...
echo.
echo 📋 服务信息:
echo - 前端页面: http://localhost:3001
echo - API接口: http://localhost:3001/api/*
echo - 健康检查: http://localhost:3001/health
echo.
echo 🔥 服务器启动中...
D:\DevTools\nvm\nodejs\npm.cmd run dev