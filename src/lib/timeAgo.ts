// Thời gian tương đối kiểu Zalo (tiếng Việt).
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Hôm qua";
  if (day < 7) return `${day} ngày`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week} tuần`;
  const d = new Date(then);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Mốc thời gian giữa các cụm tin nhắn trong khung chat, kiểu Zalo.
export function formatDivider(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  if (d.toDateString() === now.toDateString()) return time;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hôm qua ${time}`;

  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return `${days[d.getDay()]} ${time}`;
  }

  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${time}`;
}
