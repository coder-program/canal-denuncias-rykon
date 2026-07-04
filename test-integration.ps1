# Script de Testes de Integracao Completo
# Canal de Denuncia - Frontend + Backend

Write-Host "
===============================================================
     TESTES DE INTEGRACAO COMPLETOS                        
     Canal de Denuncia - Frontend + Backend                   
===============================================================
" -ForegroundColor Cyan

$ErrorCount = 0
$SuccessCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`nTestando: $Name" -ForegroundColor Yellow
    Write-Host "   Metodo: $Method"
    Write-Host "   URL: $Url"
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "   Body: $($params.Body)"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "   ✅ SUCESSO - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:SuccessCount++
            return $response
        } else {
            Write-Host "   ❌ FALHOU - Status esperado: $ExpectedStatus, recebido: $($response.StatusCode)" -ForegroundColor Red
            $script:ErrorCount++
            return $null
        }
    }
    catch {
        Write-Host "   ❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $script:ErrorCount++
        return $null
    }
}

# ============================================
# 1. VERIFICAR SERVIÇOS
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  1️⃣  VERIFICANDO SERVIÇOS
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

Write-Host "🔍 Verificando Backend (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $backendCheck = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/me" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend está rodando!" -ForegroundColor Green
    $script:SuccessCount++
}
catch {
    Write-Host "❌ Backend NÃO está rodando! Inicie com: cd apps\backend ; npm run dev" -ForegroundColor Red
    $script:ErrorCount++
    exit 1
}

Write-Host "`n🔍 Verificando Frontend (http://localhost:5173)..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -ErrorAction Stop
    Write-Host "✅ Frontend está rodando!" -ForegroundColor Green
    $script:SuccessCount++
}
catch {
    Write-Host "❌ Frontend NÃO está rodando! Inicie com: cd apps\frontend ; npm run dev" -ForegroundColor Red
    $script:ErrorCount++
    exit 1
}

Write-Host "`n🔍 Verificando PostgreSQL (Docker)..." -ForegroundColor Yellow
$dockerCheck = docker ps --filter "name=canal-denuncia-postgres" --format "{{.Names}}"
if ($dockerCheck -eq "canal-denuncia-postgres") {
    Write-Host "✅ PostgreSQL está rodando!" -ForegroundColor Green
    $script:SuccessCount++
} else {
    Write-Host "❌ PostgreSQL NÃO está rodando!" -ForegroundColor Red
    $script:ErrorCount++
    exit 1
}

# ============================================
# 2. TESTES DE AUTENTICAÇÃO
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  2️⃣  TESTES DE AUTENTICAÇÃO
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 2.1. Login com credenciais válidas (Admin)
$loginBody = @{
    email = "admin@empresa.com"
    password = "Demo123!@"
}

$loginResponse = Test-Endpoint `
    -Name "Login - Admin (Válido)" `
    -Method "POST" `
    -Url "http://localhost:3000/api/v1/auth/login" `
    -Body $loginBody `
    -ExpectedStatus 200

if ($loginResponse) {
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.accessToken
    $userId = $loginData.user.id
    Write-Host "   Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Role: $($loginData.user.role)" -ForegroundColor Gray
} else {
    Write-Host "❌ Falha ao obter token. Abortando testes..." -ForegroundColor Red
    exit 1
}

# 2.2. Login com credenciais inválidas
$loginInvalidBody = @{
    email = "admin@empresa.com"
    password = "SenhaErrada123"
}

Test-Endpoint `
    -Name "Login - Credenciais Inválidas" `
    -Method "POST" `
    -Url "http://localhost:3000/api/v1/auth/login" `
    -Body $loginInvalidBody `
    -ExpectedStatus 401

# 2.3. Verificar perfil autenticado
$headers = @{
    "Authorization" = "Bearer $token"
}

Test-Endpoint `
    -Name "GET /auth/me - Perfil Autenticado" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/auth/me" `
    -Headers $headers `
    -ExpectedStatus 200

# ============================================
# 3. TESTES DE DENÚNCIAS
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  3️⃣  TESTES DE DENÚNCIAS (CRUD)
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 3.1. Listar denúncias
$complaintsResponse = Test-Endpoint `
    -Name "GET /complaints - Listar Denúncias" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?page=1&limit=10" `
    -Headers $headers `
    -ExpectedStatus 200

if ($complaintsResponse) {
    $complaintsData = $complaintsResponse.Content | ConvertFrom-Json
    Write-Host "   Total de denúncias: $($complaintsData.meta.total)" -ForegroundColor Gray
    Write-Host "   Página atual: $($complaintsData.meta.currentPage)" -ForegroundColor Gray
    
    if ($complaintsData.data.Count -gt 0) {
        $firstComplaint = $complaintsData.data[0]
        $complaintId = $firstComplaint.id
        Write-Host "   Primeira denúncia ID: $complaintId" -ForegroundColor Gray
        Write-Host "   Protocolo: $($firstComplaint.protocol)" -ForegroundColor Gray
    }
}

# 3.2. Obter detalhes de uma denúncia
if ($complaintId) {
    Test-Endpoint `
        -Name "GET /complaints/:id - Detalhes" `
        -Method "GET" `
        -Url "http://localhost:3000/api/v1/complaints/$complaintId" `
        -Headers $headers `
        -ExpectedStatus 200
}

