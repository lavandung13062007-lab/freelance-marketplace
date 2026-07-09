import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import { getApprovedPortfolioCards } from "@/lib/portfolio";

export const metadata = {
  title: "Sala — Thuê thiết kế đẹp, nhanh gọn, đúng ý",
  description:
    "Sala là sàn kết nối bạn với freelancer thiết kế & đồ hoạ Việt. Duyệt kho thiết kế, nhắn tin trực tiếp, nhận sản phẩm ưng ý.",
};

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

const CATEGORIES = [
  { name: "Poster & Ấn phẩm", emoji: "🖼️", tint: "from-rose-50 to-rose-100 text-rose-600" },
  { name: "Logo & Nhận diện", emoji: "✨", tint: "from-amber-50 to-amber-100 text-amber-600" },
  { name: "Giao diện UI/UX", emoji: "📱", tint: "from-sky-50 to-sky-100 text-sky-600" },
  { name: "Đồ hoạ mạng xã hội", emoji: "💬", tint: "from-violet-50 to-violet-100 text-violet-600" },
  { name: "Bao bì sản phẩm", emoji: "📦", tint: "from-emerald-50 to-emerald-100 text-emerald-600" },
  { name: "Minh hoạ & Vẽ", emoji: "🎨", tint: "from-fuchsia-50 to-fuchsia-100 text-fuchsia-600" },
];

