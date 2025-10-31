import React from "react";

type UserAvatarProps = {
  avatar?: string | null;
  isOnline?: boolean;
  size?: number; // kích thước avatar (px)
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  isOnline = false,
  size = 48,
}) => {
  const avatarUrl =
    avatar && avatar.trim() !== "" && avatar !== "null"
      ? `http://localhost:3000/v1/upload/media/${avatar}`
      : "/assets/logo.png";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 transition-all">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Status dot với animation */}
      {isOnline ? (
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#2b5dc0] bg-green-500"
          title="Đang hoạt động"
        />
      ) : (
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#2b5dc0] bg-gray-400"
          title="Đang hoạt động"
        />
      )}
    </div>
  );
};

export default UserAvatar;
