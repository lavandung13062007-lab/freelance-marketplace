"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import NotificationBell from "@/components/NotificationBell";
import Avatar from "@/components/Avatar";

function HomeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
        <path d="M12 3 2.5 11.3A1 1 0 0 0 3.16 13H5v7a1 1 0 0 0 1 1h3.5v-6h5v6H18a1 1 0 0 0 1-1v-7h1.84a1 1 0 0 0 .66-1.75L12 3Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function MessageIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5 shrink-0"
    >
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

// Sidebar chỉ hiện icon, tên đầy đủ nằm ở tooltip (title) khi di chuột.
export default function Sidebar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-gray-100 px-3 py-5">
      <Link href="/dashboard" title="Sala" className="mb-4 flex h-9 items-center rounded-xl">
        <span className="flex w-10 shrink-0 items-center">
          <span className="h-6 w-6 rounded-full bg-brand" />
          <span className="-ml-2 h-6 w-2 rounded-full bg-brand-yellow" />
        </span>
      </Link>

      <Link
        href="/portfolio"
        title="Portfolio"
        className={`mb-4 flex h-10 items-center rounded-2xl shadow-sm ${
          pathname === "/portfolio" ? "bg-brand text-white" : "bg-brand/10 text-brand hover:bg-brand/15"
        }`}
      >
        <span className="flex w-10 shrink-0 items-center justify-center">
          <PortfolioIcon />
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex h-10 items-center rounded-xl ${
                active ? "bg-brand/10 text-brand" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="flex w-10 shrink-0 items-center justify-center">
                <Icon filled={active} />
              </span>
            </Link>
          );
        })}
        <NotificationBell />
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link href="/profile" title={name} className="flex h-11 items-center rounded-xl hover:bg-gray-50">
          <span className="flex w-10 shrink-0 items-center justify-center">
            <Avatar name={name} avatarUrl={avatarUrl} size="h-9 w-9 text-sm" />
          </span>
        </Link>
        <form action={logout}>
          <button
            title="Thoát"
            className="flex h-10 w-full items-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <span className="flex w-10 shrink-0 items-center justify-center">
              <LogoutIcon />
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
