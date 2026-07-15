# Aula sobre RabbitMQ

Projeto de apoio para uma aula que mostra, na prática, o problema que uma fila
de mensagens resolve. Tem três demos independentes:

1. **Sem fila** — uma requisição que demora 15s para responder, com a tela
   travada em loading o tempo todo.
2. **Concorrência sem fila** — 3 requisições sem nenhuma relação entre si,
   disparadas ao mesmo tempo, mas processadas uma de cada vez porque o
   servidor não tem fila nem paralelismo. A tela fica bloqueada três vezes
   seguidas.
3. **Com fila** — o mesmo cadastro do primeiro demo, mas agora o backend
   publica a tarefa no RabbitMQ e responde na hora. Um worker separado
   consome a fila e faz o processamento demorado em segundo plano.

## Estrutura

```
backend/
  index.ts          # demo 1: sem fila (porta 3000)
  concorrencia.ts    # demo 2: concorrência sem fila (porta 3002)
  producer.ts        # demo 3: publica na fila e responde na hora (porta 3003)
  worker.ts          # demo 3: consome a fila e processa em segundo plano
  fila/
    topologia.ts     # setup da exchange, fila e binding do RabbitMQ
frontend/
  index.html/.js     # demo 1
  concorrencia.html/.js/.css  # demo 2
  fila.html/.js/.css # demo 3
docker-compose.yml   # sobe o RabbitMQ (com management UI)
```

## Pré-requisitos

- Node.js
- Docker + Docker Compose (só é necessário para o demo 3)

Instale as dependências do backend uma vez:

```fish
cd backend
npm install
```

Os arquivos do frontend não precisam de build nem servidor — basta abrir o
`.html` direto no navegador (duplo clique ou `file://`).

## Demo 1 — Sem fila

```fish
cd backend
npm run dev
```

Abra `frontend/index.html` no navegador, preencha o formulário e cadastre.
A tela fica travada em loading por 15s antes de responder.

## Demo 2 — Concorrência sem fila

```fish
cd backend
npm run dev:concorrencia
```

Abra `frontend/concorrencia.html` e clique em "Disparar as 3 requisições".
As 3 requisições são disparadas ao mesmo tempo, mas o overlay de loading
troca de tarefa (A → B → C) conforme o servidor processa uma de cada vez —
mesmo elas não tendo nenhuma relação entre si.

## Demo 3 — Com fila (RabbitMQ)

1. Suba o RabbitMQ:

   ```fish
   docker compose up -d
   ```

   Management UI em `http://localhost:15673` (login `admin` / `admin`).
   Vale abrir essa UI durante a aula para mostrar a fila `fila.cadastros`
   recebendo e esvaziando mensagens em tempo real.

2. Em um terminal, suba o worker (quem consome e processa):

   ```fish
   cd backend
   npm run dev:worker
   ```

3. Em outro terminal, suba o producer (a API que o formulário chama):

   ```fish
   cd backend
   npm run dev:producer
   ```

4. Abra `frontend/fila.html` e cadastre um usuário. A resposta volta quase
   instantânea — o processamento de 15s acontece depois, em segundo plano,
   visível no log do terminal do worker.

Para derrubar o RabbitMQ no final: `docker compose down`.

## Portas usadas

| Serviço                          | Porta |
| --------------------------------- | ----- |
| Backend sem fila (`index.ts`)     | 3000  |
| Backend concorrência (`concorrencia.ts`) | 3002  |
| Producer com fila (`producer.ts`) | 3003  |
| RabbitMQ (AMQP)                   | 5673  |
| RabbitMQ management UI            | 15673 |
