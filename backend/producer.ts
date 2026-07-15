import express from "express";
import { nanoid } from "nanoid";
import { conectar, EXCHANGE, ROUTING_KEY } from "./fila/topologia";

const app = express();
const port = 3003;

app.use(express.json({ type: ["application/json", "text/plain"] }));

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

async function main() {
  const { canal } = await conectar();

  app.post("/users", (req, res) => {
    const { nome, idade } = req.body;
    const usuario = { id: nanoid(), nome, idade, criadoEm: Date.now() };

    canal.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(usuario)), {
      persistent: true,
    });

    res.status(202).json(usuario);
  });

  app.listen(port, () => {
    console.log(`Producer (com fila) rodando em http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o producer:", err);
  process.exit(1);
});
