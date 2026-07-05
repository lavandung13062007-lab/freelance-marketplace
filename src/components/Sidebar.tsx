"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

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

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.25" />
      <path strokeLinecap="round" d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
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

const NAV_ITEMS = [
  { href: "/dashboard", label: "Trang chủ", Icon: HomeIcon },
  { href: "/messages", label: "Tin nhắn", Icon: MessageIcon },
  { href: "/wallet", label: "Ví", Icon: WalletIcon },
  { href: "/profile", label: "Hồ sơ", Icon: ProfileIcon },
];

export default function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-100 px-3 py-5">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-3">
        <span className="h-6 w-6 rounded-full bg-brand" />
        <span className="h-6 w-2 -ml-4 rounded-full bg-brand-yellow" />
        <span className="ml-2 text-lg font-extrabold tracking-tight text-gray-900">Fela</span>
      </Link>

      <Link
        href="/portfolio"
        className={`mb-4 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm ${
          pathname === "/portfolio"
            ? "bg-brand text-white"
            : "bg-brand/10 text-brand hover:bg-brand/15"
        }`}
      >
        <PortfolioIcon />
        Portfolio
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 px-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-gray-900">
          {name.charAt(0).toUpperCase() || "?"}
        </span>
        <span className="flex-1 truncate text-sm font-medium text-gray-700">{name}</span>
        <form action={logout}>
          <button className="text-xs font-medium text-gray-400 hover:text-gray-600">Thoát</button>
        </form>
      </div>
    </aside>
  );
}
