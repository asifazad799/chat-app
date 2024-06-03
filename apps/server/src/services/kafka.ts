import { Kafka, Producer } from "kafkajs";
import { readFileSync } from "fs";
import path from "path";

import { prismaClient } from "./prisma";

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOperation(
  operation: VoidFunction,
  retries: number,
  delay: number
) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed: ${error?.message}`);
      if (attempt < retries) {
        await sleep(delay);
      }
    }
  }
  throw lastError; // All retries failed
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // in milliseconds

export async function consumeMessage() {
  const consumer = kafka.consumer({
    groupId: "default",
    minBytes: 500000,
  });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({
      batch,
      heartbeat,
      commitOffsetsIfNecessary,
      pause,
      resolveOffset,
    }) => {
      const messages = batch?.messages?.map((message) => {
        console.log(message?.value?.toString(), "Batch messages processing");
        return {
          // key: message.key,
          text: message?.value?.toString() + "",
        };
      });
      try {
        await retryOperation(
          async () => {
            await prismaClient.message.createMany({
              data: messages,
              skipDuplicates: true, // Optional: skip duplicates based on unique constraints
            });
          },
          MAX_RETRIES,
          RETRY_DELAY
        );
        // Manually commit offsets after successful insert
        // const lastMessage = batch.messages[batch.messages.length - 1];
        // await commitOffsetsIfNecessary({
        //   topics: [
        //     {
        //       topic: batch.topic,
        //       partitions: [
        //         {
        //           partition: batch.partition,
        //           offset: (parseInt(lastMessage.offset, 10) + 1).toString(),
        //         },
        //       ],
        //     },
        //   ],
        // });
        batch.messages.forEach((message) => resolveOffset(message.offset));
      } catch (error) {
        console.error("Error during bulk insert, all retries failed", error);
      }
      await heartbeat();
    },
    // autoCommit: true,
    // eachMessage: async ({ message, pause }) => {
    //   if (!message.value) return;
    //   console.log("New Message Received");
    //   try {
    //     await prismaClient.message.create({
    //       data: {
    //         text: message?.value?.toString() + "",
    //       },
    //     });
    //   } catch (error) {
    //     pause();
    //     setTimeout(() => {
    //       consumer.resume([{ topic: "MESSAGES" }]);
    //     }, 1000);
    //   }
    // },
  });
}
