import { conectar, EXCHANGE, QUEUE, ROUTING_KEY_CONCLUIDO } from "./fila/topologia";

async function main() {
  const { canal } = await conectar();
  await canal.prefetch(1);

  console.log(`Worker aguardando mensagens na fila "${QUEUE}"...`);

  canal.consume(QUEUE, async (mensagem) => {
    if (!mensagem) return;

    const usuario = JSON.parse(mensagem.content.toString());
    if (!usuario.nome) {
      console.error(`Mensagem descartada: sem "nome" (id: ${usuario.id ?? "desconhecido"})`);
      canal.ack(mensagem);
      return;
    }

    console.log(`Processando cadastro de ${usuario.nome}...`);

    await new Promise((resolve) => setTimeout(resolve, 15000));

    console.log(`Cadastro de ${usuario.nome} concluído (id: ${usuario.id})`);

    canal.publish(
      EXCHANGE,
      ROUTING_KEY_CONCLUIDO,
      Buffer.from(JSON.stringify({ id: usuario.id, concluidoEm: Date.now() })),
      { persistent: true },
    );

    canal.ack(mensagem);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o worker:", err);
  process.exit(1);
});
