import { Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { conversationApi } from "../../api/conversation";
import type { Conversation } from "../../types/conversation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { selectedChatState } from "../../recoil/atoms/chatAtom";
import UserAvatar from "../UserAvatar";
import { userAtom } from "../../recoil/atoms/userAtom";
import { socketManager } from "../../api/socket";
import { Howl } from "howler";
import { bellStateAtom } from "../../recoil/atoms/bellAtom";
import { userApi } from "../../api/userApi";

const ding = new Howl({
  src: ["/assets/ting.mp3"],
  preload: true,
  volume: 0.8,
});

export default function ChannelList() {
  const user = useRecoilValue(userAtom);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Conversation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Lấy danh sách channel mặc định khi load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await conversationApi.getConversation(1, 20, "");
        setResults(res.data.data);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lắng nghe socket realtime
  useEffect(() => {
    if (!user?.data.id) return;

    // connect chỉ 1 lần, giữ trạng thái ping/pong cho toàn trang
    socketManager.connect(user?.data.id);

    const listener = async (data: any) => {
      if (data.type === "conversations" && data.message) {
        const msg = data.message;
        console.log("Conversation realtime", msg);

        // xử ls dành cho người được nhận tin nhắn
        if (msg.sender_id !== user.data.id) {
          let isGroup;
          if (msg?.group_id === "") {
            isGroup = false;
          } else {
            isGroup =
              !!msg?.group_id && msg.group_id !== "000000000000000000000000";
          }
          const targetId = isGroup ? msg.group_id : msg?.user_id;

          const res = await userApi.getSetting(targetId, isGroup);
          console.log("notifigroup", res.data);
          if (!res.data.is_muted) {
            ding.play();
          }
        }

        setResults((prev) => {
          // Kiểm tra xem có phải group chat không
          const isGroupChat =
            msg.group_id && msg.group_id !== "000000000000000000000000";

          let existIndex = -1;

          if (isGroupChat) {
            // Tìm theo group_id
            existIndex = prev.findIndex((c) => c.group_id === msg.group_id);
          } else {
            // Tìm theo user_id (người trong conversation, không phải sender)
            existIndex = prev.findIndex(
              (c) =>
                c.user_id === msg.user_id &&
                (!c.group_id || c.group_id === "000000000000000000000000")
            );
          }

          // Lấy conversation cũ để giữ lại thông tin
          const oldConversation = existIndex >= 0 ? prev[existIndex] : null;

          // Tạo conversation cập nhật
          const updatedConversation: Conversation = {
            user_id: isGroupChat ? "" : msg.user_id,
            group_id: isGroupChat ? msg.group_id : "",
            display_name:
              oldConversation?.display_name || msg.display_name || "Unknown",
            avatar: oldConversation?.avatar || msg.avatar || "",
            last_message: msg.last_message || "",
            last_message_type: msg.last_message_type || "text",
            last_date: new Date().toISOString(),
            unread_count:
              msg.sender_id !== user.data.id
                ? (oldConversation?.unread_count || 0) + 1
                : oldConversation?.unread_count || 0,
            status: oldConversation?.status || "offline",
            updated_at: new Date().toISOString(),
          };

          // Nếu conversation đã tồn tại → xóa vị trí cũ và đẩy lên đầu
          if (existIndex >= 0) {
            const newList = [...prev];
            newList.splice(existIndex, 1);
            return [updatedConversation, ...newList];
          }
          // Nếu chưa có → thêm mới lên đầu
          return [updatedConversation, ...prev];
        });
      }

      if (data.user_id && data.status) {
        const userId = data.user_id;
        const status = data.status;
        console.log("Trạng thái realtime:", userId, status);

        setResults((prev) =>
          prev.map((conv) =>
            conv.user_id === userId ? { ...conv, status } : conv
          )
        );
      }
    };

    socketManager.addListener(listener);

    return () => {
      socketManager.removeListener(listener);
    };
  }, [user]);

  const setSelectedChat = useSetRecoilState(selectedChatState);

  const handleSearchKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;

    setHasSearched(true);
    setLoading(true);
    try {
      const res = await conversationApi.getConversation(1, 10, search);
      setResults(res.data.data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút menu mobile */}
      <button
        className="sm:hidden fixed top-4 left-20 z-50 p-2 bg-blue-600 text-white rounded"
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-[#2b5dc0] text-[#f1f5f9] p-4 shadow-lg
          w-64 sm:w-72
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} 
          sm:translate-x-0 sm:static
        `}
      >
        {/* Thanh tìm kiếm */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm nhóm hoặc bạn bè..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-[#357ae8] text-white px-3 py-2 rounded-lg placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200"
          />
        </div>

        {/* Danh sách kết quả */}
        <div className="overflow-y-auto flex-1 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <p className="text-gray-200 text-sm italic px-3 py-4 text-center">
              Không tìm thấy kết quả
            </p>
          )}
          {!loading && !hasSearched && results.length === 0 && (
            <p className="text-gray-200 text-sm italic px-3 py-4 text-center">
              Không có hội thoại nào
            </p>
          )}

          {!loading &&
            results
              .filter(
                (item) =>
                  !item.group_id || item.group_id === "000000000000000000000000"
              )
              .map((item) => {
                const isOnline = item.status?.toLowerCase() === "online";

                return (
                  <button
                    key={item.user_id}
                    onClick={() =>
                      setSelectedChat({
                        user_id: item.user_id,
                        group_id: item.group_id,
                        avatar: item.avatar,
                        display_name: item.display_name,
                        status: item.status,
                        update_at: item.updated_at,
                      })
                    }
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#357ae8] transition-all duration-200 group"
                  >
                    {/* Avatar với status indicator */}
                    <UserAvatar avatar={item.avatar} isOnline={isOnline} />

                    {/* Thông tin user */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-white truncate">
                        {item.display_name}
                      </p>
                      <p className="text-xs text-gray-300 flex items-center gap-1">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            isOnline ? "bg-green-400" : "bg-gray-400"
                          }`}
                        />
                        {isOnline ? "Đang hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 sm:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
