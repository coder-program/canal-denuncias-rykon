# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.3.0] - 2025-01-16

### 🚀 Nova Funcionalidade - Sistema de Dossiês (Relatórios PDF)

#### ✅ Adicionado

##### Módulo de Dossiês
- **DossiersService** completo para geração de relatórios (~800 linhas)
  - `generateDossier(complaintId, userId, format)` - Geração de PDF/ZIP com auditoria
  - `getDownloadUrlPDF(id, userId)` - URLs temporárias com controle de acesso
  - `getDownloadUrlZIP(id, userId)` - Download de dossiê ZIP
  - `findAll(userId, userRole, filters)` - Listar dossiês com RBAC
  - `findOne(id, userId)` - Detalhes do dossiê com relacionamentos
  - `remove(id, userId)` - Soft delete com rastreabilidade
  - Geração de PDF estruturado com 5 seções principais
  - Marca d'água "CONFIDENCIAL" em todas as páginas
  - Headers e footers profissionais com paginação

- **DossiersController** com 6 endpoints REST (~290 linhas)
  - `POST /dossiers/complaint/:id/generate` - Gerar dossiê (ADMIN/AUDITOR/INVESTIGATOR)
  - `GET /dossiers` - Listar dossiês com filtros
  - `GET /dossiers/:id` - Detalhes do dossiê
  - `GET /dossiers/:id/download/pdf` - Download do PDF
  - `GET /dossiers/:id/download/zip` - Download do ZIP
  - `DELETE /dossiers/:id` - Remover dossiê (ADMIN apenas)

##### Estrutura do Relatório PDF
- **Seção 1 - Resumo Executivo**:
  - Protocolo, status, categoria, prioridade
  - Data de criação e última atualização
  - Descrição completa da denúncia
  - Informações do denunciante (se disponível)

- **Seção 2 - Linha do Tempo**:
  - Cronologia completa de eventos
  - Datas formatadas (DD/MM/YYYY HH:mm)
  - Ícones visuais por tipo de evento

- **Seção 3 - Histórico de Status**:
  - Todas as mudanças de status
  - Responsável, data e observações
  - Duração em cada status

- **Seção 4 - Anexos**:
  - Lista completa de arquivos anexados
  - Nome, tipo, tamanho
  - Data de upload e responsável
  - Status de verificação de integridade

- **Seção 5 - Registro de Auditoria**:
  - Log completo de ações
  - Usuário, ação, timestamp
  - Detalhes e alterações realizadas

##### Recursos de Segurança e Controle
- **RBAC (Role-Based Access Control)**:
  - ADMIN: Geração, download, listagem e remoção
  - AUDITOR: Geração, download e listagem
  - INVESTIGATOR: Geração e download
  - USER: Download apenas (seus próprios dossiês)

- **Auditoria Completa**:
  - Registro de criação de dossiê
  - Log de downloads com IP e user-agent
  - Rastreabilidade de todas as operações
  - Soft delete para manter histórico

- **Validações**:
  - Verificação de existência da denúncia
  - Controle de acesso por role
  - Validação de permissões em cada operação
  - Proteção contra acessos não autorizados

##### Interface Frontend
- **Botão de Download** na página de detalhes da denúncia
  - Localização: Header da página ao lado dos botões de ação
  - Estados visuais: Normal, loading, erro
  - Feedback com toast notifications
  - Download automático do arquivo PDF

- **Função downloadReport()**:
  - Integração com API via Fetch
  - Tratamento de erros com mensagens amigáveis
  - Criação de blob e URL temporária
  - Download automático e limpeza de recursos

##### Documentação
- **FUNCIONALIDADE-DOSSIERS.md** - Documentação técnica completa (400+ linhas)
  - Visão geral do módulo
  - Arquitetura e fluxo de dados (16 etapas)
  - Estrutura detalhada do PDF
  - 6 endpoints com exemplos em cURL e TypeScript
  - Matriz de permissões RBAC
  - Guia de troubleshooting
  - Métricas de performance
  - Roadmap de funcionalidades futuras

#### 🔧 Corrigido

##### Backend
- **TypeScript Configuration**:
  - Adicionado `esModuleInterop: true` no tsconfig.json
  - Removido módulo dossiers do array exclude
  - Corrigido imports em 8 arquivos (namespace → ES6 default imports)

- **Autenticação JWT**:
  - Corrigido interface JwtPayload (sub → id)
  - Atualizado DossiersController para usar user.id
  - Corrigido 6 métodos no controller

