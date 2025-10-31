import { useEffect, useState } from "react";
import MediaViewerModal from "../../MediaViewerModal";
import type { MediaItem } from "../../../types/media";

interface Props {
  mediaUrl: string | null;
  onClose: () => void;
  allMedia: MediaItem[];
}

export default function MediaPreviewModal({
  mediaUrl,
  onClose,
  allMedia,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    if (mediaUrl) {
      const idx = allMedia.findIndex((m) => mediaUrl.includes(m.url));
      setInitialIndex(idx >= 0 ? idx : 0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [mediaUrl, allMedia]);

  if (!mediaUrl) return null;

  return (
    <MediaViewerModal
      isOpen={isOpen}
      onClose={onClose}
      mediaItems={allMedia}
      initialIndex={initialIndex}
    />
  );
}
