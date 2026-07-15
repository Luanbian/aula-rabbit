import amqplib, { type Channel, type ChannelModel } from "amqplib";

export const RABBITMQ_URL = "amqp://admin:admin@localhost:5673";

export const EXCHANGE = "cadastros";
export const EXCHANGE_TYPE = "direct";
export const ROUTING_KEY = "usuario.cadastrado";
export const QUEUE = "fila.cadastros";

export async function configurarTopologia(canal: Channel) {
  await canal.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
  await canal.assertQueue(QUEUE, { durable: true });
  await canal.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
}

export async function conectar(): Promise<{ conexao: ChannelModel; canal: Channel }> {
  const conexao = await amqplib.connect(RABBITMQ_URL);
  const canal = await conexao.createChannel();
  await configurarTopologia(canal);
  return { conexao, canal };
}
