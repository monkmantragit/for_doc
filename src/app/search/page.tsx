import { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { searchSite } from '@/app/actions/search';
import SearchForm from './SearchForm';

export const metadata: Metadata = {
  title: 'Search | Sports Orthopedics',
  description: 'Search procedures, conditions, surgeons, blogs and more across Sports Orthopedics Institute.',
  // Internal search result pages should not be in Google's index; destination
  // pages are crawled and ranked on their own.
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: rawQuery } = await searchParams;
  const query = (rawQuery ?? '').trim();
  const hasQuery = query.length >= 2;
  const data = hasQuery ? await searchSite(query) : null;

  return (
    <div className="min-h-screen bg-tint-care flex flex-col">
      <SiteHeader theme="light" />

      <main className="flex-1 pb-16">
        <section className="pt-28 md:pt-32 pb-8 border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Search</h1>
            <p className="text-gray-600 mb-6">
              Find procedures, conditions, surgeons, blogs and more.
            </p>
            <SearchForm defaultValue={query} />
            {hasQuery && data && (
              <p className="mt-4 text-sm text-gray-500">
                {data.totalCount === 0
                  ? <>No results for <span className="font-medium text-gray-700">&ldquo;{query}&rdquo;</span></>
                  : <>{data.totalCount} {data.totalCount === 1 ? 'result' : 'results'} for <span className="font-medium text-gray-700">&ldquo;{query}&rdquo;</span></>}
              </p>
            )}
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            {!hasQuery && (
              <EmptyState
                title="Start typing to search"
                description="Enter at least 2 characters above and press Enter."
              />
            )}

            {hasQuery && data && data.totalCount === 0 && (
              <EmptyState
                title="No results found"
                description="Try a different word or check the spelling. You can also browse our procedures or conditions directly."
              >
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <Link href="/procedure-surgery" className="text-sm font-medium text-[#8B5C9E] hover:underline">Browse procedures</Link>
                  <Link href="/bone-joint-school" className="text-sm font-medium text-[#8B5C9E] hover:underline">Bone & Joint School</Link>
                  <Link href="/contact" className="text-sm font-medium text-[#8B5C9E] hover:underline">Contact us</Link>
                </div>
              </EmptyState>
            )}

            {hasQuery && data && data.groups.length > 0 && (
              <div className="space-y-10">
                {data.groups.map((group) => (
                  <div key={group.kind}>
                    <div className="flex items-baseline justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">{group.label}</h2>
                      {group.viewAllUrl && (
                        <Link
                          href={group.viewAllUrl}
                          className="text-sm font-medium text-[#8B5C9E] hover:underline"
                        >
                          View all
                        </Link>
                      )}
                    </div>
                    <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 shadow-sm">
                      {group.results.map((r) => (
                        <li key={`${group.kind}-${r.url}`}>
                          <Link
                            href={r.url}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="font-medium text-gray-900">{r.title}</span>
                              {r.category && (
                                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#8B5C9E]">
                                  {r.category}
                                </span>
                              )}
                            </div>
                            {r.excerpt && (
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{r.excerpt}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">{r.url}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3E8FF] text-[#8B5C9E] mb-4">
        <SearchIcon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600 max-w-md mx-auto">{description}</p>
      {children}
    </div>
  );
}
