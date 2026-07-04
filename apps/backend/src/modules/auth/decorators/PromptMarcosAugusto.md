Você é o Claude Sonnet 4.5 (ou outro modelo equivalente) atuando como time sênior de engenharia full-stack. Seu objetivo: projetar e gerar **todo o sistema completo de um Canal de Denúncias Corporativo**, **usando a pilha JavaScript/Node.js** (produção-grade). Entregue código funcional, documentação e infraestrutura prontos para deploy — como se fosse uma squad de engenharia (Backend, Frontend, DevOps, Segurança).

RESUMO DO PRODUTO
Criar um canal de denúncias corporativo seguro, auditável e personalizável que ofereça:
- Envio e acompanhamento de denúncias (anônimas ou identificadas);
- Gestão e investigação pelo comitê de compliance;
- Bloqueio automático de membros citados;
- Geração de dossiês com anexos de prova;
- Dashboards, relatórios exportáveis e logs de auditoria;
- Personalização visual e upload de documentos corporativos (PDFs);
- Conformidade com LGPD, ISO 27001, ISO 37002 e ISO 37301.

ARQUITETURA TÉCNICA (stack JavaScript)
Frontend:
- React.js + TypeScript (apresentar versão e estrutura de pastas)
- TailwindCSS para UI; componente de upload seguro com validação (size/type)
- Rotas públicas (formulário de denúncia) e rotas restritas (comitê/admin)
- Consumo via API REST JSON + exemplos OpenAPI/Swagger

Backend / API:
- Node.js com TypeScript (preferência: NestJS para arquitetura modular) — alternativas: Express.js + TypeScript
- Padrão Clean Architecture (camadas: controllers -> services -> repositories -> entities)
- Autenticação: JWT + OAuth2 (configurável), refresh tokens, revogação
- RBAC (roles: public, reporter, investigator, admin, auditor), e exceções de citação
- CRUD completo: denúncias, usuários, comitês, dossiês, anexos
- Envio de e-mail, webhooks e filas para tarefas assíncronas
- Auditoria detalhada: logs, timestamps, hash das provas

Banco de Dados:
- PostgreSQL (dados relacionais, transacionais, políticas, usuários)
- MongoDB (documentos, evidências semi-estruturadas, metadata dos dossiês)
- Migrations com TypeORM / Prisma (escolher e padronizar)

Armazenamento de Arquivos:
- AWS S3 para anexos e PDFs com acesso via URLs pré-assinadas (token temporário)
- Política de retenção e criptografia em repouso (SSE-S3 ou KMS)

Logs & Monitoramento:
- ELK stack (Elasticsearch, Logstash, Kibana) ou alternativa compatível
- Captura de ações críticas, falhas, auditorias e uso do sistema
- Health checks e métricas Prometheus / Grafana (opcional)

Mensageria Assíncrona:
- RabbitMQ ou Kafka para alertas, notificações e workflows de investigação

Infraestrutura & Deploy:
- Docker (Dockerfile) + docker-compose para dev; manifests Kubernetes (YAML) para prod
- CI/CD via GitHub Actions ou GitLab CI (pipelines: build, test, lint, image publish, deploy)
- Separação de ambientes: dev, staging, production
- Secrets management (Vault / AWS Secrets Manager / GitHub Secrets)

MÓDULOS PRINCIPAIS (entregáveis)
1. Autenticação e controle de acesso (JWT/OAuth2 + RBAC)  
2. Formulário público de denúncia com protocolo automático e opção anônima  
3. Gestão de dossiês, anexos e criação de PDFs / ZIPs de evidências  
4. Painel do comitê de compliance (triagem, atribuição, histórico)  
5. Mecanismo de bloqueio automático de envolvidos (auditável)  
6. Sistema de notificações (email + dashboard + webhooks)  
7. Logs de auditoria com trilhas imutáveis e exportáveis  
8. Dashboard com KPIs, filtros e exportação CSV/PDF  
9. Personalização visual: tema, logo e documentos corporativos uploadáveis

