import { Search } from "lucide-react";

interface SearchMessagesProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchMessages({
  searchQuery,
  onSearchChange,
}: SearchMessagesProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Tìm kiếm tin nhắn
      </h4>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>
    </div>
  );
}
