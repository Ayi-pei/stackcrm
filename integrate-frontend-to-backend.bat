@echo off
echo 🔧 前端打包集成到后端脚本
echo.

echo 📦 1. 安装前端依赖...
cd frontend
D:\DevTools\nvm\nodejs\npm.cmd install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🏗️ 2. 构建前端项目...
D:\DevTools\nvm\nodejs\npm.cmd run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

echo.
echo 📁 3. 检查构建结果...
if not exist "dist" (
    echo ❌ 构建目录不存在
    pause
    exit /b 1
)

echo.
echo 🚚 4. 复制前端文件到后端...
cd ..
if exist "backend\public" (
    echo 删除旧的前端文件...
    rmdir /s /q "backend\public"
    if %errorlevel% neq 0 (
        echo ⚠️  删除旧文件时出现警告，继续执行...
    )
)

echo 创建 backend\public 目录...
if not exist "backend\public" (
    mkdir "backend\public"
)

echo 复制新的前端文件...
xcopy "frontend\dist\*" "backend\public" /E /I /Y
if %errorlevel% neq 0 (
    echo ❌ 文件复制失败
    pause
    exit /b 1
)

echo.
echo ✅ 前端集成完成！
echo.
echo 📋 集成结果:
echo - 前端文件位置: backend\public\
echo - 后端服务器将自动提供前端页面
echo - 访问地址: http://localhost:3001
echo.
echo 🚀 现在可以只启动后端服务器:
echo cd backend
echo D:\DevTools\nvm\nodejs\npm.cmd run dev
echo.
pause