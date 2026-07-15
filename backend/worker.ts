import { conectar, QUEUE } from "./fila/topologia";

async function main() {
  const { canal } = await conectar();
  await canal.prefetch(1);

  console.log(`Worker aguardando mensagens na fila "${QUEUE}"...`);

  canal.consume(QUEUE, async (mensagem) => {
    if (!mensagem) return;

    const usuario = JSON.parse(mensagem.content.toString());
    console.log(`Processando cadastro de ${usuario.nome}...`);

    await new Promise((resolve) => setTimeout(resolve, 15000));

    console.log(`Cadastro de ${usuario.nome} concluído (id: ${usuario.id})`);
    canal.ack(mensagem);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o worker:", err);
  process.exit(1);
});
