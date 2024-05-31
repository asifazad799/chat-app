// import http from "http";

// async function init() {
//   const httpServer = http.createServer();
//   const PORT = 8000;

//   httpServer.listen(PORT, () => {
//     console.log(`HTTP server running at : http://localhost:${PORT}`);
//   });
// }

// // init();

import http from "http";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { SocketService } from "./services";

const app = express();
const socket = new SocketService();
const server = http.createServer(app);

const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  const { text = "no text found" } = req?.query;

  res.json({ message: `hi ${text}` });
});

socket.io.attach(server);
socket.initListeners();

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
