import { nanoid } from "nanoid";
import { conectar, EXCHANGE, QUEUE, ROUTING_KEY_CONCLUIDO } from "./fila/topologia";

async function main() {
  const { canal } = await conectar();
  await canal.prefetch(1);

  console.log(`Worker aguardando mensagens na fila "${QUEUE}"...`);

  canal.consume(QUEUE, async (mensagem) => {
    if (!mensagem) return;

    const { token, nome } = JSON.parse(mensagem.content.toString());
    if (!nome) {
      console.error(`Mensagem descartada: sem "nome" (token: ${token ?? "desconhecido"})`);
      canal.ack(mensagem);
      return;
    }

    console.log(`Processando cadastro de ${nome}...`);

    await new Promise((resolve) => setTimeout(resolve, 15000));

    const id = nanoid();
    console.log(`Cadastro de ${nome} concluído (id: ${id})`);

    canal.publish(
      EXCHANGE,
      ROUTING_KEY_CONCLUIDO,
      Buffer.from(JSON.stringify({ token, id, concluidoEm: Date.now() })),
      { persistent: true },
    );

    canal.ack(mensagem);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o worker:", err);
  process.exit(1);
});
