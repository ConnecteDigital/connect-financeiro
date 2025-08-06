# 🚀 Guia de Deploy - Connect Financeiro

Este guia detalha como fazer o deploy do Connect Financeiro na Vercel com todas as configurações necessárias.

## 📋 Pré-requisitos

- [x] Projeto Connect Financeiro completo
- [x] Conta GitHub para versionamento
- [x] Conta Vercel para deploy
- [x] Conta Twilio para WhatsApp
- [x] Banco PostgreSQL (Vercel Postgres ou externo)

## 🔧 Preparação do Projeto

### 1. Configurar para Produção

Edite o arquivo `prisma/schema.prisma` para usar PostgreSQL:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Atualizar package.json

Adicione scripts de build se necessário:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### 3. Criar .env.example

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/connect_financeiro"

# JWT Secret
JWT_SECRET="seu-jwt-secret-super-seguro"

# Twilio WhatsApp API
TWILIO_ACCOUNT_SID="seu_twilio_account_sid"
TWILIO_AUTH_TOKEN="seu_twilio_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Vercel Cron Secret
CRON_SECRET="seu-cron-secret-seguro"
```

## 📦 Configuração do GitHub

### 1. Criar Repositório

```bash
# Inicializar Git
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: Connect Financeiro - Sistema completo"

# Adicionar origem remota
git remote add origin https://github.com/connect-digital/connect-financeiro.git

# Push inicial
git push -u origin main
```

### 2. Estrutura de Branches

```bash
# Branch principal (produção)
main

# Branch de desenvolvimento
git checkout -b develop

# Branches de features
git checkout -b feature/nova-funcionalidade
```

## 🗄️ Configuração do Banco de Dados

### Opção 1: Vercel Postgres (Recomendado)

1. **Acesse o painel da Vercel**
2. **Vá em Storage > Create Database**
3. **Selecione Postgres**
4. **Escolha a região (preferencialmente São Paulo)**
5. **Copie a DATABASE_URL gerada**

### Opção 2: PostgreSQL Externo

Providers recomendados:
- **Supabase** (gratuito até 500MB)
- **Railway** (gratuito até 500MB)
- **Neon** (gratuito até 3GB)

## 🚀 Deploy na Vercel

### 1. Conectar Repositório

1. **Acesse vercel.com**
2. **Clique em "New Project"**
3. **Conecte sua conta GitHub**
4. **Selecione o repositório connect-financeiro**
5. **Configure as opções:**
   - Framework Preset: **Next.js**
   - Root Directory: **.**
   - Build Command: **npm run build**
   - Output Directory: **.next**

### 2. Configurar Variáveis de Ambiente

No painel da Vercel, vá em **Settings > Environment Variables**:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=connect-financeiro-jwt-super-secret-2024
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CRON_SECRET=connect-financeiro-cron-secret-2024
```

### 3. Deploy Inicial

1. **Clique em "Deploy"**
2. **Aguarde o build completar**
3. **Acesse a URL gerada**

## 🔄 Configuração das Migrações

### 1. Executar Migrações

Após o primeiro deploy, execute as migrações:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed # se houver seeds
```

### 2. Configurar Build Hook

Para executar migrações automaticamente:

1. **Vá em Settings > Git**
2. **Adicione um Build Hook**
3. **Configure para executar em push na main**

## ⏰ Configuração dos Cron Jobs

### 1. Verificar vercel.json

O arquivo já está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 8 * * 1"
    },
    {
      "path": "/api/cron/monthly-reports", 
      "schedule": "0 8 1 * *"
    }
  ]
}
```

### 2. Testar Cron Jobs

```bash
# Testar relatório semanal
curl -X GET https://seu-dominio.vercel.app/api/cron/weekly-reports \
  -H "Authorization: Bearer seu-cron-secret"

# Testar relatório mensal
curl -X GET https://seu-dominio.vercel.app/api/cron/monthly-reports \
  -H "Authorization: Bearer seu-cron-secret"
```

## 📱 Configuração do WhatsApp

