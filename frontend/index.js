const form = document.getElementById("form");
const overlay = document.getElementById("overlay");
const error = document.getElementById("error");
const success = document.getElementById("success");
const userTableBody = document.getElementById("user-table-body");
const newUserButton = document.getElementById("new-user");

const FIELD_LABELS = {
  id: "ID",
  nome: "Nome",
  idade: "Idade",
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    nome: data.get("nome"),
    idade: Number(data.get("idade")),
  };

  overlay.hidden = false;
  error.hidden = true;

  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });

    const user = await response.json();

    userTableBody.replaceChildren(
      ...Object.entries(user).map(([key, value]) => {
        const row = document.createElement("tr");
        const label = document.createElement("th");
        label.scope = "row";
        label.textContent = FIELD_LABELS[key] ?? key;
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(label, cell);
        return row;
      }),
    );

    form.reset();
    form.hidden = true;
    success.hidden = false;
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.hidden = false;
  } finally {
    overlay.hidden = true;
  }
});

newUserButton.addEventListener("click", () => {
  success.hidden = true;
  form.hidden = false;
});
