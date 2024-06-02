import { Kafka, Producer } from "kafkajs";
import { readFileSync } from "fs";
import path from "path";

export const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST + ""],
  ssl: {
    ca: [readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USER + "",
    password: process.env.KAFKA_PASS + "",
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;

  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();

  await producer?.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
}
