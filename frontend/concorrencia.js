const startButton = document.getElementById("start");
const resultado = document.getElementById("resultado");
const overlay = document.getElementById("overlay");
const overlayLabel = document.getElementById("overlay-label");

const TAREFAS = [
  "Enviar newsletter",
  "Gerar relatório financeiro",
  "Redimensionar avatar do usuário",
];

function dispararTarefa(tarefa) {
  const disparadaEm = Date.now();

  return fetch("http://localhost:3002/tasks", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ tarefa }),
  })
    .then((response) => response.json())
    .then(() => ({ tarefa, duracao: (Date.now() - disparadaEm) / 1000 }));
}

function atualizarOverlay(pendentes) {
  const [proximaTarefa] = pendentes;
  overlayLabel.textContent = `Carregando... travado pela ${proximaTarefa}`;
}

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  resultado.replaceChildren();

  const pendentes = new Set(TAREFAS);
  overlay.hidden = false;
  atualizarOverlay(pendentes);

  const promessas = TAREFAS.map((tarefa) =>
    dispararTarefa(tarefa).then((concluida) => {
      pendentes.delete(tarefa);

      const item = document.createElement("li");
      item.textContent = `${concluida.tarefa} — ${concluida.duracao.toFixed(1)}s`;
      resultado.append(item);

      if (pendentes.size > 0) {
        atualizarOverlay(pendentes);
      }

      return concluida;
    }),
  );

  await Promise.all(promessas);

  overlay.hidden = true;
  startButton.disabled = false;
});
