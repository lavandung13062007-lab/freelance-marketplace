export default function WalletPage() {
  return (
    <div className="max-w-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Số dư khả dụng</p>
          <p className="mt-1 text-xl font-extrabold text-gray-900">0 ₫</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Tiền đang treo</p>
          <p className="mt-1 text-xl font-extrabold text-gray-900">0 ₫</p>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        <button
          disabled
          className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white opacity-40"
        >
          Nạp tiền
        </button>
        <button
          disabled
          className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-400"
        >
          Rút tiền
        </button>
      </div>

      <div className="mt-6 flex min-h-32 flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
        <p className="font-bold text-gray-900">Sắp ra mắt ✨</p>
        <p className="mt-1 text-sm text-gray-500">Nạp / rút tiền và lịch sử giao dịch</p>
      </div>
    </div>
  );
}
