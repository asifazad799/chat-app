"use client";

import React, {
  useCallback,
  createContext,
  useEffect,
  useContext,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

// types
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: string) => any;
  socket?: Socket;
  messages: MessagesType[];
}

interface MessagesType {
  message: string;
  id?: string | number;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);

  if (!state) throw new Error("state is undefined");

  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<MessagesType[]>([]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      if (socket) {
        socket.emit("event:message", { id: socket.id, message: msg });
      }
      console.log("send message", msg);
    },
    [socket]
  );

  const onMessageReceived = useCallback((receivedMessage: string) => {
    console.log(JSON.parse(receivedMessage));

    setMessages((prev) => [...prev, JSON.parse(receivedMessage)]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageReceived);

    setSocket(_socket);

    return () => {
      console.log("cleaning up socket");

      _socket.disconnect();
      _socket.off("message", onMessageReceived);
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, socket, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
