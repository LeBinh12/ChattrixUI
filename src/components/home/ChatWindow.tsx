import { useCallback, useEffect, useState, useRef } from "react";
import ChatHeaderWindow from "./chat_window/ChatHeaderWindow";
import ChatContentWindow from "./chat_window/ChatContentWindow";
import ChatInputWindow from "./chat_window/ChatInputWindow";
import ChatWindowSkeleton from "../../skeleton/ChatWindowSkeleton";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedChatState } from "../../recoil/atoms/chatAtom";
import { userAtom } from "../../recoil/atoms/userAtom";
import type { Messages } from "../../types/Message";
import { messageAPI } from "../../api/messageApi";
import { socketManager } from "../../api/socket";
import { messagesCacheAtom } from "../../recoil/atoms/messageAtom";
import EmptyChatWindow from "./EmptyChatWindow";
import { bellStateAtom } from "../../recoil/atoms/bellAtom";

export default function ChatWindow() {
  const selectedChat = useRecoilValue(selectedChatState);
  const user = useRecoilValue(userAtom);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [limit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [bell] = useRecoilState(bellStateAtom);
  const [messagesCache, setMessagesCache] = useRecoilState(messagesCacheAtom);

  const conversationKey = selectedChat
    ? selectedChat.group_id &&
      selectedChat.group_id !== "000000000000000000000000"
      ? `group_${selectedChat.group_id}`
      : `user_${selectedChat.user_id}`
    : "";

  const loadedCountRef = useRef<{ [key: string]: number }>({});

  const hasCache =
    conversationKey && messagesCache[conversationKey]?.length > 0;
  const tingAudioRef = useRef<HTMLAudioElement | null>(null);

  //  Preload âm thanh để không bị delay khi phát
  useEffect(() => {
    tingAudioRef.current = new Audio("/assets/ting.mp3");
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!bell?.is_muted && tingAudioRef.current) {
      tingAudioRef.current.currentTime = 0;
      tingAudioRef.current.play().catch((err) => {
        console.warn("Không thể phát âm thanh:", err);
      });
    }
  }, [bell]);

  const fetchMessages = useCallback(async () => {
    if (!user?.data.id || !conversationKey) return;

    if (messagesCache[conversationKey]?.length) {
      setMessages(messagesCache[conversationKey]);
      setHasMore(messagesCache[conversationKey].length >= limit);
      return;
    }

    try {
      setLoading(true);
      const res = await messageAPI.getMessage(
        selectedChat?.user_id ?? "",
        selectedChat?.group_id ?? "",
        limit
      );
      console.log("messageAPI", res.data.data);
      const sorted = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessagesCache((prev) => ({
        ...prev,
        [conversationKey]: sorted,
      }));

      setMessages(sorted);
      loadedCountRef.current[conversationKey] = sorted.length;
      setHasMore(sorted.length >= limit);

      console.log(
        "Loaded messages:",
        sorted.length,
        "hasMore:",
        sorted.length >= limit
      );
    } catch (err) {
      console.error("❌ Lỗi khi tải tin nhắn:", err);
    } finally {
      setLoading(false);
    }
  }, [
    user?.data.id,
    selectedChat,
    limit,
    conversationKey,
    messagesCache,
    setMessagesCache,
  ]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
  }, [selectedChat]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setHasLeftGroup(false);
  }, [selectedChat]);

  // Lắng nghe socket realtime
  useEffect(() => {
    if (!user?.data.id) return;

    socketManager.connect(user?.data.id);

    const listener = (data: any) => {
      // Xử lý tin nhắn mới
      if (data.type === "chat" && data.message) {
        const msg = data.message;

        const msgKey =
          msg.group_id && msg.group_id !== "000000000000000000000000"
            ? `group_${msg.group_id}`
            : `user_${
                msg.sender_id === user?.data.id
                  ? msg.receiver_id
                  : msg.sender_id
              }`;

        if (msg.sender_id !== user?.data.id) {
          playNotificationSound();
        }

        setMessagesCache((prev) => {
          const oldMessages = prev[msgKey] || [];
          const exists = oldMessages.some((m) => m.id === msg.id);
          if (exists) return prev;
          return {
            ...prev,
            [msgKey]: [...oldMessages, msg],
          };
        });

        if (msgKey === conversationKey) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id);
            if (exists) return prev;
            return [...prev, msg];
          });
        }

        if (
          msg.type === "system" &&
          msg.sender_id === user?.data.id &&
          msg.group_id === selectedChat?.group_id
        ) {
          setHasLeftGroup(true);
          return;
        }
      }

      // XỬ LÝ TRẠNG THÁI ĐÃ XEM (UPDATE_SEEN)
      if (data.type === "update_seen" && data.message) {
        const seenData = data.message;
        console.log("🔵 Trạng thái seen nhận được:", seenData);

        const { last_seen_message_id, receiver_id, sender_id } = seenData;

        // Xác định conversation key
        // Nếu mình là sender → conversation với receiver
        // Nếu mình là receiver → conversation với sender
        const seenConversationKey =
          sender_id === user?.data.id
            ? `user_${receiver_id}`
            : `user_${sender_id}`;

        // Hàm update status cho messages
        const updateMessageStatus = (msgs: Messages[]) => {
          let updated = false;
          const newMessages = msgs.map((msg) => {
            // Chỉ update tin nhắn MÀ MÌNH GỬI ĐI
            // và message_id <= last_seen_message_id
            if (
              msg.sender_id === user?.data.id &&
              msg.id <= last_seen_message_id &&
              msg.status !== "seen"
            ) {
              updated = true;
              console.log(`Update message ${msg.id} to "seen"`);
              return {
                ...msg,
                status: "seen",
                is_read: true,
              };
            }
            return msg;
          });

          if (updated) {
            console.log("Messages updated successfully");
          } else {
            console.log("No messages updated");
          }

          return newMessages;
        };

        // Cập nhật cache
        setMessagesCache((prev) => {
          const cachedMessages = prev[seenConversationKey];
          if (!cachedMessages || cachedMessages.length === 0) {
            console.log(" No cached messages found for:", seenConversationKey);
            return prev;
          }

          return {
            ...prev,
            [seenConversationKey]: updateMessageStatus(cachedMessages),
          };
        });

        // Cập nhật UI nếu đang xem conversation này
        if (seenConversationKey === conversationKey) {
          setMessages((prev) => updateMessageStatus(prev));
        }
      }
    };

    socketManager.addListener(listener);

    return () => {
      socketManager.removeListener(listener);
    };
  }, [
    user?.data.id,
    selectedChat?.group_id,
    conversationKey,
    setMessagesCache,
    playNotificationSound,
  ]);

  const loadMoreMessages = async () => {
    if (!selectedChat || isLoadingMore || !hasMore || !conversationKey) return;

    try {
      setIsLoadingMore(true);

      // 🔹 Lấy thời gian của tin nhắn cũ nhất trong cache
      const oldMessages = messagesCache[conversationKey] || messages;
      if (oldMessages.length === 0) return;

      const oldestMessage = oldMessages[0];
      const beforeTime = oldestMessage.created_at;

      const res = await messageAPI.getMessage(
        selectedChat.user_id ?? "",
        selectedChat.group_id ?? "",
        limit,
        beforeTime
      );

      const newMessages = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }

      setMessagesCache((prev) => {
        const oldMessages = prev[conversationKey] || [];
        const combined = [...newMessages, ...oldMessages];
        const unique = combined.filter(
          (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
        );
        return {
          ...prev,
          [conversationKey]: unique,
        };
      });

      setMessages((prev) => {
        const combined = [...newMessages, ...prev];
        const unique = combined.filter(
          (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
        );
        return unique;
      });

      setHasMore(newMessages.length >= limit);
    } catch (err) {
      console.error("❌ Lỗi khi tải thêm tin nhắn:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Gửi seen status khi xem tin nhắn
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    console.log("📨 Tin nhắn cuối cùng:", {
      id: lastMsg.id,
      sender: lastMsg.sender_id,
      currentUser: user?.data.id,
      isMine: lastMsg.sender_id === user?.data.id,
    });

    // Chỉ gửi seen nếu tin nhắn cuối KHÔNG PHẢI của mình
    if (lastMsg.sender_id !== user?.data.id) {
      console.log(" Gửi seen cho message:", lastMsg.id);
      socketManager.sendSeenMessage(
        lastMsg.id,
        selectedChat?.user_id,
        user?.data.id
      );
    } else {
      console.log("⏭️ Bỏ qua - tin nhắn của mình");
    }
  }, [messages, selectedChat, user]);

  if (!selectedChat) {
    return <EmptyChatWindow />;
  }

  if (loading && !hasCache) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-transparent text-white z-1">
      <ChatHeaderWindow
        avatar={selectedChat?.avatar}
        display_name={selectedChat?.display_name ?? "không tên"}
        status={selectedChat.status}
        update_at={selectedChat.update_at}
      />
      <ChatContentWindow
        display_name={selectedChat?.display_name ?? "không tên"}
        currentUserId={user?.data.id}
        messages={messages}
        loadMoreMessages={loadMoreMessages}
        isLoadingMore={isLoadingMore}
      />
      <ChatInputWindow
        user_id={user?.data.id || ""}
        receiver_id={selectedChat?.user_id ?? ""}
        group_id={selectedChat?.group_id ?? ""}
        hasLeftGroup={hasLeftGroup}
        avatar={selectedChat.avatar}
        display_name={selectedChat.display_name}
      />
    </div>
  );
}
