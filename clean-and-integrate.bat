@echo off
echo 🧹 清理并重新集成前端
echo.

echo 📁 1. 清理旧的前端文件...
if exist "backend\public" (
    echo 删除旧的 backend\public 目录...
    rmdir /s /q "backend\public"
    echo ✅ 旧文件已清理
) else (
    echo ℹ️  没有发现旧文件
)

echo.
echo 🔄 2. 重新安装前端依赖...
cd frontend
echo 当前目录: %CD%

if exist "node_modules" (
    echo 删除旧的 node_modules...
    rmdir /s /q "node_modules"
)

if exist "dist" (
    echo 删除旧的 dist 目录...
    rmdir /s /q "dist"
)

echo 安装前端依赖...
D:\DevTools\nvm\nodejs\npm.cmd install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🏗️ 3. 构建前端项目...
D:\DevTools\nvm\nodejs\npm.cmd run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

echo.
echo 📁 4. 检查构建结果...
if not exist "dist" (
    echo ❌ 构建目录不存在
    pause
    exit /b 1
)

echo.
echo 🚚 5. 复制前端文件到后端...
cd ..
echo 当前目录: %CD%

echo 复制前端文件...
xcopy "frontend\dist" "backend\public" /E /I /Y
if %errorlevel% neq 0 (
    echo ❌ 文件复制失败
    pause
    exit /b 1
)

echo.
echo ✅ 清理和集成完成！
echo.
echo 📋 新的文件结构:
dir "backend\public" /b
echo.
echo 🚀 现在可以启动服务器:
echo .\start-integrated-server.bat
echo.
pause