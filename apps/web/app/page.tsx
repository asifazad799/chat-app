"use client";

import { useSocket } from "@context/SocketProvider";
import React, { Dispatch, useEffect, useState } from "react";

const useDebounce = (
  initialState: any,
  timer: number = 500
): [any, Dispatch<any>] => {
  const [value, setValue] = useState<any>(initialState);
  const [debounced, setDebouncedValue] = useState<any>(initialState);

  useEffect(() => {
    const debounced = setTimeout(() => {
      setDebouncedValue(value);
    }, timer);

    return () => {
      clearTimeout(debounced);
    };
  }, [value]);

  return [debounced, setValue];
};

export default function Page() {
  const [message, setMessage] = useDebounce("");

  const { sendMessage, socket, messages } = useSocket();

  return (
    <div className="flex w-full m-2">
      <div>
        <h1 className="text-3xl font-bold">All messages</h1>
        <div className="flex flex-col gap-2 mt-3 max-h-[500px] overflow-y-auto">
          {messages?.map((item) => {
            return (
              <p
                key={item?.message + item.id}
                className={`text-md p-[10px] min-w-[30px] rounded-2xl ${socket?.id === item.id ? "rounded-br-none" : "rounded-bl-none"} bg-slate-400`}
              >
                {item.message}
              </p>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3">
          <input
            className="h-[40px] rounded-sm p-[10px] border-[1px] border-black border-solid w-[200px]"
            placeholder="Enter message"
            onChange={(e) => setMessage(e.target.value)}
          ></input>
          <button
            className="p-[10px] h-[40px] bg-slate-400 rounded-sm"
            onClick={() => sendMessage(message)}
          >
            <p className="text-sm">Send</p>
          </button>
        </div>
      </div>
    </div>
  );
}
