import Link from "next/link";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="relative flex h-7 w-9 shrink-0 items-center">
        <span className="h-7 w-7 rounded-full bg-brand" />
        <span className="-ml-2 h-7 w-2.5 rounded-full bg-brand-yellow" />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-gray-900"}`}>
        Sala
      </span>
    </span>
  );
}

// Khung dùng chung cho trang đăng nhập & đăng ký: nửa trái là panel thương hiệu
// (ẩn trên mobile), nửa phải là form.
export default function AuthShell({
  title,
  subtitle,
  brandTitle,
  brandSubtitle,
  covers = [],
  children,
}: {
  title: string;
  subtitle: string;
  brandTitle: string;
  brandSubtitle: string;
  covers?: string[];
  children: React.ReactNode;
}) {
  const collage = covers.slice(0, 3);
  const rotations = ["-rotate-6", "rotate-3", "-rotate-2"];

  return (
    <main className="flex min-h-screen">
      {/* PANEL THƯƠNG HIỆU */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-[#ff6a3c] p-12 text-white lg:flex">
        <div className="animate-blob pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="animate-blob pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-black/10 blur-2xl [animation-delay:-8s]" />

        <Link href="/" className="relative">
          <Logo light />
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.15]">{brandTitle}</h2>
          <p className="mt-4 max-w-sm text-white/90">{brandSubtitle}</p>

          {collage.length > 0 && (
            <div className="mt-10 flex gap-4">
              {collage.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`animate-float h-28 w-28 rounded-2xl border-4 border-white/80 object-cover shadow-2xl ${rotations[i]}`}
                  style={{ animationDelay: `${i * -2}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="relative text-sm text-white/70">
          © {new Date().getFullYear()} Sala — Thuê thiết kế &amp; đồ hoạ
        </p>
      </div>

      {/* CỘT FORM */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
