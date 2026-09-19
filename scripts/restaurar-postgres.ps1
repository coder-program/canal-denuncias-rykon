# Script para restaurar configuração PostgreSQL após usar SQLite
param(
    [Parameter(Mandatory=$true)]
    [string]$SenhaPostgres
)

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESTAURANDO POSTGRESQL               ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$projectPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendPath = Join-Path $projectPath "apps\backend"
$schemaFile = Join-Path $backendPath "prisma\schema.prisma"
$schemaBackup = "$schemaFile.backup"
$envFile = Join-Path $backendPath ".env"

# Restaurar schema.prisma do backup
Write-Host "📋 Restaurando schema.prisma..." -ForegroundColor Cyan
if (Test-Path $schemaBackup) {
    Copy-Item $schemaBackup $schemaFile -Force
    Write-Host "   ✅ Schema restaurado do backup`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backup não encontrado, atualizando manualmente..." -ForegroundColor Yellow
    $schemaContent = Get-Content $schemaFile -Raw
    $schemaContent = $schemaContent -replace 'provider\s*=\s*"sqlite"', 'provider = "postgresql"'
    Set-Content -Path $schemaFile -Value $schemaContent -NoNewline
    Write-Host "   ✅ Schema atualizado`n" -ForegroundColor Green
}

# Atualizar .env
Write-Host "📝 Atualizando configuração para PostgreSQL..." -ForegroundColor Cyan
$envContent = Get-Content $envFile -Raw
$novaUrl = "DATABASE_URL=`"postgresql://postgres:$SenhaPostgres@localhost:5432/canal_denuncia?schema=public`""
$envContent = $envContent -replace 'DATABASE_URL="file:.*"', $novaUrl
Set-Content -Path $envFile -Value $envContent -NoNewline
Write-Host "   ✅ Configuração atualizada`n" -ForegroundColor Green

# Criar banco de dados se não existir
Write-Host "🗄️  Configurando PostgreSQL..." -ForegroundColor Cyan
$env:PGPASSWORD = $SenhaPostgres
$createDbCommand = "CREATE DATABASE canal_denuncia;"
$null = & "psql" -U postgres -h localhost -c $createDbCommand 2>&1
Write-Host "   ✅ Banco pronto`n" -ForegroundColor Green

# Limpar migrations SQLite
Write-Host "🧹 Limpando configuração SQLite..." -ForegroundColor Cyan
$migrationsPath = Join-Path $backendPath "prisma\migrations"
if (Test-Path $migrationsPath) {
    Remove-Item $migrationsPath -Recurse -Force -ErrorAction SilentlyContinue
}
$sqliteDb = Join-Path $backendPath "dev.db"
if (Test-Path $sqliteDb) {
    Remove-Item $sqliteDb -Force -ErrorAction SilentlyContinue
}
Write-Host "   ✅ Limpo`n" -ForegroundColor Green

# Executar migrations do Prisma
Write-Host "🔄 Aplicando migrations PostgreSQL..." -ForegroundColor Cyan
Push-Location $backendPath
try {
    npm run prisma:generate
    npx prisma migrate deploy
    npm run prisma:seed
    Write-Host "   ✅ PostgreSQL configurado!`n" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erro: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

# Reiniciar Backend
Write-Host "🔄 Reiniciando Backend..." -ForegroundColor Cyan
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'Backend - PostgreSQL - Porta 3000';
Write-Host '`n╔════════════════════════════════════════╗' -ForegroundColor Red;
Write-Host '║   BACKEND - POSTGRESQL RESTAURADO     ║' -ForegroundColor Yellow;
Write-Host '╚════════════════════════════════════════╝`n' -ForegroundColor Red;
cd '$backendPath';
npm run dev
"@

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ POSTGRESQL RESTAURADO COM SUCESSO! ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "💡 Sistema agora está usando PostgreSQL novamente!`n" -ForegroundColor Cyan