# 3.3. Obter estatísticas
Test-Endpoint `
    -Name "GET /complaints/stats - Estatísticas" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints/stats" `
    -Headers $headers `
    -ExpectedStatus 200

# 3.4. Criar nova denúncia
$newComplaintBody = @{
    type = "HARASSMENT"
    title = "Teste de Denúncia Automatizada"
    description = "Esta é uma denúncia criada pelo script de testes automatizados."
    evidence = "Evidências coletadas durante o teste."
    priority = "HIGH"
    isAnonymous = $false
    location = "Setor de TI - Sala 101"
    involvedPeople = @("João Silva", "Maria Santos")
}

$newComplaintResponse = Test-Endpoint `
    -Name "POST /complaints - Criar Denúncia" `
    -Method "POST" `
    -Url "http://localhost:3000/api/v1/complaints" `
    -Headers $headers `
    -Body $newComplaintBody `
    -ExpectedStatus 201

if ($newComplaintResponse) {
    $newComplaint = $newComplaintResponse.Content | ConvertFrom-Json
    $newComplaintId = $newComplaint.id
    Write-Host "   Nova denúncia criada: $newComplaintId" -ForegroundColor Gray
    Write-Host "   Protocolo: $($newComplaint.protocol)" -ForegroundColor Gray
}

# ============================================
# 4. TESTES DOS MODAIS (CRÍTICO) ⭐
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  4️⃣  TESTES DOS MODAIS (FUNCIONALIDADES PRINCIPAIS) ⭐
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 4.1. MODAL: Mudar Status
if ($newComplaintId) {
    Write-Host "`n🎯 TESTANDO MODAL: MUDAR STATUS" -ForegroundColor Magenta
    
    # Mudar para UNDER_REVIEW
    $changeStatusBody = @{
        status = "UNDER_REVIEW"
        notes = "Denúncia recebida e em processo de análise preliminar."
    }
    
    Test-Endpoint `
        -Name "PATCH /complaints/:id/status - Mudar para EM_ANALISE" `
        -Method "PATCH" `
        -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/status" `
        -Headers $headers `
        -Body $changeStatusBody `
        -ExpectedStatus 200
    
    # Mudar para RESOLVED (com notas obrigatórias)
    $resolveStatusBody = @{
        status = "RESOLVED"
        notes = "Caso resolvido após investigação completa. Medidas disciplinares aplicadas."
    }
    
    Test-Endpoint `
        -Name "PATCH /complaints/:id/status - Mudar para RESOLVED (com notas)" `
        -Method "PATCH" `
        -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/status" `
        -Headers $headers `
        -Body $resolveStatusBody `
        -ExpectedStatus 200
    
    # Tentar mudar para RESOLVED sem notas (deve falhar - teste de validação)
    Write-Host "`n🧪 Teste de Validação: RESOLVED sem notas (deve falhar)" -ForegroundColor Yellow
    $resolveNoNotesBody = @{
        status = "RESOLVED"
        notes = ""
    }
    
    Test-Endpoint `
        -Name "PATCH /complaints/:id/status - RESOLVED sem notas (DEVE FALHAR)" `
        -Method "PATCH" `
        -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/status" `
        -Headers $headers `
        -Body $resolveNoNotesBody `
        -ExpectedStatus 400
}

