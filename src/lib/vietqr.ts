// Mã BIN ngân hàng dùng cho dịch vụ tạo ảnh QR VietQR (img.vietqr.io).
// Tra cứu từ https://api.vietqr.io/v2/banks — khớp với `code` trong vietnamBanks.ts.
const BANK_BIN: Record<string, string> = {
  vietcombank: "970436",
  vietinbank: "970415",
  bidv: "970418",
  agribank: "970405",
  techcombank: "970407",
  mbbank: "970422",
  acb: "970416",
  vpbank: "970432",
  sacombank: "970403",
  tpbank: "970423",
  hdbank: "970437",
  shb: "970443",
  vib: "970441",
  eximbank: "970431",
  seabank: "970440",
  msb: "970426",
  ocb: "970448",
  abbank: "970425",
  bacabank: "970409",
  pvcombank: "970412",
  namabank: "970428",
  kienlongbank: "970452",
  pgbank: "970430",
  saigonbank: "970400",
  baovietbank: "970438",
  lienvietpostbank: "970449",
  vietbank: "970433",
  scb: "970429",
  gpbank: "970408",
  coopbank: "970446",
  cake: "546034",
  ubank: "546035",
  timo: "963388",
  shinhan: "970424",
  woori: "970457",
  cimb: "422589",
  uob: "970458",
};

/**
 * URL ảnh QR VietQR để khách quét chuyển khoản. Trả về null nếu freelancer
 * chưa cấu hình đủ thông tin nhận thanh toán (ngân hàng/số tài khoản).
 */
export function buildVietQrUrl(params: {
  bankCode: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  amount: number;
  note: string;
}): string | null {
  const { bankCode, accountNumber, accountHolder, amount, note } = params;
  if (!bankCode || !accountNumber) return null;
  const bin = BANK_BIN[bankCode];
  if (!bin) return null;

  const query = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: note,
  });
  if (accountHolder) query.set("accountName", accountHolder);

  return `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?${query.toString()}`;
}
