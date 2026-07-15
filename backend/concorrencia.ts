import express from "express";

const app = express();
const port = 3002;

app.use(express.json({ type: ["application/json", "text/plain"] }));

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

function bloquearThreadPor(ms: number) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {}
}

app.post("/tasks", (req, res) => {
  const { tarefa } = req.body;
  const inicio = Date.now();

  bloquearThreadPor(5000);

  res.status(201).json({ tarefa, inicio, fim: Date.now() });
});

app.listen(port, () => {
  console.log(`Servidor sem fila (sem paralelismo) rodando em http://localhost:${port}`);
});