- **Prisma ORM**:
  - Corrigido sintaxe de criação de dossiê (connect para relações)
  - Ajustado queries para incluir relacionamentos necessários

- **PDFKit**:
  - Corrigido bug de paginação (pages 1-indexed, não 0-indexed)
  - Ajustado método switchToPage() para índice correto

- **Serviço de Arquivos**:
  - Adicionado método serveLocalFile() no AttachmentsController
  - Implementado StreamableFile para servir PDFs localmente
  - Configurado Content-Type e Content-Disposition corretos
  - Extração correta de URL do resultado do S3Service

##### Frontend
- **Download de Arquivos**:
  - Migrado de axios para Fetch API para downloads
  - Implementado tratamento correto de blobs
  - Corrigido construção de URLs absolutas
  - Adicionado cleanup de URLs temporárias

#### 📖 Documentação
- Atualizado README.md com nova seção "Dossiês e Relatórios"
- Criado FUNCIONALIDADE-DOSSIERS.md com documentação completa
- Adicionado link na seção de documentação principal
- 8 funcionalidades destacadas com emojis e descrições

#### 🎯 Impacto
- **Usuários**: Interface simples com um clique para download
- **Auditoria**: Rastreabilidade completa de relatórios gerados
- **Conformidade**: Documentação formal de denúncias
- **Segurança**: Controle granular de acesso e marcas d'água

## [1.2.0] - 2025-01-15

### 🚀 Fase 3 - Sistema de Anexos com AWS S3

#### ✅ Adicionado

##### Módulo S3 (Shared)
- **S3Service** completo com 10+ métodos (~330 linhas)
  - `uploadFile(file, folder)` - Upload com hash SHA-256 automático
  - `getPresignedDownloadUrl(key, expiresIn)` - URLs temporárias de download
  - `getPresignedUploadUrl(...)` - URLs para upload direto do cliente
  - `deleteFile(key)` - Remover arquivo do S3
  - `fileExists(key)` - Verificar existência
  - `getFileMetadata(key)` - Obter metadados S3
  - `downloadFile(key)` - Baixar arquivo como Buffer
  - `copyFile(sourceKey, destinationKey)` - Copiar dentro do S3
  - `validateFile(file)` - Validação de segurança (tamanho, MIME, extensão)
  - `calculateSHA256(buffer)` - Hash para integridade
- **S3Module** global para uso em toda aplicação
- Suporte a **LocalStack** para desenvolvimento local (via `AWS_ENDPOINT`)

##### Módulo de Anexos (Attachments)
- **AttachmentsService** com RBAC completo (~350 linhas)
  - `uploadAttachment()` - Upload com validação de complaint e RBAC
  - `findAllByComplaint()` - Listar anexos com controle de acesso
  - `findOne()` - Detalhes com relacionamentos (complaint, uploader)
  - `getDownloadUrl()` - Gerar presigned URL com auditoria
  - `remove()` - Soft delete com rastreabilidade
  - `verifyIntegrity()` - Verificação forense SHA-256
  - `getStats()` - Estatísticas de armazenamento
- **AttachmentsController** com 7 endpoints REST (~290 linhas)
  - `POST /attachments/complaint/:id` - Upload (multipart/form-data)
  - `GET /attachments/complaint/:id` - Listar anexos
  - `GET /attachments/stats` - Estatísticas gerais (ADMIN/AUDITOR)
  - `GET /attachments/:id` - Detalhes do anexo
  - `GET /attachments/:id/download` - Gerar URL de download
  - `GET /attachments/:id/verify` - Verificar integridade (ADMIN/AUDITOR)
  - `DELETE /attachments/:id` - Soft delete

##### Recursos de Segurança
- **Validação de arquivos**:
  - Tamanho máximo: 25MB (configurável via `MAX_FILE_SIZE`)
  - Tipos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, ZIP
  - Verificação de MIME type + extensão
  - Bloqueio de executáveis (.exe, .bat, .sh, .cmd)
- **Integridade de dados**:
  - Hash SHA-256 calculado no upload
  - Armazenamento no banco de dados
  - Endpoint `/verify` para auditoria forense
  - Detecção de adulteração de arquivos
- **Presigned URLs**:
  - URLs temporárias com expiração configurável (1 hora padrão)
  - Sem exposição de credenciais AWS
  - Audit log de cada geração de URL
