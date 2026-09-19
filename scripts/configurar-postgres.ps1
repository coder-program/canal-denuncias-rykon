# Script para configurar PostgreSQL local após instalação
param(
    [Parameter(Mandatory=$true)]
    [string]$SenhaPostgres
)

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CONFIGURANDO POSTGRESQL LOCAL        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$projectPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendPath = Join-Path $projectPath "apps\backend"
$envFile = Join-Path $backendPath ".env"

# Verificar se PostgreSQL está rodando
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Cyan
try {
    $pgService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pgService.Status -eq 'Running') {
        Write-Host "   ✅ PostgreSQL está rodando`n" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL não está rodando. Iniciando..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Start-Sleep -Seconds 3
        Write-Host "   ✅ PostgreSQL iniciado`n" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar o serviço (pode ser normal)" -ForegroundColor Yellow
    Write-Host "   Continuando configuração...`n" -ForegroundColor Gray
}

# Atualizar DATABASE_URL no .env
Write-Host "📝 Atualizando arquivo .env..." -ForegroundColor Cyan
$envContent = Get-Content $envFile -Raw
$novaUrl = "DATABASE_URL=`"postgresql://postgres:$SenhaPostgres@localhost:5432/canal_denuncia?schema=public`""

# Substituir a linha DATABASE_URL
$envContent = $envContent -replace 'DATABASE_URL="postgresql://.*"', $novaUrl

# Salvar arquivo
Set-Content -Path $envFile -Value $envContent -NoNewline
Write-Host "   ✅ Arquivo .env atualizado`n" -ForegroundColor Green

# Criar banco de dados se não existir
Write-Host "🗄️  Criando banco de dados (se não existir)..." -ForegroundColor Cyan
$env:PGPASSWORD = $SenhaPostgres
$createDbCommand = "CREATE DATABASE canal_denuncia;"
$null = & "psql" -U postgres -h localhost -c $createDbCommand 2>&1
Write-Host "   ✅ Banco pronto`n" -ForegroundColor Green

# Executar migrations do Prisma
Write-Host "🔄 Executando migrations do Prisma..." -ForegroundColor Cyan
Push-Location $backendPath
try {
    Write-Host "   → Gerando Prisma Client..." -ForegroundColor Gray
    npm run prisma:generate
    
    Write-Host "   → Aplicando migrations..." -ForegroundColor Gray
    npx prisma migrate deploy
    
    Write-Host "   → Populando banco com dados iniciais (seed)..." -ForegroundColor Gray
    npm run prisma:seed
    
    Write-Host "   ✅ Banco configurado e populado`n" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erro ao executar migrations: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

# Limpar processos node anteriores
Write-Host "🧹 Limpando processos anteriores..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Limpo`n" -ForegroundColor Green

# Iniciar Backend
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Backend - PostgreSQL Local - Porta 3000';
Write-Host '`n╔════════════════════════════════════════╗' -ForegroundColor Red;
Write-Host '║   BACKEND - POSTGRESQL LOCAL          ║' -ForegroundColor Yellow;
Write-Host '╚════════════════════════════════════════╝`n' -ForegroundColor Red;
cd '$backendPath';
npm run dev
"@

Start-Sleep -Seconds 5

# Verificar se Frontend já está rodando
Write-Host "🌐 Verificando Frontend..." -ForegroundColor Cyan
$frontendRunning = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✅ Frontend já está rodando`n" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "   ⚠️  Frontend não está rodando. Iniciando..." -ForegroundColor Yellow
    $frontendPath = Join-Path $projectPath "apps\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Frontend - Porta 3001';
Write-Host '`n╔════════════════════════════════════════╗' -ForegroundColor Blue;
Write-Host '║    FRONTEND NEXT.JS - PORTA 3001      ║' -ForegroundColor Yellow;
Write-Host '╚════════════════════════════════════════╝`n' -ForegroundColor Blue;
cd '$frontendPath';
npm run dev -- --port 3001
"@
}

Write-Host "`n⏳ Aguardando Backend conectar ao banco..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status
Write-Host "`n🔍 Verificando status...`n" -ForegroundColor Cyan
$backendOnline = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -TimeoutSec 3 -UseBasicParsing
    Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
    $backendOnline = $true
} catch {
    Write-Host "   ⚠️  Backend: Ainda iniciando (aguarde mais 10s)" -ForegroundColor Yellow
}

if (-not $frontendRunning) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3 -UseBasicParsing
        Write-Host "   ✅ Frontend: ONLINE" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Frontend: Ainda iniciando" -ForegroundColor Yellow
    }
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ CONFIGURAÇÃO CONCLUÍDA!        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 CREDENCIAIS DE TESTE:" -ForegroundColor Cyan
Write-Host "   🌐 URL: http://localhost:3001/login" -ForegroundColor White
Write-Host "   📧 Email: admin@empresa.com" -ForegroundColor White
Write-Host "   🔑 Senha: Demo123!@`n" -ForegroundColor White

if ($backendOnline) {
    Start-Process "http://localhost:3001/login"
    Write-Host "🎉 Navegador aberto automaticamente!`n" -ForegroundColor Green
} else {
    Write-Host "💡 Aguarde mais 10-15 segundos e acesse o link acima`n" -ForegroundColor Yellow
}
