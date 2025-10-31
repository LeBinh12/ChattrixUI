import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Bell, BellOff } from "lucide-react";
import { bellStateAtom } from "../../../recoil/atoms/bellAtom";
import { selectedChatState } from "../../../recoil/atoms/chatAtom";
import { userApi } from "../../../api/userApi";
import { toast } from "react-toastify";
import { userAtom } from "../../../recoil/atoms/userAtom";

interface ChatInfoHeaderProps {
  avatar: string;
  displayName: string;
  status?: string;
  isGroup: boolean;
}

export default function ChatInfoHeader({
  avatar,
  displayName,
  status,
  isGroup,
}: ChatInfoHeaderProps) {
  const [bell, setBell] = useRecoilState(bellStateAtom);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const selectedChat = useRecoilValue(selectedChatState);
  const [loading, setLoading] = useState(false);
  const [bellAtom, setBellAtom] = useRecoilState(bellStateAtom);
  const user = useRecoilValue(userAtom);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const isGroup =
          !!selectedChat?.group_id &&
          selectedChat.group_id !== "000000000000000000000000";
        const targetId = isGroup
          ? selectedChat.group_id
          : selectedChat?.user_id;

        if (!targetId) {
          toast.error("Không có targetId hợp lệ");
          return;
        }

        const res = await userApi.getSetting(targetId, isGroup);
        setBell(res.data);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    })();
  }, [selectedChat]);

  // Hàm nhấn vào chuông
  const handleBellClick = () => {
    if (!bell?.is_muted) {
      setShowMuteModal(true);
    } else {
      handleUnmute();
    }
  };

  // Bật lại thông báo
  const handleUnmute = async () => {
    if (!bell || !selectedChat || !user?.data.id) return;

    try {
      const isGroupChat =
        !!selectedChat.group_id &&
        selectedChat.group_id !== "000000000000000000000000";
      const targetId = isGroupChat
        ? selectedChat.group_id
        : selectedChat.user_id;

      await userApi.upsertSetting({
        user_id: user?.data.id,
        target_id: targetId,
        is_group: isGroupChat,
        is_muted: false,
        mute_until: undefined,
      });

      setBell({ ...bell, is_muted: false, mute_until: "" });
      toast.success("Đã bật thông báo");
    } catch (err) {
      toast.error("Không thể bật lại thông báo");
    }
  };

  //Tắt thông báo
  const handleMuteOption = async (label: string, duration?: number) => {
    if (!bell || !selectedChat || !user?.data.id) return;

    const isGroupChat =
      !!selectedChat.group_id &&
      selectedChat.group_id !== "000000000000000000000000";
    const targetId = isGroupChat ? selectedChat.group_id : selectedChat.user_id;

    const muteUntil =
      label === "untilOn"
        ? "9999-12-31T23:59:59Z"
        : new Date(Date.now() + (duration || 0)).toISOString();

    try {
      await userApi.upsertSetting({
        user_id: user?.data.id,
        target_id: targetId,
        is_group: isGroupChat,
        is_muted: true,
        mute_until: muteUntil,
      });

      setBell({
        ...bell,
        is_muted: true,
        mute_until: muteUntil,
      });

      toast.success(
        label === "untilOn"
          ? "Đã tắt thông báo vĩnh viễn"
          : `Đã tắt thông báo trong ${label}`
      );
    } catch (err) {
      toast.error("Không thể tắt thông báo");
    } finally {
      setShowMuteModal(false);
    }
  };

  const avatarUrl =
    avatar && avatar.trim() !== "" && avatar !== "null"
      ? `http://localhost:3000/v1/upload/media/${avatar}`
      : "/assets/logo.png";

  return (
    <>
      <div className="flex flex-col items-center py-6 px-4 border-b border-gray-200 relative z-10">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-200">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-semibold text-lg text-gray-800">{displayName}</h3>

        {!isGroup && status && (
          <span className="text-xs text-gray-500 mt-1">
            {status === "online" ? "Đang hoạt động" : "Không hoạt động"}
          </span>
        )}

        {/* Icon chuông */}
        <button
          className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleBellClick}
          title={bell?.is_muted ? "Bật thông báo" : "Tắt thông báo"}
        >
          {bell?.is_muted ? (
            <BellOff className="w-6 h-6 text-gray-600" />
          ) : (
            <Bell className="w-6 h-6 text-blue-500" />
          )}
        </button>

        {bell?.is_muted && (
          <span className="text-xs text-gray-500 mt-1">Đã tắt thông báo</span>
        )}
      </div>

      {/* Modal tắt thông báo */}
      {showMuteModal && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowMuteModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 p-2 z-[101]">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">
              Tắt thông báo trong:
            </div>

            <button
              className="w-full px-3 py-2 text-left rounded hover:bg-gray-50 text-sm transition-colors"
              onClick={() => handleMuteOption("1h", 60 * 60 * 1000)}
            >
              <div className="flex justify-between items-center">
                <span>1 tiếng</span>
                <span className="text-xs text-gray-400">1h</span>
              </div>
            </button>

            <button
              className="w-full px-3 py-2 text-left rounded hover:bg-gray-50 text-sm transition-colors"
              onClick={() => handleMuteOption("24h", 24 * 60 * 60 * 1000)}
            >
              <div className="flex justify-between items-center">
                <span>24 tiếng</span>
                <span className="text-xs text-gray-400">24h</span>
              </div>
            </button>

            <button
              className="w-full px-3 py-2 text-left rounded hover:bg-gray-50 text-sm transition-colors"
              onClick={() => handleMuteOption("30d", 30 * 24 * 60 * 60 * 1000)}
            >
              <div className="flex justify-between items-center">
                <span>1 tháng</span>
                <span className="text-xs text-gray-400">30 ngày</span>
              </div>
            </button>

            <button
              className="w-full px-3 py-2 text-left rounded hover:bg-gray-50 text-sm transition-colors"
              onClick={() => handleMuteOption("untilOn")}
            >
              <div className="flex justify-between items-center">
                <span>Vĩnh viễn</span>
                <span className="text-xs text-gray-400">∞</span>
              </div>
            </button>

            <hr className="my-1 border-gray-200" />

            <button
              className="w-full px-3 py-2 text-left rounded hover:bg-red-50 text-sm text-red-500 transition-colors"
              onClick={() => setShowMuteModal(false)}
            >
              Hủy
            </button>
          </div>
        </>
      )}
    </>
  );
}
