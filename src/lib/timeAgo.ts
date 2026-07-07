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
