"use-client";

export default function Page() {
  return (
    <div className="flex w-full m-2">
      <div>
        <h1 className="text-3xl font-bold">All messages</h1>
        <div className="flex gap-3 mt-3">
          <input
            className="h-[40px] rounded-sm p-[10px] border-[1px] border-black border-solid w-[200px]"
            placeholder="Enter message"
          ></input>
          <button className="p-[10px] h-[40px] bg-slate-400 rounded-sm">
            <p className="text-sm">Send</p>
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <p className="text-md">message</p>
          <p className="text-md">message</p>
          <p className="text-md">message</p>
        </div>
      </div>
    </div>
  );
}
