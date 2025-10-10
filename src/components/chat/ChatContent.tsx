import { useEffect, useRef } from "react";
import type { Messages } from "../../types/Message";
import type { Conversation } from "../../types/conversation";

type Props = {
  onUser: Conversation;
  currentUserId?: string;
  messages: Messages[];
};

export default function ChatContent({
  onUser,
  currentUserId,
  messages,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 p-3 overflow-y-auto bg-gradient-to-b from-[#2665b1]
                scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent"
    >
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <img
          src="assets/logo.png"
          alt="Logo"
          className="w-40 h-40 opacity-20"
        />
      </div>

      <div className="relative space-y-3">
        {messages.map((msg) =>
          msg.sender_id === currentUserId ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-xs bg-[#1b4c8a] text-white p-3 rounded-lg shadow">
                <p>{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-400 text-white font-bold mr-3 shadow-md overflow-hidden">
                <img
                  src={
                    onUser.avatar &&
                    onUser.avatar.trim() !== "" &&
                    onUser.avatar !== "null"
                      ? onUser.avatar
                      : "/assets/logo.png"
                  }
                  alt={onUser.display_name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="max-w-xs bg-gray-200 p-3 rounded-lg shadow text-black">
                <p>{msg.content}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