# 4.2. MODAL: Atribuir Investigador
if ($newComplaintId) {
    Write-Host "`n🎯 TESTANDO MODAL: ATRIBUIR INVESTIGADOR" -ForegroundColor Magenta
    
    # Primeiro, obter lista de investigadores
    Write-Host "`n🔍 Obtendo lista de investigadores..." -ForegroundColor Yellow
    $investigatorsResponse = Test-Endpoint `
        -Name "GET /users?role=INVESTIGATOR - Listar Investigadores" `
        -Method "GET" `
        -Url "http://localhost:3000/api/v1/users?role=INVESTIGATOR&role=ADMIN" `
        -Headers $headers `
        -ExpectedStatus 200
    
    if ($investigatorsResponse) {
        $investigators = $investigatorsResponse.Content | ConvertFrom-Json
        if ($investigators.Count -gt 0) {
            $investigatorId = $investigators[0].id
            Write-Host "   Investigador selecionado: $investigatorId" -ForegroundColor Gray
            Write-Host "   Nome: $($investigators[0].fullName)" -ForegroundColor Gray
            
            # Atribuir investigador
            Test-Endpoint `
                -Name "PATCH /complaints/:id/assign/:investigatorId - Atribuir Investigador" `
                -Method "PATCH" `
                -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/assign/$investigatorId" `
                -Headers $headers `
                -ExpectedStatus 200
            
            # Verificar se foi atribuído corretamente
            $checkAssignResponse = Test-Endpoint `
                -Name "GET /complaints/:id - Verificar Atribuição" `
                -Method "GET" `
                -Url "http://localhost:3000/api/v1/complaints/$newComplaintId" `
                -Headers $headers `
                -ExpectedStatus 200
            
            if ($checkAssignResponse) {
                $checkData = $checkAssignResponse.Content | ConvertFrom-Json
                if ($checkData.investigatorId -eq $investigatorId) {
                    Write-Host "   ✅ Investigador atribuído corretamente!" -ForegroundColor Green
                    $script:SuccessCount++
                } else {
                    Write-Host "   ❌ Investigador NÃO foi atribuído!" -ForegroundColor Red
                    $script:ErrorCount++
                }
            }
        }
    }
}

# ============================================
# 5. TESTES DE COMENTÁRIOS
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  5️⃣  TESTES DE COMENTÁRIOS
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

if ($newComplaintId) {
    # Adicionar comentário
    $commentBody = @{
        content = "Este é um comentário de teste adicionado automaticamente."
    }
    
    Test-Endpoint `
        -Name "POST /complaints/:id/comments - Adicionar Comentário" `
        -Method "POST" `
        -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/comments" `
        -Headers $headers `
        -Body $commentBody `
        -ExpectedStatus 201
    
    # Listar comentários
    Test-Endpoint `
        -Name "GET /complaints/:id/comments - Listar Comentários" `
        -Method "GET" `
        -Url "http://localhost:3000/api/v1/complaints/$newComplaintId/comments" `
        -Headers $headers `
        -ExpectedStatus 200
}

# ============================================
# 6. TESTES DE FILTROS E BUSCA
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  6️⃣  TESTES DE FILTROS E BUSCA
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 6.1. Filtro por status
Test-Endpoint `
    -Name "GET /complaints?status=PENDING - Filtro por Status" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?status=PENDING" `
    -Headers $headers `
    -ExpectedStatus 200

# 6.2. Filtro por tipo
Test-Endpoint `
    -Name "GET /complaints?type=HARASSMENT - Filtro por Tipo" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?type=HARASSMENT" `
    -Headers $headers `
    -ExpectedStatus 200

# 6.3. Filtro por prioridade
Test-Endpoint `
    -Name "GET /complaints?priority=HIGH - Filtro por Prioridade" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?priority=HIGH" `
    -Headers $headers `
    -ExpectedStatus 200

# 6.4. Busca por protocolo
if ($newComplaint.protocol) {
    $searchTerm = $newComplaint.protocol.Substring(0, 10)
    Test-Endpoint `
        -Name "GET /complaints?search=$searchTerm - Busca por Protocolo" `
        -Method "GET" `
        -Url "http://localhost:3000/api/v1/complaints?search=$searchTerm" `
        -Headers $headers `
        -ExpectedStatus 200
}

# 6.5. Múltiplos filtros combinados
Test-Endpoint `
    -Name "GET /complaints - Filtros Combinados" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?status=RESOLVED&type=HARASSMENT&priority=HIGH" `
    -Headers $headers `
    -ExpectedStatus 200

# ============================================
# 7. TESTES DE PAGINAÇÃO
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  7️⃣  TESTES DE PAGINAÇÃO
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 7.1. Página 1 com 5 itens
Test-Endpoint `
    -Name "GET /complaints?page=1&limit=5 - Paginação (5 itens)" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?page=1&limit=5" `
    -Headers $headers `
    -ExpectedStatus 200

# 7.2. Página 2
Test-Endpoint `
    -Name "GET /complaints?page=2&limit=5 - Página 2" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints?page=2&limit=5" `
    -Headers $headers `
    -ExpectedStatus 200

# ============================================
# 8. TESTES DE CONTROLE DE ACESSO
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  8️⃣  TESTES DE CONTROLE DE ACESSO
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

# 8.1. Tentar acessar sem token (deve falhar)
Write-Host "`n🧪 Teste: Acesso sem autenticação (deve falhar)" -ForegroundColor Yellow
Test-Endpoint `
    -Name "GET /complaints - Sem Token (DEVE FALHAR)" `
    -Method "GET" `
    -Url "http://localhost:3000/api/v1/complaints" `
    -ExpectedStatus 401

