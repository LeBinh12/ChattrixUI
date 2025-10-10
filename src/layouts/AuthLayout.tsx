import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#2665b1] to-blue-400">
      {/* Nội dung */}
      <div className="relative flex flex-col items-center justify-center h-full px-4">
        {/* Tiêu đề Chattrix */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 sm:mb-8 tracking-wide drop-shadow-lg text-center">
          Chattrix
        </h1>

        {/* Form / nội dung */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
