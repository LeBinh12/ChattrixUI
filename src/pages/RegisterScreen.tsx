import AuthForm from "../components/auth/AuthForm";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import { useState } from "react";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("other");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navigation = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Tên đăng nhập không được để trống!");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      toast.error(
        "Tên đăng nhập chỉ được chứa chữ, số, dấu chấm (.) và gạch dưới (_), không khoảng trắng!"
      );
      return;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    // Số điện thoại (tùy chỉnh theo định dạng VN)
    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Số điện thoại không hợp lệ! (9-12 số)");
      return;
    }

    // Mật khẩu
    if (!password) {
      toast.error("Mật khẩu không được để trống!");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự!");
      return;
    }
    if (password !== changePassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("display_name", displayName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("birthday", birthday);
    formData.append("gender", gender);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      console.log("Data:", formData);
      const res = await authApi.register(formData);
      toast.success(res.message);
      navigation("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <AuthForm title="Đăng Ký" onSubmit={handleSubmit}>
      {/* Avatar */}
      <div className="flex flex-col items-center mb-4">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-white shadow-lg cursor-pointer"
            onClick={() => document.getElementById("avatarInput")?.click()}
          />
        ) : (
          <label
            htmlFor="avatarInput"
            className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 cursor-pointer hover:bg-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h2l1 2h10l1-2h2m-6 5a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
          </label>
        )}
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AuthInput
          label="Tên đăng nhập"
          type="text"
          placeholder="Nhập tài khoản..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <AuthInput
          label="Tên hiển thị"
          type="text"
          placeholder="Nhập tên hiển thị..."
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Số điện thoại"
          type="tel"
          placeholder="Nhập số điện thoại..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <AuthInput
          label="Ngày sinh"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
        {/* Giới tính */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Giới tính</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />{" "}
              Nam
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />{" "}
              Nữ
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="other"
                checked={gender === "other"}
                onChange={() => setGender("other")}
              />{" "}
              Khác
            </label>
          </div>
        </div>
        <div className="relative">
          <AuthInput
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-9 right-3 text-gray-500"
          >
            {showPassword ? (
              <EyeOffIcon className="w-6 h-6" />
            ) : (
              <EyeIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="relative">
          <AuthInput
            label="Nhập lại mật khẩu"
            type={showChangePassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu..."
            value={changePassword}
            onChange={(e) => setChangePassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="absolute top-9 right-3 text-gray-500"
          >
            {showChangePassword ? (
              <EyeOffIcon className="w-6 h-6" />
            ) : (
              <EyeIcon className="w-6 h-6" />
            )}{" "}
          </button>
        </div>
      </div>

      {/* Nút đăng ký */}
      <motion.div
        className="mt-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <AuthButton type="submit" className="w-full">
          Đăng Ký
        </AuthButton>
      </motion.div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <button
          type="button"
          className="text-blue-500 hover:underline"
          onClick={() => navigation("/login")}
        >
          Đăng nhập
        </button>
      </div>
    </AuthForm>
  );
}
