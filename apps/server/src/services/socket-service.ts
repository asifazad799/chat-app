import { Server } from "socket.io";

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
  }

  public initListeners() {
    const io = this.io;
    console.log("Init socket listeners");
    io.on("connect", (socket) => {
      console.log(`New socket connected ${socket.id}`);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message rec", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}
