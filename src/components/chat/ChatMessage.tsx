import ChatHeader from "./ChatHeader";
import ChatContent from "./ChatContent";
import ChatInput from "./ChatInput";
import { useEffect, useState } from "react";
import ChatSkeleton from "../../skeleton/ChatSkeleton";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../recoil/atoms/userAtom";
import { messageAPI } from "../../api/messageApi";
import type { Conversation } from "../../types/conversation";
import type { Messages } from "../../types/Message";
import { getSocket } from "../../api/socket";

type Props = {
  onFriend: Conversation;
  onBack: () => void;
  chatID: string;
};

export default function ChatMessage({ onFriend, onBack, chatID }: Props) {
  const [loading, setLoading] = useState(true);
  const user = useRecoilValue(userAtom);
  const [messages, setMessages] = useState<Messages[]>([]);

  const currentUserId = user?.data?.id;
  const receiverId = onFriend?.user_id;

  // lắng nghe lịch sử nhắn tin
  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await messageAPI.getMessage(receiverId);
        const sorted = (res.data.data || []).sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
      } catch (err) {
        console.error("❌ Lỗi khi tải tin nhắn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUserId, receiverId]);

  // lắng nghe socket realtime

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat" && data.message) {
          const msg = data.message;
          // kiểm tra nếu tin thuộc cuộc hội thoại hiện tại
          if (
            (msg.sender_id === currentUserId &&
              msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      } catch (error) {
        console.warn("⚠️ Lỗi parse socket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [currentUserId, receiverId]);

  useEffect(() => {
    // giả lập delay load dữ liệu (1s)
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [chatID]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const newMsg: Messages = {
      id: receiverId + Date.now() + receiverId, // tạm thời tạo ID cục bộ
      sender_id: currentUserId!,
      receiver_id: receiverId!,
      content,
      created_at: new Date().toISOString(),
    };

    // hiển thị ngay khi gửi (UI nhanh hơn)
    setMessages((prev) => [...prev, newMsg]);
  };

  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onUser={onFriend} onBack={onBack} />
      <ChatContent
        onUser={onFriend}
        currentUserId={currentUserId}
        messages={messages}
      />
      <ChatInput
        senderID={user?.data}
        receiverID={onFriend}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
