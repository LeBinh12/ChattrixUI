import { useEffect } from "react";

type Props = {
  mediaUrl: string | null;
  onClose: () => void;
};

export default function MediaPreview({ mediaUrl, onClose }: Props) {
  // Đóng khi nhấn Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mediaUrl) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* media container */}
      <div className="relative z-10 p-2 rounded shadow-lg max-w-[80%] max-h-[80%] flex items-center justify-center">
        <img
          src={mediaUrl}
          alt="Preview"
          className="max-h-full max-w-full rounded"
        />

        {/* nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
