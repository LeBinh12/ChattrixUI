import ChatHeader from "./ChatHeader";
import ChatContent from "./ChatContent";
import ChatInput from "./ChatInput";
import { useCallback, useEffect, useState } from "react";
import ChatSkeleton from "../../skeleton/ChatSkeleton";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../recoil/atoms/userAtom";
import { messageAPI } from "../../api/messageApi";
import type { Conversation } from "../../types/conversation";
import type { Messages } from "../../types/Message";
import { socketManager } from "../../api/socket";

type Props = {
  onFriend: Conversation;
  onBack: () => void;
  chatID: string;
};

export default function ChatMessage({ onFriend, onBack, chatID }: Props) {
  const [loading, setLoading] = useState(true);
  const user = useRecoilValue(userAtom);
  const [messages, setMessages] = useState<Messages[]>([]);
  console.log("Chon:", onFriend);
  const currentUserId = user?.data?.id;
  const receiverId = onFriend?.user_id;
  const groupID = onFriend?.group_id;

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [limit, setLimit] = useState(30);
  const [skip, setSkip] = useState(0);
  // lắng nghe lịch sử nhắn tin
  // fetch lịch sử nhắn tin
  const fetchMessages = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await messageAPI.getMessage(receiverId, groupID, limit, 0);
      const sorted = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      console.log("Tin nahwns", res);
      setMessages(sorted);
    } catch (err) {
      console.error("❌ Lỗi khi tải tin nhắn:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, receiverId, groupID, limit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // lắng nghe socket realtime

  useEffect(() => {
    if (!currentUserId) return;

    // connect chỉ 1 lần, giữ trạng thái ping/pong cho toàn trang
    socketManager.connect(currentUserId);

    const listener = (data: any) => {
      if (data.type === "chat" && data.message) {
        const msg = data.message;
        if (
          (msg.sender_id === currentUserId && msg.receiver_id === receiverId) ||
          (msg.sender_id === receiverId && msg.receiver_id === currentUserId) ||
          (msg.group_id && msg.group_id === groupID)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    };

    socketManager.addListener(listener);

    return () => {
      socketManager.removeListener(listener);
    };
  }, [currentUserId, receiverId, groupID]);

  useEffect(() => {
    // giả lập delay load dữ liệu (1s)
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [chatID]);

  // xử lý pagination cho nhắn tin
  const loadMoreMessages = async () => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const newSkip = skip + limit;
      const res = await messageAPI.getMessage(
        receiverId,
        groupID,
        limit,
        newSkip
      );
      const newMessages = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]); // thêm tin nhắn cũ lên đầu
        setSkip(newSkip); // tăng skip
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải thêm tin nhắn:", err);
    } finally {
      setIsLoadingMore(false);
    }
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
        loadMoreMessages={loadMoreMessages}
        isLoadingMore={isLoadingMore}
      />
      <ChatInput senderID={user?.data} receiverID={onFriend} />
    </div>
  );
}
