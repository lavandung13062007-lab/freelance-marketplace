"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import NotificationBell from "@/components/NotificationBell";
import Avatar from "@/components/Avatar";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h11m0 0-3-3m3 3-3 3" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Trang chủ", Icon: HomeIcon },
  { href: "/messages", label: "Tin nhắn", Icon: MessageIcon },
];

const STORAGE_KEY = "fm:sidebar-expanded";

export default function Sidebar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Đọc trạng thái đã lưu sau khi vào trang, tránh lệch giữa render trên server và trình duyệt.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE_KEY) === "true") setExpanded(true);
  }, []);

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-gray-100 py-5 transition-[width] duration-200 ${
        expanded ? "w-56 px-3" : "w-16 items-center"
      }`}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        title={expanded ? "Thu gọn menu" : "Mở rộng menu"}
        className={`mb-4 flex items-center rounded-xl hover:bg-gray-50 ${expanded ? "gap-2 px-1 py-1" : "justify-center"}`}
      >
        <span className="relative flex h-6 w-8 shrink-0 items-center">
          <span className="h-6 w-6 rounded-full bg-brand" />
          <span className="-ml-2 h-6 w-2 rounded-full bg-brand-yellow" />
        </span>
        {expanded && <span className="truncate text-sm font-bold text-gray-900">Sàn Freelance</span>}
      </button>

      <Link
        href="/portfolio"
        title="Portfolio"
        className={`mb-4 flex h-10 items-center rounded-2xl shadow-sm ${expanded ? "gap-2 px-3" : "w-10 justify-center"} ${
          pathname === "/portfolio" ? "bg-brand text-white" : "bg-brand/10 text-brand hover:bg-brand/15"
        }`}
      >
        <PortfolioIcon />
        {expanded && <span className="text-sm font-semibold">Portfolio</span>}
      </Link>

      <nav className={`flex flex-col gap-1 ${expanded ? "" : "items-center"}`}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex h-10 items-center rounded-xl ${expanded ? "gap-2 px-3" : "w-10 justify-center"} ${
                active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon />
              {expanded && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
        <div className={expanded ? "px-3" : ""}>
          <NotificationBell />
        </div>
      </nav>

      <div className={`mt-auto flex flex-col gap-1 ${expanded ? "" : "items-center"}`}>
        <Link
          href="/profile"
          title="Hồ sơ"
          className={`flex items-center rounded-xl hover:bg-gray-50 ${expanded ? "gap-2 px-1 py-1" : "justify-center"}`}
        >
          <Avatar name={name} avatarUrl={avatarUrl} size="h-9 w-9 text-sm" />
          {expanded && <span className="truncate text-sm font-semibold text-gray-900">{name}</span>}
        </Link>
        <form action={logout}>
          <button
            title="Thoát"
            className={`flex h-9 items-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 ${
              expanded ? "w-full gap-2 px-3" : "w-9 justify-center"
            }`}
          >
            <LogoutIcon />
            {expanded && <span className="text-sm font-medium">Thoát</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
