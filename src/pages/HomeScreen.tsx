import { toast } from "react-toastify";
import ChatWidget from "../components/ChatWidget";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { userAtom } from "../recoil/atoms/userAtom";
import { useEffect } from "react";
import Header from "../components/Header";

export default function HomeScreen() {
  const { saveToken } = useAuth();
  const navigation = useNavigate();
  const user = useRecoilValue(userAtom);
  const userLoadable = useRecoilValueLoadable(userAtom);
  console.log(user);
  if (userLoadable.state === "loading") {
    return <div>Đang tải dữ liệu người dùng...</div>;
  }

  const userContent = userLoadable.contents;

  if (!userContent) {
    return <div>Không có thông tin người dùng</div>;
  }

  return (
    <>
      <Header />
      <div className="h-screen flex items-center justify-center">
        {/* Giao diện chính */}
        <h1 className="text-3xl font-bold">Chattrix</h1>
        {/* Chat widget */}
        <ChatWidget />
      </div>
    </>
  );
}