- **Soft Delete**:
  - Arquivos não são apagados imediatamente do S3
  - Marcação `deletedAt` / `deletedBy`
  - Rastreabilidade completa
  - Job futuro para limpeza após período de retenção

##### RBAC para Anexos
- `REPORTER`: Apenas anexos de denúncias próprias
- `INVESTIGATOR`: Anexos de denúncias atribuídas
- `ADMIN`: Acesso total
- `AUDITOR`: Leitura apenas (sem upload/delete)

##### Schema Prisma
- Modelo `Attachment` atualizado:
  - Campos renomeados: `fileName` → `filename`, `fileSize` → `size`, `fileHash` → `sha256Hash`
  - Soft delete: `deletedAt`, `deletedBy`
  - Relações: `uploader` (User), `deleter` (User)
  - Índices: `complaintId`, `uploadedBy`, `deletedAt`
- Modelo `User` atualizado:
  - Relações: `attachmentsUploaded[]`, `attachmentsDeleted[]`

##### Documentação
- **LOCALSTACK-SETUP.md** (~320 linhas)
  - Instalação do LocalStack (Docker Compose + CLI)
  - Configuração de bucket S3 local
  - Script de setup automatizado
  - Testes de conexão
  - Migração para AWS S3 real
  - IAM Policy mínima para produção
  - Troubleshooting completo
- **ATTACHMENTS-API-EXAMPLES.md** (~750 linhas)
  - 7 exemplos de endpoints (cURL, JavaScript, Python)
  - Respostas de sucesso e erro
  - Tabela de permissões RBAC
  - Collection do Postman importável
  - Logs de auditoria
  - Notas de segurança
- **PHASE-3-SUMMARY.md** (resumo executivo da Fase 3)
  - Arquitetura completa
  - Métricas (~1.150 linhas de código)
  - Checklist de conclusão

##### Scripts
- `scripts/setup-localstack.ts` - Setup automatizado do LocalStack
  - Criação de bucket S3
  - Configuração de CORS
  - Verificação de ambiente

#### 🔧 Modificado
- `app.module.ts` - Registro de `S3Module` e `AttachmentsModule`
- `.env.example` - Variáveis AWS S3 + LocalStack
- `README.md` - Badges v1.2.0 + Fase 3, roadmap atualizado

#### 📦 Dependências
- `@aws-sdk/client-s3@^3.478.0` - Cliente AWS S3
- `@aws-sdk/s3-request-presigner@^3.478.0` - Geração de presigned URLs

---

## [1.1.0] - 2024-10-14

### 🚀 Fase 2 - Módulo de Denúncias Completo

#### ✅ Adicionado

##### Módulo de Denúncias (Complaints)
- Service completo com 14 métodos (~550 linhas)
  - `create()` - Criar denúncia com protocolo único
  - `findAll()` - Listar com paginação e filtros
  - `findOne()` - Detalhes completos com relacionamentos
  - `findByProtocol()` - Busca pública por protocolo
  - `update()` - Atualizar denúncia
  - `assignInvestigator()` - Atribuir investigador
  - `changeStatus()` - Workflow de status
  - `remove()` - Soft delete
  - `getStats()` - Estatísticas agregadas
- Controller com 10 endpoints REST (~270 linhas)
  - `POST /complaints` - Criar denúncia (público)
  - `GET /complaints/protocol/:protocol` - Buscar por protocolo (público)
  - `GET /complaints/stats` - Estatísticas (ADMIN/AUDITOR)
  - `GET /complaints` - Listar com filtros
  - `GET /complaints/:id` - Detalhes
  - `PATCH /complaints/:id` - Atualizar
  - `PATCH /complaints/:id/assign/:investigatorId` - Atribuir investigador
  - `PATCH /complaints/:id/status` - Alterar status
  - `DELETE /complaints/:id` - Arquivar
- 4 DTOs de validação
  - `CreateComplaintDto` - 13 campos validados
  - `UpdateComplaintDto` - Atualização parcial
  - `QueryComplaintsDto` - Paginação e filtros
  - `ChangeStatusDto` - Mudança de status

##### Recursos de Segurança
- Geração de protocolo único alfanumérico (`DEN-YYYY-XXXXXX`)
- Criptografia de dados sensíveis (PII) - estrutura pronta
- Hash de integridade SHA-256 para cada denúncia
- Bloqueio automático de usuários citados (configurável)
- Sanitização de dados antes de retornar
- Auditoria completa de todas as ações

