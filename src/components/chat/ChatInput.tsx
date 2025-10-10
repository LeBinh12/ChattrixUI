import EmojiPicker from "emoji-picker-react";
import { motion } from "framer-motion";
import { Mic, Plus, Video, Image, Send, Smile, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../../api/socket";

export default function ChatInput({
  senderID,
  receiverID,
  onSendMessage,
}: any) {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null); // ref để bắt click ra ngoài

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    // Không ẩn picker, để người dùng chọn tiếp
  };

  const handleSend = () => {
    if (message.trim().length === 0) return;
    sendMessage(senderID.id, receiverID.user_id, message); // socket gửi
    setMessage("");
  };
  // Ẩn emoji picker khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="p-2 sm:p-3 flex items-center shadow-[0_-2px_6px_rgba(0,0,0,0.1)] bg-white">
      {/* Dấu cộng */}
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <Plus size={20} className="text-gray-600" />
        </button>
      </motion.div>

      {/* Icon ảnh */}
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-1 sm:ml-2">
          <Image size={20} className="text-gray-600" />
        </button>
      </motion.div>

      {/* Icon video */}
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-1 sm:ml-2">
          <Video size={20} className="text-gray-600" />
        </button>
      </motion.div>

      {/* Icon mic */}
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-1 sm:ml-2">
          <Mic size={20} className="text-gray-600" />
        </button>
      </motion.div>

      {/* Ô nhập tin nhắn */}
      <div className="flex-1 flex items-center bg-gray-200 rounded-full px-3 py-2 ml-2 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm sm:text-base"
          placeholder="Nhắn tin..."
        />

        {/* Nút emoji */}
        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="p-2 rounded-full hover:bg-gray-300 transition-colors"
          >
            <Smile size={20} className="text-gray-600" />
          </button>
        </motion.div>

        {/* Hiển thị emoji picker */}
        {showPicker && (
          <div ref={pickerRef} className="absolute bottom-12 right-0 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="light"
              searchDisabled
              previewConfig={{ showPreview: false }}
              height={350}
              width={300}
            />
          </div>
        )}
      </div>

      {/* Nút gửi */}
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        {message.trim().length > 0 ? (
          <button
            onClick={handleSend}
            className="ml-2 p-2 rounded-full text-[#1b4c8a] hover:bg-[#0f3461] hover:text-white transition-colors"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            className="ml-2 p-2 rounded-full text-[#1b4c8a] 
                hover:bg-[#0f3461] hover:text-white 
                transition-colors duration-200"
          >
            <ThumbsUp size={22} />
          </button>
        )}
      </motion.div>
    </div>
  );
}
