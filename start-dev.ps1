# 🚀 Script para Iniciar Backend e Frontend

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Both
)

$backendPath = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
$frontendPath = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"

function Start-Backend {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   INICIANDO BACKEND (Porta 3000)" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Verificar se a porta está ocupada
    $port3000 = netstat -ano | findstr :3000
    if ($port3000) {
        Write-Host "AVISO: Porta 3000 ja esta em uso!" -ForegroundColor Yellow
        Write-Host "Deseja matar o processo e reiniciar? (S/N)" -ForegroundColor Yellow
        $resposta = Read-Host
        if ($resposta -eq 'S' -or $resposta -eq 's') {
            Stop-Process -Name node -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        } else {
            Write-Host "Operacao cancelada" -ForegroundColor Red
            return
        }
    }
    
    # Ir para pasta do backend
    Set-Location $backendPath
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias..." -ForegroundColor Yellow
        npm install
    }
    
    # Iniciar backend
    Write-Host "`nIniciando backend em modo desenvolvimento..." -ForegroundColor Cyan
    Write-Host "Aguarde ate ver: 'Application is running on: http://localhost:3000'`n" -ForegroundColor Green
    
    npm run dev
}

function Start-Frontend {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   INICIANDO FRONTEND (Porta 3001)" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Ir para pasta do frontend
    Set-Location $frontendPath
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias..." -ForegroundColor Yellow
        npm install
    }
    
    # Limpar cache
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Iniciar frontend na porta 3001
    Write-Host "`nIniciando frontend na porta 3001..." -ForegroundColor Cyan
    Write-Host "Acesse: http://localhost:3001`n" -ForegroundColor Green
    
    npm run dev -- -p 3001
}

function Start-Both {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   INICIANDO BACKEND E FRONTEND" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "  1. Backend: http://localhost:3000/api/v1" -ForegroundColor White
    Write-Host "  2. Frontend: http://localhost:3001" -ForegroundColor White
    Write-Host "`nVoce precisa abrir 2 terminais separados:" -ForegroundColor Yellow
    Write-Host "`nTerminal 1 (Backend):" -ForegroundColor Cyan
    Write-Host "  cd apps\backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Cyan
    Write-Host "  cd apps\frontend" -ForegroundColor White
    Write-Host "  npm run dev -- -p 3001`n" -ForegroundColor White
    
    Write-Host "Deseja iniciar o backend agora? (S/N)" -ForegroundColor Yellow
    $resposta = Read-Host
    if ($resposta -eq 'S' -or $resposta -eq 's') {
        Start-Backend
    }
}

# Executar baseado nos parametros
if ($Backend) {
    Start-Backend
} elseif ($Frontend) {
    Start-Frontend
} elseif ($Both) {
    Start-Both
} else {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   USO DO SCRIPT" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "Opcoes:" -ForegroundColor Yellow
    Write-Host "  .\start-dev.ps1 -Backend   # Iniciar apenas backend" -ForegroundColor White
    Write-Host "  .\start-dev.ps1 -Frontend  # Iniciar apenas frontend" -ForegroundColor White
    Write-Host "  .\start-dev.ps1 -Both      # Instrucoes para ambos`n" -ForegroundColor White
    
    Write-Host "Exemplo:" -ForegroundColor Green
    Write-Host "  .\start-dev.ps1 -Backend`n" -ForegroundColor Cyan
}
