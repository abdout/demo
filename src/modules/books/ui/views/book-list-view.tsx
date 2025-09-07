import { Suspense } from "react";
import { BookFilters } from "../components/book-filters";
import { BookList, BookListSkeleton } from "../components/book-list";
import { BookSort } from "../components/book-sort";

interface Props {
  category?: string;
  tenantSlug?: string;
  narrowView?: boolean;
}

export const BookListView = ({ category, tenantSlug, narrowView }: Props) => {
  return (
    <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
        <p className="text-2xl font-medium">Curated for you</p>
        <BookSort />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
        <div className="lg:col-span-2 xl:col-span-2">
          <BookFilters />
        </div>
        <div className="lg:col-span-4 xl:col-span-6">
          <Suspense fallback={<BookListSkeleton narrowView={narrowView} />}>
            <BookList
              category={category}
              tenantSlug={tenantSlug}
              narrowView={narrowView}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
