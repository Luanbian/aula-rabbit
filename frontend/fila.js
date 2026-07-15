const form = document.getElementById("form");
const error = document.getElementById("error");
const accepted = document.getElementById("accepted");
const userTableBody = document.getElementById("user-table-body");
const newUserButton = document.getElementById("new-user");

const FIELD_LABELS = {
  id: "ID",
  nome: "Nome",
  idade: "Idade",
  criadoEm: "Recebido em",
};

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

    userTableBody.replaceChildren(
      ...Object.entries(usuario).map(([key, value]) => {
        const row = document.createElement("tr");
        const label = document.createElement("th");
        label.scope = "row";
        label.textContent = FIELD_LABELS[key] ?? key;
        const cell = document.createElement("td");
        cell.textContent =
          key === "criadoEm" ? new Date(value).toLocaleTimeString("pt-BR") : value;
        row.append(label, cell);
        return row;
      }),
    );

    form.reset();
    form.hidden = true;
    accepted.hidden = false;
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.hidden = false;
  }
});

newUserButton.addEventListener("click", () => {
  accepted.hidden = true;
  form.hidden = false;
});
