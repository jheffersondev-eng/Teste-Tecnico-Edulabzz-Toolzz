# Real-Time Chat Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.2-purple.svg)
![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

A production-ready, enterprise-level real-time chat application built with Laravel 11, Next.js 14, WebSockets, and modern best practices.

          docker-compose up -d
          docker-compose exec -T frontend npm test
```

## 📈 Monitoring

### Logging
- Laravel logs: `backend/storage/logs/`
- Structured JSON logging
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL


# ChatFlow

Seja bem-vindo ao ChatFlow! Aqui você encontra um chat moderno, com autenticação social, IA integrada e tudo rodando em tempo real. O projeto é feito com Laravel (backend) e Next.js (frontend), usando boas práticas, código limpo e arquitetura organizada.

## O que é o ChatFlow?
Um sistema de chat inteligente, onde você pode:
- Conversar com amigos ou com o bot de IA
- Usar login com Google ou GitHub
- Aproveitar interface bonita, responsiva e rápida
- Tudo protegido com autenticação e 2FA

## Como rodar localmente

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js (recomendado v18+)
- (Opcional) PHP 8.2+ e Composer, caso queira rodar sem Docker

### Passo a passo rápido

1. **Clone o repositório:**
  ```bash
  git clone https://github.com/seu-usuario/seu-repo.git
  cd seu-repo
  ```

2. **Suba tudo com Docker:**
  ```bash
  docker-compose up --build
  ```
  Isso já sobe backend, frontend e banco de dados.

3. **Acesse:**
  - Frontend: [http://localhost:3000](http://localhost:3000)
  - Backend/API: [http://localhost:8000](http://localhost:8000)

4. **Configurar variáveis (.env):**
  - Copie `.env.example` para `.env` tanto no backend quanto no frontend e ajuste as chaves (Google, GitHub, OpenAI, etc).

5. **Banco de dados:**
  - O Docker já sobe o banco, mas se precisar rodar as migrations:
    ```bash
    docker-compose exec backend php artisan migrate
    ```

6. **Pronto!**
  - Só acessar, criar conta e brincar à vontade.

---

Se der algum erro, cheque as variáveis de ambiente e se as portas não estão ocupadas. Qualquer dúvida, abre uma issue ou chama no chat!

Bons testes 🚀
│   ├── store/             # Zustand state management
