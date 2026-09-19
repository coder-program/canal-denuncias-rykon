# Configurar SQLite e iniciar backend

Write-Host "`nCONFIGURANDO SQLITE...`n" -ForegroundColor Cyan

$projectPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendPath = Join-Path $projectPath "apps\backend"
$schemaFile = Join-Path $backendPath "prisma\schema.prisma"
$envFile = Join-Path $backendPath ".env"

# Backup schema
Write-Host "Fazendo backup..." -ForegroundColor White
Copy-Item $schemaFile "$schemaFile.backup" -Force -ErrorAction SilentlyContinue

# Atualizar para SQLite
Write-Host "Configurando Prisma para SQLite..." -ForegroundColor White
$schema = Get-Content $schemaFile -Raw
$schema = $schema -replace 'provider\s*=\s*"postgresql"', 'provider = "sqlite"'
Set-Content -Path $schemaFile -Value $schema -NoNewline

# Atualizar .env
Write-Host "Atualizando .env..." -ForegroundColor White
$env = Get-Content $envFile -Raw
$env = $env -replace 'DATABASE_URL="postgresql://.*"', 'DATABASE_URL="file:./dev.db"'
Set-Content -Path $envFile -Value $env -NoNewline

# Limpar migrations antigas
Write-Host "Limpando migrations antigas..." -ForegroundColor White
$migrations = Join-Path $backendPath "prisma\migrations"
if (Test-Path $migrations) {
    Remove-Item $migrations -Recurse -Force -ErrorAction SilentlyContinue
}

# Configurar banco
Write-Host "`nConfigurando banco de dados...`n" -ForegroundColor Cyan
Push-Location $backendPath
try {
    Write-Host "  Gerando Prisma Client..." -ForegroundColor Gray
    npx prisma generate | Out-Null
    
    Write-Host "  Criando banco e tabelas..." -ForegroundColor Gray
    npx prisma db push --skip-generate | Out-Null
    
    Write-Host "  Populando dados iniciais..." -ForegroundColor Gray
    npm run prisma:seed 2>&1 | Out-Null
    
    Write-Host "`nSQLite configurado com sucesso!`n" -ForegroundColor Green
} catch {
    Write-Host "  Aviso: $_" -ForegroundColor Yellow
} finally {
    Pop-Location
}

# Limpar processos antigos
Write-Host "Limpando processos anteriores..." -ForegroundColor White
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Iniciar Backend
Write-Host "`nIniciando Backend com SQLite...`n" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Backend - SQLite - Porta 3000';
Write-Host 'BACKEND - SQLITE';
Write-Host 'Porta 3000';
Write-Host '';
cd '$backendPath';
npm run dev
"@

Start-Sleep -Seconds 5

# Verificar Frontend
Write-Host "Verificando Frontend..." -ForegroundColor White
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 2 -UseBasicParsing
    Write-Host "Frontend ja esta rodando`n" -ForegroundColor Green
} catch {
    Write-Host "Iniciando Frontend...`n" -ForegroundColor Yellow
    $frontendPath = Join-Path $projectPath "apps\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Frontend - Porta 3001';
Write-Host 'FRONTEND - NEXT.JS';
Write-Host 'Porta 3001';
Write-Host '';
cd '$frontendPath';
npm run dev -- --port 3001
"@
}

Write-Host "Aguardando Backend conectar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status
Write-Host "`nVerificando status...`n" -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -TimeoutSec 3 -UseBasicParsing
    Write-Host "Backend: ONLINE`n" -ForegroundColor Green
    $backendOnline = $true
} catch {
    Write-Host "Backend: Ainda iniciando (aguarde mais 10s)`n" -ForegroundColor Yellow
    $backendOnline = $false
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "SISTEMA COM SQLITE PRONTO!" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "CREDENCIAIS DE TESTE:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3001/login" -ForegroundColor White
Write-Host "  Email: admin@empresa.com" -ForegroundColor White
Write-Host "  Senha: Demo123!@`n" -ForegroundColor White

Write-Host "BANCO DE DADOS:" -ForegroundColor Cyan
Write-Host "  Arquivo: apps\backend\dev.db" -ForegroundColor White
Write-Host "  Tipo: SQLite (arquivo local)`n" -ForegroundColor White

if ($backendOnline) {
    Start-Process "http://localhost:3001/login"
    Write-Host "Navegador aberto automaticamente!`n" -ForegroundColor Green
} else {
    Write-Host "Aguarde mais 10 segundos e acesse:`n" -ForegroundColor Yellow
    Write-Host "http://localhost:3001/login`n" -ForegroundColor Cyan
}
