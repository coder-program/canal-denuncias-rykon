# 🚀 Script de Instalação Automática - Pré-requisitos
# Canal de Denúncias - Instalador Completo

#Requires -RunAsAdministrator

$ErrorActionPreference = "Continue"

# Cores
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Step { param($msg) Write-Host "`n$msg" -ForegroundColor Yellow }

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "║   INSTALADOR AUTOMÁTICO - CANAL DE DENÚNCIAS        ║" -ForegroundColor Yellow
Write-Host "║   Instalará: Node.js + Docker Desktop + winget      ║" -ForegroundColor White
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se está como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "❌ Este script precisa ser executado como Administrador!"
    Write-Warning ""
    Write-Warning "Clique com botão direito no PowerShell e escolha:"
    Write-Warning "'Executar como Administrador'"
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Success "✅ Executando como Administrador`n"

# Verificar/Instalar winget (Windows Package Manager)
Write-Step "🔍 Verificando winget (Windows Package Manager)..."

try {
    $wingetVersion = winget --version 2>$null
    Write-Success "   ✓ winget já instalado: $wingetVersion"
} catch {
    Write-Warning "   ⚠ winget não encontrado. Tentando instalar..."
    
    try {
        # Instalar App Installer (que inclui winget)
        Write-Info "   Baixando App Installer..."
        $url = "https://aka.ms/getwinget"
        $output = "$env:TEMP\Microsoft.DesktopAppInstaller.msixbundle"
        
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Add-AppxPackage -Path $output
        
        Write-Success "   ✓ winget instalado com sucesso!"
    } catch {
        Write-Warning "   ⚠ Não foi possível instalar winget automaticamente"
        Write-Warning "   Continuando com método alternativo..."
    }
}

# Verificar Node.js
Write-Step "🔍 Verificando Node.js..."

$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Success "   ✓ Node.js já instalado: $nodeVersion"
    Write-Success "   ✓ npm: $npmVersion"
    $nodeInstalled = $true
} catch {
    Write-Warning "   ✗ Node.js não está instalado"
}

# Instalar Node.js se necessário
if (-not $nodeInstalled) {
    Write-Step "📦 Instalando Node.js LTS..."
    
    # Tentar com winget primeiro
    try {
        Write-Info "   Método 1: Instalando via winget..."
        winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "   ✓ Node.js instalado via winget!"
            $nodeInstalled = $true
        }
    } catch {
        Write-Warning "   ⚠ Falha no método 1"
    }
    
    # Método alternativo: Download direto
    if (-not $nodeInstalled) {
        Write-Info "   Método 2: Download direto do instalador..."
        
        try {
            # Detectar arquitetura
            $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
            
            # URL do Node.js LTS (v20.x)
            $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-$arch.msi"
            $installerPath = "$env:TEMP\nodejs-installer.msi"
            
            Write-Info "   Baixando Node.js v20.11.0 ($arch)..."
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
            
            Write-Info "   Instalando Node.js (pode levar alguns minutos)..."
            Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
            
            # Atualizar PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            
            # Verificar instalação
            Start-Sleep -Seconds 3
            $nodeVersion = node --version 2>$null
            if ($nodeVersion) {
                Write-Success "   ✓ Node.js $nodeVersion instalado com sucesso!"
                $nodeInstalled = $true
            } else {
                Write-Warning "   ⚠ Node.js instalado, mas requer reinicialização"
            }
            
            # Limpar
            Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
            
        } catch {
            Write-Error "   ✗ Erro ao instalar Node.js: $_"
        }
    }
}

# Verificar Docker Desktop
Write-Step "🔍 Verificando Docker Desktop..."

$dockerInstalled = $false
try {
    $dockerVersion = docker --version 2>$null
    Write-Success "   ✓ Docker já instalado: $dockerVersion"
    
    # Verificar se está rodando
    docker ps >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "   ✓ Docker Engine está rodando"
    } else {
        Write-Warning "   ⚠ Docker instalado mas não está rodando"
        Write-Info "   Iniciando Docker Desktop..."
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    }
    
    $dockerInstalled = $true
} catch {
    Write-Warning "   ✗ Docker não está instalado"
}

