import { useRecoilValue } from "recoil";
import { selectedChatState } from "../../recoil/atoms/chatAtom";
import { userAtom } from "../../recoil/atoms/userAtom";
import { useState } from "react";
import { useChatMedia } from "../../hooks/useChatMedia";
import { motion } from "framer-motion";
import ChatInfoHeader from "./chat_info_panel/ChatInfoHeader";
import ActionButtons from "./chat_info_panel/ActionButtons";
import SearchMessages from "./chat_info_panel/SearchMessages";
import RecentMediaSection from "./chat_info_panel/RecentMediaSection";
import RecentFilesSection from "./chat_info_panel/RecentFilesSection";

export default function ChatInfoPanel() {
  const selectedChat = useRecoilValue(selectedChatState);
  const user = useRecoilValue(userAtom);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom hook để quản lý media và files
  const { recentMedia, recentFiles } = useChatMedia({
    selectedChat,
    userId: user?.data.id,
  });

  // Handlers
  const handleLeaveGroup = () => {
    console.log("Rời khỏi nhóm");
    // TODO: Implement leave group logic
  };

  const handleDeleteHistory = () => {
    console.log("Xóa lịch sử trò chuyện");
    // TODO: Implement delete history logic
  };

  // Empty state
  if (!selectedChat) {
    return (
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white w-80 h-screen flex items-center justify-center border-l border-gray-200"
      >
        <p className="text-gray-400 text-sm">Chọn một cuộc trò chuyện</p>
      </motion.div>
    );
  }

  const isGroup = !!selectedChat.group_id;

  return (
    <motion.div
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      className="bg-white w-80 h-screen flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <ChatInfoHeader
        avatar={selectedChat.avatar}
        displayName={selectedChat.display_name}
        status={selectedChat.status}
        isGroup={isGroup}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Action Buttons (Leave Group if applicable) */}
        {isGroup && (
          <ActionButtons
            isGroup={isGroup}
            onLeaveGroup={handleLeaveGroup}
            onDeleteHistory={() => {}}
            userId={user?.data.id}
            groupId={selectedChat.group_id}
          />
        )}

        {/* Search Messages */}
        <SearchMessages
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Recent Media */}
        <RecentMediaSection mediaItems={recentMedia} />

        {/* Recent Files */}
        <RecentFilesSection fileItems={recentFiles} />

        {/* Delete History Button */}
        {!isGroup && (
          <ActionButtons
            isGroup={false}
            onDeleteHistory={handleDeleteHistory}
          />
        )}
      </div>
    </motion.div>
  );
}
