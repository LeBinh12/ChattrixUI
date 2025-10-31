import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import TimeAgo from "react-timeago";
import vi from "react-timeago/lib/language-strings/vi";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";

const formatter = buildFormatter(vi);

type ChatHeaderWindowProps = {
  display_name: string;
  avatar?: string;
  onBack?: () => void;
  status?: string; // optional trạng thái online/offline
  update_at?: string;
};

export default function ChatHeaderWindow({
  display_name,
  avatar,
  onBack,
  status,
  update_at,
}: ChatHeaderWindowProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-[#2665b1] to-[#1b4c8a] text-white shadow-md">
      <div className="flex items-center">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-[#0f3461] transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}
        {avatar && (
          <img
            src={
              avatar && avatar.trim() !== "" && avatar !== "null"
                ? `http://localhost:3000/v1/upload/media/${avatar}`
                : "/assets/logo.png"
            }
            alt={display_name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        )}
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold">{display_name}</h2>
          {status === "online" ? (
            <span className="text-sm sm:text-sm text-green-300">{status}</span>
          ) : (
            <span className="text-sm sm:text-sm text-gray-300">
              Hoạt động{" "}
              <TimeAgo date={update_at ?? new Date()} formatter={formatter} />{" "}
              trước
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
