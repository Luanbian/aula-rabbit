import express from "express";
import { nanoid } from "nanoid";

const app = express();
const port = 3000;

app.use(express.json({ type: ["application/json", "text/plain"] }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/users", (req, res) => {
  const { nome, idade } = req.body;
  setTimeout(() => {
    res.status(201).json({ id: nanoid(), nome, idade });
  }, 1500);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
