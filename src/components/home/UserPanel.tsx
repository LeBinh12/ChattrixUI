import { LogOut, Settings } from "lucide-react";
import { useLoadUser } from "../../hooks/useLoadUser";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../recoil/atoms/userAtom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { socketManager } from "../../api/socket";
import UserAvatar from "../UserAvatar";
import ConfirmModal from "../notification/ConfirmModal";

export default function UserPanel() {
  useLoadUser();

  const user = useRecoilValue(userAtom);

  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info(`Đăng xuất thành công!`);
    socketManager.disconnect();
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  return (
    <>
      <div className="absolute bottom-4 left-4 sm:left-6 flex items-center justify-between bg-[#2b5dc0] text-white w-60 sm:w-72 px-4 py-3 rounded-2xl shadow-xl">
        {/* Avatar + Tên */}
        <div className="flex items-center space-x-3">
          <UserAvatar avatar={user?.data.avatar} isOnline={true} />

          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-semibold">
              {user?.data.display_name}
            </span>

            <span className="text-xs sm:text-sm text-green-500">Online</span>
          </div>
        </div>

        {/* Nút cài đặt */}
        <div className="flex items-center space-x-2">
          <button className="p-2 sm:p-3 rounded-xl hover:bg-[#357ae8] transition">
            <Settings size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setShowConfirm(true);
            }}
            className="p-2 sm:p-3 rounded-xl hover:bg-gray-300 transition bg-white"
          >
            <LogOut size={20} className="text-black" />
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Xác nhận đăng xuất"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={() => {
          setShowConfirm(false);
          handleLogout();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
