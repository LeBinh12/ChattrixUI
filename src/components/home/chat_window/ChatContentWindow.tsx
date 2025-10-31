import { motion, AnimatePresence } from "framer-motion";
import type { Messages } from "../../../types/Message";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import MessageItem from "../../chat/chat_content/MessageItem";
import MediaPreviewModal from "./MediaPreviewModal";

type Props = {
  display_name: string;
  currentUserId?: string;
  messages: Messages[];
  loadMoreMessages: () => void;
  isLoadingMore: boolean;
};

export default function ChatContentWindow({
  display_name,
  currentUserId,
  messages,
  loadMoreMessages,
  isLoadingMore,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  // Thu thập tất cả media (image, video) từ messages
  const allMedia = messages.flatMap((msg) =>
    (msg.media_ids || [])
      .filter((m) => m.type === "image" || m.type === "video")
      .map((m) => ({
        id: m.url,
        type: m.type,
        url: m.url,
        filename: m.filename || m.url,
        timestamp: msg.created_at,
      }))
  );

  const prevMessageCount = useRef(0);
  const prevDisplayName = useRef(display_name);
  const lastMessageId = useRef<string | null>(null);
  const handleScroll = async () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);

    // Khi cuộn đến gần đầu và chưa loading
    if (scrollTop < 50 && !isLoadingMore) {
      const prevScrollHeight = container.scrollHeight;
      const prevScrollTop = container.scrollTop;

      await loadMoreMessages();

      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const newScrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop =
          newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    }
  };

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    requestAnimationFrame(() => {
      containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
      setShowScrollButton(false);
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // FIX 1: Reset khi chuyển conversation (display_name thay đổi)
    if (prevDisplayName.current !== display_name) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      prevDisplayName.current = display_name;
      prevMessageCount.current = messages.length;
      lastMessageId.current = messages[messages.length - 1]?.id || null;
      return;
    }

    // Kiểm tra tin nhắn mới thông qua ID thay vì chỉ số lượng
    const currentLastMessageId = messages[messages.length - 1]?.id;
    const hasNewMessage =
      messages.length > prevMessageCount.current &&
      currentLastMessageId !== lastMessageId.current;

    if (hasNewMessage) {
      const newMessage = messages[messages.length - 1];
      const isMyMessage = newMessage?.sender_id === currentUserId;

      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      // Luôn scroll xuống nếu là tin nhắn của mình HOẶC đang ở gần đáy
      if (isMyMessage || isAtBottom) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }

      lastMessageId.current = currentLastMessageId;
    }

    prevMessageCount.current = messages.length;
  }, [messages, display_name, currentUserId]);

  return (
    <>
      {/* Logo mờ giữa */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/assets/logo.png"
          alt="logo"
          className="opacity-20 w-40 h-40 sm:w-52 sm:h-52 object-contain select-none"
        />
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 p-3 overflow-y-auto bg-gradient-to-b from-[#2665b1]
                scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent"
      >
        {isLoadingMore && (
          <div className="text-center text-white py-2">Đang tải thêm...</div>
        )}

        {/* Container scrollable */}
        <div className="relative space-y-3">
          {messages.length === 0 ? (
            // Hiển thị message tạm thời khi chưa có tin nhắn
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center space-y-2">
                <div className="text-white/80 text-lg font-medium">
                  Chưa có tin nhắn nào với {display_name}
                </div>
                <div className="text-white/60 text-sm">
                  Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageItem
                key={msg.id}
                msg={msg}
                index={index}
                messages={messages}
                currentUserId={currentUserId}
                onPreviewMedia={setPreviewMedia}
                display_name={display_name}
                size="large"
              />
            ))
          )}
        </div>
      </div>
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-60 bg-[#2665b1] hover:bg-[#1b4c8a] text-white rounded-full shadow-lg p-3 backdrop-blur-sm z-20"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <MediaPreviewModal
        mediaUrl={previewMedia}
        onClose={() => setPreviewMedia(null)}
        allMedia={allMedia}
      />
    </>
  );
}
