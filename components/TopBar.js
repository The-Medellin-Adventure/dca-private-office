"use client";

export default function TopBar({ query, onQueryChange }) {
  return (
    <div className="flex items-center gap-4 px-6 md:px-8 py-5">
      <div className="flex-1 relative">
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          className="w-4 h-4 text-inkSoft absolute left-4 top-1/2 -translate-y-1/2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar en toda tu información..."
          className="input pl-11 pr-4 py-3 bg-paper"
        />
      </div>
    </div>
  );
}