##### Workflow de Status
- `PENDING` → Aguardando triagem
- `IN_PROGRESS` → Em investigação
- `UNDER_REVIEW` → Em análise pelo comitê
- `RESOLVED` → Resolvida
- `DISMISSED` → Arquivada (improcedente)
- `ESCALATED` → Escalada

##### Tipos de Denúncia
- `HARASSMENT` - Assédio moral/sexual
- `DISCRIMINATION` - Discriminação
- `FRAUD` - Fraude
- `CORRUPTION` - Corrupção
- `SAFETY_VIOLATION` - Violação de segurança
- `ENVIRONMENTAL` - Crimes ambientais
- `OTHER` - Outros

##### Níveis de Prioridade
- `LOW` - Baixa (SLA: 15 dias)
- `MEDIUM` - Média (SLA: 7 dias)
- `HIGH` - Alta (SLA: 3 dias)
- `CRITICAL` - Crítica (SLA: 24 horas)

##### Testes
- Suite de testes unitários completa (~420 linhas)
  - 25+ casos de teste
  - Cobertura de todos os métodos principais
  - Mocks de PrismaService e LoggerService
  - Testes de RBAC e validação

##### Documentação
- `COMPLAINTS-API-EXAMPLES.md` (~700 linhas)
  - 9 exemplos cURL completos
  - Exemplos de denúncia identificada e anônima
  - Workflow de status completo
  - Tabelas de referência
  - Matriz RBAC
  - Script Bash para testes
- `PHASE-2-SUMMARY.md` (resumo executivo da Fase 2)

#### 🔧 Modificado
- `app.module.ts` - Registro do ComplaintsModule
- `complaints.module.ts` - Importação de services

---

## [1.0.0] - 2024-10-14

### 🎉 Release Inicial - Fase 1 (MVP Backend)

#### ✅ Adicionado

##### Infraestrutura
- Configuração de monorepo com Turborepo
- Docker Compose para ambiente de desenvolvimento
  - PostgreSQL 16
  - MongoDB 7
  - RabbitMQ 3.12 com management UI
  - Elasticsearch 8.11 + Kibana
  - Adminer para gestão de banco
- Dockerfile multi-stage otimizado para produção
- Pipeline CI/CD completo (GitHub Actions)
  - Lint & format check
  - Unit tests
  - E2E tests com PostgreSQL
  - Docker build & push
  - Deploy staging/production

##### Backend (NestJS + TypeScript)
- Módulo de **Autenticação** completo
  - Registro de usuários
  - Login com JWT
  - Refresh tokens com rotação automática
  - Revogação de tokens
  - Logout
  - Endpoint `/auth/me` (perfil do usuário)
- Módulo de **Usuários**
  - CRUD básico
  - Bloqueio/desbloqueio de usuários
  - Listagem com filtros
- **RBAC** (Role-Based Access Control)
  - 5 roles: PUBLIC, REPORTER, INVESTIGATOR, ADMIN, AUDITOR
  - Guards personalizados
  - Decorators `@Roles()` e `@CurrentUser()`
- **Prisma ORM**
  - Schema completo com 14 models
  - Migrations configuradas
  - Seed script com 4 usuários demo
- **Logging & Auditoria**
  - Winston logger com Elasticsearch transport
  - Mascaramento automático de dados sensíveis
  - Logs de auditoria para ações críticas
- **Segurança**
  - Helmet.js (headers de segurança)
  - CORS configurável
  - Rate limiting (100 req/min)
  - Validação de DTOs com class-validator
  - Hash bcrypt (12 rounds) para senhas
- **Health Check**
  - Endpoint `/health` com status do banco
- **Documentação Swagger**
  - OpenAPI 3.0
  - Try it out habilitado
  - Bearer auth configurado

##### Banco de Dados
- **Schema Prisma** (~370 linhas)
  - User, RefreshToken, Complaint, ComplaintStatusHistory
  - Attachment, Dossier, Notification, AuditLog
  - SystemSetting, CorporateDocument
  - 6 enums (UserRole, ComplaintStatus, ComplaintType, etc.)
- **Migrations** iniciais
- **Seed data** com usuários demo e configurações

##### Testes
- Testes unitários do AuthService (~250 linhas)
  - Validação de usuário
  - Registro
  - Login
  - Permissões RBAC
  - Coverage: ~80%

##### Documentação
- **README.md** (~600 linhas)
  - Arquitetura e stack
  - Guia de instalação
  - Exemplos cURL completos
  - Deploy com Docker e Kubernetes
  - Conformidade LGPD e ISOs