const STEPS = [
  {
    title: "Tìm & duyệt",
    desc: "Lướt kho thiết kế thật của hàng trăm freelancer, lọc theo phong cách và ngân sách của bạn.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <circle cx="11" cy="11" r="7" strokeLinecap="round" />
        <path strokeLinecap="round" d="m20 20-3-3" />
      </svg>
    ),
  },
  {
    title: "Nhắn tin trao đổi",
    desc: "Chat trực tiếp trong Sala, chốt yêu cầu và giá cả rõ ràng — mọi thứ được lưu lại minh bạch.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5Z" />
      </svg>
    ),
  },
  {
    title: "Nhận sản phẩm",
    desc: "Nhận file thiết kế đúng hẹn. Hài lòng rồi mới hoàn tất — Sala đứng giữa như trọng tài cho cả hai.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7 9.5 17.5 4 12" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Chat ngay trong nền tảng",
    desc: "Trao đổi, gửi yêu cầu, chốt tiến độ — không cần rời khỏi Sala, không sợ mất lịch sử.",
    icon: "💬",
  },
  {
    title: "Giá tham khảo minh bạch",
    desc: "Xem khoảng giá thị trường cho từng loại thiết kế trước khi thuê, khỏi lo bị hớ.",
    icon: "📊",
  },
  {
    title: "Portfolio chia sẻ được",
    desc: "Freelancer có link portfolio công khai, gửi cho khách xem tất cả tác phẩm chỉ với một cú nhấn.",
    icon: "🔗",
  },
  {
    title: "Trọng tài bảo vệ hai bên",
    desc: "Quy trình theo từng bước rõ ràng giúp khách và freelancer yên tâm từ lúc chào đến khi hoàn tất.",
    icon: "🛡️",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const cards = await getApprovedPortfolioCards();
  const covers = cards.map((c) => c.cover).filter(Boolean);
  const heroCards = cards.slice(0, 5);
  const designCount = cards.length;

  // Hàng ảnh chạy ngang: lặp lại để chạy liền mạch; có ảnh thật thì dùng, không thì để trống.
  const marqueeTop = covers.slice(0, 8);
  const marqueeBottom = covers.slice(8, 16).length >= 4 ? covers.slice(8, 16) : covers.slice(0, 8);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#cach-hoat-dong" className="hover:text-gray-900">Cách hoạt động</a>
            <a href="#danh-muc" className="hover:text-gray-900">Danh mục</a>
            <a href="#vi-sao" className="hover:text-gray-900">Vì sao Sala</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              Tạo tài khoản
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        {/* nền gradient blob */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="animate-blob absolute -right-16 top-10 h-80 w-80 rounded-full bg-brand-yellow/20 blur-3xl [animation-delay:-6s]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          {/* trái */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1.5 text-xs font-bold text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Sàn thuê thiết kế cho người Việt
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Thuê thiết kế{" "}
              <span className="bg-gradient-to-r from-brand to-[#ff6a3c] bg-clip-text text-transparent">
                đẹp, nhanh gọn
              </span>
              , đúng ý.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-600">
              Sala kết nối bạn với hàng trăm freelancer thiết kế &amp; đồ hoạ. Duyệt kho tác phẩm
              thật, nhắn tin trực tiếp và nhận sản phẩm ưng ý.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-brand px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90 active:scale-[0.98]"
              >
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-gray-200 bg-white px-7 py-3.5 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Khám phá thiết kế
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {["bg-brand", "bg-brand-yellow", "bg-sky-400", "bg-violet-400"].map((c, i) => (
                  <span key={i} className={`h-8 w-8 rounded-full border-2 border-white ${c}`} />
                ))}
              </div>
              <span>
                <strong className="text-gray-900">{designCount > 0 ? `${designCount}+ thiết kế` : "Kho thiết kế"}</strong>{" "}
                đang chờ bạn khám phá
              </span>
            </div>
          </div>

          {/* phải — collage ảnh thật */}
          <div className="relative animate-fade-up [animation-delay:0.15s]">
            {heroCards.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {heroCards.slice(0, 2).map((c, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c.id}
                      src={c.cover}
                      alt={c.title}
                      className={`w-full rounded-3xl border-4 border-white object-cover shadow-xl ${i === 0 ? "aspect-[3/4]" : "aspect-square"}`}
                    />
                  ))}
                </div>
                <div className="space-y-4 pt-8">
                  {heroCards.slice(2, 4).map((c, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c.id}
                      src={c.cover}
                      alt={c.title}
                      className={`w-full rounded-3xl border-4 border-white object-cover shadow-xl ${i === 0 ? "aspect-square" : "aspect-[3/4]"}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 ${i % 2 ? "aspect-square" : "aspect-[3/4]"}`}
                  />
                ))}
              </div>
            )}

            {/* chip nổi */}
            <div className="animate-float absolute -left-4 top-1/3 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <p className="text-xs text-gray-500">Đánh giá</p>
              <p className="text-sm font-bold text-gray-900">★ 4.9 / 5</p>
            </div>
            <div className="animate-float absolute -right-3 bottom-8 rounded-2xl bg-white px-4 py-3 shadow-xl [animation-delay:-3s]">
              <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Đã giao đúng hẹn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE — kho thiết kế chạy ngang */}
      {covers.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50 py-10">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
            Kho thiết kế thật trên Sala
          </p>
          <div className="marquee-row space-y-4">
            <div className="flex w-max animate-marquee gap-4">
              {[...marqueeTop, ...marqueeTop].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-40 w-40 shrink-0 rounded-2xl object-cover shadow-sm sm:h-48 sm:w-48"
                />
              ))}
            </div>
            <div className="flex w-max animate-marquee-reverse gap-4">
              {[...marqueeBottom, ...marqueeBottom].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-40 w-40 shrink-0 rounded-2xl object-cover shadow-sm sm:h-48 sm:w-48"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CÁCH HOẠT ĐỘNG */}
      <section id="cach-hoat-dong" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ba bước là xong</h2>
          <p className="mt-3 text-gray-600">
            Từ ý tưởng đến sản phẩm hoàn chỉnh, Sala giữ mọi thứ đơn giản và minh bạch.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="absolute right-6 top-6 text-5xl font-black text-gray-100">{i + 1}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                {s.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DANH MỤC */}
      <section id="danh-muc" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Đủ mọi loại thiết kế</h2>
            <p className="mt-3 text-gray-600">Bất kể bạn cần gì, luôn có freelancer phù hợp trên Sala.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div
                key={c.name}
                className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${c.tint} p-5 transition hover:-translate-y-1`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="font-semibold text-gray-900">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VÌ SAO SALA */}
      <section id="vi-sao" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Vì sao chọn Sala?</h2>
          <p className="mt-3 text-gray-600">Không chỉ là nơi tìm freelancer — Sala là nơi hợp tác yên tâm.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 rounded-3xl border border-gray-100 p-7 transition hover:border-brand/30 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/20 text-2xl">
                {f.icon}
              </span>
              <div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HAI ĐỐI TƯỢNG */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-gray-900 p-9 text-white">
            <p className="text-sm font-semibold text-brand-yellow">Dành cho khách hàng</p>
            <h3 className="mt-2 text-2xl font-extrabold">Cần một thiết kế ưng ý?</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Duyệt kho tác phẩm thật, so sánh giá và nhắn tin trực tiếp với freelancer bạn thích.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Tìm freelancer
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-brand to-[#ff6a3c] p-9 text-white">
            <p className="text-sm font-semibold text-white/80">Dành cho freelancer</p>
            <h3 className="mt-2 text-2xl font-extrabold">Muốn có thêm khách hàng?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Đăng portfolio miễn phí, chia sẻ link cho khách và nhận yêu cầu ngay trong Sala.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-gray-100"
            >
              Đăng tác phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* CTA CUỐI */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-6 py-16 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-black/10" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sẵn sàng bắt đầu với Sala?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/90">
            Tạo tài khoản miễn phí trong 30 giây và khám phá kho thiết kế ngay hôm nay.
          </p>
          <Link
            href="/signup"
            className="relative mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-bold text-brand shadow-lg transition hover:bg-gray-100 active:scale-[0.98]"
          >
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
            {/* Thương hiệu + liên hệ */}
            <div className="lg:col-span-4">
              <Logo light />
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                Sala là nền tảng kết nối khách hàng với freelancer thiết kế &amp; đồ hoạ Việt Nam —
                minh bạch, an toàn và tiện lợi.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { label: "Facebook", d: "M13 22v-8h2.5l.5-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5.1C15.7 5 14.8 5 13.8 5 11.6 5 10 6.3 10 8.9V11H7.5v3H10v8h3Z" },
                  { label: "Messenger", d: "M12 3C7 3 3.2 6.6 3.2 11.3c0 2.5 1.1 4.7 2.9 6.2V21l2.7-1.5c.7.2 1.5.3 2.2.3 5 0 8.8-3.6 8.8-8.3S17 3 12 3Zm.9 11.2-2.3-2.4-4.3 2.4 4.7-5 2.4 2.4 4.2-2.4-4.4 5Z" },
                  { label: "YouTube", d: "M21.6 8.2c-.2-.9-.9-1.5-1.7-1.7C18.3 6 12 6 12 6s-6.3 0-7.9.5c-.8.2-1.5.8-1.7 1.7C2 9.8 2 12 2 12s0 2.2.4 3.8c.2.9.9 1.5 1.7 1.7C5.7 18 12 18 12 18s6.3 0 7.9-.5c.8-.2 1.5-.8 1.7-1.7.4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8ZM10 15V9l5 3-5 3Z" },
                  { label: "TikTok", d: "M16 3c.3 2 1.6 3.5 3.5 3.8V9c-1.3 0-2.5-.4-3.5-1v6.5A5.5 5.5 0 1 1 10.5 9v2.6a2.9 2.9 0 1 0 2.9 2.9V3H16Z" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Cột liên kết */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-white">Khám phá</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white">Trang chủ</Link></li>
                <li><a href="#danh-muc" className="hover:text-white">Danh mục</a></li>
                <li><a href="#cach-hoat-dong" className="hover:text-white">Cách hoạt động</a></li>
                <li><Link href="/signup" className="hover:text-white">Tạo tài khoản</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-white">Hỗ trợ</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white">Hướng dẫn thuê thiết kế</a></li>
                <li><a href="#" className="hover:text-white">Báo cáo vi phạm</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-sm font-bold text-white">Liên hệ</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-0.5 text-brand-yellow">📍</span>
                  <span>Tầng 8, Toà nhà Sài Gòn Center, 65 Lê Lợi, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="text-brand-yellow">📞</span>
                  <a href="tel:19006868" className="hover:text-white">Hotline: 1900 6868</a>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="text-brand-yellow">✉️</span>
                  <a href="mailto:hotro@sala.vn" className="hover:text-white">hotro@sala.vn</a>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="text-brand-yellow">🕐</span>
                  <span>Thứ 2 – Thứ 7, 8:00 – 18:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Thanh pháp lý */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs sm:flex-row">
            <p>
              © {new Date().getFullYear()} Công ty TNHH Sala Việt Nam · MST: 0312 345 678 · GPĐKKD do Sở
              KH&amp;ĐT TP.HCM cấp
            </p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white">Điều khoản</a>
              <a href="#" className="hover:text-white">Bảo mật</a>
              <a href="#" className="hover:text-white">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
