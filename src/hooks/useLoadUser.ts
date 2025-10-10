import { useRecoilState } from "recoil";
import { userAtom } from "../recoil/atoms/userAtom";
import { userApi } from "../api/userApi";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../api/socket";

export const useLoadUser = () => {
      const [user, setUser] = useRecoilState(userAtom);

     useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      userApi.getProfile().then(setUser).catch(() => {
        console.warn("Token hết hạn hoặc không hợp lệ");
        localStorage.removeItem("access_token");
      });
    }
     }, []);
  
       useEffect(() => {
    if (user?.data?.id) {
      const socket = connectSocket(user.data.id);
      console.log("🧩 Kết nối socket với user: Thành công");

      // cleanup khi component unmount
      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

    return user;
}