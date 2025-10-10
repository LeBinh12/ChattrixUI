import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { Conversation } from "../../types/conversation";

type Props = {
  onUser: Conversation;
  onBack: () => void;
};

export default function ChatHeader({ onUser, onBack }: Props) {
  return (
    <div className="flex items-center p-5 bg-[#2665b1] text-white">
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-[#0f3461] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </motion.div>
      {/* Avatar */}
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

      {/* Tên người gửi */}
      <h2 className="font-bold text-lg">{onUser.display_name}</h2>
    </div>
  );
}
