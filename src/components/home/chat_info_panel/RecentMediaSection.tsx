import { Image, Video } from "lucide-react";
import { useState } from "react";
import MediaViewerModal from "../../MediaViewerModal";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  filename: string;
  timestamp: string;
}

interface RecentMediaSectionProps {
  mediaItems: MediaItem[];
}

export default function RecentMediaSection({
  mediaItems,
}: RecentMediaSectionProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleMediaClick = (index: number) => {
    setSelectedIndex(index);
    setIsViewerOpen(true);
  };
  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Image size={18} />
            Ảnh/Video ({mediaItems.length})
          </h4>
          {mediaItems.length > 8 && (
            <button className="text-xs text-blue-600 hover:underline">
              Xem tất cả
            </button>
          )}
        </div>

        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {mediaItems.slice(0, 8).map((media, index) => (
              <div
                key={media.id}
                onClick={() => handleMediaClick(index)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition group"
              >
                {media.type === "video" ? (
                  <>
                    <video
                      src={`http://localhost:3000/v1/upload/media/${media.url}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                      <Video size={20} className="text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={`http://localhost:3000/v1/upload/media/${media.url}`}
                    alt={media.filename}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">
            Chưa có ảnh/video nào
          </p>
        )}
      </div>
      <MediaViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        mediaItems={mediaItems}
        initialIndex={selectedIndex}
      />
    </>
  );
}
