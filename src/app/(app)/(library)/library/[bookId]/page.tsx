import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { BookView } from "@/modules/library/ui/views/book-view";
import { Suspense } from "react";
import { BookViewSkeleton } from "@/modules/books/ui/views/book-view";

interface Props {
  params: Promise<{
    bookId: string;
  }>;
}

export const dynamic = "force-dynamic";

const Page = async ({ params }: Props) => {
  const { bookId } = await params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({
      bookId,
    })
  );

  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({
      bookId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<BookViewSkeleton />}>
        <BookView bookId={bookId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