# 8.2. Login como Investigador
$investigatorLoginBody = @{
    email = "investigador@empresa.com"
    password = "Demo123!@"
}

$investigatorLoginResponse = Test-Endpoint `
    -Name "Login - Investigador" `
    -Method "POST" `
    -Url "http://localhost:3000/api/v1/auth/login" `
    -Body $investigatorLoginBody `
    -ExpectedStatus 200

if ($investigatorLoginResponse) {
    $investigatorData = $investigatorLoginResponse.Content | ConvertFrom-Json
    $investigatorToken = $investigatorData.accessToken
    $investigatorHeaders = @{
        "Authorization" = "Bearer $investigatorToken"
    }
    
    Write-Host "   Investigador logado com sucesso" -ForegroundColor Gray
    
    # Investigador deve poder ver denúncias
    Test-Endpoint `
        -Name "GET /complaints - Como Investigador" `
        -Method "GET" `
        -Url "http://localhost:3000/api/v1/complaints" `
        -Headers $investigatorHeaders `
        -ExpectedStatus 200
}

# ============================================
# 9. LIMPEZA (OPCIONAL)
# ============================================
Write-Host "`n
═══════════════════════════════════════════════════════════════
  9️⃣  LIMPEZA
═══════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

if ($newComplaintId) {
    Write-Host "🗑️  Deseja deletar a denúncia de teste criada? (ID: $newComplaintId)" -ForegroundColor Yellow
    # Não vamos deletar automaticamente para permitir inspeção manual
    Write-Host "   Mantendo denúncia para inspeção manual." -ForegroundColor Gray
    Write-Host "   Para deletar manualmente: DELETE /api/v1/complaints/$newComplaintId" -ForegroundColor Gray
}

# ============================================
# RELATÓRIO FINAL
# ============================================
Write-Host "`n
╔═══════════════════════════════════════════════════════════════╗
║                    RELATÓRIO FINAL                            ║
╚═══════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$TotalTests = $SuccessCount + $ErrorCount
$SuccessRate = if ($TotalTests -gt 0) { [math]::Round(($SuccessCount / $TotalTests) * 100, 2) } else { 0 }

Write-Host "
📊 ESTATÍSTICAS:
   Total de Testes: $TotalTests
   ✅ Sucessos:      $SuccessCount
   ❌ Falhas:        $ErrorCount
   📈 Taxa de Sucesso: $SuccessRate%
" -ForegroundColor White

if ($ErrorCount -eq 0) {
    Write-Host "
🎉🎉🎉 PARABÉNS! 🎉🎉🎉

Todos os testes passaram com sucesso!
O sistema está funcionando perfeitamente.

✅ Backend: Funcionando
✅ Frontend: Funcionando  
✅ Banco de Dados: Conectado
✅ Autenticação: OK
✅ CRUD Denúncias: OK
✅ Modal Mudar Status: OK ⭐
✅ Modal Atribuir Investigador: OK ⭐
✅ Comentários: OK
✅ Filtros: OK
✅ Paginação: OK
✅ Controle de Acesso: OK

Sistema pronto para uso! 🚀
" -ForegroundColor Green
} else {
    Write-Host "
⚠️  ATENÇÃO! ⚠️

Alguns testes falharam. Verifique os erros acima.

Logs do backend: Verifique o terminal do backend
Logs do frontend: Verifique o terminal do frontend

" -ForegroundColor Yellow
}

Write-Host "
📚 CREDENCIAIS DE TESTE:
   Admin:        admin@empresa.com        / Demo123!@
   Investigador: investigador@empresa.com / Demo123!@
   Denunciante:  denunciante@empresa.com  / Demo123!@
   Auditor:      auditor@empresa.com      / Demo123!@

🌐 URLs:
   Frontend: http://localhost:5173
   Backend:  http://localhost:3000/api/v1
   Swagger:  http://localhost:3000/api/v1/docs

📖 Para testes manuais detalhados, consulte:
   GUIA-TESTES-MANUAIS.md

" -ForegroundColor Cyan

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