DIRETRIZES TÉCNICAS DE DESENVOLVIMENTO
- Aplique Clean Architecture; código modular e testável.
- Backend: use DTOs, Repositories, Services, Controllers; validação rigorosa (class-validator).
- Testes: unitários e de integração (Jest para Node; supertest para endpoints; React Testing Library + Jest no front).
- Segurança: TLS 1.3 na API, criptografia sensível com AES-256 (dados PII encriptados em DB), proteção contra CSRF, XSS, SQL Injection, rate limiting e WAF recommendation.
- Observabilidade: tracing (OpenTelemetry), métricas e logs estruturados (JSON).
- Documentação: JSDoc / TypeDoc / Swagger (OpenAPI) + README completo.
- Dev experience: lint (ESLint), format (Prettier), husky + pre-commit hooks.
- Produza Dockerfile(s) funcionais e um docker-compose.yml para desenvolvimento local.

REQUISITOS DE CONFORMIDADE
- LGPD: minimização de dados, anonimização quando requisitado, direitos do titular (consulta/exclusão/restrição) documentados.
- ISO 27001/37002/37301: controles de acesso, gestão de incidentes, cadeia de custódia de evidências e políticas de retenção.

ENTREGAS ESPERADAS (lista para commit inicial no Git)
1. Estrutura completa do repositório (mono-repo ou multi-repo — justificar escolha).  
2. Código-fonte backend (Node.js/TypeScript) e frontend (React/TypeScript) funcional.  
3. Scripts de banco e migrations (Prisma/TypeORM).  
4. Pipelines CI/CD configurados (GitHub Actions/GitLab CI).  
5. Dockerfiles e kubernetes manifests (deploy mínimo).  
6. Documentação: README.md raiz, SRS breve, API Spec (OpenAPI), Guia de Deploy.  
7. Demo com mock data + scripts para popular DB.  
8. Logs de auditoria integrados e exemplos de consultas.  
9. Coleção Postman / exemplos cURL para os fluxos principais.

ESTILO DE ENTREGA & PROCESSO
- Use a estratégia "Long Context + Extended Thinking" do modelo: primeiro gere estrutura de pastas e arquivos, depois implemente módulos por prioridade (auth → denúncia → dossiê → comitê → notifications → infra).
- Forneça o conteúdo em blocos numerados por módulo (ex.: [01] backend/src/auth/*), com snippets de código bem formatados.
- Inclua exemplos de requests (cURL e JSON do Postman) para cada endpoint crítico.
- Priorize implantação local via Docker + docker-compose antes de kubernetes.
- Explique trade-offs arquiteturais (por ex. RabbitMQ vs Kafka, Prisma vs TypeORM).
- Indique envs e secrets essenciais (.env.example).
- Gere testes automatizados demonstrando coverage nas áreas críticas (auth, criação de denúncia, upload).

REGRAS DE SEGURANÇA E OPERACIONAL
- Não armazenar PII em texto plano; tudo sensível encriptado com AES-256.
- URLs pré-assinadas S3 com expiração curta para download de provas.
- Logs sensíveis devem ser mascarados antes de indexação no ELK.
- Mecanismo de retenção/expurgo com trilha de auditoria.

EXEMPLOS (obrigatórios)
- Exemplo de cURL para criar denúncia anônima.
- Exemplo de request para gerar dossiê (ZIP + manifest).
- Exemplo de configuração do pipeline CI (workflow.yaml).

MISSÃO FINAL
Entregar um sistema corporativo, modular e escalável, 100% pronto para deploy em Docker/Kubernetes, com documentação profissional e código em nível de projeto real de mercado.

INICIE AGORA:
1) Gere a **estrutura inicial do repositório** (nomes de pastas, pacotes/package.json, dependências principais) para a stack Node.js/TypeScript + React.  
2) Em seguida, crie o primeiro módulo funcional: **Autenticação (JWT + Refresh + RBAC)** com testes unitários e exemplos cURL.

Observação: responda em português claro, com vocabulário corporativo, visão estratégica e, quando apropriado, uma pitada de humor executivo — seja objetivo e direto.