- **QUICKSTART.md** - Setup em 5 minutos
- **EXECUTIVE-SUMMARY.md** - Resumo executivo
  - Proposta de valor
  - Roadmap
  - KPIs
  - Estimativa de custos
- **DELIVERABLES.md** - Lista completa de entregáveis
- **Postman Collection** - Endpoints de autenticação

##### Configuração
- `.env.example` com 60+ variáveis documentadas
- ESLint + Prettier configurados
- TypeScript strict mode
- Path aliases (`@modules/*`, `@shared/*`)

#### 🔒 Segurança
- JWT com expiração configurável (15min access, 7d refresh)
- Tokens armazenados no banco com revogação
- Logs de IP e User-Agent
- Proteção contra SQL injection (Prisma)
- Validação rigorosa de inputs
- CSRF e XSS prevention
- Rate limiting global

#### 📝 Conformidade
- **LGPD**
  - Minimização de dados
  - Criptografia (preparada para AES-256)
  - Logs de consentimento
  - Direitos do titular (estrutura)
- **ISO 27001**
  - Controles de acesso
  - Auditoria
  - Gestão de incidentes (estrutura)
- **ISO 37002/37301**
  - Confidencialidade (anônimo preparado)
  - Não retaliação (bloqueio preparado)

### 🚧 Em Desenvolvimento (Próxima Sprint)
- Módulo de Denúncias (CRUD completo)
- Upload de anexos (AWS S3)
- Workflow de status
- Bloqueio automático de citados
- Frontend React

### 📊 Estatísticas
- **Linhas de código**: ~5.420
- **Arquivos criados**: 44+
- **Endpoints**: 6 (auth) + 1 (users) + 1 (health)
- **Tempo de desenvolvimento**: ~11h

---

## [Unreleased]

### 🎯 Planejado para v1.1.0 (Sprint 2)

#### A Adicionar
- [ ] CRUD completo de denúncias
- [ ] Protocolo único alfanumérico
- [ ] Upload de anexos para S3
- [ ] Validação de tipos de arquivo (PDF, DOCX, PNG, JPG, ZIP)
- [ ] Workflow de status (PENDING → IN_PROGRESS → RESOLVED)
- [ ] Histórico de mudanças de status
- [ ] Bloqueio automático de usuários citados
- [ ] Testes E2E do módulo de denúncias

#### A Melhorar
- [ ] Coverage de testes > 85%
- [ ] Performance: response time < 100ms (p95)
- [ ] Documentação de API: exemplos de erros

---

## [Unreleased]

### 🎯 Planejado para v1.2.0 (Sprint 3)

#### A Adicionar
- [ ] Módulo de Dossiês
- [ ] Geração de PDF com resumo da investigação
- [ ] Geração de ZIP com todas as evidências
- [ ] Assinatura digital de documentos
- [ ] Notificações por email (SMTP)
- [ ] Notificações in-app (websockets)
- [ ] Webhooks para integrações

---

## [Unreleased]

### 🎯 Planejado para v2.0.0 (Sprint 4-6)

#### A Adicionar
- [ ] Frontend React completo
  - Interface pública de denúncia
  - Dashboard do denunciante
  - Painel do comitê de compliance
  - Painel administrativo
- [ ] Dashboards e KPIs
- [ ] Exportação de relatórios (CSV, PDF)
- [ ] Sistema de busca avançada
- [ ] Filtros dinâmicos
- [ ] Personalização visual (white-label)
- [ ] Upload de documentos corporativos

#### A Melhorar
- [ ] Monitoramento com Grafana/Prometheus
- [ ] Load testing com k6
- [ ] Penetration testing (OWASP ZAP)
- [ ] Kubernetes manifests completos
- [ ] Backup e disaster recovery

---

## Convenções

### Tipos de Mudanças
- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para correções de vulnerabilidades

### Versionamento
- **Major** (X.0.0): Mudanças incompatíveis com versões anteriores
- **Minor** (0.X.0): Novas funcionalidades (backward compatible)
- **Patch** (0.0.X): Correções de bugs (backward compatible)

---

## Links
- [Projeto no GitHub](https://github.com/sua-org/canal-denuncia-corporativo)
- [Documentação](./README.md)
- [Issues](https://github.com/sua-org/canal-denuncia-corporativo/issues)
- [Milestones](https://github.com/sua-org/canal-denuncia-corporativo/milestones)

---

*Última atualização: 14 de outubro de 2024*
