import { Home, Plus } from "lucide-react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import { selectedChatState } from "../../recoil/atoms/chatAtom";
import { useEffect } from "react";
import { groupApi } from "../../api/group";
import CreateGroupModal from "../group/CreateGroup";
import { groupListState } from "../../recoil/atoms/groupAtom";

interface SidebarProps {
  isGroupModalOpen: boolean;
  setIsGroupModalOpen: (open: boolean) => void;
  onGroupCreated: () => void;
  refreshGroups: number;
}

export default function Sidebar({
  isGroupModalOpen,
  setIsGroupModalOpen,
  onGroupCreated,
  refreshGroups,
}: SidebarProps) {
  const setSelectedChat = useSetRecoilState(selectedChatState);
  const selectedChat = useRecoilValue(selectedChatState);
  const [servers, setServers] = useRecoilState(groupListState);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await groupApi.getGroup();
        setServers(res.data); // lưu mảng Group vào state
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhóm:", error);
      }
    };
    fetchGroups();
    // refresh when parent triggers
  }, [refreshGroups, setServers]);

  return (
    <>
      <div className="flex flex-col items-center bg-[#357ae8] text-white w-16 sm:w-20 h-screen py-4 space-y-4 shadow-lg">
        <div
          onClick={() => setSelectedChat(null)}
          className="relative group bg-white text-[#357ae8] p-3 rounded-full hover:bg-slate-200 transition cursor-pointer"
          title="Trang chủ"
        >
          <Home size={24} />
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1e3a8a] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
            Trang chủ
          </span>
        </div>

        <div className="w-8 h-[2px] bg-white/40 rounded-full my-2"></div>

        {/* Danh sách server */}
        <div className="flex flex-col space-y-4 mt-4">
          {servers.map((server) => {
            let mediaURL = "";
            if (
              !server.image ||
              server.image === "null" ||
              server.image === "" ||
              server.image === null ||
              server.image === undefined
            ) {
              mediaURL = "/assets/logo.png";
            } else {
              mediaURL = `http://localhost:3000/v1/upload/media/${server.image}`;
            }

            const isSelected = selectedChat?.group_id === server.id;

            return (
              <div
                onClick={() =>
                  setSelectedChat({
                    user_id: "",
                    group_id: server.id,
                    avatar: server.image,
                    display_name: server.name,
                    status: "online",
                    update_at: server.updated_at,
                  })
                }
                key={server.id}
                className="relative group cursor-pointer flex items-center"
              >
                {/* Thanh highlight bên trái khi được chọn */}
                {isSelected && (
                  <div className="absolute -left-4 w-1 h-10 bg-white rounded-r-full"></div>
                )}

                <img
                  src={mediaURL}
                  alt={server.name}
                  className={`w-12 h-12 rounded-lg object-cover hover:rounded-xl transition-all duration-300 ${
                    isSelected ? "rounded-xl ring-2 ring-[#063970]" : ""
                  }`}
                />
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1e3a8a] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {server.name}
                </span>
              </div>
            );
          })}
        </div>

        <div
          onClick={() => setIsGroupModalOpen(true)}
          className="relative group cursor-pointer mb-3"
        >
          <div className="bg-white/20 p-3 rounded-full hover:bg-white/40 transition">
            <Plus size={24} />
          </div>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1e3a8a] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
            Thêm nhóm
          </span>
        </div>
      </div>
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onCreateGroup={onGroupCreated}
      />
    </>
  );
}
