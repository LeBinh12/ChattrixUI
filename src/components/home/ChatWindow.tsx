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

export default function ChatWindow() {
  const selectedChat = useRecoilValue(selectedChatState);
  const user = useRecoilValue(userAtom);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [limit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [messagesCache, setMessagesCache] = useRecoilState(messagesCacheAtom);

  const conversationKey = selectedChat
    ? selectedChat.group_id &&
      selectedChat.group_id !== "000000000000000000000000"
      ? `group_${selectedChat.group_id}`
      : `user_${selectedChat.user_id}`
    : "";

  // Track số lượng messages đã load từ server cho mỗi conversation
  const loadedCountRef = useRef<{ [key: string]: number }>({});

  // Kiểm tra xem conversation này đã có cache chưa
  const hasCache =
    conversationKey && messagesCache[conversationKey]?.length > 0;

  const fetchMessages = useCallback(async () => {
    if (!user?.data.id || !conversationKey) return;

    // Nếu cache đã có → dùng luôn
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
        limit,
        0
      );
      console.log("messageAPI", res.data.data);
      const sorted = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Cập nhật cache
      setMessagesCache((prev) => ({
        ...prev,
        [conversationKey]: sorted,
      }));

      setMessages(sorted);

      // Track số lượng đã load
      loadedCountRef.current[conversationKey] = sorted.length;

      // Nếu số messages trả về < limit → đã hết
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

        setMessagesCache((prev) => {
          const oldMessages = prev[msgKey] || [];
          const exists = oldMessages.some((m) => m.id === msg.id);
          if (exists) return prev;
          return {
            ...prev,
            [msgKey]: [...oldMessages, msg],
          };
        });
        console.log("message realtime", msg);

        // chỉ cập nhật UI nếu đang xem đúng conversation
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
  ]);

  // Xử lý pagination cho nhắn tin
  const loadMoreMessages = async () => {
    if (!selectedChat || isLoadingMore || !hasMore || !conversationKey) return;

    try {
      setIsLoadingMore(true);

      // Tính skip dựa trên số lượng messages hiện có trong cache
      const currentCount =
        messagesCache[conversationKey]?.length || messages.length;
      const newSkip = currentCount;

      console.log("Loading more from skip:", newSkip);

      const res = await messageAPI.getMessage(
        selectedChat.user_id ?? "",
        selectedChat.group_id ?? "",
        limit,
        newSkip
      );

      const newMessages = (res.data.data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log("Loaded more:", newMessages.length);

      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }

      // Cập nhật cache - thêm tin cũ vào đầu
      setMessagesCache((prev) => {
        const oldMessages = prev[conversationKey] || [];
        // Filter duplicate by id
        const combined = [...newMessages, ...oldMessages];
        const unique = combined.filter(
          (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
        );
        return {
          ...prev,
          [conversationKey]: unique,
        };
      });

      // Cập nhật UI
      setMessages((prev) => {
        const combined = [...newMessages, ...prev];
        const unique = combined.filter(
          (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
        );
        return unique;
      });

      // Track số lượng đã load
      loadedCountRef.current[conversationKey] =
        currentCount + newMessages.length;

      // Nếu số messages mới < limit → đã hết
      setHasMore(newMessages.length >= limit);
    } catch (err) {
      console.error("❌ Lỗi khi tải thêm tin nhắn:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Không có chat được chọn
  if (!selectedChat) {
    return (
      <div className="flex flex-col flex-1 h-screen bg-[#357ae8] text-white">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="opacity-20 w-40 h-40 sm:w-52 sm:h-52 object-contain select-none"
          />
        </div>
      </div>
    );
  }

  // Đang loading lần đầu VÀ chưa có cache
  if (loading && !hasCache) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#357ae8] text-white">
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
