@echo off
echo.
echo ========================================
echo    INICIANDO BACKEND E FRONTEND
echo ========================================
echo.

cd /d "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"

echo [1/3] Parando processos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo       OK - Processos parados
echo.

echo [2/3] Iniciando Backend (Porta 3000)...
start "BACKEND - Porta 3000" cmd /k "cd apps\backend && echo Iniciando backend... && npm run dev"
echo       Terminal do backend aberto
echo       Aguardando 15 segundos...
timeout /t 15 /nobreak
echo.

echo [3/3] Iniciando Frontend (Porta 3001)...
start "FRONTEND - Porta 3001" cmd /k "cd apps\frontend && echo Iniciando frontend... && npm run dev -- -p 3001"
echo       Terminal do frontend aberto
echo.

echo ========================================
echo    AMBIENTE INICIADO!
echo ========================================
echo.
echo Backend:  http://localhost:3000/api/v1
echo Frontend: http://localhost:3001/login
echo.
echo Aguarde os terminais carregarem...
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:3001/login

echo.
echo Navegador aberto!
echo.
pause
