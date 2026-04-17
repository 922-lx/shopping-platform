@echo off
chcp 65001 >nul 2>&1
title 购物平台Demo - 一键启动

echo ========================================
echo    购物平台系统 Demo 启动器
echo ========================================
echo.

:: 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js！
    pause
    exit /b 1
)

echo [1/3] 正在启动后端服务器 (端口 3001)...
start "后端-Server" cmd /c "cd /d "%~dp0server" && node server.js"

echo [2/3] 正在启动前端开发服务器 (端口 5173)...
start "前端-Vite" cmd /c "cd /d "%~dp0client" && npx vite --host"

timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo   系统已启动！
echo.
echo   前端地址: http://localhost:5173
echo   后端地址: http://localhost:3001
echo.
echo   管理员账号: admin / 123456
echo   普通用户:   user1  / 123456
echo ========================================
echo.
echo 按任意键打开浏览器访问...
pause >nul

start http://localhost:5173

echo.
echo 提示：关闭此窗口不会停止服务。
echo      如需停止服务，请手动关闭上方两个命令行窗口。
echo.
pause
