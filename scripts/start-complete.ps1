# 🚀 Iniciar Backend e Frontend - Versão Melhorada

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO AMBIENTE COMPLETO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$backendPath = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
$frontendPath = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"

# Função para verificar se o backend está online
function Test-BackendOnline {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET -TimeoutSec 2 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Função para aguardar o backend
function Wait-BackendReady {
    param(
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )
    
    Write-Host "`nAguardando backend iniciar..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Write-Host "  Tentativa $i/$MaxAttempts..." -ForegroundColor Gray -NoNewline
        
        if (Test-BackendOnline) {
            Write-Host " ✓ ONLINE!" -ForegroundColor Green
            return $true
        }
        
        Write-Host " aguardando..." -ForegroundColor Yellow
        Start-Sleep -Seconds $DelaySeconds
    }
    
    Write-Host "`n✗ Backend nao iniciou apos $($MaxAttempts * $DelaySeconds) segundos" -ForegroundColor Red
    return $false
}

# PASSO 1: Parar processos existentes
Write-Host "[1/5] Parando processos Node.js..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "      ✓ Processos encerrados`n" -ForegroundColor Green

# PASSO 2: Verificar portas
Write-Host "[2/5] Verificando portas..." -ForegroundColor Cyan
$port3000 = netstat -ano | findstr ":3000.*LISTENING"
$port3001 = netstat -ano | findstr ":3001.*LISTENING"

if ($port3000) {
    Write-Host "      ✗ Porta 3000 ainda ocupada!" -ForegroundColor Red
    Write-Host "      Execute: Stop-Process -Name node -Force" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "      ✓ Porta 3000 livre (Backend)" -ForegroundColor Green
}

if ($port3001) {
    Write-Host "      ! Porta 3001 ocupada, liberando..." -ForegroundColor Yellow
    $processId = ($port3001 -split '\s+')[-1]
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
Write-Host "      ✓ Porta 3001 livre (Frontend)`n" -ForegroundColor Green

# PASSO 3: Verificar dependências
Write-Host "[3/5] Verificando dependencias..." -ForegroundColor Cyan

# Backend
if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "      Instalando dependencias do backend..." -ForegroundColor Yellow
    Set-Location $backendPath
    npm install | Out-Null
    Write-Host "      ✓ Backend dependencies instaladas" -ForegroundColor Green
} else {
    Write-Host "      ✓ Backend dependencies OK" -ForegroundColor Green
}

# Frontend
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "      Instalando dependencias do frontend..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install | Out-Null
    Write-Host "      ✓ Frontend dependencies instaladas" -ForegroundColor Green
} else {
    Write-Host "      ✓ Frontend dependencies OK" -ForegroundColor Green
}

# Limpar cache do frontend
Set-Location $frontendPath
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      ✓ Cache do frontend limpo`n" -ForegroundColor Green

# PASSO 4: Iniciar Backend
Write-Host "[4/5] Iniciando Backend (Porta 3000)..." -ForegroundColor Cyan
Write-Host "      Abrindo terminal do backend...`n" -ForegroundColor Gray

# Abrir terminal do backend com mensagens coloridas
$backendCommand = @"
`$Host.UI.RawUI.WindowTitle = 'BACKEND - Porta 3000';
Clear-Host;
Write-Host '';
Write-Host '========================================' -ForegroundColor Cyan;
Write-Host '   BACKEND NESTJS - PORTA 3000' -ForegroundColor Green;
Write-Host '========================================' -ForegroundColor Cyan;
Write-Host '';
Write-Host 'Iniciando servidor NestJS...' -ForegroundColor Yellow;
Write-Host 'Aguarde: Application is running...' -ForegroundColor Gray;
Write-Host '';
cd '$backendPath';
npm run dev;
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# PASSO 5: Aguardar Backend e Iniciar Frontend
Write-Host "[5/5] Aguardando backend ficar online..." -ForegroundColor Cyan

if (Wait-BackendReady -MaxAttempts 30 -DelaySeconds 2) {
    Write-Host "`n✓ Backend esta ONLINE em http://localhost:3000/api/v1`n" -ForegroundColor Green
    
    Write-Host "Iniciando Frontend (Porta 3001)..." -ForegroundColor Cyan
    Write-Host "Abrindo terminal do frontend...`n" -ForegroundColor Gray
    
    # Abrir terminal do frontend
    $frontendCommand = @"
`$Host.UI.RawUI.WindowTitle = 'FRONTEND - Porta 3001';
Clear-Host;
Write-Host '';
Write-Host '========================================' -ForegroundColor Cyan;
Write-Host '   FRONTEND NEXT.JS - PORTA 3001' -ForegroundColor Cyan;
Write-Host '========================================' -ForegroundColor Cyan;
Write-Host '';
Write-Host 'Backend: http://localhost:3000/api/v1 ✓' -ForegroundColor Green;
Write-Host 'Frontend: http://localhost:3001' -ForegroundColor Yellow;
Write-Host '';
Write-Host 'Iniciando servidor Next.js...' -ForegroundColor Yellow;
Write-Host '';
cd '$frontendPath';
npm run dev -- -p 3001;
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand
    
    Start-Sleep -Seconds 5
    
    # Resumo final
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✓ AMBIENTE INICIADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "SERVICOS RODANDO:`n" -ForegroundColor Yellow
    Write-Host "  Backend:  http://localhost:3000/api/v1" -ForegroundColor White
    Write-Host "  Frontend: http://localhost:3001`n" -ForegroundColor White
    
    Write-Host "ACESSE:`n" -ForegroundColor Yellow
    Write-Host "  Login:     http://localhost:3001/login" -ForegroundColor Cyan
    Write-Host "  Dashboard: http://localhost:3001/dashboard`n" -ForegroundColor Cyan
    
    Write-Host "CREDENCIAIS DE TESTE:`n" -ForegroundColor Yellow
    Write-Host "  Email: admin@empresa.com" -ForegroundColor White
    Write-Host "  Senha: Admin@123`n" -ForegroundColor White
    
    Write-Host "Pressione qualquer tecla para abrir o navegador..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    
    # Abrir navegador
    Start-Process "http://localhost:3001/login"
    
} else {
    Write-Host "`n✗ ERRO: Backend nao iniciou!" -ForegroundColor Red
    Write-Host "`nVERIFIQUE:" -ForegroundColor Yellow
    Write-Host "  1. Abra o terminal do backend manualmente" -ForegroundColor White
    Write-Host "  2. cd apps\backend" -ForegroundColor Cyan
    Write-Host "  3. npm run dev" -ForegroundColor Cyan
    Write-Host "  4. Verifique erros no console`n" -ForegroundColor White
    
    Write-Host "ERROS COMUNS:" -ForegroundColor Yellow
    Write-Host "  - Banco de dados nao esta rodando (PostgreSQL)" -ForegroundColor White
    Write-Host "  - Arquivo .env faltando no backend" -ForegroundColor White
    Write-Host "  - Dependencias nao instaladas`n" -ForegroundColor White
}
