// Seed dữ liệu demo cho sàn Sala bằng ảnh có giấy phép thương mại miễn phí (Pexels).
// Chạy: PEXELS_API_KEY=xxx node scripts/seed-pexels.mjs [--limit=1000] [--dry-run]
//
// Ảnh lấy từ Pexels (giấy phép Pexels: dùng thương mại tự do, không cần ghi nguồn),
// KHÔNG cào từ Pinterest/Google. Đây là dữ liệu SEED để sàn có nội dung ngay từ đầu —
// nên thay dần bằng file thiết kế thật của team khi có.

import { randomUUID } from "node:crypto";

const SUPABASE_URL = "https://nxmttswedokkitgyndcy.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const FREELANCER_ID = process.env.FREELANCER_ID || "4c50ac99-0d29-4eb8-a75a-e8662cb891c8"; // La Văn Dũng

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 1000);
const CONCURRENCY = 5;

if (!SERVICE_ROLE_KEY) {
  console.error("Thiếu SUPABASE_SERVICE_ROLE_KEY (env hoặc file fallback).");
  process.exit(1);
}
if (!PEXELS_API_KEY) {
  console.error("Thiếu PEXELS_API_KEY. Chạy: PEXELS_API_KEY=xxx node scripts/seed-pexels.mjs");
  process.exit(1);
}

// ===== Danh mục -> từ khóa tìm trên Pexels + khoảng giá (VNĐ) + tag gợi ý =====
const CATEGORIES = [
  { topic: "thiết kế logo", query: "logo design branding", priceRange: [300000, 800000], tags: ["thiết kế logo", "cẩm nang thương hiệu"] },
  { topic: "poster", query: "poster design advertising", priceRange: [150000, 350000], tags: ["poster", "banner quảng cáo kỹ thuật số"] },
  { topic: "standee", query: "standee poster mockup event", priceRange: [200000, 400000], tags: ["standee", "poster"] },
  { topic: "băng rôn", query: "banner mockup outdoor advertising", priceRange: [180000, 400000], tags: ["băng rôn", "phướn"] },
  { topic: "infographic", query: "infographic design data", priceRange: [250000, 600000], tags: ["infographic"] },
  { topic: "bảng hiệu", query: "signage design storefront", priceRange: [500000, 1500000], tags: ["bảng hiệu", "signage"] },
  { topic: "billboard", query: "billboard advertising city", priceRange: [600000, 1800000], tags: ["billboard", "biển quảng cáo ngoài trời"] },
  { topic: "bộ văn phòng cơ bản", query: "stationery mockup branding", priceRange: [400000, 900000], tags: ["stationery kit", "cẩm nang thương hiệu"] },
  { topic: "cẩm nang thương hiệu", query: "brand identity guidelines design", priceRange: [1000000, 3000000], tags: ["brand guidelines", "thiết kế logo"] },
  { topic: "profile công ty", query: "company profile brochure design", priceRange: [800000, 2000000], tags: ["profile công ty", "hồ sơ năng lực"] },
  { topic: "catalogue sản phẩm", query: "product catalogue design", priceRange: [400000, 900000], tags: ["catalogue sản phẩm"] },
  { topic: "thiết kế slide", query: "presentation slide design", priceRange: [500000, 1200000], tags: ["pitch deck", "thiết kế slide"] },
  { topic: "nhãn mác sản phẩm", query: "product label design packaging", priceRange: [300000, 700000], tags: ["nhãn mác sản phẩm"] },
  { topic: "hộp quà tặng", query: "gift box packaging design", priceRange: [400000, 900000], tags: ["box design", "hộp quà tặng"] },
  { topic: "túi giấy", query: "paper shopping bag design mockup", priceRange: [300000, 700000], tags: ["túi giấy", "shopping bag"] },
  { topic: "bao bì màng mềm", query: "pouch packaging design snack", priceRange: [350000, 800000], tags: ["pouch", "sachet"] },
  { topic: "tờ rơi", query: "flyer design marketing", priceRange: [200000, 450000], tags: ["flyer", "tờ rơi"] },
  { topic: "brochure", query: "brochure design corporate", priceRange: [350000, 800000], tags: ["brochure"] },
  { topic: "bìa sách", query: "book cover design", priceRange: [300000, 700000], tags: ["bìa sách", "bìa tạp chí"] },
  { topic: "thiệp mời", query: "wedding invitation card design", priceRange: [150000, 400000], tags: ["thiệp mời", "invitation card"] },
  { topic: "thực đơn", query: "restaurant menu design", priceRange: [250000, 550000], tags: ["thực đơn", "menu"] },
  { topic: "landing page", query: "website UI design landing page", priceRange: [900000, 2500000], tags: ["landing page", "giao diện website toàn diện"] },
  { topic: "giao diện ứng dụng di động", query: "mobile app UI design", priceRange: [900000, 2500000], tags: ["mobile app ui", "giao diện ứng dụng di động"] },
  { topic: "giao diện hệ thống quản trị", query: "admin dashboard UI design", priceRange: [1000000, 2800000], tags: ["admin dashboard"] },
  { topic: "bộ biểu tượng", query: "icon set design flat", priceRange: [300000, 700000], tags: ["icon pack", "bộ biểu tượng"] },
  { topic: "tranh minh họa", query: "illustration art digital", priceRange: [250000, 700000], tags: ["illustration", "tranh minh họa"] },
  { topic: "họa tiết thời trang", query: "seamless pattern textile design", priceRange: [200000, 500000], tags: ["pattern design", "họa tiết thời trang"] },
  { topic: "thiết kế áo thun", query: "t-shirt design graphic print", priceRange: [200000, 500000], tags: ["t-shirt design"] },
  { topic: "sticker", query: "sticker design cute illustration", priceRange: [100000, 300000], tags: ["sticker", "emoji độc quyền"] },
  { topic: "video quảng cáo", query: "advertising video production studio", priceRange: [1500000, 4000000], tags: ["video quảng cáo", "promo video"] },
];

