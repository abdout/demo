import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReviewForm } from "./review-form";

interface Props {
  bookId: string;
}

export const ReviewSidebar = ({ bookId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({
      bookId,
    })
  );

  return <ReviewForm bookId={bookId} initialData={data} />;
};
