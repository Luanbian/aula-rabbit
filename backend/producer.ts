import express from "express";
import { nanoid } from "nanoid";
import { conectar, EXCHANGE, QUEUE_CONCLUIDOS, ROUTING_KEY } from "./fila/topologia";

const app = express();
const port = 3003;

const cadastros = new Map();

app.use(express.json({ type: ["application/json", "text/plain"] }));

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

async function main() {
  const { canal } = await conectar();

  canal.consume(QUEUE_CONCLUIDOS, (mensagem) => {
    if (!mensagem) return;

    const { id, concluidoEm } = JSON.parse(mensagem.content.toString());
    const usuario = cadastros.get(id);
    if (usuario) {
      usuario.status = "concluido";
      usuario.concluidoEm = concluidoEm;
    }

    canal.ack(mensagem);
  });

  app.post("/users", (req, res) => {
    const { nome, idade } = req.body;
    if (!nome || typeof idade !== "number" || Number.isNaN(idade)) {
      res.status(400).json({ erro: "Informe nome e idade válidos." });
      return;
    }

    const usuario = { id: nanoid(), nome, idade, criadoEm: Date.now(), status: "processando" };
    cadastros.set(usuario.id, usuario);

    canal.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(usuario)), {
      persistent: true,
    });

    res.status(202).json(usuario);
  });

  app.get("/users/:id", (req, res) => {
    const usuario = cadastros.get(req.params.id);
    if (!usuario) {
      res.status(404).json({ erro: "Cadastro não encontrado." });
      return;
    }

    res.json(usuario);
  });

  app.listen(port, () => {
    console.log(`Producer (com fila) rodando em http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o producer:", err);
  process.exit(1);
});