const STYLE_WORDS = [
  "hiện đại", "tối giản", "sang trọng", "sáng tạo", "chuyên nghiệp",
  "cá tính", "trẻ trung", "cao cấp", "ấn tượng", "tinh tế", "độc đáo", "nổi bật",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randPrice([min, max]) {
  const step = 10000;
  const n = Math.round((min + Math.random() * (max - min)) / step) * step;
  return n;
}

function makeTitle(topic) {
  return `${topic[0].toUpperCase()}${topic.slice(1)} ${pick(STYLE_WORDS)}`;
}

function makeDescription(topic) {
  return `Thiết kế ${topic} phong cách ${pick(STYLE_WORDS)}, phù hợp cho thương hiệu muốn tạo ấn tượng chuyên nghiệp.`;
}

async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${path} -> ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function ensureTags(names) {
  const { data: existing } = { data: await sb(`/tags?select=id,name&name=in.(${names.map((n) => `"${n}"`).join(",")})`) };
  const map = new Map(existing.map((t) => [t.name, t.id]));
  for (const name of names) {
    if (!map.has(name)) {
      const [created] = await sb(`/tags`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name }),
      });
      map.set(name, created.id);
    }
  }
  return map;
}

async function searchPexels(query, perPage) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`Pexels search "${query}" -> ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.photos ?? [];
}

async function uploadImage(bytes, contentType, path) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio/${path}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
    },
    body: bytes,
  });
  if (!res.ok) throw new Error(`Upload ${path} -> ${res.status}: ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/portfolio/${path}`;
}

async function seedOne(category, photo, tagMap) {
  let step = "download";
  try {
    const imgRes = await fetch(photo.src.large);
    if (!imgRes.ok) throw new Error(`Tải ảnh thất bại: ${photo.src.large}`);
    const bytes = Buffer.from(await imgRes.arrayBuffer());

    const path = `${FREELANCER_ID}/${randomUUID()}.jpg`;
    if (DRY_RUN) {
      console.log(`[dry-run] ${category.topic}: ${photo.id} (${bytes.length} bytes)`);
      return;
    }

    step = "upload";
    const imageUrl = await uploadImage(bytes, "image/jpeg", path);

    step = "insert-post";
    const [post] = await sb(`/portfolio_posts`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ freelancer_id: FREELANCER_ID, status: "approved" }),
    });

    step = "insert-image";
    const title = makeTitle(category.topic);
    const [image] = await sb(`/portfolio_post_images`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        post_id: post.id,
        image_url: imageUrl,
        position: 0,
        title,
        description: makeDescription(category.topic),
        link: null,
        price: randPrice(category.priceRange),
        topic: category.topic,
      }),
    });

    step = "insert-tags";
    const tagIds = category.tags.map((t) => tagMap.get(t)).filter(Boolean);
    if (tagIds.length > 0) {
      await sb(`/portfolio_post_tags`, {
        method: "POST",
        body: JSON.stringify(tagIds.map((tag_id) => ({ post_image_id: image.id, tag_id }))),
      });
    }

    return title;
  } catch (err) {
    throw new Error(`[${step}] ${err.message}`);
  }
}

async function runPool(items, worker, concurrency) {
  let i = 0;
  let done = 0;
  let failed = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      try {
        await worker(items[idx]);
        done++;
      } catch (err) {
        failed++;
        console.error(`  ✗ ${err.stack || err.message}`);
      }
      if ((done + failed) % 25 === 0) console.log(`  ... ${done + failed}/${items.length} (lỗi: ${failed})`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return { done, failed };
}

async function main() {
  console.log(`Seed tối đa ${LIMIT} thiết kế cho freelancer ${FREELANCER_ID}${DRY_RUN ? " (DRY RUN)" : ""}\n`);

  const allTagNames = [...new Set(CATEGORIES.flatMap((c) => c.tags))];
  const tagMap = DRY_RUN ? new Map() : await ensureTags(allTagNames);

  const perCategory = Math.ceil(LIMIT / CATEGORIES.length);
  let totalDone = 0;
  let totalFailed = 0;

  let categoriesTried = 0;
  for (const category of CATEGORIES) {
    if (totalDone >= LIMIT || categoriesTried >= Math.max(1, Math.ceil(LIMIT / perCategory))) break;
    categoriesTried++;
    console.log(`\n📁 ${category.topic} (tìm "${category.query}")`);
    let photos = [];
    try {
      photos = await searchPexels(category.query, Math.min(perCategory, 80));
    } catch (err) {
      console.error(`  Lỗi tìm kiếm: ${err.message}`);
      continue;
    }
    const items = photos.slice(0, Math.min(perCategory, LIMIT - totalDone));
    const { done, failed } = await runPool(items, (photo) => seedOne(category, photo, tagMap), CONCURRENCY);
    totalDone += done;
    totalFailed += failed;
    console.log(`  ✓ ${done} thành công, ✗ ${failed} lỗi`);
  }

  console.log(`\n=== XONG: ${totalDone} thiết kế đã đăng, ${totalFailed} lỗi ===`);
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
