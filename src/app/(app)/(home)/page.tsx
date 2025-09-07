import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";

import { loadBookFilters } from "@/modules/books/search-params";
import { BookListView } from "@/modules/books/ui/views/book-list-view";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  console.log("📖 [Home Page] Loading book filters from search params...");
  const filters = await loadBookFilters(searchParams);
  console.log("📖 [Home Page] Filters:", JSON.stringify(filters, null, 2));

  const queryClient = getQueryClient();
  console.log("📖 [Home Page] Prefetching books with filters...");
  void queryClient.prefetchInfiniteQuery(
    trpc.books.getMany.infiniteQueryOptions({
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookListView />
    </HydrationBoundary>
  );
};

export default Page;
