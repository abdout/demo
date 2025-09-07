import { useCallback } from "react";
import { useCartStore } from "../store/use-cart-store";
import { useShallow } from "zustand/react/shallow";

export const useCart = (tenantSlug: string) => {
  const addBook = useCartStore((state) => state.addBook);
  const removeBook = useCartStore((state) => state.removeBook);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  const bookIds = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSlug]?.bookIds || [])
  );

  const toggleBook = useCallback(
    (bookId: string) => {
      if (bookIds.includes(bookId)) {
        removeBook(tenantSlug, bookId);
      } else {
        addBook(tenantSlug, bookId);
      }
    },
    [addBook, removeBook, bookIds, tenantSlug]
  );

  const isBookInCart = useCallback(
    (bookId: string) => {
      return bookIds.includes(bookId);
    },
    [bookIds]
  );

  const clearTenantCart = useCallback(() => {
    clearCart(tenantSlug);
  }, [tenantSlug, clearCart]);

  const handleAddBook = useCallback(
    (bookId: string) => {
      addBook(tenantSlug, bookId);
    },
    [addBook, tenantSlug]
  );

  const handleRemoveBook = useCallback(
    (bookId: string) => {
      removeBook(tenantSlug, bookId);
    },
    [removeBook, tenantSlug]
  );

  return {
    bookIds,
    addBook: handleAddBook,
    removeBook: handleRemoveBook,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleBook,
    isBookInCart,
    totalItems: bookIds.length,
  };
};
