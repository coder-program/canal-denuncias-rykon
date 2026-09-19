# CHECKLIST - INSTALACAO POSTGRESQL

## STATUS

- [ ] Download iniciado
- [ ] Instalador executado
- [ ] Componentes selecionados
- [ ] Senha definida e anotada
- [ ] Instalacao concluida
- [ ] Sistema configurado

---

## DURANTE A INSTALACAO

### Componentes (Marque todos):

- [x] PostgreSQL Server (obrigatorio)
- [x] pgAdmin 4 (recomendado)
- [x] Command Line Tools (obrigatorio)
- [ ] Stack Builder (DESMARCAR)

### Configuracoes:

- **Diretorio**: C:\Program Files\PostgreSQL\16 (padrao)
- **Porta**: 5432 (padrao)
- **Locale**: Portuguese_Brazil ou Default

### SENHA (ANOTE!):

```
Usuario: postgres
Senha: _______________________
```

---

## APOS INSTALACAO

Execute no PowerShell:

```powershell
.\configurar-postgres.ps1 -SenhaPostgres "SUASENHA"
```

Substitua SUASENHA pela senha que voce criou.

---

## TEMPO ESTIMADO

- Download: 2-5 minutos (depende da internet)
- Instalacao: 3-5 minutos
- Total: 5-10 minutos
