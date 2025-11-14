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
import { generatePKCECodes } from "../utils/pkce";

const returnUrl = "http://localhost:9001/Account/Login";
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigate();
  const { saveToken } = useAuth();
  const setUser = useSetRecoilState(userAtom);

  const handleAfterLoginSuccess = async (res: any) => {
    toast.success(res.message);
    saveToken(res.data);

    try {
      const user = await userApi.getProfile(); // Gọi API lấy thông tin người dùng
      setUser(user);
    } catch {
      console.warn("Không thể lấy profile sau đăng nhập");
    }

    navigation("/home");
  };

  // xử lý đăng nhập JWT thường
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authApi
      .login({ username, password })
      .then(handleAfterLoginSuccess)
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

    authApi
      .loginGoogle(token)
      .then(handleAfterLoginSuccess)
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

  const handleOpenDictLogin = async () => {
    const { codeVerifier, codeChallenge } = await generatePKCECodes();
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);

    const clientId = "chat-system";
    const redirectUri = "http://localhost:5173/auth/opendict/callback";
    const openDictUrl = `http://localhost:9005/connect/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    const popup = window.open(
      openDictUrl,
      "OpenDictLogin",
      "width=600,height=700"
    );

    //  Dùng flag để đảm bảo chỉ xử lý 1 lần
    let isProcessing = false;

    const listener = async (event: MessageEvent) => {
      if (!event.data || event.data.source !== "opendict") return;

      // Kiểm tra để tránh xử lý trùng lặp
      if (isProcessing) {
        console.log("Đã đang xử lý, bỏ qua request trùng");
        return;
      }

      const { code, error } = event.data;

      if (error || !code) {
        toast.error(error || "Không nhận được code!");
        popup?.close();
        window.removeEventListener("message", listener);
        return;
      }

      // Đánh dấu đang xử lý
      isProcessing = true;

      try {
        const storedVerifier = sessionStorage.getItem("pkce_code_verifier");
        if (!storedVerifier) throw new Error("Code verifier không tồn tại");

        const res = await authApi.exchangeCodeForToken({
          code,
          code_verifier: storedVerifier,
        });

        console.log("Token nhận được từ BE:", res.data);

        saveToken(res.data);
        try {
          const user = await userApi.getProfile();
          setUser(user);
          console.log("Token nhận được từ BE:", res.data);
        } catch {
          console.warn("Không thể lấy profile sau đăng nhập");
        }

        toast.success("Đăng nhập thành công!");
        navigation("/home");
      } catch (err: any) {
        console.error("Lỗi: ", err);
        toast.error(
          err.response?.data?.message || "Đăng nhập OpenDict thất bại!"
        );
      } finally {
        //  Cleanup ngay lập tức
        popup?.close();
        window.removeEventListener("message", listener);
        sessionStorage.removeItem("pkce_code_verifier");
        isProcessing = false;
      }
    };

    window.addEventListener("message", listener);

    // ✅ Thêm cleanup khi popup bị đóng
    const checkPopupClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", listener);
        sessionStorage.removeItem("pkce_code_verifier");
      }
    }, 500);
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
              <button
                type="button"
                onClick={handleOpenDictLogin}
                className="w-full rounded-md bg-[#222] text-white py-2 hover:bg-[#444] transition"
              >
                Đăng nhập bằng OpenDict
              </button>
            </motion.div>
          </div>

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
