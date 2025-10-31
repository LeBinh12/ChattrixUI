import { useEffect, useRef, useState } from "react";
import { Send, Smile, Image, ThumbsUp, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { uploadAPI } from "../../../api/upload";
import type { Media } from "../../../types/upload";
import EmojiPicker from "emoji-picker-react";
import { socketManager } from "../../../api/socket";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import MenuBar from "./MenuBar";
import Placeholder from "@tiptap/extension-placeholder";
import { useRecoilValue } from "recoil";
import { bellStateAtom } from "../../../recoil/atoms/bellAtom";

type ChatInputWindowProps = {
  user_id: string;
  receiver_id: string;
  group_id: string;
  hasLeftGroup: boolean;
  display_name: string;
  avatar?: string;
  sender_avatar?: string;
};

export default function ChatInputWindow({
  user_id,
  receiver_id,
  group_id,
  hasLeftGroup,
  display_name,
  avatar,
  sender_avatar,
}: ChatInputWindowProps) {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showRichText, setShowRichText] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(60);
  const bell = useRecoilValue(bellStateAtom);
  // điều chỉnh tiptap
  const editor = useEditor({
    extensions: [
      Placeholder.configure({
        placeholder: hasLeftGroup ? "Bạn đã rời nhóm..." : "Nhập tin nhắn...",
        showOnlyWhenEditable: true,
      }),
      StarterKit,
      Link,
      ImageExt,
    ],
    content: "",
    onUpdate: ({ editor }) => setMessage(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none text-gray-700 p-3",
      },
      // Xử lý phím Enter trong editor
      handleKeyDown: (view, event) => {
        if (hasLeftGroup) return true; // Chặn mọi input nếu đã rời nhóm

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!hasLeftGroup);
    }
  }, [hasLeftGroup, editor]);

  const handleEmojiClick = (emojiData: any) => {
    if (showRichText && editor) {
      editor.commands.insertContent(emojiData.emoji);
    } else {
      setMessage((prev) => prev + emojiData.emoji);
    }
  };

  const handleSend = async () => {
    if (
      (showRichText
        ? editor?.getText().trim() === ""
        : message.trim() === "") &&
      selectedFiles.length === 0
    )
      return;

    setUploading(true);
    let uploaded: Media[] = [];

    if (selectedFiles.length > 0) {
      try {
        uploaded = await uploadAPI.uploadFiles(
          selectedFiles,
          (percent, index) => {
            setProgress((prev) => {
              const updated = [...prev];
              updated[index] = percent;
              return updated;
            });
          }
        );
      } catch (err: any) {
        console.error("Upload lỗi:", err);
        toast.error(
          `Upload file lỗi: ${err.response?.data?.error || err.message}`
        );
        setUploading(false);
        return;
      }
    }

    socketManager.sendMessage(
      user_id,
      receiver_id,
      group_id,
      showRichText ? editor?.getHTML() || "" : message,
      uploaded,
      display_name,
      avatar,
      sender_avatar
    );

    if (editor) editor.commands.clearContent();
    setMessage("");
    setSelectedFiles([]);
    setProgress([]);
    setUploading(false);

    //  Tắt rich text mode sau khi gửi và reset về chiều cao mặc định
    setShowRichText(false);
    setEditorHeight(100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setSelectedFiles(files);
    setProgress(files.map(() => 0));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl + Shift + X để bật/tắt Tiptap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        setShowRichText((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleHeight = () => {
    setEditorHeight((prev) => (prev === 60 ? 300 : 60));
  };

  return (
    <div className="p-2 sm:p-3 flex flex-col bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.1)]">
      {/* Thông báo đã rời nhóm */}
      {hasLeftGroup && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-md"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Bạn đã rời khỏi nhóm này
              </p>
              <p className="text-xs text-red-600 mt-1">
                Bạn không có quyền gửi tin nhắn
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* File preview */}
      {selectedFiles.length > 0 && !hasLeftGroup && (
        <div className="flex overflow-x-auto gap-2 mb-2 py-1">
          {selectedFiles.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            const fileUploading = uploading;
            return (
              <div
                key={index}
                className="relative w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              >
                {isImage || isVideo ? (
                  <div className="w-full h-full">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-sm">
                    <FileText size={28} />
                  </div>
                )}
                {!uploading && (
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
                {fileUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-xs">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-1"></div>
                    <div>{progress[index] ?? 0}%</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* các file và image */}
      <div className="flex border-b-2 border-gray-200 mb-3">
        {/* Upload icon */}
        <motion.label
          whileHover={{ scale: hasLeftGroup ? 1 : 1.1 }}
          whileTap={{ scale: hasLeftGroup ? 1 : 0.9 }}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all ${
            hasLeftGroup
              ? "cursor-not-allowed opacity-40"
              : "cursor-pointer hover:bg-gray-200"
          }`}
        >
          <Image size={20} className="text-gray-600" />
          <input
            type="file"
            multiple
            hidden
            onChange={handleFileSelect}
            disabled={hasLeftGroup}
          />
        </motion.label>
      </div>

      {/* Input zone */}
      <div className="flex items-end relative gap-2">
        {/* Input / Tiptap */}
        <div className="flex-1">
          <div
            className={`flex flex-col rounded-lg overflow-hidden border bg-gray-50 ${
              hasLeftGroup ? "border-gray-200 opacity-60" : "border-gray-300"
            }`}
          >
            {/* Editor - chiều cao cố định */}
            <div
              className={`bg-gray-100 overflow-y-auto prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-lg prose-headings:my-2
                prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4
                prose-blockquote:border-l-4 prose-blockquote:border-gray-400 prose-blockquote:pl-4
                prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-code:text-sm
                prose-p:my-1 ${
                  hasLeftGroup ? "text-gray-400" : "text-gray-700"
                }`}
              style={{ height: `${editorHeight}px` }}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Toolbar chỉ hiển thị khi showRichText và chưa rời nhóm */}
            <AnimatePresence>
              {showRichText && !hasLeftGroup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-300"
                >
                  <MenuBar editor={editor} toggleHeight={toggleHeight} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Emoji & Gửi */}
        <div className="flex items-center gap-1 pb-1">
          <motion.div
            whileHover={{ scale: hasLeftGroup ? 1 : 1.15 }}
            whileTap={{ scale: hasLeftGroup ? 1 : 0.85 }}
          >
            <button
              onClick={() => !hasLeftGroup && setShowPicker((p) => !p)}
              disabled={hasLeftGroup}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                hasLeftGroup
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-gray-200"
              }`}
            >
              <Smile size={20} className="text-gray-600" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: hasLeftGroup ? 1 : 1.15 }}
            whileTap={{ scale: hasLeftGroup ? 1 : 0.85 }}
          >
            {message.trim().length > 0 ? (
              <button
                onClick={handleSend}
                disabled={hasLeftGroup}
                className={`p-2 rounded-full transition-colors ${
                  hasLeftGroup
                    ? "cursor-not-allowed opacity-40 text-gray-400"
                    : "text-[#1b4c8a] hover:bg-[#0f3461] hover:text-white"
                }`}
              >
                <Send size={20} />
              </button>
            ) : (
              <button
                disabled={hasLeftGroup}
                className={`p-2 rounded-full transition-colors ${
                  hasLeftGroup
                    ? "cursor-not-allowed opacity-40 text-gray-400"
                    : "text-[#1b4c8a] hover:bg-[#0f3461] hover:text-white"
                }`}
              >
                <ThumbsUp size={22} />
              </button>
            )}
          </motion.div>
        </div>

        {showPicker && !hasLeftGroup && (
          <div ref={pickerRef} className="absolute bottom-12 right-10 z-50">
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
    </div>
  );
}