# Instalar Docker Desktop se necessário
if (-not $dockerInstalled) {
    Write-Step "🐳 Instalando Docker Desktop..."
    
    # Tentar com winget
    try {
        Write-Info "   Método 1: Instalando via winget..."
        winget install -e --id Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "   ✓ Docker Desktop instalado via winget!"
            $dockerInstalled = $true
        }
    } catch {
        Write-Warning "   ⚠ Falha no método 1"
    }
    
    # Método alternativo
    if (-not $dockerInstalled) {
        Write-Info "   Método 2: Download direto..."
        
        try {
            $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
            
            Write-Info "   Baixando Docker Desktop (pode levar alguns minutos)..."
            Invoke-WebRequest -Uri $dockerUrl -OutFile $installerPath -UseBasicParsing
            
            Write-Info "   Instalando Docker Desktop..."
            Start-Process -FilePath $installerPath -ArgumentList "install --quiet" -Wait
            
            Write-Success "   ✓ Docker Desktop instalado!"
            Write-Warning "   ⚠ Você precisará REINICIAR o computador para o Docker funcionar"
            
            $dockerInstalled = $true
            
            # Limpar
            Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
            
        } catch {
            Write-Error "   ✗ Erro ao instalar Docker: $_"
        }
    }
}

# Instalar Git (útil para desenvolvimento)
Write-Step "🔍 Verificando Git..."

try {
    $gitVersion = git --version 2>$null
    Write-Success "   ✓ Git já instalado: $gitVersion"
} catch {
    Write-Warning "   ⚠ Git não encontrado. Instalando..."
    
    try {
        winget install -e --id Git.Git --silent --accept-package-agreements --accept-source-agreements
        Write-Success "   ✓ Git instalado!"
    } catch {
        Write-Warning "   ⚠ Não foi possível instalar Git (não é crítico)"
    }
}

# Resumo
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                      ║" -ForegroundColor Green
Write-Host "║            📊 RESUMO DA INSTALAÇÃO                   ║" -ForegroundColor Yellow
Write-Host "║                                                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Node.js
if ($nodeInstalled) {
    Write-Success "✅ Node.js: INSTALADO"
} else {
    Write-Error "❌ Node.js: FALHOU"
}

# Docker
if ($dockerInstalled) {
    Write-Success "✅ Docker Desktop: INSTALADO"
} else {
    Write-Error "❌ Docker Desktop: FALHOU"
}

Write-Host ""

# Próximos passos
$needsRestart = $false

if ($nodeInstalled -and $dockerInstalled) {
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                      ║" -ForegroundColor Green
    Write-Host "║          ✅ INSTALAÇÃO CONCLUÍDA!                    ║" -ForegroundColor Yellow
    Write-Host "║                                                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # Verificar se precisa reiniciar
    try {
        node --version >$null 2>&1
        docker --version >$null 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            $needsRestart = $true
        }
    } catch {
        $needsRestart = $true
    }
    
    if ($needsRestart) {
        Write-Warning "⚠️  IMPORTANTE: Você precisa REINICIAR o computador"
        Write-Warning "   para que todas as mudanças tenham efeito."
        Write-Host ""
        
        $restart = Read-Host "Deseja reiniciar agora? (S/N)"
        if ($restart -eq 'S' -or $restart -eq 's') {
            Write-Info "Reiniciando em 10 segundos..."
            Write-Info "Salve todos os seus trabalhos!"
            Start-Sleep -Seconds 10
            Restart-Computer -Force
        } else {
            Write-Warning "Lembre-se de reiniciar antes de usar o sistema!"
        }
    } else {
        Write-Host "🎯 Próximos Passos:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Feche TODOS os terminais PowerShell abertos" -ForegroundColor White
        Write-Host "2. Abra um NOVO PowerShell" -ForegroundColor White
        Write-Host "3. Execute:" -ForegroundColor White
        Write-Host ""
        Write-Host '   cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"' -ForegroundColor Gray
        Write-Host '   .\iniciar.ps1' -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. O sistema será iniciado automaticamente!" -ForegroundColor Green
        Write-Host ""
    }
    
} else {
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║                                                      ║" -ForegroundColor Yellow
    Write-Host "║       ⚠️  INSTALAÇÃO PARCIAL                        ║" -ForegroundColor Red
    Write-Host "║                                                      ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Warning "Alguns componentes não foram instalados corretamente."
    Write-Host ""
    Write-Host "📝 Instalação Manual:" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $nodeInstalled) {
        Write-Host "Node.js:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://nodejs.org/" -ForegroundColor Gray
        Write-Host "   2. Baixe a versão LTS" -ForegroundColor Gray
        Write-Host "   3. Execute o instalador" -ForegroundColor Gray
        Write-Host ""
    }
    
    if (-not $dockerInstalled) {
        Write-Host "Docker Desktop:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
        Write-Host "   2. Baixe o instalador para Windows" -ForegroundColor Gray
        Write-Host "   3. Execute como Administrador" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "📖 Consulte: GUIA-INSTALACAO-COMPLETO.md" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
