import { cn, generateTenantURL } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/use-cart";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

export const CheckoutButton = ({
  className,
  hideIfEmpty,
  tenantSlug,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <NextLink href={`${generateTenantURL(tenantSlug)}/checkout`}>
      <Button variant="elevated" className={cn("bg-white gap-2", className)}>
        <ShoppingCart className="size-5" />
        {totalItems > 0 ? totalItems : ""}
      </Button>
    </NextLink>
  );
};
