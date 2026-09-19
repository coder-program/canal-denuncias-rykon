# 🔴 ERR_CONNECTION_REFUSED - Guia de Solução Rápida

## ❌ Erro

```
ERR_CONNECTION_REFUSED
POST http://localhost:3000/api/v1/auth/login
```

## 🔍 Causa

O **backend NestJS não está rodando** na porta 3000.

O frontend tenta conectar em `http://localhost:3000/api/v1`, mas nada responde.

---

## ✅ Solução Rápida (3 Opções)

### **Opção 1: Script Automático (Recomendado)** ⭐

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"
.\start-complete.ps1
```

**O que este script faz:**

1. ✅ Para todos os processos Node
2. ✅ Verifica se as portas estão livres
3. ✅ Instala dependências (se necessário)
4. ✅ Inicia backend (porta 3000)
5. ✅ **Aguarda backend ficar online**
6. ✅ Inicia frontend (porta 3001)
7. ✅ Abre navegador automaticamente

---

### **Opção 2: Manual (2 Terminais)**

#### **Terminal 1 - Backend**

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
npm run dev
```

**Aguarde ver:**

```
[Nest] Application is running on: http://localhost:3000 ✅
```

#### **Terminal 2 - Frontend**

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"
npm run dev -- -p 3001
```

**Acesse:** http://localhost:3001/login

---

### **Opção 3: Diagnóstico Completo**

```powershell
.\diagnostico.ps1
```

Verifica:

- Processos Node rodando
- Portas ocupadas
- Conexão com backend
- Variáveis de ambiente

---

## 🔧 Troubleshooting

### **Backend não inicia?**

#### **1. Verificar se banco de dados está rodando**

O backend NestJS precisa do **PostgreSQL** rodando.

```powershell
# Verificar se PostgreSQL está rodando
Get-Service -Name postgresql*

# Se estiver parado, iniciar
Start-Service postgresql-x64-14  # ou sua versão
```

#### **2. Verificar arquivo .env no backend**

```powershell
# Verificar se existe
Test-Path "apps\backend\.env"

# Ver conteúdo
Get-Content "apps\backend\.env"
```

**Deve ter:**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/canal_denuncia"
JWT_SECRET="seu-secret-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui"
JWT_REFRESH_EXPIRES_IN="7d"
```

#### **3. Instalar dependências**

```powershell
cd apps\backend
npm install
npm run dev
```

#### **4. Verificar erros no console**

Abra o terminal do backend e veja os erros:

**Erros comuns:**

- **"Error: connect ECONNREFUSED"** → PostgreSQL não está rodando
- **"MODULE_NOT_FOUND"** → Executar `npm install`
- **"Port 3000 already in use"** → Matar processo: `Stop-Process -Name node -Force`

---

## 📊 Verificação Rápida

Execute este comando para verificar tudo:

```powershell
# Verificar se backend está online
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET -TimeoutSec 2
    Write-Host "✅ Backend ONLINE - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend OFFLINE" -ForegroundColor Red
    Write-Host "Execute: .\start-complete.ps1" -ForegroundColor Yellow
}
```

---

## 🚀 Comando Único (Copiar e Colar)

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"; .\start-complete.ps1
```

---

## ✅ Verificar se Funcionou

1. **Backend deve mostrar:**

   ```
   [Nest] Application is running on: http://localhost:3000 ✅
   ```

2. **Frontend deve mostrar:**

   ```
   ✓ Ready in 2.5s
   ○ Local: http://localhost:3001 ✅
   ```

3. **Acessar login:**

   ```
   http://localhost:3001/login
   ```

4. **Fazer login:**
   - Email: `admin@empresa.com`
   - Senha: `Admin@123`

5. **Console do navegador deve mostrar:**
   ```
   ✅ POST http://localhost:3000/api/v1/auth/login 200 OK
   ✅ Login realizado com sucesso!
   ```

---

## 📝 Resumo

| Problema               | Solução                          |
| ---------------------- | -------------------------------- |
| ERR_CONNECTION_REFUSED | Backend não está rodando         |
| Solução Rápida         | `.\start-complete.ps1`           |
| Backend não inicia     | Verificar PostgreSQL e .env      |
| Porta 3000 ocupada     | `Stop-Process -Name node -Force` |

---

**Execute: `.\start-complete.ps1` agora!** 🚀
