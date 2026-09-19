# Script para iniciar Backend e Frontend simultaneamente

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   INICIANDO CANAL DE DENÚNCIAS        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar se Docker está rodando (PostgreSQL)
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Cyan
$pg = docker ps --filter "name=postgres-canal" --format "{{.Status}}" | Select-Object -First 1
if ($pg -match "Up") {
    Write-Host "   ✅ PostgreSQL está rodando`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL não está rodando. Iniciando..." -ForegroundColor Yellow
    docker start postgres-canal
    Start-Sleep -Seconds 3
    Write-Host "   ✅ PostgreSQL iniciado`n" -ForegroundColor Green
}

# Matar processos node existentes
Write-Host "🧹 Limpando processos Node.js anteriores..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Limpo`n" -ForegroundColor Green

# Caminho base do projeto (script agora vive em /scripts, raiz do projeto é um nível acima)
$projectPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Iniciar Backend em nova janela
Write-Host "🚀 Iniciando Backend (nova janela)..." -ForegroundColor Cyan
$backendPath = Join-Path $projectPath "apps\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Backend - Porta 3000';
Write-Host '`n╔════════════════════════════════════════╗' -ForegroundColor Red;
Write-Host '║     BACKEND NESTJS - PORTA 3000       ║' -ForegroundColor Yellow;
Write-Host '╚════════════════════════════════════════╝`n' -ForegroundColor Red;
cd '$backendPath';
npm run dev
"@

Start-Sleep -Seconds 3

# Iniciar Frontend em nova janela
Write-Host "🌐 Iniciando Frontend (nova janela)..." -ForegroundColor Cyan
$frontendPath = Join-Path $projectPath "apps\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Frontend - Porta 3001';
Write-Host '`n╔════════════════════════════════════════╗' -ForegroundColor Blue;
Write-Host '║    FRONTEND NEXT.JS - PORTA 3001      ║' -ForegroundColor Yellow;
Write-Host '╚════════════════════════════════════════╝`n' -ForegroundColor Blue;
cd '$frontendPath';
npm run dev -- --port 3001
"@

Write-Host "`n⏳ Aguardando servidores iniciarem..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar 15-20 segundos)`n" -ForegroundColor Gray
Start-Sleep -Seconds 15

# Verificar se estão online
Write-Host "🔍 Verificando status...`n" -ForegroundColor Cyan

$backendOnline = $false
$frontendOnline = $false

try {
    $null = Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 5
    Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
    $backendOnline = $true
} catch {
    Write-Host "   ⚠️  Backend: Ainda iniciando..." -ForegroundColor Yellow
}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5
    Write-Host "   ✅ Frontend: ONLINE" -ForegroundColor Green
    $frontendOnline = $true
} catch {
    Write-Host "   ⚠️  Frontend: Ainda iniciando..." -ForegroundColor Yellow
}

Write-Host ""

if ($backendOnline -and $frontendOnline) {
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     ✅ SISTEMA PRONTO!                ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host "`n🌐 Acesse: http://localhost:3001/login" -ForegroundColor Cyan
    Write-Host "📧 Login: admin@empresa.com" -ForegroundColor White
    Write-Host "🔑 Senha: Demo123!@`n" -ForegroundColor White
    
    # Abrir navegador automaticamente
    Start-Process "http://localhost:3001/login"
} else {
    Write-Host "⚠️  Alguns serviços ainda estão iniciando." -ForegroundColor Yellow
    Write-Host "   Aguarde mais 10-15 segundos e acesse:" -ForegroundColor Gray
    Write-Host "   http://localhost:3001/login`n" -ForegroundColor Cyan
    
    Write-Host "💡 Aguardando mais 10 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "`n🔍 Verificando novamente...`n" -ForegroundColor Cyan
    
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 3
        Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Backend: OFFLINE - Verifique a janela do Backend" -ForegroundColor Red
    }
    
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3
        Write-Host "   ✅ Frontend: ONLINE`n" -ForegroundColor Green
        Start-Process "http://localhost:3001/login"
    } catch {
        Write-Host "   ❌ Frontend: OFFLINE - Verifique a janela do Frontend`n" -ForegroundColor Red
    }
}

Write-Host "💡 IMPORTANTE: Não feche as janelas do Backend e Frontend!" -ForegroundColor Yellow
Write-Host "   Minimize-as se precisar, mas não feche.`n" -ForegroundColor Gray

Write-Host "📚 Documentação:" -ForegroundColor Cyan
Write-Host "   • COMO_INICIAR_SERVIDORES.md - Guia completo" -ForegroundColor Gray
Write-Host "   • TESTE_FLUXO_COMPLETO.md - Como testar o sistema`n" -ForegroundColor Gray
