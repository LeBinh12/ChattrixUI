import { useRecoilState } from "recoil";
import { userAtom } from "../recoil/atoms/userAtom";
import { userApi } from "../api/userApi";
import { useEffect } from "react";

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


  return user;
}