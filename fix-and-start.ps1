# 🚀 SOLUÇÃO RÁPIDA - Iniciar Backend e Frontend

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "   PROBLEMA IDENTIFICADO!" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "Frontend estava rodando na porta 3000" -ForegroundColor Yellow
Write-Host "Backend precisa da porta 3000`n" -ForegroundColor Yellow

Write-Host "SOLUCAO:" -ForegroundColor Green
Write-Host "  1. Frontend -> Porta 3001" -ForegroundColor White
Write-Host "  2. Backend -> Porta 3000`n" -ForegroundColor White

# Parar todos os processos Node
Write-Host "[1/4] Parando processos Node.js..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "      ✓ Processos encerrados`n" -ForegroundColor Green

# Verificar se as portas estão livres
Write-Host "[2/4] Verificando portas..." -ForegroundColor Cyan
$port3000 = netstat -ano | findstr :3000
$port3001 = netstat -ano | findstr :3001

if (-not $port3000) {
    Write-Host "      ✓ Porta 3000 livre" -ForegroundColor Green
} else {
    Write-Host "      ✗ Porta 3000 ainda ocupada" -ForegroundColor Red
}

if (-not $port3001) {
    Write-Host "      ✓ Porta 3001 livre`n" -ForegroundColor Green
} else {
    Write-Host "      ✗ Porta 3001 ainda ocupada`n" -ForegroundColor Red
}

Write-Host "[3/4] Preparando ambiente..." -ForegroundColor Cyan

# Atualizar .env.local para apontar para porta 3000
$envContent = @"
# Backend API (NestJS) - Porta 3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Frontend rodará na porta 3001
"@

$envPath = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend\.env.local"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
Write-Host "      ✓ .env.local atualizado`n" -ForegroundColor Green

Write-Host "[4/4] Proximo passo:" -ForegroundColor Cyan
Write-Host "`n┌─────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│  ABRA 2 TERMINAIS SEPARADOS:                   │" -ForegroundColor Yellow
Write-Host "├─────────────────────────────────────────────────┤" -ForegroundColor Yellow
Write-Host "│                                                 │" -ForegroundColor Yellow
Write-Host "│  TERMINAL 1 (Backend):                         │" -ForegroundColor White
Write-Host "│  ──────────────────────                        │" -ForegroundColor Gray
Write-Host "│  cd apps\backend                               │" -ForegroundColor Cyan
Write-Host "│  npm run dev                                   │" -ForegroundColor Cyan
Write-Host "│                                                 │" -ForegroundColor Yellow
Write-Host "│  Aguarde: 'Application is running...'          │" -ForegroundColor Green
Write-Host "│                                                 │" -ForegroundColor Yellow
Write-Host "│  TERMINAL 2 (Frontend):                        │" -ForegroundColor White
Write-Host "│  ───────────────────────                       │" -ForegroundColor Gray
Write-Host "│  cd apps\frontend                              │" -ForegroundColor Cyan
Write-Host "│  npm run dev -- -p 3001                        │" -ForegroundColor Cyan
Write-Host "│                                                 │" -ForegroundColor Yellow
Write-Host "│  Acesse: http://localhost:3001/login           │" -ForegroundColor Green
Write-Host "│                                                 │" -ForegroundColor Yellow
Write-Host "└─────────────────────────────────────────────────┘" -ForegroundColor Yellow

Write-Host "`n✅ AMBIENTE PRONTO PARA INICIAR!`n" -ForegroundColor Green

Write-Host "Deseja abrir os terminais automaticamente? (S/N): " -ForegroundColor Yellow -NoNewline
$resposta = Read-Host

if ($resposta -eq 'S' -or $resposta -eq 's') {
    Write-Host "`nAbrindo terminais..." -ForegroundColor Cyan
    
    # Terminal 1 - Backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend'; Write-Host 'BACKEND - Porta 3000' -ForegroundColor Green; Write-Host 'Iniciando...' -ForegroundColor Yellow; npm run dev"
    
    Start-Sleep -Seconds 2
    
    # Terminal 2 - Frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend'; Write-Host 'FRONTEND - Porta 3001' -ForegroundColor Cyan; Write-Host 'Aguarde o backend iniciar...' -ForegroundColor Yellow; Start-Sleep -Seconds 10; npm run dev -- -p 3001"
    
    Write-Host "`n✅ Terminais abertos! Aguarde a inicializacao...`n" -ForegroundColor Green
    Write-Host "Acesse: http://localhost:3001/login`n" -ForegroundColor Cyan
}
