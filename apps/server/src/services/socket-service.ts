import { Server } from "socket.io";
import { Redis } from "ioredis";

import { prismaClient } from "./prisma";
import { produceMessage } from "./kafka";

// constants
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: JSON.parse(process.env.REDIS_PORT || "10200"),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
};

const REDIS_MESSAGE_CHANNEL = "MESSAGES";

const pub = new Redis(REDIS_CONFIG);
const sub = new Redis(REDIS_CONFIG);

export class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init socket service....");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    sub.subscribe(REDIS_MESSAGE_CHANNEL);
  }

  public initListeners() {
    const io = this.io;
    console.log("Init socket listeners");

    io.on("connect", (socket) => {
      console.log(`New socket connected ${socket.id}`);

      socket.on(
        "event:message",
        async ({ message, id }: { message: string; id?: string }) => {
          console.log("New message rec", message, "from", id);
          await pub.publish(
            REDIS_MESSAGE_CHANNEL,
            JSON.stringify({ message, id })
          );
        }
      );
    });

    sub.on("message", async (channel, message) => {
      if (channel === REDIS_MESSAGE_CHANNEL) {
        console.log("New Message", message);
        io.emit("message", message);

        await produceMessage(message);
        console.log("Message produced to kafka");

        // await prismaClient.message.create({
        //   data: {
        //     text: message,
        //   },
        // });
      }
    });
  }

  get io() {
    return this._io;
  }
}
