import {
  Check,
  CheckCheck,
  Eye,
  FileText,
  Download,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Messages } from "../../../types/Message";
import AvatarPreview from "./AvatarPreview";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  msg: Messages;
  index: number;
  messages: Messages[];
  currentUserId?: string;
  onPreviewMedia: (url: string) => void;
  display_name: string;
  size?: "small" | "large"; // small = chat mini, large = chat window
};

export default function MessageItem({
  msg,
  index,
  messages,
  currentUserId,
  onPreviewMedia,
  display_name,
  size = "large",
}: Props) {
  const isMine = msg.sender_id === currentUserId;

  // Tạo editor read-only cho Tiptap
  const editor = useEditor({
    extensions: [StarterKit],
    content: msg.content, // HTML từ Tiptap
    editable: false,
  });

  // Nếu là tin nhắn hệ thống (người dùng rời nhóm)
  if (msg.type === "system") {
    return (
      <AnimatePresence initial={false}>
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex justify-center ${
            size === "small" ? "my-2" : "my-3"
          }`}
        >
          <div
            className={`bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-center shadow-sm ${
              size === "small" ? "text-xs px-3 py-1" : "text-sm"
            }`}
          >
            <span className="font-medium">{msg.content}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const renderFiles = () =>
    msg.media_ids
      .filter((m) => m.type === "file")
      .map((media) => {
        const mediaUrl = `http://localhost:3000/v1/upload/media/${media.url}`;
        return (
          <div
            key={media.url}
            className={`flex flex-col sm:flex-row sm:items-center justify-between 
              bg-[#1b4c8a] text-white p-2 rounded-md shadow 
              ${size === "small" ? "text-xs p-1" : "text-sm"} 
              gap-2 sm:gap-0 w-full max-w-full`}
          >
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 min-w-0">
              <FileText className="w-5 h-5 text-white flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium truncate">{media.filename}</span>
                <span className="text-xs text-gray-200">
                  {Math.round(media.size / 1024)} KB
                </span>
              </div>
            </div>

            <a
              href={mediaUrl}
              download
              className="flex items-center justify-center bg-black hover:bg-gray-800 
               text-white px-2 py-1 rounded-md text-xs sm:text-sm 
               transition w-full sm:w-auto"
            >
              <Download className="w-4 h-4 text-white mr-1" />
              <span className="hidden sm:inline">Tải</span>
            </a>
          </div>
        );
      });

  const renderImagesAndVideos = () => {
    const medias = msg.media_ids.filter(
      (m) => m.type === "image" || m.type === "video"
    );
    if (!medias.length) return null;

    return (
      <div
        className={`grid gap-2 ${
          medias.length === 1 ? "grid-cols-1" : "grid-cols-2"
        } ${size === "small" ? "gap-1" : ""}`}
      >
        {medias.map((media) => {
          const mediaUrl = `http://localhost:3000/v1/upload/media/${media.url}`;

          return (
            <div
              key={media.url}
              className={`relative rounded-md overflow-hidden cursor-pointer group ${
                size === "small" ? "h-20" : "h-32"
              }`}
              onClick={() => onPreviewMedia(mediaUrl)}
            >
              {media.type === "video" ? (
                <>
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                    <Video size={22} className="text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={mediaUrl}
                  alt={media.filename}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
        className={`flex flex-col mb-3 ${size === "small" ? "mb-2" : "mb-4"} ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-start">
          {!isMine && (
            <div className="mr-3">
              <AvatarPreview
                src={
                  msg.sender_avatar && msg.sender_avatar !== "null"
                    ? `http://localhost:3000/v1/upload/media/${msg.sender_avatar}`
                    : "/assets/logo.png"
                }
                alt={display_name}
                size={size === "small" ? 36 : 40}
                onClick={
                  msg.sender_avatar && msg.sender_avatar !== "null"
                    ? () =>
                        onPreviewMedia(
                          `http://localhost:3000/v1/upload/media/${msg.sender_avatar}`
                        )
                    : undefined
                }
              />
            </div>
          )}

          <div className="flex flex-col items-start">
            <div
              className={`max-w-xs p-3 rounded-lg shadow-md ${
                isMine
                  ? "bg-[#f1f5f9] text-[#1b4c8a] rounded-br-none"
                  : "bg-[#357ae8] text-white rounded-bl-none"
              } ${size === "small" ? "p-2 max-w-[180px]" : ""}`}
            >
              {/* text hoặc rỗng */}
              {msg.type !== "file" && editor && (
                <EditorContent
                  editor={editor}
                  className={`prose prose-sm ${
                    isMine ? "text-black" : "text-white"
                  } `}
                />
              )}

              {msg.type === "file" && (
                <div className="flex flex-col space-y-2">
                  {renderImagesAndVideos()}
                  {renderFiles()}
                  {msg.content && editor && (
                    <EditorContent
                      editor={editor}
                      className={`prose prose-sm ${
                        isMine ? "text-black" : "text-white"
                      } `}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            {isMine && index === messages.length - 1 && (
              <div
                className="flex items-center mt-1 space-x-1 text-xs rounded-xl px-2 py-1 border border-gray-400 bg-gray-400
                 self-end w-24 justify-end"
              >
                {msg.status === "sent" && (
                  <>
                    <Check className="w-4 h-4" />{" "}
                    <span className="truncate">Đã gửi</span>
                  </>
                )}
                {msg.status === "delivered" && (
                  <>
                    <CheckCheck className="w-4 h-4" />{" "}
                    <span className="truncate">Đã nhận</span>
                  </>
                )}
                {msg.status === "read" && (
                  <>
                    <Eye className="w-4 h-4" />{" "}
                    <span className="truncate">Đã xem</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
