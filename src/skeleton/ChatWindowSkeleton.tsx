export default function ChatWindowSkeleton() {
  return (
    <div className="flex flex-col flex-1 h-screen bg-[#357ae8] animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 bg-[#2665b1] px-4 py-3 shadow-lg">
        <div className="w-12 h-12 bg-white/20 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-20"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Logo mờ giữa */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="opacity-20 w-40 h-40 sm:w-52 sm:h-52 object-contain select-none"
          />
        </div>

        {/* Message bubbles skeleton */}
        <div className="relative z-10 space-y-4">
          {/* Tin nhắn bên trái */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0"></div>
            <div className="space-y-2">
              <div className="h-12 bg-white/20 rounded-2xl w-64"></div>
              <div className="h-12 bg-white/20 rounded-2xl w-48"></div>
            </div>
          </div>

          {/* Tin nhắn bên phải */}
          <div className="flex items-start gap-2 justify-end">
            <div className="space-y-2">
              <div className="h-12 bg-white/30 rounded-2xl w-56"></div>
              <div className="h-12 bg-white/30 rounded-2xl w-40"></div>
            </div>
          </div>

          {/* Tin nhắn bên trái */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0"></div>
            <div className="h-16 bg-white/20 rounded-2xl w-72"></div>
          </div>

          {/* Tin nhắn bên phải */}
          <div className="flex items-start gap-2 justify-end">
            <div className="h-12 bg-white/30 rounded-2xl w-52"></div>
          </div>

          {/* Tin nhắn bên trái */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0"></div>
            <div className="space-y-2">
              <div className="h-12 bg-white/20 rounded-2xl w-60"></div>
              <div className="h-12 bg-white/20 rounded-2xl w-44"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="bg-[#2665b1] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div className="flex-1 h-12 bg-white/20 rounded-full"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
