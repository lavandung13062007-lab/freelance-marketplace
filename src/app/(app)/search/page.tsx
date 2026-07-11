import Link from "next/link";
import { searchApproved } from "@/lib/portfolio";
import { getCurrentUser } from "@/lib/supabase/session";
import TopSearchBar from "@/components/TopSearchBar";
import PortfolioGrid from "@/components/PortfolioGrid";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [results, currentUser] = await Promise.all([
    query ? searchApproved(query) : Promise.resolve({ freelancers: [], designs: [] }),
    getCurrentUser(),
  ]);

  const empty = results.freelancers.length === 0 && results.designs.length === 0;

  return (
    <div>
      <div className="sticky -top-6 z-20 -mx-8 mb-4 border-b border-gray-100 bg-white px-8 pb-3 pt-4">
        <TopSearchBar />
      </div>

      {query && (
        <p className="mb-4 text-sm text-gray-500">
          Kết quả cho <span className="font-semibold text-gray-900">“{query}”</span>
        </p>
      )}

      {empty ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
          <p className="font-bold text-gray-900">Không tìm thấy kết quả</p>
          <p className="mt-1 text-sm text-gray-500">Thử từ khóa khác nhé</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.freelancers.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-gray-900">Freelancer</h2>
              <div className="flex flex-wrap gap-3">
                {results.freelancers.map((f) => (
                  <Link
                    key={f.id}
                    href={`/freelancer/${f.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-gray-900">
                      {f.name.charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{f.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.designs.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-gray-900">Thiết kế</h2>
              <PortfolioGrid cards={results.designs} currentUserId={currentUser?.id} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
