# 💰 Connect Financeiro

Sistema financeiro completo desenvolvido para a **Connect Digital**, com design mobile-first e relatórios automáticos via WhatsApp.

![Connect Financeiro](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🚀 Funcionalidades Principais

### 📊 Dashboard Financeiro
- **Visão geral completa** das finanças
- **Saldo total** em tempo real
- **Entradas e saídas** do mês
- **Gráfico de despesas** por categoria
- **Transações recentes** com detalhes

### 💳 Gestão de Transações
- **Registro rápido** de entradas e saídas
- **Sistema de categorias** personalizáveis
- **Formatação automática** de valores em R$
- **Validações inteligentes** de dados
- **Interface mobile-first** otimizada

### 🔍 Histórico e Filtros
- **Busca avançada** por descrição
- **Filtros por tipo** (Entradas/Saídas)
- **Filtros por categoria** e período
- **Paginação inteligente** para grandes volumes
- **Exportação de dados** (futuro)

### 📱 Relatórios via WhatsApp
- **Relatórios semanais** automáticos (segundas às 8h)
- **Relatórios mensais** automáticos (dia 1º às 8h)
- **Envio manual** de relatórios
- **Templates profissionais** com emojis
- **Integração Twilio** WhatsApp Business

### 🎨 Design e UX
- **Mobile-first** - 90% dos acessos são mobile
- **Cores da marca** Connect Digital (laranja/branco/preto)
- **Interface clean** e moderna
- **Navegação intuitiva** com ícones
- **Feedback visual** em todas as ações

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - Backend integrado
- **Prisma ORM** - Gerenciamento de banco
- **JWT** - Autenticação segura
- **Middleware** - Proteção de rotas

### Banco de Dados
- **PostgreSQL** (produção)
- **SQLite** (desenvolvimento)
- **Prisma Schema** - Modelagem de dados

### Integrações
- **Twilio WhatsApp API** - Envio de mensagens
- **Vercel Cron** - Tarefas agendadas
- **Date-fns** - Manipulação de datas

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Twilio (para WhatsApp)
- Conta Vercel (para deploy)

### 1. Clone o Repositório
```bash
git clone https://github.com/connect-digital/connect-financeiro.git
cd connect-financeiro
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

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

### 4. Configure o Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# (Opcional) Visualizar banco
npx prisma studio
```

### 5. Execute o Projeto
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔧 Configuração do WhatsApp

### 1. Conta Twilio
1. Crie uma conta em [twilio.com](https://twilio.com)
2. Acesse o Console do Twilio
3. Copie o **Account SID** e **Auth Token**

### 2. WhatsApp Sandbox
1. No Console Twilio, vá em **Messaging > Try it out > Send a WhatsApp message**
2. Siga as instruções para configurar o Sandbox
3. Copie o número do WhatsApp fornecido

### 3. Configuração de Produção
Para produção, você precisará:
- **WhatsApp Business Account** aprovado
- **Número de telefone verificado**
- **Templates de mensagem** aprovados pelo WhatsApp

## 🚀 Deploy na Vercel

### 1. Preparação
```bash
# Build do projeto
npm run build

# Teste local da build
npm start
```

### 2. Deploy
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar domínio personalizado (opcional)
vercel --prod
```

### 3. Configurar Variáveis de Ambiente
No painel da Vercel:
1. Vá em **Settings > Environment Variables**
2. Adicione todas as variáveis do arquivo `.env`
3. Configure o **DATABASE_URL** para PostgreSQL

### 4. Configurar Cron Jobs
Os cron jobs já estão configurados no `vercel.json`:
- **Relatórios semanais**: Segundas às 8h
- **Relatórios mensais**: Dia 1º às 8h

## 📱 Como Usar

### 1. Primeiro Acesso
1. Acesse o sistema
2. Clique em **"Criar conta"**
3. Preencha: Nome, Email, WhatsApp, Senha
4. Faça login

### 2. Registrar Transações
1. Clique em **"Nova Transação"**
2. Selecione **Entrada** ou **Saída**
3. Preencha descrição e valor
4. Escolha a categoria
5. Clique em **"Registrar"**

### 3. Visualizar Relatórios
1. Acesse **"Relatórios"**
2. Configure seu WhatsApp no perfil
3. Clique em **"Enviar via WhatsApp"**
4. Receba relatórios automáticos

### 4. Filtrar Histórico
1. Acesse **"Histórico"**
2. Use a busca por descrição
3. Aplique filtros por tipo/categoria/data
4. Navegue pelas páginas

## 🎯 Estrutura do Projeto

```
connect-financeiro/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Página do dashboard
│   │   ├── history/           # Histórico de transações
│   │   ├── reports/           # Relatórios
│   │   └── transactions/      # Gestão de transações
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base
│   │   ├── forms/            # Formulários
│   │   └── Layout.tsx        # Layout principal
│   ├── lib/                   # Configurações e utilitários
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── auth.ts           # Autenticação JWT
│   │   └── whatsapp.ts       # Integração WhatsApp
│   ├── types/                 # Tipos TypeScript
│   └── utils/                 # Funções auxiliares
├── prisma/
│   └── schema.prisma         # Schema do banco
├── vercel.json               # Configuração Vercel + Cron
└── tailwind.config.ts        # Configuração Tailwind
```

## 🔐 Segurança

- **JWT Authentication** - Tokens seguros
- **Middleware Protection** - Rotas protegidas
- **Input Validation** - Validação de dados
- **CORS Configuration** - Controle de origem
- **Environment Variables** - Dados sensíveis protegidos

## 📊 Relatórios WhatsApp

### Formato dos Relatórios
```
📊 RELATÓRIO FINANCEIRO
👤 João Silva
📅 Semana de 01/08 a 07/08/2025

💰 RESUMO GERAL
💚 Entradas: R$ 5.000,00
💸 Saídas: R$ 2.300,00
✅ Resultado: R$ 2.700,00
📋 Total de transações: 15

📊 GASTOS POR CATEGORIA
🥇 Gasolina: R$ 800,00
🥈 Funcionário: R$ 600,00
🥉 Material: R$ 400,00

💚 PRINCIPAIS ENTRADAS
🥇 Pagamento Cliente ABC: R$ 2.500,00
🥈 Serviço Entrega: R$ 1.200,00

🚀 Connect Financeiro
Seu controle financeiro sempre em dia!
```

## 🤝 Suporte

Para suporte técnico:
- **Email**: suporte@connectdigital.com.br
- **WhatsApp**: (11) 99999-9999
- **Site**: connectdigital.com.br

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para a **Connect Digital**.
Todos os direitos reservados © 2025 Connect Digital.

---

**Desenvolvido com ❤️ pela equipe Connect Digital**
