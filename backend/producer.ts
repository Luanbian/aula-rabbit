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

    const { token, id, concluidoEm } = JSON.parse(mensagem.content.toString());
    const usuario = cadastros.get(token);
    if (usuario) {
      usuario.id = id;
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

    const token = nanoid();
    const usuario = {
      token,
      id: null,
      nome,
      idade,
      criadoEm: Date.now(),
      concluidoEm: null,
      status: "processando",
    };
    cadastros.set(token, usuario);

    canal.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify({ token, nome, idade })), {
      persistent: true,
    });

    res.status(202).json(usuario);
  });

  app.get("/users/:token", (req, res) => {
    const usuario = cadastros.get(req.params.token);
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
