const startButton = document.getElementById("start");
const taskTableBody = document.getElementById("task-table-body");

const TAREFAS = [
  "Enviar newsletter",
  "Gerar relatório financeiro",
  "Redimensionar avatar do usuário",
];

function criarLinha(tarefa) {
  const row = document.createElement("tr");

  const nomeCell = document.createElement("td");
  nomeCell.textContent = tarefa;

  const statusCell = document.createElement("td");
  statusCell.textContent = "Pendente";
  statusCell.className = "status-pendente";

  const inicioCell = document.createElement("td");
  const fimCell = document.createElement("td");
  const duracaoCell = document.createElement("td");

  row.append(nomeCell, statusCell, inicioCell, fimCell, duracaoCell);
  taskTableBody.append(row);

  return { statusCell, inicioCell, fimCell, duracaoCell };
}

function formatarHora(timestamp) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

async function dispararTarefa(tarefa, celulas) {
  const disparadaEm = Date.now();
  celulas.statusCell.textContent = "Aguardando o servidor...";
  celulas.statusCell.className = "status-processando";
  celulas.inicioCell.textContent = formatarHora(disparadaEm);

  const response = await fetch("http://localhost:3002/tasks", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ tarefa }),
  });
  await response.json();

  const concluidaEm = Date.now();
  celulas.statusCell.textContent = "Concluída";
  celulas.statusCell.className = "status-concluida";
  celulas.fimCell.textContent = formatarHora(concluidaEm);
  celulas.duracaoCell.textContent = `${((concluidaEm - disparadaEm) / 1000).toFixed(1)}s`;
}

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  taskTableBody.replaceChildren();

  const pendentes = TAREFAS.map((tarefa) =>
    dispararTarefa(tarefa, criarLinha(tarefa)),
  );

  Promise.all(pendentes).finally(() => {
    startButton.disabled = false;
  });
});
