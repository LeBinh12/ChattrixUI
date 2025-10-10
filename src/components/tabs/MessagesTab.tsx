import { motion } from "framer-motion";
import { formatTimestamp } from "../../logic/FormatTimestamp";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../recoil/atoms/userAtom";
import type { Conversation } from "../../types/conversation";
import { conversationApi } from "../../api/conversation";
import { Search } from "lucide-react";

type Props = {
  onFriend: (friend: Conversation) => void;
  onOpenId?: (id: string) => void;
};

export default function MessagesTab({ onFriend, onOpenId }: Props) {
  const user = useRecoilValue(userAtom);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.data?.id) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await conversationApi.getConversation(1, 10);
        setUsers(res.data.data || []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách hội thoại:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // const filtered = users.filter((u) =>
  //   u.display_name.toLowerCase().includes(query.toLowerCase())
  // );

  // Sắp xếp theo thời gian (cũ -> mới)
  const sortedMessages = [...users].sort(
    (a, b) => new Date(b.last_date).getTime() - new Date(a.last_date).getTime()
  );

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-4xl font-bold text-center text-white">Nhắn Tin</h1>
      <h5 className="text-2xl font-extrabold text-[#ecf1fe] text-center">
        Danh sách tin nhắn
      </h5>

      {/* Ô tìm kiếm */}
      <motion.div
        className="relative w-full sm:w-2/3 mx-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-300" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-300 pl-10 pr-4 py-3 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
          />
        </div>
      </motion.div>

      {/* Danh sách tin */}
      {loading ? (
        <p className="text-center text-white">Đang tải...</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedMessages.map((msg) => (
            <motion.div
              key={msg.user_id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                onClick={() => {
                  onFriend(msg);
                  onOpenId?.(msg.user_id);
                }}
                className="flex items-center p-4 bg-purple-50 rounded-lg shadow-sm hover:bg-[#cedbfb] transition cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 mr-3 shadow-md">
                  <img
                    src={
                      msg.avatar && msg.avatar !== "null"
                        ? msg.avatar
                        : "/assets/logo.png"
                    }
                    alt={msg.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {msg.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {msg.unread_count}
                    </span>
                  )}
                </div>

                {/* Nội dung */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-semibold">{msg.display_name}</p>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(msg.last_date)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-black truncate">
                    {msg.last_message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Định nghĩa animation chung cho toàn danh sách
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // thời gian trễ giữa các item
    },
  },
};

// Định nghĩa animation cho từng item
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
