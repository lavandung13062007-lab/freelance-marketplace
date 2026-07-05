function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-gray-400">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3-3" />
    </svg>
  );
}

export default function TopSearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand/20">
      <SearchIcon />
      <input
        type="search"
        placeholder="Tìm ý tưởng, dịch vụ thiết kế…"
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