### 1. Twilio Sandbox (Desenvolvimento)

1. **Acesse console.twilio.com**
2. **Vá em Messaging > Try it out > Send a WhatsApp message**
3. **Siga as instruções para configurar**
4. **Teste o envio de mensagens**

### 2. WhatsApp Business (Produção)

Para produção, você precisará:

1. **WhatsApp Business Account aprovado**
2. **Número de telefone verificado**
3. **Templates de mensagem aprovados**
4. **Webhook configurado (opcional)**

### 3. Configurar Templates

Templates necessários para aprovação:

```
Template: financial_report_weekly
Categoria: UTILITY
Idioma: pt_BR

Conteúdo:
📊 RELATÓRIO FINANCEIRO SEMANAL
👤 {{1}}
📅 {{2}}

💰 RESUMO GERAL
💚 Entradas: {{3}}
💸 Saídas: {{4}}
✅ Resultado: {{5}}

🚀 Connect Financeiro
```

## 🌐 Configuração de Domínio

### 1. Domínio Personalizado

1. **Vá em Settings > Domains**
2. **Adicione seu domínio**
3. **Configure DNS:**
   - Tipo: **CNAME**
   - Nome: **financeiro** (ou subdomínio desejado)
   - Valor: **cname.vercel-dns.com**

### 2. SSL/HTTPS

- **Automático** - Vercel configura SSL automaticamente
- **Redirecionamento HTTPS** - Habilitado por padrão

## 🔍 Monitoramento e Logs

### 1. Vercel Analytics

1. **Vá em Analytics**
2. **Habilite Web Analytics**
3. **Configure Speed Insights**

### 2. Logs de Função

```bash
# Ver logs em tempo real
vercel logs

# Ver logs de uma função específica
vercel logs --function=api/cron/weekly-reports
```

### 3. Monitoramento de Erros

Considere integrar:
- **Sentry** - Monitoramento de erros
- **LogRocket** - Sessões de usuário
- **Datadog** - Métricas avançadas

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente

- **Nunca** commite arquivos `.env`
- **Use** secrets seguros (mínimo 32 caracteres)
- **Rotacione** secrets periodicamente

### 2. CORS e Headers

Configure headers de segurança no `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 3. Rate Limiting

Considere implementar rate limiting para APIs:

```javascript
// lib/rate-limit.js
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

## 📊 Performance

### 1. Otimizações Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  compress: true,
}

module.exports = nextConfig
```

### 2. Database Connection Pooling

Configure connection pooling no Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 🚀 Deploy Automatizado

### 1. GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Webhooks

Configure webhooks para notificações:
- **Slack** - Notificações de deploy
- **Discord** - Status do sistema
- **Email** - Alertas críticos

## ✅ Checklist Final

- [ ] Repositório GitHub configurado
- [ ] Banco PostgreSQL funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy na Vercel realizado
- [ ] Migrações executadas
- [ ] Cron jobs testados
- [ ] WhatsApp configurado
- [ ] Domínio personalizado (opcional)
- [ ] SSL/HTTPS ativo
- [ ] Monitoramento configurado
- [ ] Backup do banco configurado

## 🆘 Troubleshooting

### Problemas Comuns

1. **Build Error**: Verificar dependências e tipos TypeScript
2. **Database Connection**: Verificar DATABASE_URL e firewall
3. **Cron Jobs não executam**: Verificar CRON_SECRET e logs
4. **WhatsApp não envia**: Verificar credenciais Twilio

### Comandos Úteis

```bash
# Verificar build local
npm run build

# Testar produção local
npm run start

# Ver logs Vercel
vercel logs

# Executar migrações
npx prisma migrate deploy

# Reset banco (cuidado!)
npx prisma migrate reset
```

## 📞 Suporte

Para problemas de deploy:
- **Vercel Docs**: vercel.com/docs
- **Prisma Docs**: prisma.io/docs
- **Twilio Docs**: twilio.com/docs

---

**Deploy realizado com sucesso! 🎉**

O Connect Financeiro está agora rodando em produção na Vercel.

