const form = document.getElementById("form");
const error = document.getElementById("error");
const accepted = document.getElementById("accepted");
const acceptedCaption = document.getElementById("accepted-caption");
const userTableBody = document.getElementById("user-table-body");
const newUserButton = document.getElementById("new-user");

const FIELD_LABELS = {
  id: "ID",
  nome: "Nome",
  idade: "Idade",
  criadoEm: "Recebido em",
  concluidoEm: "Processado em",
};

const TIME_FIELDS = new Set(["criadoEm", "concluidoEm"]);

let polling = null;

function renderUsuario(usuario) {
  userTableBody.replaceChildren(
    ...Object.entries(usuario)
      .filter(([key, value]) => key !== "status" && key !== "token" && !(value === null && key !== "id"))
      .map(([key, value]) => {
        const row = document.createElement("tr");
        const label = document.createElement("th");
        label.scope = "row";
        label.textContent = FIELD_LABELS[key] ?? key;
        const cell = document.createElement("td");
        const idPendente = key === "id" && value === null;
        cell.textContent = idPendente
          ? "sendo gerado..."
          : TIME_FIELDS.has(key)
            ? new Date(value).toLocaleTimeString("pt-BR")
            : value;
        cell.classList.toggle("pending-value", idPendente);
        row.append(label, cell);
        return row;
      }),
  );

  const concluido = usuario.status === "concluido";
  accepted.classList.toggle("concluido", concluido);
  acceptedCaption.textContent = concluido
    ? "Cadastro concluído pelo worker!"
    : "Cadastro recebido! Processando em segundo plano...";
}

function pararPolling() {
  if (polling) {
    clearInterval(polling);
    polling = null;
  }
}

function iniciarPolling(token) {
  pararPolling();
  polling = setInterval(async () => {
    const response = await fetch(`http://localhost:3003/users/${token}`);
    const usuario = await response.json();
    renderUsuario(usuario);

    if (usuario.status === "concluido") {
      pararPolling();
    }
  }, 1000);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    nome: data.get("nome"),
    idade: Number(data.get("idade")),
  };

  error.hidden = true;

  try {
    const response = await fetch("http://localhost:3003/users", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });

    const usuario = await response.json();

    if (!response.ok) {
      throw new Error(usuario.erro ?? "Falha ao cadastrar usuário.");
    }

    renderUsuario(usuario);
    iniciarPolling(usuario.token);

    form.reset();
    form.hidden = true;
    accepted.hidden = false;
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.hidden = false;
  }
});

newUserButton.addEventListener("click", () => {
  pararPolling();
  accepted.hidden = true;
  form.hidden = false;
});
