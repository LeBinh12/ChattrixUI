import React, { useState, useEffect } from "react";
import { X, Search, Camera, Check, Users, Sparkles } from "lucide-react";
import { conversationApi } from "../../api/conversation";
import { toast } from "react-toastify";
import { groupApi } from "../../api/group";

// Types
interface User {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: () => void;
}

// Mock data - thay thế bằng API thực tế

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempQuery, setTempQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // fetch dữ liệu
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await conversationApi.getConversation(1, 50, searchQuery);
        if (res.status === 200) {
          // map về định dạng User, chỉ lấy user thật (không phải group)
          const mappedUsers: User[] = res.data.data
            .filter((item) => !!item.user_id) // chỉ lấy user có user_id
            .map((item) => ({
              id: item.user_id,
              name: item.display_name,
              avatar: item.avatar || "https://via.placeholder.com/150",
              online: item.status === "online", // tùy API trả về
            }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, searchQuery]);

  // xóa khi đóng
  useEffect(() => {
    if (!isOpen) {
      // Reset form khi đóng modal
      setGroupName("");
      setGroupImage("");
      setImagePreview("");
      setSearchQuery("");
      setSelectedMembers(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setGroupImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  // xử lý thêm group
  const handleSubmit = async () => {
    if (!groupName.trim() || selectedMembers.size === 0) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("status", "active");

      if (groupImage) {
        // groupImage là base64, nên ta cần convert thành file
        const blob = await fetch(groupImage).then((res) => res.blob());
        const file = new File([blob], "group.jpg", { type: blob.type });
        formData.append("image", file);
      }

      const res = await groupApi.addGroup(formData);
      console.log("data", res);
      if (res.status === 200) {
        const groupId = res.data || res.data; // tùy backend trả về
        const memberIds = Array.from(selectedMembers);

        // Gửi từng thành viên
        for (const userId of memberIds) {
          await groupApi.addMember({
            group_id: groupId,
            user_id: userId,
            role: "member",
          });
        }

        toast.success("Tạo nhóm thành công!");
        onCreateGroup?.();
        onClose();
      } else {
        toast.error("Không thể tạo nhóm!");
      }
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
      toast.error("Đã xảy ra lỗi khi tạo nhóm!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(tempQuery); // trigger useEffect fetch API
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transition-all duration-500 overflow-hidden ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-8"
        } rounded-[28px]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Tạo nhóm mới</h2>
                <p className="text-xs text-white/90 mt-0.5">
                  Kết nối với bạn bè của bạn
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Image & Name */}
          <div className="flex items-start gap-4 animate-fade-in">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[18px] bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative">
                    <Camera size={36} className="text-white" />
                    <Sparkles
                      size={16}
                      className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
                    />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110">
                <Camera size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-200 bg-white"
              />
            </div>
          </div>

          {/* Search Members */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thêm thành viên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
              />
              <input
                type="text"
                value={tempQuery}
                onChange={(e) => setTempQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm người dùng... (Nhấn Enter)"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-200 bg-white"
              />
            </div>
          </div>

          {/* Selected Members Count */}
          {selectedMembers.size > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 animate-slide-in">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Đã chọn{" "}
                  <span className="font-bold text-purple-600">
                    {selectedMembers.size}
                  </span>{" "}
                  thành viên
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
            </div>
          )}

          {/* Members List */}
          {!loading && (
            <div className="space-y-2">
              {users.map((user, index) => {
                const isSelected = selectedMembers.has(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 animate-fade-in ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-400 shadow-md scale-[1.02]"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent hover:shadow-sm"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <img
                        src={
                          user.avatar && user.avatar !== "null"
                            ? `http://localhost:3000/v1/upload/media/${user.avatar}`
                            : "/assets/logo.png"
                        }
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                      />
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                        {user.online ? "Đang hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-500 scale-105"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <Check
                          size={16}
                          className="text-white animate-scale-in"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                Không tìm thấy người dùng nào
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !groupName.trim() || selectedMembers.size === 0 || submitting
            }
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group flex items-center justify-center gap-2"
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{submitting ? "Đang tạo..." : "Tạo nhóm"}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
