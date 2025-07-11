@echo off
echo 🔍 检查 AgentHeader.tsx 语法
echo.

cd frontend
echo 当前目录: %CD%

echo 检查 TypeScript 语法...
D:\DevTools\nvm\nodejs\npx.cmd tsc --noEmit --skipLibCheck src/components/chat/AgentHeader.tsx

if %errorlevel% equ 0 (
    echo ✅ AgentHeader.tsx 语法检查通过
) else (
    echo ❌ AgentHeader.tsx 存在语法错误
)

echo.
echo 检查整个前端项目...
D:\DevTools\nvm\nodejs\npx.cmd tsc --noEmit --skipLibCheck

if %errorlevel% equ 0 (
    echo ✅ 整个前端项目语法检查通过
) else (
    echo ❌ 前端项目存在语法错误
)

echo.
pause