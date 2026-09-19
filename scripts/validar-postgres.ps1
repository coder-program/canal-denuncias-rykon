# Validacao PostgreSQL

Write-Host "`nVERIFICANDO POSTGRESQL...`n" -ForegroundColor Cyan

# 1. Servico PostgreSQL
Write-Host "1. Servico PostgreSQL..." -ForegroundColor White
$svc = Get-Service "*postgres*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc -and $svc.Status -eq 'Running') {
    Write-Host "   OK: $($svc.DisplayName) rodando" -ForegroundColor Green
} elseif ($svc) {
    Write-Host "   AVISO: Servico existe mas esta parado" -ForegroundColor Yellow
} else {
    Write-Host "   NAO ENCONTRADO" -ForegroundColor Red
}

# 2. Porta 5432
Write-Host "`n2. Porta 5432..." -ForegroundColor White
$port = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($port) {
    Write-Host "   OK: Porta acessivel" -ForegroundColor Green
} else {
    Write-Host "   NAO ACESSIVEL" -ForegroundColor Red
}

# 3. Comando psql
Write-Host "`n3. Comando psql..." -ForegroundColor White
try {
    $ver = & psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: $ver" -ForegroundColor Green
    } else {
        Write-Host "   NAO ENCONTRADO no PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   NAO ENCONTRADO no PATH" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor White
if ($svc -and $svc.Status -eq 'Running' -and $port) {
    Write-Host "POSTGRESQL VALIDADO!" -ForegroundColor Green
    Write-Host "Execute: .\configurar-postgres.ps1 -SenhaPostgres 'SUASENHA'`n" -ForegroundColor Yellow
} else {
    Write-Host "PostgreSQL nao esta totalmente configurado." -ForegroundColor Yellow
    Write-Host "Verifique a instalacao ou use SQLite: .\configurar-sqlite.ps1`n" -ForegroundColor Gray
}
