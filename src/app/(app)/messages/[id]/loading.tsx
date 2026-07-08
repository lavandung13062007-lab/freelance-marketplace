export default function ConversationLoading() {
  return (
    <div className="flex h-full animate-pulse gap-4">
      <div className="flex h-full min-w-0 flex-1 flex-col rounded-3xl bg-gray-50">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
          <span className="h-10 w-10 rounded-full bg-gray-200" />
          <span className="h-4 w-32 rounded-full bg-gray-200" />
        </div>
        <div className="flex-1 space-y-3 px-5 py-4">
          <div className="h-9 w-2/5 rounded-2xl bg-gray-200" />
          <div className="ml-auto h-9 w-1/3 rounded-2xl bg-gray-200" />
          <div className="h-9 w-1/2 rounded-2xl bg-gray-200" />
        </div>
        <div className="border-t border-gray-100 p-3">
          <div className="h-10 w-full rounded-2xl bg-gray-200" />
        </div>
      </div>
      <div className="flex w-72 shrink-0 flex-col items-center gap-3 rounded-3xl bg-gray-50 p-5">
        <span className="h-16 w-16 rounded-full bg-gray-200" />
        <span className="h-4 w-24 rounded-full bg-gray-200" />
        <span className="mt-4 h-10 w-full rounded-2xl bg-gray-200" />
        <span className="h-10 w-full rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
