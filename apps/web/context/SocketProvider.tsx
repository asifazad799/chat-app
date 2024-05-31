"use client";

import React, {
  useCallback,
  createContext,
  useEffect,
  useContext,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: string) => any;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);

  if (!state) throw new Error("state is undefined");

  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
      console.log("send message", msg);
    },
    [socket]
  );

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    setSocket(_socket);

    return () => {
      console.log("cleaning up socket");

      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
