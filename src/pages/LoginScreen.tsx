import AuthForm from "../components/auth/AuthForm";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import { useState } from "react";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../recoil/atoms/userAtom";
import { userApi } from "../api/userApi";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigate();
  const { saveToken } = useAuth();
  const setUser = useSetRecoilState(userAtom);

  // xử lý đăng nhập JWT thường
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authApi
      .login({ username, password })
      .then(async (res) => {
        toast.success(res.message);
        saveToken(res.data);

        try {
          const user = await userApi.getProfile();
          setUser(user); // Lưu vào Recoil
        } catch {
          console.warn("Không thể lấy profile sau đăng nhập");
        }

        navigation("/home");
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message || "Đăng nhập thất bại");
          console.log(err.response.data);
        } else {
          toast.error(err.message);
          console.log(err.message);
        }
      });
  };

  ///Xử lý OAuth2 bằng Google
  const handleGoogleLoginError = () => {
    toast.error("Đăng nhập Google thất bại");
  };

  const handleGoogleLoginSuccess = (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) {
      toast.error("Google không trả về token!");
      return;
    }

    console.log("Google token:", token);

    authApi
      .loginGoogle(token)
      .then((res) => {
        toast.success(res.message);
        saveToken(res.data);
        navigation("/home");
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message || "Đăng nhập thất bại");
          console.log(err.response.data);
        } else {
          toast.error(err.message);
          console.log(err.message);
        }
      });
  };

  return (
    <>
      <GoogleOAuthProvider clientId="500759950637-9gdtqlt4kqli24gpg9jih6h6kl624boh.apps.googleusercontent.com">
        <AuthForm title="Đăng nhập" onSubmit={handleSubmit}>
          <AuthInput
            label="Username"
            type="text"
            placeholder="Nhập tài khoản..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <AuthInput
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
            <AuthButton type="submit">Đăng nhập</AuthButton>
          </motion.div>
          <div className="mt-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </motion.div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => navigation("/register")}
            >
              Đăng ký ngay
            </button>
          </div>
        </AuthForm>
      </GoogleOAuthProvider>
    </>
  );
}
