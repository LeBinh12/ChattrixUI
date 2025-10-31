import { FileText } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string;
  url: string;
  timestamp: string;
}

interface RecentFilesSectionProps {
  fileItems: FileItem[];
}

export default function RecentFilesSection({
  fileItems,
}: RecentFilesSectionProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText size={18} />
          File ({fileItems.length})
        </h4>
        {fileItems.length > 5 && (
          <button className="text-xs text-blue-600 hover:underline">
            Xem tất cả
          </button>
        )}
      </div>

      {fileItems.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {fileItems.slice(0, 5).map((file) => (
            <a
              key={file.id}
              href={`http://localhost:3000/v1/upload/media/${file.url}`}
              download
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {file.size} • {file.timestamp}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">
          Chưa có file nào
        </p>
      )}
    </div>
  );
}
