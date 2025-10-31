import ChatWidget from "../components/ChatWidget";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { userAtom } from "../recoil/atoms/userAtom";

import Sidebar from "../components/home/Sidebar";
import ChannelList from "../components/home/ChannelList";
import ChatWindow from "../components/home/ChatWindow";
import UserPanel from "../components/home/UserPanel";
import ChatInfoPanel from "../components/home/ChatInfoPanel";

import { useState } from "react";

export default function HomeScreen() {
  const { saveToken } = useAuth();
  const navigation = useNavigate();
  const user = useRecoilValue(userAtom);
  const userLoadable = useRecoilValueLoadable(userAtom);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [refreshGroups, setRefreshGroups] = useState(0); // for Sidebar to trigger group list refresh

  if (userLoadable.state === "loading") {
    return <div>Đang tải dữ liệu người dùng...</div>;
  }

  const userContent = userLoadable.contents;

  if (!userContent) {
    return <div>Không có thông tin người dùng</div>;
  }

  // Handler for group created
  const handleGroupCreated = () => {
    setRefreshGroups((prev) => prev + 1);
  };

  return (
    <>
      {/* <Header /> */}
      <div className="h-screen flex items-center justify-center">
        {/* Giao diện chính */}
        <Sidebar
          isGroupModalOpen={isGroupModalOpen}
          setIsGroupModalOpen={setIsGroupModalOpen}
          onGroupCreated={handleGroupCreated}
          refreshGroups={refreshGroups}
        />
        <ChannelList />
        <ChatWindow />
        <UserPanel />
        <ChatInfoPanel />
        {/* Chat widget */}
        <ChatWidget isGroupModalOpen={isGroupModalOpen} />
      </div>
    </>
  );
}
