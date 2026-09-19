# 🐘 GUIA: Instalação do PostgreSQL no Windows

## ✅ Status Atual

- ✅ Frontend: RODANDO em http://localhost:3001
- ❌ Backend: AGUARDANDO PostgreSQL
- 📝 Script de configuração automática: PRONTO

---

## 📥 PASSO 1: Download do PostgreSQL

1. **Acesso ao site** (já aberto no navegador):
   - https://www.postgresql.org/download/windows/
2. **Clique em**: "Download the installer"
3. **Escolha**: PostgreSQL 16.x para Windows x86-64

4. **Baixe o arquivo** (aproximadamente 350 MB)

---

## 🔧 PASSO 2: Instalação

### Durante o Instalador:

#### 1️⃣ **Select Components** (Componentes):

- ✅ PostgreSQL Server (obrigatório)
- ✅ pgAdmin 4 (interface gráfica - recomendado)
- ✅ Command Line Tools (necessário)
- ⬜ Stack Builder (opcional - pode desmarcar)

#### 2️⃣ **Data Directory** (Diretório de Dados):

- Deixe o padrão: `C:\Program Files\PostgreSQL\16\data`

#### 3️⃣ **Password** (IMPORTANTE!):

```
⚠️ ANOTE A SENHA QUE VOCÊ VAI CRIAR!

Usuário: postgres (padrão, não muda)
Senha: ____________________ (escolha uma senha forte)

Exemplos de senhas seguras:
- PostgreSQL2026!
- MinhaSenhaDB#123
- Canal@Denuncia2026
```

#### 4️⃣ **Port** (Porta):

- Deixe: `5432` (porta padrão)

#### 5️⃣ **Locale**:

- Escolha: `Portuguese, Brazil` ou deixe `Default locale`

#### 6️⃣ **Instalação**:

- Clique em "Next" → "Next" → "Finish"
- ⚠️ Desmarque "Launch Stack Builder" no final

---

## 🚀 PASSO 3: Configuração Automática

### Após terminar a instalação:

1. **Volte ao VS Code**

2. **Execute o comando** (substitua SUASENHA pela senha que você criou):

   ```powershell
   .\configurar-postgres.ps1 -SenhaPostgres "SUASENHA"
   ```

   **Exemplo**:

   ```powershell
   .\configurar-postgres.ps1 -SenhaPostgres "PostgreSQL2026!"
   ```

3. **O script irá automaticamente**:
   - ✅ Verificar se PostgreSQL está rodando
   - ✅ Atualizar configuração do projeto
   - ✅ Criar banco de dados `canal_denuncia`
   - ✅ Executar migrations (criar tabelas)
   - ✅ Popular banco com dados de teste
   - ✅ Iniciar Backend conectado ao PostgreSQL
   - ✅ Abrir navegador no sistema

---

## 🎯 PASSO 4: Testar o Sistema

Após o script terminar, acesse:

**URL**: http://localhost:3001/login

**Credenciais de Teste**:

- 📧 Email: `admin@empresa.com`
- 🔑 Senha: `Demo123!@`

---

## ❓ Possíveis Problemas

### PostgreSQL não inicia

```powershell
# Verificar serviço
Get-Service -Name "*postgresql*"

# Iniciar manualmente
Start-Service postgresql-x64-16
```

### Erro "psql não é reconhecido"

O PostgreSQL precisa estar no PATH do Windows. Reinicie o computador ou adicione manualmente:

```
C:\Program Files\PostgreSQL\16\bin
```

### Erro de conexão "Connection Refused"

- Verifique se a senha está correta
- Confirme que a porta 5432 está livre
- Verifique o serviço: `Get-Service postgresql*`

---

## 📞 Ajuda

Após a instalação, me informe:

✅ **Sucesso**: "Instalei, a senha é: MINHASENHA"

❌ **Problema**: Descreva o erro que apareceu

---

## 🎉 Próximos Passos

Depois que o sistema estiver funcionando:

1. ✅ Testar criação de denúncia anônima
2. ✅ Testar login como admin
3. ✅ Explorar dashboard de denúncias
4. ✅ Testar workflow de investigação
