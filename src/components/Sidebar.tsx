"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import NotificationBell from "@/components/NotificationBell";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H5a2 2 0 0 0-2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <circle cx="16" cy="13" r="1.25" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h11m0 0-3-3m3 3-3 3" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Trang chủ", Icon: HomeIcon },
  { href: "/messages", label: "Tin nhắn", Icon: MessageIcon },
  { href: "/wallet", label: "Ví", Icon: WalletIcon },
];

export default function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col items-center border-r border-gray-100 py-5">
      <Link href="/dashboard" title="Trang chủ" className="mb-4 flex items-center justify-center">
        <span className="relative flex h-6 w-8 items-center">
          <span className="h-6 w-6 rounded-full bg-brand" />
          <span className="-ml-2 h-6 w-2 rounded-full bg-brand-yellow" />
        </span>
      </Link>

      <Link
        href="/portfolio"
        title="Portfolio"
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${
          pathname === "/portfolio"
            ? "bg-brand text-white"
            : "bg-brand/10 text-brand hover:bg-brand/15"
        }`}
      >
        <PortfolioIcon />
      </Link>

      <nav className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon />
            </Link>
          );
        })}
        <NotificationBell />
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1">
        <Link href="/profile" title="Hồ sơ">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-gray-900">
            {name.charAt(0).toUpperCase() || "?"}
          </span>
        </Link>
        <form action={logout}>
          <button
            title="Thoát"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <LogoutIcon />
          </button>
        </form>
      </div>
    </aside>
  );
}
